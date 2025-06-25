import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, UserCircle } from 'lucide-react';
import Image from "next/image";

const ResponsiveMenu: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }



  if (session) {
    return (
      <header className="shadow-md z-50 m-3">
        <nav className="container mx-auto p-4 flex justify-between items-center">

          <div className="flex items-center justify-between w-full">

            <div className="flex flex-row items-center justify-center space-x-6">

              {/* Título ou logotipo */}
              <Link href="/dashboard" className="text-xl font-bold mr-4 hidden md:block" style={{ fontSize: 22 }}>
                <Image
                  src="/icon.png" // Caminho para sua imagem
                  alt="Background do curso de Ciência da Computação"
                  width={30}
                  height={30}
                  quality={100}
                  className="opacity-70"
                />
              </Link>

              {/* Links condicionais baseados no papel do usuário */}
              {session?.user.role === "admin" && (
                <Link href="/dashboard" className="text-md">
                  Painel Geral
                </Link>
              )}
              {session?.user.role === "admin" && (
                <Link href="/validation" className="text-md">
                  Validação de atividades
                </Link>
              )}

              {session?.user.role === "admin" && (
                <Link href="/users" className="text-md">
                  Usuários
                </Link>
              )}

              {/* Link para usuários não admin */}
              {session?.user.role !== "admin" && (
                <Link href="/files" className="text-md">
                  Atividades
                </Link>
              )}

            </div>

            <div>
              {/* Menu suspenso do usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex flex-row align-center justify-center"
                  aria-label="Abrir menu de usuário"
                >
                  <UserCircle size={16} className='mr-2 mt-1' />
                  <div className="hidden md:block">
                    {
                      session?.user?.name?.split(" ")[0] || "Usuário"
                    }
                  </div>
                  <ChevronDown size={12} className='ml-2 mt-1' />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  {
                    session?.user.role === "admin" && (
                      
                      <DropdownMenuItem onClick={() => router.push("/adminpanel")}>
                        Painel administrativo
                      </DropdownMenuItem>
                    )
                  }
                  <DropdownMenuSeparator />

                  {
                    session?.user.role !== "admin" && (
                      <>
                        <DropdownMenuItem onClick={() => router.push("/myprogress")}>
                          Meu Progresso
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => { }}>
                          Notificações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )
                  }


                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </nav>
      </header>
    );
  }
};

export default ResponsiveMenu;
