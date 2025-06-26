import dynamic from 'next/dynamic';

const UsersPage = dynamic(() => import('@/components/users-page'), { ssr: false });

export default function Page() {
  return <UsersPage />;
} 