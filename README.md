# Market Management — Front-end

Interface web para gerenciamento de mini mercados desenvolvida em React com Vite. Cada mercado possui seu próprio painel com controle de estoque, registro de vendas com carrinho de múltiplos produtos, dashboard com gráficos e histórico de pedidos. Inclui área administrativa para gerenciar todos os mercados cadastrados.

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18 | Biblioteca de interface |
| **Vite** | 5.x | Bundler e servidor de desenvolvimento |
| **React Router DOM** | 6.x | Navegação entre páginas (SPA) |
| **Context API** | — | Gerenciamento de estado de autenticação |
| **Recharts** | 2.x | Gráficos de linha e barras no dashboard |
| **CSS customizado** | — | Tema escuro com estilo próprio |

---

## Funcionalidades

### Autenticação
- Cadastro de mini mercado com nome, CNPJ, e-mail, celular e senha
- Ativação de conta via código de 4 dígitos recebido por WhatsApp
- Login com token JWT armazenado no `localStorage`
- Proteção de rotas — usuários não autenticados são redirecionados para `/login`
- Nome do mercado exibido dinamicamente na aba do navegador e na sidebar

### Produtos
- Listagem com busca por nome, filtro por categoria e paginação (8 por página)
- Cards de estatísticas: total de produtos, estoque total, ativos e estoque baixo
- Cadastro e edição com nome, preço, quantidade, categoria, imagem (URL) e status
- Ativação, inativação e exclusão de produtos
- **8 categorias:** Bebidas, Alimentos, Laticínios, Higiene, Limpeza, Hortifruti, Cereais e Grãos, Outros

### Vendas
- Grade de produtos com cards clicáveis organizados por categorias
- Barra de categorias no topo para filtragem rápida
- **Carrinho:** adiciona múltiplos produtos, controla quantidade por item, mostra badge com quantidade no card
- Rodapé fixo com lista do carrinho, subtotais por item e total geral
- Botões de limpar carrinho e finalizar venda
- Estoque atualizado automaticamente ao confirmar

### Histórico de Pedidos
- Lista de pedidos com ID único, total e data/hora
- Expansão de cada pedido para ver todos os produtos, quantidades e valores
- Cards de resumo: total de pedidos realizados e valor total acumulado

### Dashboard
- Cards: produtos ativos, itens em estoque, total vendido, vendas realizadas e alertas de estoque baixo (≤ 5 unidades)
- Gráfico de linha: vendas em reais nos últimos 7 dias
- Gráfico de barras: top 5 produtos mais vendidos por quantidade
- Gráfico de barras: total vendido por categoria
- Tabela das últimas 5 vendas

### Painel Admin
- Acesso exclusivo para usuários com `role = ADMIN`
- Listagem de todos os mercados cadastrados
- Ações: ativar/desativar e deletar mercados
- Sidebar adaptada — exibe apenas o menu de mercados para admins

---

## Estrutura

```
src/
├── components/
│   ├── PrivateRoute.jsx    # Redireciona para /login se não autenticado
│   ├── AdminRoute.jsx      # Redireciona para /dashboard se não for admin
│   └── WinWindow.jsx       # Wrapper visual da área de conteúdo
├── contexts/
│   └── AuthContext.jsx     # Token JWT e dados do usuário logado
├── layouts/
│   └── AppLayout.jsx       # Sidebar + área principal + título dinâmico
├── pages/
│   ├── LoginPage.jsx       # Tela de login
│   ├── RegisterPage.jsx    # Cadastro de novo mercado
│   ├── DashboardPage.jsx   # Indicadores e gráficos
│   ├── ProductsPage.jsx    # Listagem com busca, filtro e paginação
│   ├── ProductFormPage.jsx # Criar e editar produto
│   ├── SalePage.jsx        # Carrinho de venda com grade de produtos
│   ├── SalesListPage.jsx   # Histórico de pedidos expansível
│   └── AdminPage.jsx       # Gerenciamento de mercados (admin)
├── services/
│   └── api.js              # Todas as chamadas HTTP para o back-end
├── styles/
│   └── global.css          # Estilos globais e tema escuro
├── App.jsx                 # Definição de rotas
└── main.jsx                # Ponto de entrada
```

---

## Rotas

| Rota | Descrição | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/cadastro` | Cadastro de mercado | Público |
| `/dashboard` | Indicadores gerais | Autenticado |
| `/produtos` | Listagem de produtos | Autenticado |
| `/produtos/novo` | Novo produto | Autenticado |
| `/produtos/:id/editar` | Editar produto | Autenticado |
| `/vendas/nova` | Registrar venda (carrinho) | Autenticado |
| `/vendas` | Histórico de pedidos | Autenticado |
| `/admin/mercados` | Gerenciar mercados | Admin |

---

## Como rodar

### Pré-requisitos

- Node.js 18+
- Back-end rodando em `http://localhost:5000` — veja [market-backend](https://github.com/Gesoaress/market-backend)

### Instalação e execução

```bash
git clone https://github.com/Gesoaress/market-frontend.git
cd market-frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

### Build para produção

```bash
npm run build
```

---

## Comunicação com o Back-end

Todas as chamadas à API estão centralizadas em `src/services/api.js`. O token JWT é lido do `localStorage` e enviado automaticamente no header `Authorization: Bearer <token>` em todas as rotas protegidas. Em caso de token expirado (resposta 401), o usuário é deslogado e redirecionado para `/login`.

---

## Projeto relacionado

- **Back-end:** [market-backend](https://github.com/Gesoaress/market-backend)
