import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ValidationArchiveDialogProps {
  showArchiveDialog: boolean;
  setShowArchiveDialog: (v: boolean) => void;
  handleArchiveFile: () => void;
}

const ValidationArchiveDialog: React.FC<ValidationArchiveDialogProps> = ({
  showArchiveDialog,
  setShowArchiveDialog,
  handleArchiveFile,
}) => {
  return (
    <AlertDialog open={showArchiveDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar arquivo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja arquivar este arquivo? Ele não aparecerá mais na listagem padrão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowArchiveDialog(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleArchiveFile}>
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default React.memo(ValidationArchiveDialog); 