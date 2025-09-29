# Erinnerungen Lora  Erinnerungen

Guarde e compartilhe seus momentos mais especiais. Uma plataforma completa para registrar suas memórias.

**[🔗 Acesse a aplicação ao vivo!](https://lembrancas-lora.vercel.app/)**

---

## 💡 Sobre o Projeto

**Lembranças Lora** é uma aplicação web moderna e completa, projetada para ser um diário digital onde os usuários podem registrar, organizar e reviver suas memórias mais preciosas. Mais do que um simples álbum de fotos, a plataforma permite enriquecer cada lembrança com descrições detalhadas, datas, e até mesmo a trilha sonora que marcou aquele momento.

O projeto foi construído com uma arquitetura robusta, separando claramente as responsabilidades entre o **frontend** (a interface com o usuário) e o **backend** (o cérebro da aplicação), garantindo uma experiência de usuário fluida, segura e escalável.

---

## ✨ Funcionalidades Principais

-   **🔐 Autenticação Completa:** Sistema de cadastro e login de usuários para garantir a privacidade e segurança das memórias.
-   **📝 Criação e Edição de Memórias:** Formulário intuitivo para adicionar título, descrição, data, link de música e múltiplas imagens a cada memória.
-   **🖼️ Galeria de Imagens e Colagem Automática:** Faça o upload de várias imagens para uma memória. A aplicação gera automaticamente uma colagem para destacar o registro.
-   **🌐 Memórias Públicas e Privadas:** O usuário tem total controle sobre a privacidade de suas memórias, podendo mantê-las privadas ou compartilhá-las em um feed público com a comunidade.
-   **❤️ Sistema de Favoritos:** Marque suas memórias preferidas para acessá-las rapidamente em uma seção dedicada.
-   **👥 Marcar Pessoas:** Associe pessoas às suas memórias, criando um registro de quem participou de cada momento especial.
-   **🗑️ Exclusão Segura:** Ao apagar uma memória, todos os dados e imagens associados são removidos de forma segura do banco de dados e do armazenamento.

---

## 🚀 Tecnologias Utilizadas

A escolha das tecnologias foi pensada para criar uma aplicação moderna, rápida, segura e de fácil manutenção.

### Frontend

| Tecnologia | Por que foi escolhida? |
| :--- | :--- |
| **Vite** | Para um ambiente de desenvolvimento extremamente rápido, com Hot Module Replacement (HMR) instantâneo, o que acelera muito o ciclo de desenvolvimento. |
| **React** | Pela sua eficiência na criação de interfaces de usuário reativas e componentizadas. A utilização de hooks como `useState` e `useEffect` permite um gerenciamento de estado e ciclo de vida dos componentes de forma clara e poderosa. |
| **TypeScript** | Para adicionar segurança de tipos ao código, prevenindo uma vasta gama de erros comuns em tempo de desenvolvimento, e melhorando a autocompletação e a manutenibilidade do projeto. |
| **Tailwind CSS** | Pela sua abordagem "utility-first", que permite construir designs complexos e customizados diretamente no HTML, sem a necessidade de escrever CSS tradicional. Isso agiliza a estilização e mantém a consistência visual. |
| **shadcn/ui** | Para fornecer uma base de componentes de UI de alta qualidade, acessíveis e customizáveis (como Botões, Cards, Dialogs, etc.), acelerando o desenvolvimento da interface e garantindo uma experiência de usuário profissional. |
| **React Router**| É a solução padrão da comunidade React para roteamento, permitindo a navegação entre as diferentes páginas da aplicação de forma declarativa e eficiente. |

### Backend (Plataforma como Serviço)

| Tecnologia | Por que foi escolhida? |
| :--- | :--- |
| **Supabase** | Foi escolhido como a solução de backend completa. Ele oferece uma alternativa de código aberto ao Firebase, com um conjunto de ferramentas poderosas que simplificam enormemente o desenvolvimento: |
| &nbsp;&nbsp;&nbsp;**PostgreSQL Database** | Um banco de dados relacional robusto e confiável, onde a estrutura de tabelas (memories, profiles, etc.) é definida através de migrações SQL, garantindo consistência e versionamento. |
| &nbsp;&nbsp;&nbsp;**Authentication** | Oferece um serviço de autenticação completo e seguro, que foi facilmente integrado no frontend através do hook `useAuth`. |
| &nbsp;&nbsp;&nbsp;**Storage** | Para o armazenamento de arquivos, como as imagens das memórias. O Supabase fornece uma API simples para upload e gerenciamento de arquivos, com regras de segurança para controlar o acesso. |
| &nbsp;&nbsp;&nbsp;**Edge Functions** | Permite a execução de código serverless (no caso, em Deno/TypeScript) para tarefas que precisam ser executadas no backend, como a geração da colagem de imagens, sem a necessidade de gerenciar um servidor. |

---

## 🚀 Como Executar o Projeto

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/victormordachini/lembrancas-lora.git](https://github.com/victormordachini/lembrancas-lora.git)
    cd lembrancas-lora
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração do Supabase:**
    1.  Crie um projeto no [Supabase](https://supabase.com/).
    2.  No seu projeto Supabase, vá para **SQL Editor** e execute os arquivos de migração localizados na pasta `supabase/migrations` para criar as tabelas e políticas de segurança.
    3.  Vá para **Settings > API** e copie a **URL do projeto** e a chave **anon public**.
    4.  Renomeie o arquivo `.env.example` para `.env` e adicione suas chaves do Supabase:
        ```
        VITE_SUPABASE_URL=SUA_URL_SUPABASE
        VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
        ```

4.  **Execute o projeto:**
    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173` (a porta padrão do Vite geralmente é a 5173, mas pode variar).

---
> Este projeto foi criado com o auxílio do Lovable, uma plataforma de inteligência artificial que transforma descrições em linguagem natural em aplicações web funcionais.
