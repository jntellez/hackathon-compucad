# Hackathon Compucad

Plataforma de capacitación interna asistida por IA para consultar cursos, recomendar opciones y ejecutar acciones de inscripción con validaciones determinísticas de negocio.

## Resumen

Este repositorio contiene un monorepo full-stack listo para demo:

- Frontend (React) con chat del agente.
- Backend (Express) con endpoints CRUD, recomendaciones y agente IA.
- SQLite + Prisma como fuente de verdad en runtime.
- OpenRouter integrado **solo en backend**.

## Stack tecnológico

- Monorepo: pnpm workspaces
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Base de datos: SQLite (archivo local)
- Documentación: Markdown + Mermaid

## Levantar el proyecto localmente

### 1) Prerrequisitos

- Node.js `>=20.19.0` (o 22+)
- pnpm instalado

Si usás `nvm`:

```bash
nvm use
```

### 2) Variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Configuración mínima recomendada:

```env
# apps/api/.env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
WEB_ORIGIN="http://localhost:5173"
OPENROUTER_API_KEY="<YOUR_OPENROUTER_API_KEY>"
OPENROUTER_MODEL="mistralai/mistral-7b-instruct:free"

# apps/web/.env
VITE_API_URL="http://localhost:3000"
```

> Seguridad: `OPENROUTER_API_KEY` se configura y utiliza únicamente en backend. No exponerla en frontend.

### 3) Instalar dependencias

```bash
pnpm install
```

### 4) Preparar base de datos (migraciones + seed)

```bash
pnpm db:reset
```

### 5) Ejecutar frontend + backend

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Comandos útiles

```bash
pnpm dev          # Levanta web + api en paralelo
pnpm dev:web      # Levanta solo frontend
pnpm dev:api      # Levanta solo backend
pnpm db:migrate   # Ejecuta Prisma migrate dev
pnpm db:reset     # Resetea DB y vuelve a correr seed
pnpm db:seed      # Importa datos iniciales desde Excel
pnpm db:studio    # Abre Prisma Studio
pnpm build        # Build de todos los workspaces
pnpm typecheck    # Type-check de todos los workspaces
```

## Arquitectura y principios clave

- El frontend consume únicamente endpoints del backend.
- El LLM interpreta intención del usuario, pero **no modifica la base directamente**.
- Las acciones reales (inscribir, cancelar, completar) se ejecutan por servicios determinísticos del backend.
- Reglas críticas de negocio se validan siempre del lado servidor.

## Estructura del repositorio

```text
hackathon-compucad/
├─ apps/
│  ├─ api/
│  └─ web/
├─ packages/
│  └─ shared/
├─ docs/
├─ scripts/
├─ pnpm-workspace.yaml
├─ package.json
└─ README.md
```

## Documentación

- `docs/arquitectura.md`
- `docs/endpoints.md`
- `docs/agente-ia.md`
- `docs/reglas-negocio.md`
- `docs/demo.md`
- `docs/decisions.md`
