// pages/dashboard/page.tsx
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
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { calculatePdfHash, getRandomFileName } from '@/lib/utils';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loader';
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



const formSchema = z.object({
  description: z.string().min(2, {
    message: "Descricao é obrigatória",
  }),
  file: z.instanceof(File)
    .refine((file) => file.size < 5 * 1024 * 1024, { // 5MB max size
      message: "O arquivo deve ter menos de 5MB.",
    }),
  // .refine((file) => file.type.startsWith("pdf/"), {
  //   message: "O arquivo deve ser uma PDF.",
  // }),
  workload: z.string().min(1, { message: "Carga horaria é obrigatória" }),

});

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
const ProgressPage = () => {
  const [loading, setLoading] = useState(false);
  const [myWorkload, setMyWorkload] = useState(0);
  const [drawerVisibleForm, setDrawerVisibleForm] = useState(false);
  const [drawerVisibleView, setDrawerVisibleView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfPath, setPdfPath] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    async function getAllFiles() {
      if (!session) {
        return;
      }

      try {
        const q = query(collection(db, "files"), where("userId", "==", session.user.id));

        const querySnapshot = await getDocs(q);
        console.log(querySnapshot);

        if (querySnapshot.empty) {
          console.log("snapshot empty");

          return;
        }

        let workloadCompleted = 0;

        querySnapshot.forEach((doc) => {

          const data = doc.data();

          if (data?.status === "approved") {

            workloadCompleted += parseInt(data?.workload);
          }

        });

        setMyWorkload(workloadCompleted);
      } catch (error) {
        console.error("Erro ao obter lista de arquivos:", error);
      }
    }
    getAllFiles();

  }, [session, status, drawerVisibleForm]);


  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center h-screen">
      <LoadingSpinner className="bg-dark" /></div>; // Mostra um carregando enquanto a sessão é verificada
  }

  return (
    <div>
      <ResponsiveMenu />
      <div className="container mt-5">
        <div className="flex flex-row justify-between items-center p-3 mb-10 border-b">
          <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
            Meu progresso
          </h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
            <CardDescription>Acompanhe seu progresso atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-semibold mb-2">Carga horária concluída: {myWorkload}h</p>
            </div>
            <Progress value={myWorkload} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProgressPage;
