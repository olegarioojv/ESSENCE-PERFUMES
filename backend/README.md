# Essence Perfumes — Backend

API REST em NestJS + TypeScript + PostgreSQL (TypeORM).

## Requisitos

- Node.js 22+
- Docker e Docker Compose

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d postgres   # a partir da raiz do projeto
npm run start:dev
```

> `npm run test:e2e` e `npm run start` exigem o PostgreSQL rodando (via Docker Compose ou local).

Documentação Swagger disponível em `http://localhost:3000/docs`.

## Scripts

- `npm run start:dev` — desenvolvimento com hot reload
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run test` — testes unitários
- `npm run test:e2e` — testes end-to-end
