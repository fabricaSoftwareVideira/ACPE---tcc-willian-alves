"use client";
import ResponsiveMenu from "@/components/responsive-menu";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "@/config/firebase.config";
import {
  FilterIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ref, getDownloadURL } from "firebase/storage";
import { LoadingSpinner } from "@/components/ui/loader";
import withAuthorization from "@/components/with-authorization";
import { useToast } from "@/hooks/use-toast";
import ValidationFilters from './ValidationFilters';
import ValidationTable from './ValidationTable';
import ValidationDrawer from './ValidationDrawer';
import ValidationArchiveDialog from './ValidationArchiveDialog';

interface Filters {
  status: string;
  description: string;
  user: string;
  createdAt: string;
  workload: string;
  includeArchived: boolean;
}

const filterDisplayNames: { [key in keyof Filters]: string } = {
  status: "Status",
  description: "Descrição",
  user: "Nome",
  createdAt: "Data de envio",
  workload: "Carga Horária",
  includeArchived: "Incluir Arquivados",
};

const statuses: { [key: string]: string } = {
  pending: "Pendente",
  rejected: "Rejeitado",
  approved: "Aprovado",
  archived: "Arquivado",
  processing: "Processando",
};

const statusesColors: any = {
  pending: "",
  rejected: "destructive",
  approved: "outline",
  archived: "",
  processing: "secondary",
};

