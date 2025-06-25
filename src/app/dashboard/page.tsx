// pages/dashboard/page.tsx
'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { LoadingSpinner } from '@/components/ui/loader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import withAuthorization from '@/components/with-authorization';
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from '@/config/firebase.config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowRight, FileClock, FilePlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    qFiles: 0,
    qUsers: 0,
    qPendingFiles: 0,
  });
  const { data: session, status } = useSession();
  const router = useRouter();


  useEffect(() => {
    const getData = async () => {
      if (!session) return; // Certifique-se de que session existe, mas não envolva o hook condicionalmente

      try {
        const files = query(collection(db, "files"));
        const users = query(collection(db, "users"));

        const filesSnapshot = await getDocs(files);
        const usersSnapshot = await getDocs(users);

        const newData = {
          qFiles: filesSnapshot.docs.length,
          qUsers: usersSnapshot.docs.length,
          qPendingFiles: 0,
        };

        filesSnapshot.forEach((doc) => {
          const fileData = doc.data();
          if (fileData.status === "pending") {
            newData.qPendingFiles++;
          }
        });

        setDashboardData(newData);
      } catch (error) {
        console.error("Erro ao obter lista de arquivos:", error);
      }
    };

    getData();
  }, [session]);


  if (status === 'loading' || !session) {

    return (
      <div className="w-full h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  } else {
    return (
      <div>
        <ResponsiveMenu></ResponsiveMenu>

        <div className="container mt-5">
          <div className="flex flex-row justify-between items-center p-3 mb-10 border-b">
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
              Painel geral
            </h2>
          </div>
          <div className="flex-row sm:flex-col lg:flex-row justify-center h-full lg:space-x-2 sm:space-y-3 xs:space-y-3" >


            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários registrados
                </CardTitle>
                <User size={18} />
              </CardHeader>
              <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-2xl font-bold">{dashboardData?.qUsers}</div>
                <Button
                  variant={"ghost"}
                  onClick={() => { router.push("/users") }}
                >
                  Ver detalhes
                  <ArrowRight className="ml-5" size={16} />
                </Button>

              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Arquivos submetidos
                </CardTitle>
                <FilePlus size={18} />
              </CardHeader>
              <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-2xl font-bold">{dashboardData?.qFiles}</div>
                <Button
                  variant={"ghost"}
                  onClick={() => { 
                    router.push('/validation') ;
                  }}
                >
                  Ver detalhes
                  <ArrowRight className="ml-5" size={16} />
                </Button>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
                <CardTitle className="text-sm font-medium">
                  Arquivos pendentes
                </CardTitle>
                <FileClock size={18} />
              </CardHeader>
              <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-2xl font-bold">{dashboardData?.qPendingFiles}</div>
                <Button
                  variant={"ghost"}
                  onClick={() => { 
                    router.push('/validation?status=pending') ;
                  }}
                >
                  Ver detalhes
                  <ArrowRight className="ml-5" size={16} />
                  </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    );
  }


};

export default withAuthorization(DashboardPage, ["admin"]);
