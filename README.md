# ControleCC

Uma aplicação web para gerenciamento de usuários e arquivos, construída com Next.js, Firebase e Tailwind CSS.

## Funcionalidades

- Autenticação e autorização de usuários (admin/usuário)
- Gerenciamento de usuários (CRUD)
- Upload e gerenciamento de arquivos
- Dashboard para acompanhamento de progresso
- Interface responsiva com Tailwind CSS

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Firebase (Firestore, Auth)](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Primeiros Passos

### Pré-requisitos

- Node.js (v16+)
- npm

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seuusuario/controlecc.git
   cd controlecc
   ```

2. Instale as dependências:
   ```bashr
   npm install
   ```

3. Configure o Firebase:
   - Copie sua configuração do Firebase para `src/config/firebase.config.ts`.

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Estrutura do Projeto

```
controlecc/
  ├── src/
  │   ├── app/                # Diretório principal do Next.js (páginas, layouts)
  │   ├── components/         # Componentes reutilizáveis React
  │   ├── config/             # Arquivos de configuração (ex: Firebase)
  │   ├── hooks/              # Hooks personalizados React
  │   ├── lib/                # Funções utilitárias e bibliotecas
  │   ├── services/           # Camada de serviços (API, integração com Firebase)
  │   └── types/              # Definições de tipos TypeScript
  ├── public/                 # Arquivos estáticos
  ├── package.json
  └── README.md
```

## Uso

- Cadastre-se ou faça login como usuário.
- Administradores podem gerenciar usuários e aprovar arquivos.
- Usuários podem enviar arquivos e acompanhar seu progresso.

## Backup

[Arquivos para realizar restore](https://drive.google.com/file/d/1d5EvnBFBn5dOQumzK913sythz-j2Jz5R/view?usp=sharing)
