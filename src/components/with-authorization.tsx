"use client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LoadingSpinner } from "./ui/loader";

interface WithAuthorizationProps {
    children: ReactNode;
    allowedRoles: string[]; // Roles that are allowed to access the page
}

const withAuthorization = (Component: any, allowedRoles: string[]) => {
    const WrappedComponent = (props: any) => {
        const { data: session, status } = useSession();
        const router = useRouter();
        const { toast } = useToast();

        useEffect(() => {
            if (status === "unauthenticated") {
                // Redirect to login if unauthenticated
                router.push("/login");
            } else if (status === "authenticated" && !allowedRoles.includes(session?.user?.role || "")) {
                toast({
                    variant: "destructive",
                    title: "Acesso nao autorizado!",
                })
                // Redirect to unauthorized page if role is not allowed

                if (session?.user?.role === "admin") {
                    router.push("/dashboard");
                } else {
                    router.push("/myprogress");
                }
            }
        }, [status, session, router, allowedRoles, toast]);

        // Show a loading state while checking session
        if (status === "loading") return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner className="bg-dark" />
            </div>
        );

        // If authenticated and role is allowed, render the component
        if (status === "authenticated" && allowedRoles.includes(session?.user?.role || "")) {
            return <Component {...props} />;
        }

        // Optionally, return null while the redirect happens
        return null;
    };

    return WrappedComponent;
};

export default withAuthorization;