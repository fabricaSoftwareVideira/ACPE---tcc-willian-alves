import { User, columns } from "./columns"
import { DataTable } from "./data-table"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from '@/config/firebase.config';
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getServerSideProps } from "next/dist/build/templates/pages";
import { getSession, useSession } from "next-auth/react";
import { authOptions } from "@/lib/auth";

async function getData(): Promise<any> {
  try {

    const users = query(
      collection(db, "users"), 
      where("email", "!=", "admin@admin.com"),
    );
    const files = query(
      collection(db, "files"),
      where("status", "==", "approved")
    );

    const filesSnapshot = await getDocs(files);
    const usersSnapshot = await getDocs(users);

    const arrayUsersList: Array<any> = [];

    usersSnapshot.forEach((user) => {
      let progress:any = 0;
      let userData = user.data();

      filesSnapshot.forEach((file) => {
        if(file.data().userId === user.id){
          progress += parseInt(file.data().workload);
        }
      })

      userData.progress = progress;


      arrayUsersList.push(userData);
    });

    return arrayUsersList;
  } catch (error) {

  }
}

export default async function UsersPage() {
  const session: any = await getServerSession(authOptions);
  const data = await getData();

  if (session) {
    if (session?.user?.role == "admin") {      
      return (
        <DataTable columns={columns} data={data} pageName="Usuarios" />
      )
    }else{           
      redirect("/myprogress");
    }
  }

}
