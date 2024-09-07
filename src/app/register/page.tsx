"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  registerUser,
  AdditionalData,
} from "@/services/authService"
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loader";

const formSchema = z.object({
  fullname: z.string().min(2, {
    message: "Nome é obrigatório",
  }),
  registrationNumber: z.string().min(2, {
    message: "Matricula é obrigatório",
  }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, {
    message: "A senha precisa ter no mínimo 6 caracteres",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirme sua senha",
  }),
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
      registrationNumber: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      // Processa o registro do usuário
      setLoading(true);
      console.log("Dados do formulário:", values);

      let additionalData: AdditionalData = {
        fullname: values.fullname,
        registrationNumber: values.registrationNumber,
      };


      await registerUser(values.email, values.password, additionalData);

      toast({
        title: 'Registrado com sucesso',
        description: 'Sua conta foi criada e voce esta logado',
      });
      
    } catch (error) {
      // Tratar erros gerais
      toast({
        variant: 'destructive',
        title: 'Falha ao registrar',
      });
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 m-2"> <Card>
    <CardHeader>
      <CardTitle>Registre-se</CardTitle>
      <CardDescription>Crie sua conta</CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullname"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Nome Completo </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite seu nome completo"
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
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Digite sua matrícula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmação de Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirme sua senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner className="text-black"/> : "Registrar"}
          </Button>
          
          <Button type="button" className="w-full" style={{ marginTop: 5 }} variant={"ghost"} onClick={() => router.push('/login')}>
            Login
          </Button>
        </form>
      </Form>
      
      </CardContent>
      </Card>
    </div>
  );
}
