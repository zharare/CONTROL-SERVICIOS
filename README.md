# Control de Servicios – CONSITEC

Panel administrativo empresarial en Next.js + TypeScript + Tailwind + Supabase para gestionar servicios de capacitación.

## Requisitos

- Node.js 20+
- Proyecto de Supabase

## Configuración rápida

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Ejecuta `supabase/schema.sql` en tu proyecto de Supabase.

4. Levanta desarrollo:

```bash
npm run dev
```

## Funcionalidades

- CRUD de servicios con múltiples fechas + horas
- Validación con Zod + React Hook Form
- Filtros reactivos por instructor/comercial/estado/semana/mes
- Selección de filas y exportación Excel (xlsx)
- Panel estadístico en tiempo real
- Tema claro/oscuro
- Estado global con Zustand
