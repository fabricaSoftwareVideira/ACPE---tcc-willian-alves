import React from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from '@/components/ui/loader';

interface ValidationDrawerProps {
  drawerVisibleView: boolean;
  setDrawerVisibleView: (v: boolean) => void;
  pdfUrl: string;
  pdfLoading: boolean;
  formValidation: any;
  setFormValidation: (v: any) => void;
  updateStatus: () => void;
  setAlertVisible: (v: any) => void;
  currentFile: any;
}

const ValidationDrawer: React.FC<ValidationDrawerProps> = ({
  drawerVisibleView,
  setDrawerVisibleView,
  pdfUrl,
  pdfLoading,
  formValidation,
  setFormValidation,
  updateStatus,
  setAlertVisible,
  currentFile,
}) => {
  return (
    <Drawer open={drawerVisibleView}>
      <DrawerTrigger asChild></DrawerTrigger>
      <DrawerContent className="h-[90%]">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold">Validar atividade</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col lg:flex-row w-full h-full gap-4 p-4 overflow-y-auto">
          <div className="w-full lg:w-1/4 flex flex-col gap-4">
            <Label htmlFor="workload">Carga Horária</Label>
            <Input
              type="number"
              placeholder="Carga Horária"
              value={formValidation.workload}
              onChange={(e) => setFormValidation({ ...formValidation, workload: e.target.value })}
            />
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) => setFormValidation({ ...formValidation, status: value })}
              defaultValue={formValidation.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="observation">Observação</Label>
            <Input
              type="text"
              placeholder="Observação"
              value={formValidation.observation}
              onChange={(e) => setFormValidation({ ...formValidation, observation: e.target.value })}
            />
          </div>
          <div className="w-full lg:w-3/4 h-full flex justify-center items-center overflow-hidden">
            {pdfUrl && !pdfLoading ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                style={{ minHeight: "400px", height: "100%", width: "100%" }}
                title="PDF Viewer"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex justify-center items-center">
                <LoadingSpinner className="bg-dark" />
              </div>
            )}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose className="flex justify-between">
            <Button
              variant="outline"
              className="mr-6"
              onClick={() => {
                setDrawerVisibleView(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setAlertVisible({ visible: true, id: currentFile.id });
              }}
            >
              Salvar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default React.memo(ValidationDrawer); 