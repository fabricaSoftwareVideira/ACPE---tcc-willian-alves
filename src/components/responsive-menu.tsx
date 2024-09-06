import React, { useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { ModeToggle } from './ui/mode-toggle';
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

  useEffect(() => {


  }, [session])

  return (
    <header className="shadow-md z-50 m-3">
      <nav className="container mx-auto p-4 flex justify-between items-center">

        <div className="flex items-center justify-between w-full">

          <div className="space-x-6">

            <Link href="" legacyBehavior passHref className="text-xl font-bold mr-4" style={{ fontSize: 22 }}>
              Controle CC
            </Link>

            {session?.user.role === "admin" && (
              <Link href="/dashboard" legacyBehavior passHref className="text-md">
                Dashboard
              </Link>
            )}
            {session?.user.role === "admin" && (
              <Link href="/validation" legacyBehavior passHref className="text-md">
                Validacao de arquivos
              </Link>
            )}


            {session?.user.role !== "admin" && (
              <Link href="/files" legacyBehavior passHref>
                Arquivos
              </Link>
            )}

          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="flex flex-row align-center justify-center"
              >
                <UserCircle size={16} className='mr-2 mt-1' />
                {session?.user.name?.split(" ")[0]}
                <ChevronDown size={12} className='ml-2 mt-1' />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/myprogress")}
                >
                  Meu Progresso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={()=>{}}
                >
                  Notificacoes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </nav>

    </header >

  );
};

export default ResponsiveMenu;
