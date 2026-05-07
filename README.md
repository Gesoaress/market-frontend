# MiniMkt - Sistema de Gestão de Estoque

## Descrição
MiniMkt é um sistema completo de gestão de estoque para mini mercados, desenvolvido com React no front-end e Node.js no back-end. Permite o cadastro de produtos, controle de vendas, monitoramento de estoque e dashboard com indicadores em tempo real.

## Funcionalidades

### Autenticação e Cadastro
- Cadastro de mini mercado com CNPJ, e-mail, celular e senha
- Ativação via código enviado por WhatsApp
- Login seguro com token JWT
- Logout e proteção de rotas

### Gestão de Produtos
- Listagem de produtos com paginação e busca
- Cadastro e edição de produtos (nome, preço, quantidade, imagem, status)
- Inativação de produtos
- Estatísticas: total de produtos, ativos, estoque baixo

### Registro de Vendas
- Seleção de produto ativo em estoque
- Ajuste de quantidade
- Confirmação de venda com atualização automática do estoque

### Dashboard
- Indicadores principais: valor total vendido, unidades em estoque, produtos com estoque baixo, sem estoque
- Top 5 produtos mais vendidos
- Últimas vendas registradas
- Monitoramento de estoque crítico (itens com menos de 15 unidades)

## Tecnologias Utilizadas

### Front-end
- **React** com Vite
- **React Router** para navegação
- **Context API** para gerenciamento de estado de autenticação
- **CSS** customizado com tema Windows XP-like
- Componentes reutilizáveis (WinWindow, etc.)

### Back-end (assumido)
- Node.js com Express
- Banco de dados (provavelmente PostgreSQL ou similar)
- Autenticação JWT
- API RESTful

## Como Rodar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação
1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd dash-fullstack-ft
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra o navegador em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── PrivateRoute.jsx    # Proteção de rotas autenticadas
│   └── WinWindow.jsx       # Componente de janela estilo Windows
├── contexts/
│   └── AuthContext.jsx     # Contexto de autenticação
├── layouts/
│   └── AppLayout.jsx       # Layout principal com sidebar
├── pages/
│   ├── DashboardPage.jsx   # Dashboard com indicadores
│   ├── LoginPage.jsx       # Tela de login
│   ├── ProductsPage.jsx    # Listagem de produtos
│   ├── ProductFormPage.jsx # Formulário de produto
│   ├── RegisterPage.jsx    # Cadastro de mercado
│   └── SalePage.jsx        # Registro de venda
├── services/
│   └── api.js              # Chamadas para a API back-end
├── styles/
│   └── global.css          # Estilos globais
├── App.jsx                 # Rotas principais
└── main.jsx                # Ponto de entrada
```

## Rotas da Aplicação

- `/login` - Login
- `/cadastro` - Cadastro de mercado
- `/dashboard` - Dashboard (protegida)
- `/produtos` - Listagem de produtos (protegida)
- `/produtos/novo` - Novo produto (protegida)
- `/produtos/:id/editar` - Editar produto (protegida)
- `/vendas/nova` - Registrar venda (protegida)

## API Endpoints Utilizados

- `POST /api/sellers` - Criar vendedor
- `POST /api/sellers/activate` - Ativar conta
- `POST /api/auth/login` - Login
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Inativar produto
- `POST /api/sales` - Registrar venda
- `GET /api/sales` - Listar vendas

## Estilo Visual
O front-end adota um tema inspirado no Windows XP, com janelas, botões e cores nostálgicas, proporcionando uma interface amigável e intuitiva.

## Contribuição
Para contribuir, faça um fork do projeto, crie uma branch para sua feature e envie um pull request.

## Licença
Este projeto é licenciado sob a MIT License.