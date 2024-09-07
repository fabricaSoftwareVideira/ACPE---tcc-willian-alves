import dynamic from 'next/dynamic';

const FilesPage = dynamic(() => import('@/components/files-page'), { ssr: false });

export default function Page() {
  return <FilesPage />;
}