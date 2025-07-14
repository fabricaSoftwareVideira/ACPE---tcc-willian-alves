import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Plus, CalendarIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loader';

interface FileUploadDrawerProps {
  drawerVisibleForm: boolean;
  setDrawerVisibleForm: (open: boolean) => void;
  form: any;
  onSubmit: (values: any) => void;
  loading: boolean;
}

const FileUploadDrawer: React.FC<FileUploadDrawerProps> = ({
  drawerVisibleForm,
  setDrawerVisibleForm,
  form,
  onSubmit,
  loading
}) => {
  const fileRef = form.register("file", { required: true });
  return (
    <Drawer open={drawerVisibleForm}>
      <DrawerTrigger asChild>
        <Button
          variant={"secondary"}
          onClick={() => setDrawerVisibleForm(true)}
        >
          <Plus size={16} />
          Adicionar atividade
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-80% ">
        <DrawerHeader>
          <DrawerTitle>Adicione novos arquivos</DrawerTitle>
          <DrawerDescription>Arquivos duplicados sao verificados automaticamente.</DrawerDescription>
        </DrawerHeader>
        <div className='h-max p-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nome da atividade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da atividade"
                        className={fieldState.error ? "text-color-red" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Descricao da atividade </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite uma descricao para a atividade"
                        className={fieldState.error ? "text-color-red" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workload"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Carga horaria </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder="Digite a carga horaria em horas"
                        className={fieldState.error ? "text-color-red" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de realização</FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Arquivo</FormLabel>
                    <FormControl>
                      <Input
                        {...fileRef}
                        placeholder="Arquivo"
                        type="file"
                        accept="application/pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter className="flex flex-row justify-between m-0 p-0">
                <DrawerClose>
                  <Button variant="outline" onClick={() => { setDrawerVisibleForm(false) }}>Cancelar</Button>
                </DrawerClose>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner className="text-dark" /> : "Enviar"}
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FileUploadDrawer; 