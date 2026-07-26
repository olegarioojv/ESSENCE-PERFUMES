# ESSENCE PERFUMES --- Roadmap de Desenvolvimento (Backend First)

> Objetivo: desenvolver primeiro todo o backend, validar todas as regras
> de negócio e APIs e, somente depois, iniciar o frontend.

------------------------------------------------------------------------

# Regras do Projeto

## Arquitetura

-   Modular
-   Escalável
-   API REST

## Qualidade

-   Código 100% em TypeScript
-   Sem uso de `any`
-   Swagger atualizado
-   Testes obrigatórios
-   Conventional Commits
-   ESLint + Prettier

------------------------------------------------------------------------

# Stack Tecnológica

## Front-end

-   Next.js
-   React
-   TypeScript
-   Styled Components
-   Framer Motion
-   Zustand
-   Axios
-   Lucide React
-   Swiper
-   Sonner
-   Next SEO
-   Vitest
-   React Testing Library

## Back-end

-   NestJS
-   TypeScript
-   PostgreSQL
-   TypeORM
-   JWT
-   Passport
-   Swagger
-   Docker
-   Docker Compose
-   Cloudinary
-   AbacatePay
-   Pino Logger
-   Class Validator
-   Class Transformer
-   bcrypt
-   Jest
-   Supertest

## Infraestrutura

-   Docker
-   Docker Compose
-   Nginx
-   GitHub
-   GitHub Actions
-   Vercel (Frontend)
-   Railway ou VPS (Backend)
-   PostgreSQL
-   Cloudinary
-   Let's Encrypt

------------------------------------------------------------------------

# Fase 1 --- Fundação

## Objetivos

-   Definir arquitetura
-   Configurar ambiente
-   Criar base do projeto

## Tarefas

-   [x] Criar repositório Git
-   [x] Configurar NestJS
-   [x] Configurar TypeScript
-   [x] Configurar PostgreSQL
-   [x] Configurar TypeORM
-   [x] Configurar Swagger
-   [x] Configurar ESLint
-   [x] Configurar Prettier
-   [x] Configurar ConfigModule
-   [x] Configurar variáveis de ambiente
-   [x] Configurar Logger
-   [x] Configurar Exception Filters
-   [x] Configurar Interceptors
-   [x] Configurar Guards
-   [x] Configurar ValidationPipe
-   [x] Criar estrutura de módulos

**Entrega:** API inicial pronta.

------------------------------------------------------------------------

# Fase 2 --- Infraestrutura

-   [x] Configurar Docker
-   [x] Configurar Docker Compose
-   [x] Configurar Containers
-   [x] Configurar Volumes
-   [x] Configurar Banco Local
-   [x] Configurar Health Check

**Entrega:** `docker compose up -d` sobe `postgres` + `backend`, ambos com
healthcheck passando e `GET /health` retornando `status: ok`.

------------------------------------------------------------------------

# Fase 3 --- Autenticação

-   [x] Cadastro
-   [x] Login
-   [x] JWT
-   [x] Refresh Token
-   [x] Logout
-   [x] Recuperação de senha
-   [x] Alteração de senha
-   [x] Perfil
-   [x] Permissões (Admin / Cliente)

**Entrega:** `POST /auth/register|login|refresh|logout|forgot-password|
reset-password|change-password` e `GET/PATCH /users/me` + `GET /users`
(admin) funcionando, com refresh token persistido e revogável, reset de
senha via token hasheado (log em vez de e-mail por enquanto) e permissões
Admin/Cliente via `RolesGuard`. Coberto por 18 testes unitários e 12 e2e
contra banco real.

------------------------------------------------------------------------

# Fase 4 --- Usuários

-   [x] CRUD de usuários
-   [x] Endereços
-   [x] Avatar
-   [x] Histórico
-   [x] Auditoria

------------------------------------------------------------------------

# Fase 5 --- Catálogo

## Categorias

-   [x] CRUD
-   [x] Slug
-   [x] Ativar/Inativar

## Marcas

-   [x] CRUD
-   [x] Logo
-   [x] Descrição

------------------------------------------------------------------------

# Fase 6 --- Produtos

-   [x] Nome
-   [x] SKU
-   [x] Slug
-   [x] Código de barras
-   [x] EAN
-   [x] Descrição
-   [x] Preço
-   [x] Promoção
-   [x] Marca
-   [x] Categoria
-   [x] Volume
-   [x] Peso
-   [x] Família olfativa
-   [x] Notas
-   [x] Meta Title
-   [x] Meta Description
-   [x] SEO
-   [x] Destaque
-   [x] Ativo
-   [x] Busca
-   [x] Paginação
-   [x] Filtros
-   [x] Ordenação

