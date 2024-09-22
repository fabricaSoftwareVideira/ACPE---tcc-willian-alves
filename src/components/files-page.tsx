'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from '@/config/firebase.config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, FileBadge } from 'lucide-react';
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { calculatePdfHash, getRandomFileName } from '@/lib/utils';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loader';
import withAuthorization from '@/components/with-authorization';


const formSchema = z.object({
  description: z.string().min(2, {
    message: "Descricao é obrigatória",
  }),
  file: z.instanceof(globalThis.FileList).optional(),
  workload: z.string().min(1, { message: "Carga horaria é obrigatória" }),

});

interface FileValidation {
  description: string;
  workload: string;
  hashFile: string;
  status: string;
  userId: any;
  pathFile: string;
  createdAt: any;
}

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
const FilesPage = () => {
  const [filesList, setFilesList] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [drawerVisibleForm, setDrawerVisibleForm] = useState(false);
  const [drawerVisibleView, setDrawerVisibleView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<any>(null);
  const [pdfPath, setPdfPath] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast()

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      workload: "",
    },
    mode: "onBlur",
  });

  const fileRef = form.register("file", { required: true });

  const uploadFile = async (file: File, fileName: string, userId: any) => {
    const pathFile = `${userId}/${fileName}.pdf`;

    const storage = getStorage();
    const storageRef = ref(storage, pathFile);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      return pathFile;
    } catch (error) {
      console.error("Erro ao upload arquivo:", error);
      throw error; // rethrow the error to propagate it up the call stack
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      if (!values?.file || !session) {
        toast({
          variant: "destructive",
          title: "Ops! Nenhum arquivo selecionado.",
          description: "Selecione um arquivo ou tente novamente mais tarde.",
        })

        return;
      } {

        if (values.file?.length > 0) {
          let selectedFile = values.file[0];
          const hash = await calculatePdfHash(selectedFile);
          
          const fileName = await getRandomFileName();


          const filesCollectionRef = collection(db, "files");

          // Verifica se já existe um documento com o hashFile
          const q = query(filesCollectionRef, where("hashFile", "==", hash));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            toast({
              variant: "destructive",
              title: "Ops! Ja existe um arquivo igual ao adicionado.",
              description: "Adicione um novo arquivo ou tente novamente mais tarde.",
            })
            setLoading(false);
            setDrawerVisibleForm(false);
            form.clearErrors();
            form.reset()
            return;
          } else {

            const pathFile = await uploadFile(selectedFile, fileName, session?.user.id);

            const fileValidation: FileValidation = {
              description: values.description,
              workload: values.workload,
              hashFile: hash,
              status: "pending",
              userId: session?.user.id,
              pathFile,
              createdAt: serverTimestamp(),
            };


            // Add a new document with a generated id.
            const docRef = await addDoc(collection(db, "files"), fileValidation);

            toast({
              title: "Atividade cadastrada com sucesso!",
              description: "Acompanhe o progresso na sua conta.",
            })

            setLoading(false);
            setDrawerVisibleForm(false);
            form.clearErrors();
            form.reset()
          }
        } else {

          toast({
            variant: "destructive",
            title: "Ops! Nenhum arquivo selecionado.",
            description: "Selecione um arquivo ou tente novamente mais tarde.",
          })
        }

      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar.",
        description: error,
      })
      console.error("Erro ao registrar:", error);
      setLoading(false);
      setDrawerVisibleForm(false);
      form.clearErrors();
      form.reset()
    }
  }
  



  useEffect(() => {
    async function getAllFiles() {
      setLoading(true);
      if (!session) {
        return;
      }

      try {
        const q = query(collection(db, "files"), where("userId", "==", session.user.id));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {

          setFilesList([]);

          setLoading(false);
          return;
        }

        const arrayFileslist: Array<any> = [];
        querySnapshot.forEach((doc) => {
          arrayFileslist.push(doc.data());
        });

        setFilesList(arrayFileslist);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao obter lista de arquivos:", error);
      }
    }
    getAllFiles();

  }, [session, status, drawerVisibleForm]);

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




  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="bg-dark" />
      </div>
    );
  }else{

    return (
      <div>
        <ResponsiveMenu />
        <div className="container mt-5">
          <div className="flex flex-row justify-between items-center p-3 mb-10 border-b">
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
              Atividades
            </h2>
            <Drawer
              open={drawerVisibleForm}
            >
              <DrawerTrigger asChild>
                <Button
                  variant={"secondary"}
                  onClick={() => setDrawerVisibleForm(true)}
                >
                  <Plus size={16} />

                  Adicionar atividade
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-80% ">
                <DrawerHeader>
                  <DrawerTitle>Adicione novos arquivos</DrawerTitle>
                  <DrawerDescription>Arquivos duplicados sao verificados automaticamente.</DrawerDescription>
                </DrawerHeader>
                <div className='h-max p-4'>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Descricao da atividade </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite uma descricao para a atividade"
                                className={fieldState.error ? "text-color-red" : ""}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workload"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Carga horaria </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder="Digite a carga horaria em horas"
                                className={fieldState.error ? "text-color-red" : ""}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="file"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Arquivo</FormLabel>
                            <FormControl>
                              <Input
                                {...fileRef}
                                placeholder="Arquivo"
                                type="file"
                                accept="application/pdf"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DrawerFooter className="flex flex-row justify-between m-0 p-0">
                        <DrawerClose>
                          <Button variant="outline" onClick={() => { setDrawerVisibleForm(false) }}>Cancelar</Button>
                        </DrawerClose>
                        <Button type="submit" disabled={loading}>
                          {loading ? <LoadingSpinner className="text-dark" /> : "Enviar"}
                        </Button>
                      </DrawerFooter>
                    </form>

                  </Form>
                </div>

              </DrawerContent>
            </Drawer>

          </div>
          <Table className='border'>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Data de envio</TableHead>
                <TableHead>Carga Horaria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Arquivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filesList.length > 0
                ? loading ? (

                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className=" flex align-center justify-center"><LoadingSpinner className="bg-dark" /></div>
                    </TableCell>
                  </TableRow>
                )
                  : (
                    filesList?.map((file: any) => (

                      <TableRow key={file.pathFile}>
                        <TableCell>{file.description}</TableCell>
                        <TableCell className="font-medium">{new Date(file.createdAt.seconds * 1000 + file.createdAt.nanoseconds / 1000000).toLocaleString()}</TableCell>         
                        <TableCell>{file.workload}</TableCell>
                        <TableCell>
                          <Badge variant={statusesColors[file.status]}>{statuses[file.status]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Drawer
                            open={drawerVisibleView}
                          >
                            <DrawerTrigger asChild>
                              <Button
                                variant={"ghost"}
                                onClick={() => {
                                  setDrawerVisibleView(true);
                                  setPdfPath(file.pathFile)
                                }}
                              >
                                <FileBadge size={18} />

                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="h-80% ">
                              <DrawerHeader>
                                <DrawerTitle>Visualize seu arquivo</DrawerTitle>
                              </DrawerHeader>
                              <div>
                                {pdfUrl && pdfLoading ? (
                                  <iframe
                                    src={pdfUrl}
                                    width="100%"
                                    height="600px"
                                    title="PDF Viewer"
                                    onLoad={() => setPdfLoading(false)}
                                  />
                                ) : (
                                  <div className="h-full w-full flex justify-center items-center"><LoadingSpinner className="bg-dark" /></div>
                                )}
                              </div>

                              <DrawerFooter>
                                <DrawerClose>
                                  <Button variant="outline" onClick={() => { setDrawerVisibleView(false) }}>Cancelar</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </ DrawerContent>
                          </Drawer>
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
        </div>
      </div>
    );
  }
};

export default withAuthorization(FilesPage, ["common"] );
