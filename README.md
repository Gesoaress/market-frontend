# Market Management — Front-end

Interface web para gerenciamento de mini mercados. Desenvolvida em React com Vite, permite login, cadastro de produtos, registro de vendas e visualização de indicadores no dashboard.

---

## Tecnologias

- **React 18** + **Vite**
- **React Router DOM** — navegação entre páginas
- **Context API** — gerenciamento de autenticação
- **Recharts** — gráficos e indicadores no dashboard
- **CSS** customizado com tema visual estilo Windows XP

---

## Funcionalidades

### Autenticação
- Cadastro de mini mercado (nome, CNPJ, e-mail, celular, senha)
- Ativação de conta via código recebido por WhatsApp
- Login com token JWT
- Proteção de rotas para usuários autenticados

### Produtos
- Listagem com busca e paginação
- Cadastro e edição (nome, preço, quantidade, imagem, status)
- Ativação e inativação de produtos

### Vendas
- Seleção de produto em estoque
- Registro de venda com atualização automática do estoque
- Histórico de vendas

### Dashboard
- Total vendido, unidades em estoque, produtos em falta
- Top 5 produtos mais vendidos
- Últimas vendas registradas
- Alerta de estoque crítico (menos de 15 unidades)

---

## Estrutura

```
src/
├── components/
│   ├── PrivateRoute.jsx    # Proteção de rotas autenticadas
│   └── WinWindow.jsx       # Componente de janela estilo Windows
├── contexts/
│   └── AuthContext.jsx     # Contexto de autenticação JWT
├── layouts/
│   └── AppLayout.jsx       # Layout principal com sidebar
├── pages/
│   ├── DashboardPage.jsx   # Dashboard com indicadores
│   ├── LoginPage.jsx       # Tela de login
│   ├── RegisterPage.jsx    # Cadastro de mercado
│   ├── ProductsPage.jsx    # Listagem de produtos
│   ├── ProductFormPage.jsx # Formulário de produto
│   ├── SalePage.jsx        # Registro de venda
│   └── SalesListPage.jsx   # Histórico de vendas
├── services/
│   └── api.js              # Chamadas para a API back-end
├── styles/
│   └── global.css          # Estilos globais
├── App.jsx                 # Rotas da aplicação
└── main.jsx                # Ponto de entrada
```

---

## Rotas

| Rota | Descrição | Protegida |
|------|-----------|-----------|
| `/login` | Login | Não |
| `/cadastro` | Cadastro de mercado | Não |
| `/dashboard` | Indicadores gerais | Sim |
| `/produtos` | Listagem de produtos | Sim |
| `/produtos/novo` | Novo produto | Sim |
| `/produtos/:id/editar` | Editar produto | Sim |
| `/vendas/nova` | Registrar venda | Sim |
| `/vendas` | Histórico de vendas | Sim |

---

## Como rodar

```bash
git clone https://github.com/Gesoaress/market-frontend.git
cd market-frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

> O back-end precisa estar rodando em `http://localhost:5000`. Veja o repositório [FullStack---Impacta](https://github.com/Gesoaress/FullStack---Impacta).

### Build para produção

```bash
npm run build
```

---

## Projeto relacionado

- **Back-end:** [FullStack---Impacta](https://github.com/Gesoaress/FullStack---Impacta)
