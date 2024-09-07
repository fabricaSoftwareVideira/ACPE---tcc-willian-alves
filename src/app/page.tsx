import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button"; // Importação do botão do ShadCN
import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <Image 
          src="/computacao-background.webp" // Caminho para sua imagem
          alt="Background do curso de Ciência da Computação"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-70"
        />
      </div>

      {/* Conteúdo da página */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen p-6">
        {/* Botões no canto superior direito */}
        <div className="flex justify-end space-x-4">
          <Link href="/login" passHref>
            <Button className="px-6 py-2 text-sm font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button className="px-6 py-2 text-sm font-semibold" variant="outline">
              Registro
            </Button>
          </Link>
        </div>

        {/* Título e Descrição no centro */}
        <div className="flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-3xl font-bold mb-4 drop-shadow-lg">
            Sistema de Controle - Ciência da Computação
          </h1>
          <p className="text-sm max-w-2xl drop-shadow-lg">
            Bem-vindo ao sistema de controle do curso de Ciência da Computação do Instituto Federal Catarinense. Gerencie seus arquivos, acompanhe seu progresso e muito mais!
          </p>
        </div>

        {/* Espaçamento no rodapé (opcional) */}
        <div />
      </div>
    </main>
  );
}
