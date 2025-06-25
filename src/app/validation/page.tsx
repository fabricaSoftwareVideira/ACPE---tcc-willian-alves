'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { collection, query, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { db, storage } from '@/config/firebase.config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Container, Icon, Plus, FileBadge, FilterIcon, FileDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
} from "@/components/ui/alert-dialog"
import { ref, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/ui/loader';
import withAuthorization from '@/components/with-authorization';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Filters {
  status: string;
  description: string;
  user: string;
  createdAt: string;
  workload: string;
}

const filterDisplayNames: { [key in keyof Filters]: string } = {
  status: "Status",
  description: "Descrição",
  user: "Nome",
  createdAt: "Data de envio",
  workload: "Carga Horária",
};

const statuses: { [key: string]: string } = {
  pending: "Pendente",
  rejected: "Rejeitado",
  approved: "Aprovado",
  processing: "Processando",
}


const statusesColors: any = {
  "pending": "",
  "rejected": "destructive",
  "approved": "outline",
  "processing": "secondary",
}

const ValidationPage = () => {
  const [filesList, setFilesList] = useState([]);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [formValidation, setFormValidation] = useState({
    status: "",
    workload: "",
    observation: "",
  });
  // Estado único para todos os filtros
  const [filters, setFilters] = useState<Filters>({
    description: '',
    user: '',
    status: 'all',
    createdAt: '',
    workload: '',
  });
  const [alertVisible, setAlertVisible] = useState<any>({
    visible: false,
  });
  const [drawerVisibleView, setDrawerVisibleView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfPath, setPdfPath] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const router: any = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const statusParam = queryParams.get('status');
      if (statusParam) {
        handleFilterChange("status", statusParam);
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return; // Aguarda a verificação da sessão

    if (!session) {
      router.push('/login'); // Redireciona para o login se não houver sessão
    } else if (session.user.role !== 'admin') {
      router.push('/files'); // Redireciona para uma página de não autorizado se o role não for permitido
    }
  }, [session, status]);

  async function getAllFiles() {
    setLoading(true);

    if (!session) {
      return;
    }

    try {
      // Fetch all users once and build a map
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: Record<string, any> = {};
      usersSnapshot.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });

      // Fetch all files
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
    // Aplicando filtros
    if (filters.status !== 'all') {
      filteredList = filteredList.filter((item: any) =>
        item.status === filters.status
      );
    }

    if (filters.description) {
      filteredList = filteredList.filter((item: any) =>
        item.description.toLowerCase().includes(filters.description.toLowerCase())
      );
    }

    if (filters.createdAt) {
      // Verifique se o createdAt é um Timestamp e compare datas
      filteredList = filteredList.filter((item: any) => {
        const createdDate = item.createdAt; // Se estiver usando Firebase Timestamp
        const filterDate = new Date(filters.createdAt);

        const firebaseDate = new Date(item.createdAt.seconds * 1000);

        // Formata a data do Firebase no formato yyyy-mm-dd
        const firebaseDateFormatted = firebaseDate.toISOString().split('T')[0];



        return firebaseDateFormatted === filters.createdAt;
      });
    }

    if (filters.workload) {
      filteredList = filteredList.filter((item: any) => {

        return item.workload === filters.workload

      }
      );
    }

    if (filters.user) {
      filteredList = filteredList.filter((item: any) => {

        return item.user.fullname.toLowerCase().includes(filters.user.toLowerCase())

      }
      );
    }

    return filteredList;
  }, [filesList, filters])

  useEffect(() => {
    getAllFiles();

  }, [session, status, drawerVisibleView, router]);

  useEffect(() => {
    if (pdfPath === null || pdfPath === undefined) {
      return;
    }

    const pdfRef = ref(storage, pdfPath);

    getDownloadURL(pdfRef)
      .then((url) => {
        if (url === null || url === undefined) {
          console.error("Erro ao obter a URL do PDF: a URL é nula ou indefinida");
          return;
        }

        setPdfUrl(url);
      })
      .catch((error) => {
        console.error("Erro ao obter a URL do PDF:", error);
      });

  }, [drawerVisibleView, pdfPath]);

  const handleOpenPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      console.error("URL do PDF não disponível, não é possível abrir.");
    }
  };

  const updateStatus = async () => {
    try {
      if (formValidation && currentFile.uid) {
        const fileRef = doc(db, "files", currentFile.uid);
        // Always preserve userId
        let data = {
          status: formValidation.status,
          observation: formValidation.observation || "Sem observação",
          workload: formValidation.workload,
          userId: currentFile.userId, // ensure userId is not lost
        };
        await setDoc(fileRef, data, { merge: true });
        toast({
          title: "Validação concluida com sucesso",
          variant: "default"
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

  useEffect(() => {
    setTimeout(() => {
      setPdfLoading(false);
    }, 3000);
  }, [drawerVisibleView]);

  // Função para atualizar o estado dos filtros dinamicamente
  const handleFilterChange = (field: any, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  // Função para remover um filtro individualmente
  const removeFilter = (key: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: ''
    }));
  };

  // Função para remover todos os filtros
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      description: '',
      user: '',
      createdAt: '',
      workload: ''
    });
  };



  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="bg-dark" />
      </div>
    );
  } else {

    return (
      <div>
        <ResponsiveMenu />
        <div className="container mt-5">
          <div className="flex flex-row justify-between items-center p-3 mb-4 border-b">
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
              Validação de atividades
            </h2>
            <Button variant="outline" onClick={() => setFiltersVisible(!filtersVisible)}>
              <FilterIcon size={18} />
            </Button>
          </div>


          <div
            className={`
              transition-all duration-500 ease-in-out overflow-hidden 
              ${filtersVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="mb-4 grid grid-cols-3 gap-4 bg-slate-900 p-4 rounded-sm">


              <Select onValueChange={(value) => handleFilterChange('status', value)} value={filters.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Descrição"
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
              />

              <Input
                type="text"
                placeholder="Nome do aluno"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              />
              <Input
                type="date"
                placeholder="Data de envio"
                value={filters.createdAt}
                onChange={(e) => handleFilterChange('createdAt', e.target.value)}
              />
              <Input
                placeholder="Carga Horária"
                value={filters.workload}
                onChange={(e) => handleFilterChange('workload', e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 justify-start items-center">
            {/* Render filter badges */}
            {(Object.keys(filters) as (keyof Filters)[]).map((key) => {
              if (filters[key] && (key !== "status" || filters["status"] !== "all")) {
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center text-xs font-medium p-3 h-4"
                  >
                    <span>
                      {`
                      ${filterDisplayNames[key] || key}: 
                      ${key === "createdAt"
                          ?
                          filters[key].split("-").reverse().join("/")
                          :
                          statuses[filters[key]] || filters[key]
                        }
                    `}
                    </span>
                    <button
                      onClick={() => removeFilter(key)}
                      className="text-white ml-3"
                    >
                      ✕
                    </button>
                  </Badge>
                );
              }
              return null;
            })}
            {/* Render "Remover todos" button only once if any filter is active */}
            {Object.keys(filters).some(
              (key) => filters[key as keyof Filters] && (key !== "status" || filters["status"] !== "all")
            ) && (
              <Button
                onClick={clearAllFilters}
                className="badge text-xs font-medium ml-5 p-3 h-4 rounded-full"
                variant={"destructive"}
              >
                Remover todos
              </Button>
            )}
          </div>
          <Table className='border'>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de envio</TableHead>
                <TableHead>Carga Horaria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Arquivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex justify-center items-center w-full">
                        <LoadingSpinner className="bg-dark" />
                      </div>

                    </TableCell>
                  </TableRow>
                ) :
                  filteredFilesList.length > 0 ? (
                    filteredFilesList?.map((file: any) => (
                      <TableRow key={file.pathFile}>
                        <TableCell>{file.user.fullname}</TableCell>
                        <TableCell>{file.user.registrationNumber}</TableCell>
                        <TableCell>{file.description}</TableCell>
                        <TableCell className="font-medium">
                          {new Date(file.createdAt.seconds * 1000 + file.createdAt.nanoseconds / 1000000).toLocaleString()}
                        </TableCell>
                        <TableCell>{file.workload}</TableCell>
                        <TableCell>
                          <Badge variant={statusesColors[file.status]}>{statuses[file.status]}</Badge>
                        </TableCell>
                        <TableCell className="flex">
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              setDrawerVisibleView(true);
                              setPdfPath(file.pathFile);
                              setPdfLoading(true);
                              setCurrentFile(file);
                              setFormValidation({
                                status: file.status,
                                workload: file.workload,
                                observation: file.observation || "",
                              })
                            }}
                          >
                            <FileBadge size={18} />
                          </Button>
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              handleOpenPdf();
                            }}
                          >
                            <FileDownIcon size={18} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )
              }
            </TableBody>
          </Table>

          <Drawer open={drawerVisibleView} >
            <DrawerTrigger asChild></DrawerTrigger>
            <DrawerContent className="h-[90%]">
              <DrawerHeader>
                <DrawerTitle className="text-xl font-bold">Validar atividade</DrawerTitle>

              </DrawerHeader>
              <div className="flex flex-col lg:flex-row w-full h-full gap-4 p-4 overflow-y-auto">
                {/* Formulário */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4">
                  {/* Campo para carga horária (workload) */}
                  <Label htmlFor="workload">Carga Horária</Label>
                  <Input
                    type="number"
                    placeholder="Carga Horária"
                    value={formValidation.workload}
                    onChange={(e) => setFormValidation({ ...formValidation, workload: e.target.value })}
                  />

                  {/* Campo para status */}
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setFormValidation({ ...formValidation, status: value })}
                    defaultValue={formValidation.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Campo para observação (observation) */}
                  <Label htmlFor="observation">Observação</Label>
                  <Input
                    type="text"
                    placeholder="Observação"
                    value={formValidation.observation}
                    onChange={(e) => setFormValidation({ ...formValidation, observation: e.target.value })}
                  />
                </div>

                {/* Visualizador de PDF */}
                <div className="w-full lg:w-3/4 h-full flex justify-center items-center overflow-hidden">
                  {pdfUrl && !pdfLoading ? (
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      style={{ minHeight: "400px", height: "100%", width: "100%" }}
                      title="PDF Viewer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex justify-center items-center">
                      <LoadingSpinner className="bg-dark" />
                    </div>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose className="flex justify-between">

                  <Button variant="outline" className="mr-6" onClick={() => { setDrawerVisibleView(false) }}>Cancelar</Button>
                  <Button variant="default"
                    onClick={() => { 
                      setAlertVisible({visible: true, id: currentFile.id});
                    }}
                   >
                    Salvar
                  </Button>

                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <AlertDialog open={alertVisible.visible}>
          <AlertDialogTrigger asChild></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmação
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja alterar a validação do arquivo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertVisible(false)}>Cancelar</AlertDialogCancel>
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
    );
  }
};

export default withAuthorization(ValidationPage, ["admin"]);