import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { FileBadge } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statuses: any = {
  "pending": "Pendente",
  "rejected": "Rejeitado",
  "approved": "Aprovado",
  "processing": "Processando",
}
const statusesColors: any = {
  "pending": "",
  "rejected": "destructive",
  "approved": "outline",
  "processing": "secondary",
}

interface FilesTableProps {
  filesList: any[];
  loading: boolean;
  setDrawerVisibleView: (open: boolean) => void;
  setPdfPath: (path: string) => void;
  drawerVisibleView: boolean;
  pdfUrl: string | null;
  pdfLoading: boolean;
  setPdfLoading: (loading: boolean) => void;
  setPdfUrl: (url: string | null) => void;
  setFilesList: (files: any[]) => void;
}

const FilesTable: React.FC<FilesTableProps> = ({
  filesList,
  loading,
  setDrawerVisibleView,
  setPdfPath,
  drawerVisibleView,
  pdfUrl,
  pdfLoading,
  setPdfLoading,
  setPdfUrl,
  setFilesList,
}) => {
  return (
    <Table className='border'>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Data de realização</TableHead>
          <TableHead>Data de envio</TableHead>
          <TableHead>Carga Horaria</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Arquivo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filesList.length > 0
          ? loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <div className=" flex align-center justify-center"><LoadingSpinner className="bg-dark" /></div>
              </TableCell>
            </TableRow>
          ) : (
            filesList?.map((file: any) => (
              <TableRow key={file.pathFile}>
                <TableCell>{file.name ?? 'Sem nome'}</TableCell>
                <TableCell>{file.description ?? 'Sem Descrição'}</TableCell>
                <TableCell>{file.completionDate ? new Date(file.completionDate).toLocaleDateString() : "Sem data de realização"}</TableCell>
                <TableCell className="font-medium">{new Date(file.createdAt.seconds * 1000 + file.createdAt.nanoseconds / 1000000).toLocaleString()}</TableCell>
                <TableCell>{file.workload}</TableCell>
                <TableCell>
                  <Badge variant={statusesColors[file.status]}>{statuses[file.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          setPdfLoading(true);
                          setDrawerVisibleView(true);
                          setPdfPath(file.pathFile)
                        }}
                      >
                        <FileBadge size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Visualizar arquivo</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Nenhum dado disponível
              </TableCell>
            </TableRow>
          )
        }
      </TableBody>
    </Table>
  );
};

export default FilesTable; 