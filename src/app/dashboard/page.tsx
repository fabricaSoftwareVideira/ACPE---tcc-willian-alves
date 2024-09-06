// pages/dashboard/page.tsx
'use client'
import ResponsiveMenu from '@/components/responsive-menu';
import { LoadingSpinner } from '@/components/ui/loader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Aguarda a verificação da sessão

    if (!session) {
      router.push('/login'); // Redireciona para o login se não houver sessão
    } else if (session.user.role !== 'admin') {
      router.push('/myprogress'); // Redireciona para uma página de não autorizado se o role não for permitido
    }
  }, [session, status]);

  if (status === 'loading' || !session) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <ResponsiveMenu></ResponsiveMenu>
      Bem-vindo ao Dashboard, {session.user.name}!
    </div>
  );
};

export default DashboardPage;
