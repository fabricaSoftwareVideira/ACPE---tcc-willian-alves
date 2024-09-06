// pages/dashboard/page.tsx
'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, storage } from '@/config/firebase.config';
import {
  Table,
  TableBody,
  TableCaption,
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

import { Input } from "../../components/ui/input";
import { calculatePdfHash, getRandomFileName } from '@/lib/utils';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/ui/loader';




interface FileValidation {
  description: string;
  workload: string;
  hashFile: string;
  status: string;
  userId: string;
  pathFile: string;
  createdAt: string;
}

const statuses = {
  "pending": "Pendente",
  "rejected": "Rejeitado",
  "approved": "Aprovado",
  "processing": "Processando",
}
const statusesColors = {
  "pending": "",
  "rejected": "destructive",
  "approved": "outline",
  "processing": "secondary",
}
const ValidationPage = () => {
  const [filesList, setFilesList] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState({
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


        const arrayFileslist: Array<any> = [];
        filesSnapshot.forEach((fi) => {
          const userId = fi.data().userId;
          const userDoc = usersSnapshot.docs.find((us) => us.id === userId);
          if (!userDoc) {
            console.error(`User not found: ${userId}`);
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

  }, [session, status, drawerVisibleView]);

  useEffect(() => {
    if (pdfPath === null || pdfPath === undefined) {
      return;
    }

    const pdfRef = ref(storage, pdfPath);

    // Obtém a URL de download
    getDownloadURL(pdfRef)
      .then((url) => {
        if (url === null || url === undefined) {
          console.error("Erro ao obter a URL do PDF: a URL é nula ou indefinida");
          return;
        }

        setPdfUrl(url); // Define a URL no estado
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


  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="bg-dark" />
      </div>
    );
  }


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
              <TableHead>Matricula</TableHead>
              <TableHead>Descricao</TableHead>
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
                  <TableCell className="font-medium">{new Date(file.createdAt.seconds * 1000 + file.createdAt.nanoseconds / 1000000).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusesColors[file.status]}>{statuses[file.status]}</Badge>

                  </TableCell>
                  <TableCell>
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            setDrawerVisibleView(true);
                            setPdfPath(file.pathFile);
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
            )
            }
          </TableBody>
        </Table>

        <Drawer
                      open={drawerVisibleView}
                    >
                      <DrawerTrigger asChild>
                      </DrawerTrigger>
                      <DrawerContent className="h-80% ">
                        <DrawerHeader>
                          <DrawerTitle>Valide o arquivo </DrawerTitle>
                          <DrawerDescription>
                            Descricao: {currentFile?.description}
                          </DrawerDescription>

                          <DrawerDescription>
                            Carga horaria: {currentFile?.workload}
                          </DrawerDescription>
                        </DrawerHeader>
                        <div>
                          {pdfUrl ? (
                            <iframe
                              src={pdfUrl}
                              width="100%"
                              height="600px"
                              title="PDF Viewer"
                            />
                          ) : (
                            <p><LoadingSpinner className="bg-dark" /></p>
                          )}
                        </div>

                        <DrawerFooter>
                          <DrawerClose className="flex justify-between">

                            <div>
                              <Button variant="outline" className="mr-6" onClick={() => { setDrawerVisibleView(false) }}>Cancelar</Button>
                              {
                                currentFile?.status === 'pending' &&
                                <Button 
                                  variant="destructive"
                                  onClick={() => {
                                    setAlertVisible({
                                      visible: true,
                                      message: "recusar",
                                      id: currentFile?.uid,
                                      type: 'rejected'
                                    })
                                  }}
                                >
                                  Recusar
                                </Button>

                              }
                            </div>

                              {
                                currentFile?.status === 'pending' &&
                                
                                  <Button 
                                    variant="default"
                                    onClick={() => {
                                      setAlertVisible({
                                        visible: true,
                                        message: "aprovar",
                                        id: currentFile?.uid,
                                        type: 'approved'
                                      })
                                    }}
                                  >
                                    Aprovar
                                  </Button>

                              }

                          </DrawerClose>
                        </DrawerFooter>
                      </ DrawerContent>
                    </Drawer>

        <AlertDialog
          open={alertVisible.visible}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Voce tem certeza que deseja {alertVisible.message} o arquivo?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirme que o arquivo e valido, pertinente ao curso e a carga hpraria compativel a enviada no formulario
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  updateStatus(alertVisible.id, alertVisible.type);
                  setDrawerVisibleView(false);
                  setAlertVisible({ ...alertVisible, visible: false });
                }}
              >
                Sim, tenho certeza
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        
      </div>
    </div>
  );
};

export default ValidationPage;