------------------------------------------------------------------------

# Fase 7 --- Imagens

-   [x] Cloudinary
-   [x] Upload
-   [x] Exclusão
-   [x] Galeria
-   [x] Imagem principal

------------------------------------------------------------------------

# Fase 8 --- Estoque

-   [x] Entrada
-   [x] Saída
-   [x] Movimentação
-   [x] Histórico
-   [x] Inventário
-   [x] Reserva
-   [x] Ajuste manual
-   [x] Alerta de baixo estoque

------------------------------------------------------------------------

# Fase 9 --- Carrinho

-   [x] Criar carrinho
-   [x] Adicionar item
-   [x] Remover item
-   [x] Atualizar quantidade
-   [x] Persistência
-   [x] Resumo

------------------------------------------------------------------------

# Fase 10 --- Favoritos

-   [x] Adicionar
-   [x] Remover
-   [x] Listar

------------------------------------------------------------------------

# Fase 11 --- Pedidos

-   [x] Criar pedido
-   [x] Checkout
-   [x] Timeline
-   [x] Histórico
-   [x] Alterar status
-   [x] Cancelamento
-   [ ] Rastreamento (V2)
-   [ ] Estorno (V2)

------------------------------------------------------------------------

# Fase 12 --- Pagamentos

-   [x] Criar cobrança PIX
-   [x] Consultar cobrança
-   [x] Webhook
-   [x] Confirmar pagamento
-   [x] Cancelar cobrança
-   [x] Logs

------------------------------------------------------------------------

# Fase 13 --- Dashboard

-   [x] Total de vendas
-   [x] Pedidos
-   [x] Clientes
-   [x] Produtos
-   [x] Ticket médio
-   [x] Lucro
-   [x] Produtos mais vendidos
-   [x] Produtos sem estoque
-   [x] Gráficos

------------------------------------------------------------------------

# Fase 14 --- Cupons

-   [x] CRUD
-   [x] Percentual
-   [x] Valor fixo
-   [x] Validade
-   [x] Limite de uso

------------------------------------------------------------------------

# Fase 15 --- Notificações

-   [x] Pedido criado
-   [x] Pagamento aprovado
-   [x] Pedido enviado
-   [x] Recuperação de senha


------------------------------------------------------------------------

# Fase 16 --- Testes

-   [x] Unitários
-   [x] Integração
-   [x] Swagger
-   [x] Postman

------------------------------------------------------------------------

# Fase 17 --- Frontend

## Configuração

-   [x] Criar projeto Next.js
-   [x] Configurar Styled Components
-   [x] Configurar ThemeProvider
-   [x] Configurar Global Styles
-   [x] Configurar Zustand
-   [x] Configurar Axios
-   [x] Configurar Zod
-   [x] Configurar Framer Motion
-   [x] Configurar Rotas
-   [x] Configurar Layout
-   [x] Configurar SEO
-   [x] Configurar Testes

## Loja

-   [ ] Home
-   [ ] Catálogo
-   [ ] Produto
-   [ ] Carrinho
-   [ ] Checkout
-   [ ] Login
-   [ ] Minha Conta

## Painel Administrativo

-   [ ] Dashboard
-   [ ] Produtos
-   [ ] Estoque
-   [ ] Pedidos
-   [ ] Clientes
-   [ ] Cupons
-   [ ] Configurações

------------------------------------------------------------------------

# Fase 18 --- Integração

-   [ ] Consumir APIs
-   [ ] Login
-   [ ] Produtos
-   [ ] Carrinho
-   [ ] Checkout
-   [ ] Dashboard

------------------------------------------------------------------------

# Fase 19 --- Deploy

-   [ ] Docker
-   [ ] Nginx
-   [ ] SSL
-   [ ] Banco de Produção
-   [ ] Cloudinary
-   [ ] AbacatePay
-   [ ] Monitoramento
-   [ ] Backup

------------------------------------------------------------------------

# Critério Final

-   [ ] Backend 100% testado
-   [ ] Swagger atualizado
-   [ ] Banco versionado por migrations
-   [ ] Frontend integrado
-   [ ] Deploy em produção
-   [ ] Documentação concluída
