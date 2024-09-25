// PasswordResetComponent.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { sendPasswordReset } from "@/services/passwordReset";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

type FormData = {
  email: string;
};

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});


/**
 * Componente para redefini o de senha.
 *
 * @param visible valor booleano que indica se o componente est  vis vel ou n o.
 */
const PasswordResetComponent: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await sendPasswordReset(data.email);
      toast({
        title: 'E-mail enviado',
        description: 'Um link de redefini o de senha foi enviado para o seu e-mail.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar e-mail',
        description: 'N o foi poss vel enviar o e-mail de redefini o de senha. Tente novamente.',
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Esqueceu a Senha?</Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerOverlay />
        <DrawerContent className="p-4">
          <DrawerHeader>
            <h2 className="text-lg font-semibold">Redefinir Senha</h2>
          </DrawerHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="email"
                render={() => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        {...register("email", { required: "O e-mail   obrigat rio" })}
                      />
                    </FormControl>
                    {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Enviar Link de Redefini o de Senha
              </Button>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PasswordResetComponent;
