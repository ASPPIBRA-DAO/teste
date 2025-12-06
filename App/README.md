'''# Gov-System - Plataforma de Governança Digital

Bem-vindo ao repositório do Gov-System, uma aplicação full-stack projetada para facilitar a interação e a participação cidadã em processos de governança. O sistema é composto por um frontend moderno construído com Next.js e um backend robusto e escalável utilizando Hono em um ambiente de Cloudflare Workers.

## 🚀 Visão Geral do Projeto

O Gov-System oferece uma plataforma segura e intuitiva para que os usuários possam se registrar, autenticar, participar de votações e acompanhar propostas. A arquitetura foi pensada para ser altamente performática e segura, utilizando tecnologias modernas tanto no lado do cliente quanto no servidor.

---

## 🛠️ Tecnologias Utilizadas

Abaixo está a lista completa de tecnologias, frameworks e bibliotecas que compõem o Gov-System.

### **Frontend**

| Tecnologia                 | Versão             | Descrição                                         |
| -------------------------- | ------------------ | ------------------------------------------------- |
| **Next.js**                | `^15.5.4`          | Framework React para produção.                    |
| **React**                  | `^19.1.1`          | Biblioteca para construir interfaces de usuário.    |
| **TypeScript**             | `^5.9.2`           | Superset de JavaScript que adiciona tipagem.      |
| **MUI (Material-UI)**      | `^7.3.2`           | Biblioteca de componentes de UI para React.       |
| **Emotion**                | `^11.14.1`         | Biblioteca para estilização em CSS-in-JS.         |
| **Axios**                  | `^1.12.2`          | Cliente HTTP para fazer requisições a APIs.       |
| **SWR**                    | `^2.3.6`           | Biblioteca para busca de dados em React.          |
| **React Hook Form**        | `^7.63.0`          | Gerenciador de formulários para React.            |
| **Zod**                    | `^4.1.11`          | Biblioteca para validação de esquemas.            |
| **JWT Decode**             | `^4.0.0`           | Para decodificar tokens JWT no lado do cliente.   |
| **i18next**                | `^25.5.2`          | Framework de internacionalização.                 |
| **FullCalendar**           | `^6.1.19`          | Componente de calendário.                         |
| **ApexCharts**             | `^5.3.5`           | Biblioteca para criar gráficos interativos.       |
| **Framer Motion**          | `^12.23.22`        | Biblioteca para animações em React.               |
| **MapLibre GL**            | `^5.7.3`           | Biblioteca para renderizar mapas interativos.     |
| **Tiptap**                 | `^3.6.2`           | Framework para construção de editores de texto.   |
| **Supabase Client**        | `^2.58.0`          | Cliente para interagir com a plataforma Supabase. |
| **ESLint**                 | `^9.36.0`          | Ferramenta de linting para JavaScript/TypeScript. |
| **Prettier**               | `^3.6.2`           | Formatador de código.                             |

### **Backend**

| Tecnologia                 | Versão      | Descrição                                                 |
| -------------------------- | ----------- | --------------------------------------------------------- |
| **Hono**                   | `^4.10.7`   | Framework para aplicações web, rápido e leve.             |
| **bcryptjs**               | `^3.0.3`    | Para criptografar e comparar senhas (hashing).            |
| **jsonwebtoken**           | `^9.0.3`    | Para criar e verificar JSON Web Tokens (JWT).             |
| **Drizzle ORM**            | -           | ORM (Object-Relational Mapper) para TypeScript.           |
| **@hono/zod-validator**    | -           | Middleware para integrar Zod com Hono.                    |


---

## 📁 Estrutura de Diretórios

### **Backend (Cloudflare Worker)**

```
/
|-- .vscode/
|   |-- settings.json
|-- migrations/
|   |-- ...
|-- public/
|   |-- index.html
|-- src/
|   |-- db/
|   |   |-- index.ts
|   |   |-- schema.ts
|   |-- routes/
|   |   |-- auth.ts
|   |   |-- users.ts
|   |-- types/
|   |   |-- bindings.d.ts
|   |-- utils/
|   |   |-- response.ts
|   |-- validators/
|   |   |-- users.ts
|   |-- index.ts
|-- test/
|   |-- ...
|-- .gitignore
|-- drizzle.config.ts
|-- package.json
|-- tsconfig.json
|-- vitest.config.mts
|-- worker-configuration.d.ts
|-- wrangler.jsonc
```

### **Frontend (Next.js)**

```
/
|-- public/
|-- src/
|   |-- _mock/
|   |-- actions/
|   |-- app/
|   |-- assets/
|   |-- auth/
|   |-- components/
|   |-- layouts/
|   |-- lib/
|   |-- locales/
|   |-- routes/
|   |-- sections/
|   |-- theme/
|   |-- types/
|   |-- utils/
|-- .eslintrc.json
|-- next.config.mjs
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
|-- tsconfig.json
```

## 🚀 Como Começar

Para executar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITÓRIO>
    cd Gov-System
    ```

2.  **Instale as dependências do Frontend:**
    ```bash
    cd App/Frontend
    pnpm install
    ```

3.  **Instale as dependências do Backend:**
    ```bash
    cd App/Backend
    pnpm install
    ```

4.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env` no diretório `App/Frontend` e defina `VITE_HOST_API` com a URL do seu worker de backend.
    - Crie um arquivo `.dev.vars` no diretório `App/Backend` e defina `JWT_SECRET` com uma chave secreta para a geração de tokens.

5.  **Inicie o ambiente de desenvolvimento:**
    - Para o Frontend: `pnpm dev`
    - Para o Backend: `pnpm dev` (ou o comando para iniciar o seu worker local)

---

Este README foi gerado e atualizado com o auxílio de uma IA para garantir que as informações estejam sempre sincronizadas com o estado atual do projeto.
'''