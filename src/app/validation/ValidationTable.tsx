import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileBadge, FileDownIcon, ArchiveIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loader";

interface ValidationTableProps {
  filteredFilesList: any[];
  loading: boolean;
  downloadLoadingFiles: Record<string, boolean>;
  setDrawerVisibleView: (v: boolean) => void;
  setPdfPath: (v: string) => void;
  setPdfLoading: (v: boolean) => void;
  setCurrentFile: (v: any) => void;
  setFormValidation: (v: any) => void;
  handleOpenPdf: (path: string, uid: string) => void;
  setShowArchiveDialog: (v: boolean) => void;
  setAlertVisible?: (v: any) => void;
  statuses: Record<string, string>;
  statusesColors: Record<string, string>;
}

const ValidationTable: React.FC<ValidationTableProps> = ({
  filteredFilesList,
  loading,
  downloadLoadingFiles,
  setDrawerVisibleView,
  setPdfPath,
  setPdfLoading,
  setCurrentFile,
  setFormValidation,
  handleOpenPdf,
  setShowArchiveDialog,
  setAlertVisible,
  statuses,
  statusesColors,
}) => {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Data de envio</TableHead>
          <TableHead>Carga Horaria</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              <div className="flex justify-center items-center w-full">
                <LoadingSpinner className="bg-dark" />
              </div>
            </TableCell>
          </TableRow>
        ) : filteredFilesList.length > 0 ? (
          filteredFilesList.map((file: any) => (
            <TableRow key={file.pathFile}>
              <TableCell>{file.user.fullname}</TableCell>
              <TableCell>{file.description}</TableCell>
              <TableCell className="font-medium">
                {file.createdAt && typeof file.createdAt.seconds === "number"
                  ? new Date(
                      file.createdAt.seconds * 1000 +
                        (file.createdAt.nanoseconds
                          ? file.createdAt.nanoseconds / 1000000
                          : 0)
                    ).toLocaleString()
                  : "Data não disponível"}
              </TableCell>
              <TableCell>{file.workload}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={statusesColors[file.status] as any}>
                    {statuses[file.status]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        setDrawerVisibleView(true);
                        setPdfPath(file.pathFile);
                        setPdfLoading(true);
                        setCurrentFile(file);
                        setFormValidation({
                          status: file.status,
                          workload: file.workload,
                          observation: file.observation || "",
                        });
                      }}
                    >
                      <FileBadge size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Validar arquivo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"ghost"}
                      disabled={downloadLoadingFiles[file.uid] || false}
                      onClick={() => {
                        setCurrentFile(file);
                        handleOpenPdf(file.pathFile, file.uid);
                      }}
                    >
                      {downloadLoadingFiles[file.uid] ? (
                        <LoadingSpinner className="bg-dark" />
                      ) : (
                        <FileDownIcon size={18} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Baixar arquivo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (file.status !== "approved" || file.archived) return;
                        setCurrentFile(file);
                        setShowArchiveDialog(true);
                      }}
                    >
                      <ArchiveIcon
                        size={18}
                        className={
                          file.archived ? "text-blue-600" : "text-gray-400"
                        }
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {file.status !== "approved" && !file.archived
                      ? "Arquivo não aprovado"
                      : file.archived
                      ? "Arquivo já arquivado"
                      : "Arquivar arquivo"}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Nenhum dado disponível
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default React.memo(ValidationTable);
