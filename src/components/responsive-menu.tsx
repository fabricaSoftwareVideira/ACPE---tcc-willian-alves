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

const ResponsiveMenu: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <header className="shadow-md z-50 m-3">
        <nav className="container mx-auto p-4 flex justify-between items-center">

          <div className="flex items-center justify-between w-full">

            <div className="space-x-6">

              {/* Título ou logotipo */}
              <Link href="/" className="text-xl font-bold mr-4" style={{ fontSize: 22 }}>
                Controle CC
              </Link>

              {/* Links condicionais baseados no papel do usuário */}
              {session?.user.role === "admin" && (
                <Link href="/dashboard" className="text-md">
                  Dashboard
                </Link>
              )}
              {session?.user.role === "admin" && (
                <Link href="/validation" className="text-md">
                  Validação de Arquivos
                </Link>
              )}

              {/* Link para usuários não admin */}
              {session?.user.role !== "admin" && (
                <Link href="/files" className="text-md">
                  Arquivos
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
                  {session?.user?.name?.split(" ")[0] || "Usuário"}
                  <ChevronDown size={12} className='ml-2 mt-1' />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/myprogress")}>
                    Meu Progresso
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => { }}>
                    Notificações
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

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