const ValidationPage = () => {
  const [filesList, setFilesList] = useState([]);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [downloadLoadingFiles, setDownloadLoadingFiles] = useState<
    Record<string, boolean>
  >({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [formValidation, setFormValidation] = useState({
    status: "",
    workload: "",
    observation: "",
  });
  const [filters, setFilters] = useState<Filters>({
    description: "",
    user: "",
    status: "all",
    createdAt: "",
    workload: "",
    includeArchived: false,
  });
  const [alertVisible, setAlertVisible] = useState<any>({
    visible: false,
  });
  const [drawerVisibleView, setDrawerVisibleView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfPath, setPdfPath] = useState<string>(""); 
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { data: session, status } = useSession();
  const router: any = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      const statusParam = queryParams.get("status");
      if (statusParam) {
        handleFilterChange("status", statusParam);
        setFilters((prevFilters) => ({ ...prevFilters, status: statusParam }));
      }
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else if (session.user.role !== "admin") {
      router.push("/files");
    }
  }, [session, status]);

  async function getAllFiles() {
    setLoading(true);

    if (!session) {
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: Record<string, any> = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      const filesSnapshot = await getDocs(query(collection(db, "files")));

      if (filesSnapshot.empty) {
        setFilesList([]);
        setLoading(false);
        return;
      }

      let arrayFileslist: any = [];
      for (const fi of filesSnapshot.docs) {
        const fileData = fi.data();
        const userId = fileData.userId;
        if (!userId) {
          console.error(`Arquivo ${fi.id} não possui userId`);
          continue;
        }
        const userData = usersMap[userId];
        if (userData) {
          arrayFileslist.push({
            uid: fi.id,
            ...fileData,
            user: userData,
          });
        } else {
          console.error(`Usuário não encontrado: ${userId}`);
        }
      }
      setFilesList(arrayFileslist);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao obter lista de arquivos:", error);
    }
  }

  const filteredFilesList = useMemo(() => {
    let filteredList = [...filesList];
    if (filters.status !== "all") {
      filteredList = filteredList.filter(
        (item: any) => item.status === filters.status
      );
    }

    if (filters.description) {
      filteredList = filteredList.filter((item: any) =>
        item.description
          .toLowerCase()
          .includes(filters.description.toLowerCase())
      );
    }

    if (filters.createdAt) {
      filteredList = filteredList.filter((item: any) => {
        const firebaseDate = new Date(item.createdAt.seconds * 1000);
        const firebaseDateFormatted = firebaseDate.toISOString().split("T")[0];
        return firebaseDateFormatted === filters.createdAt;
      });
    }

    if (filters.workload) {
      filteredList = filteredList.filter(
        (item: any) => item.workload === filters.workload
      );
    }

    if (filters.user) {
      filteredList = filteredList.filter((item: any) =>
        item.user.fullname.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (!filters.includeArchived) {
      filteredList = filteredList.filter((f: any) => f.archived === false || f.archived === undefined);
    }

    return filteredList;
  }, [filesList, filters]);

  useEffect(() => {
    getAllFiles();
  }, [session, status, drawerVisibleView, router]);

  useEffect(() => {
    if (!pdfPath) {
      setPdfUrl("");
      return; 
    }

    setPdfLoading(true);
    const pdfRef = ref(storage, pdfPath);

    getDownloadURL(pdfRef)
      .then((url) => {
        if (!url) {
          console.error(
            "Erro ao obter a URL do PDF: a URL é nula ou indefinida"
          );
          setPdfUrl("");
          return;
        }
        setPdfUrl(url);
      })
      .catch((error) => {
        console.error("Erro ao obter a URL do PDF:", error);
        setPdfUrl("");
      })
      .finally(() => {
        setPdfLoading(false);
      });
  }, [pdfPath]);

  const handleOpenPdf = async (filePath: string, fileId: string) => {
    if (!filePath) {
      console.error(
        "Erro ao abrir o PDF: o caminho do arquivo é nulo ou indefinido"
      );
      return;
    }

    setDownloadLoadingFiles((prev) => ({ ...prev, [fileId]: true }));
    try {
      const pdfRef = ref(storage, filePath);
      const url = await getDownloadURL(pdfRef);
      if (!url) {
        console.error("Erro ao obter a URL do PDF: a URL é nula ou indefinida");
        return;
      }
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao obter a URL do PDF:", error);
    } finally {
      setDownloadLoadingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const updateStatus = async () => {
    try {
      if (formValidation && currentFile.uid) {
        const fileRef = doc(db, "files", currentFile.uid);
        let data = {
          status: formValidation.status,
          observation: formValidation.observation || "Sem observação",
          workload: formValidation.workload,
          userId: currentFile.userId,
        };
        await setDoc(fileRef, data, { merge: true });
        toast({
          title: "Validação concluida com sucesso",
          variant: "default",
        });
        setTimeout(() => {
          setDrawerVisibleView(false);
        }, 2000);
      } else {
        console.warn("Form ou ID não fornecidos");
      }
    } catch (error) {
      console.error("Erro ao atualizar o status:", error);
    }
  };

  const handleArchiveFile = async () => {
    if (!currentFile?.uid) return;
    const fileRef = doc(db, "files", currentFile.uid);
    await setDoc(fileRef, { archived: true }, { merge: true });
    setShowArchiveDialog(false);
    getAllFiles(); // Atualiza a lista
  };

  useEffect(() => {
    setTimeout(() => {
      setPdfLoading(false);
    }, 3000);
  }, [drawerVisibleView]);

  const handleFilterChange = (field: any, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const removeFilter = (key: any) => {
    let value = key == "status" ? "all" : "";

    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: "all",
      description: "",
      user: "",
      createdAt: "",
      workload: "",
      includeArchived: false,
    });
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="bg-dark" />
      </div>
    );
  } else {
    return (
      <TooltipProvider>
        <ResponsiveMenu />
        <div className="container mt-5">
          <div className="flex flex-row justify-between items-center p-3 mb-4 border-b">
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
              Validação de atividades
            </h2>
            <Button
              variant="outline"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <FilterIcon size={18} />
            </Button>
          </div>
          <div
            className={`
              transition-all duration-500 ease-in-out overflow-hidden 
              ${
                filtersVisible
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }
            `}
          >
            <ValidationFilters
              filters={filters}
              handleFilterChange={handleFilterChange}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
              filterDisplayNames={filterDisplayNames}
              statuses={statuses}
            />
          </div>
          <ValidationTable
            filteredFilesList={filteredFilesList}
            loading={loading}
            downloadLoadingFiles={downloadLoadingFiles}
            setDrawerVisibleView={setDrawerVisibleView}
            setPdfPath={setPdfPath}
            setPdfLoading={setPdfLoading}
            setCurrentFile={setCurrentFile}
            setFormValidation={setFormValidation}
            handleOpenPdf={handleOpenPdf}
            setShowArchiveDialog={setShowArchiveDialog}
            setAlertVisible={setAlertVisible}
            statuses={statuses}
            statusesColors={statusesColors}
          />
          <ValidationDrawer
            drawerVisibleView={drawerVisibleView}
            setDrawerVisibleView={setDrawerVisibleView}
            pdfUrl={pdfUrl}
            pdfLoading={pdfLoading}
            formValidation={formValidation}
            setFormValidation={setFormValidation}
            updateStatus={updateStatus}
            setAlertVisible={setAlertVisible}
            currentFile={currentFile}
          />
          <ValidationArchiveDialog
            showArchiveDialog={showArchiveDialog}
            setShowArchiveDialog={setShowArchiveDialog}
            handleArchiveFile={handleArchiveFile}
          />
          <AlertDialog open={alertVisible.visible}>
            <AlertDialogTrigger asChild></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmação</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja alterar a validação do arquivo?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAlertVisible(false)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    updateStatus();
                    setAlertVisible(false);
                    setDrawerVisibleView(false);
                  }}
                >
                  Sim
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    );
  }
};

export default withAuthorization(ValidationPage, ["admin"]);
