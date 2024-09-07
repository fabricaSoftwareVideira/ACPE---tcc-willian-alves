'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from '@/config/firebase.config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Container, Icon, Plus, FileBadge } from 'lucide-react';
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

const statuses: any = {
  "pending": "Pendente",
  "rejected": "Rejeitado",
  "approved": "Aprovado",
  "processing": "Processando",
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
  const [alertVisible, setAlertVisible] = useState<any>({
    visible: false,
  });
  const [drawerVisibleView, setDrawerVisibleView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfPath, setPdfPath] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Aguarda a verificação da sessão

    if (!session) {
      router.push('/login'); // Redireciona para o login se não houver sessão
    } else if (session.user.role !== 'admin') {
      router.push('/files'); // Redireciona para uma página de não autorizado se o role não for permitido
    }
  }, [session, status]);

  useEffect(() => {
    async function getAllFiles() {
      if (!session) {
        return;
      }

      try {
        const files = query(collection(db, "files"));
        const users = query(collection(db, "users"));
        const filesSnapshot = await getDocs(files);
        const usersSnapshot = await getDocs(users);

        if (filesSnapshot.empty) {
          setFilesList([]);
          return;
        }

        const arrayFileslist: any = [];
        filesSnapshot.forEach((fi) => {
          const userId = fi.data().userId;
          const userDoc = usersSnapshot.docs.find((us) => us.id === userId);
          if (!userDoc) {
            console.error(`Usuário não encontrado: ${userId}`);
            return;
          }

          const item = fi.data();
          console.log(fi.id);
          item.uid = fi.id;
          item.user = userDoc.data();

          arrayFileslist.push(item);
        });

        console.log(arrayFileslist);

        setFilesList(arrayFileslist);
      } catch (error) {
        console.error("Erro ao obter lista de arquivos:", error);
      }
    }
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

  const updateStatus = async (id: string, status: string) => {
    try {
      console.log(status, id);

      const fileRef = doc(db, "files", id);
      await updateDoc(fileRef, { status: status });
    } catch (error) {
      console.error("Erro ao atualizar o status:", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPdfLoading(false);
    }, 3000);
  }, [drawerVisibleView]);

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
          <div className="flex flex-row justify-between items-center p-3 mb-10 border-b">
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
              Analisar arquivos
            </h2>
          </div>
          <Table className='border'>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de envio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Arquivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filesList.length > 0 ? (
                filesList?.map((file: any) => (
                  <TableRow key={file.pathFile}>
                    <TableCell>{file.user.fullname}</TableCell>
                    <TableCell>{file.user.registrationNumber}</TableCell>
                    <TableCell>{file.description}</TableCell>
                    <TableCell className="font-medium">
                      {new Date(file.createdAt.seconds * 1000 + file.createdAt.nanoseconds / 1000000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusesColors[file.status]}>{statuses[file.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          setDrawerVisibleView(true);
                          setPdfPath(file.pathFile);
                          setPdfLoading(true);
                          setCurrentFile(file);
                        }}
                      >
                        <FileBadge size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Drawer open={drawerVisibleView}>
            <DrawerTrigger asChild></DrawerTrigger>
            <DrawerContent className="h-80% ">
              <DrawerHeader>
                <DrawerTitle>Valide o arquivo </DrawerTitle>
                <DrawerDescription>
                  Descrição: {currentFile?.description}
                </DrawerDescription>
                <DrawerDescription>
                  Carga horária: {currentFile?.workload}
                </DrawerDescription>
              </DrawerHeader>
              <div>
                {pdfUrl && !pdfLoading ? (
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                    loading='lazy'
                  />
                ) : (
                  <div className="h-full w-full flex justify-center items-center">
                    <LoadingSpinner className="bg-dark" />
                  </div>
                )}
              </div>

              <DrawerFooter>
                <DrawerClose className="flex justify-between">
                  <div>
                    <Button variant="outline" className="mr-6" onClick={() => { setDrawerVisibleView(false) }}>Cancelar</Button>
                    {currentFile?.status === 'pending' && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setAlertVisible({
                            visible: true,
                            message: "recusar",
                            id: currentFile.uid
                          });
                        }}
                      >
                        Recusar
                      </Button>
                    )}
                  </div>

                  {currentFile?.status === 'pending' && (
                    <Button
                      onClick={() => {
                        updateStatus(currentFile.uid, 'approved');
                        setDrawerVisibleView(false);
                      }}
                    >
                      Aprovar
                    </Button>
                  )}
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
                Tem certeza que deseja {alertVisible.message} o arquivo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertVisible(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  updateStatus(alertVisible.id, 'rejected');
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