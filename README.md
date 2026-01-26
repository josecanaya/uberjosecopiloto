# Copiloto Uber

Aplicación web para registrar eventos (ingresos, nafta, kiosco, pausas) y visualizar dashboards por día/semana para conductores Uber.

**✨ Característica principal**: Backend mínimo con Supabase (Postgres) para persistencia de datos. App personal (no multiusuario).

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Postgres) para persistencia
- **Tailwind CSS** + **shadcn/ui** para UI
- **Deploy**: Vercel

## 📋 Características

- ✅ **Backend mínimo**: API routes con Supabase
- ✅ **Seguridad simple**: Protección con `x-admin-key` header
- ✅ **Mobile-first design perfecto** (360-430px optimizado)
- ✅ **UX estilo "Grows"** con botones grandes tipo banco
- ✅ Registro de eventos (ingresos, nafta, kiosco, pausas)
- ✅ Dashboard diario con métricas en tiempo real
- ✅ Vista semanal con cards apiladas
- ✅ Historial de eventos con filtros
- ✅ **Pantalla "Turnos"** con plan semanal visual día por día
- ✅ Plan de hoy visible en la página principal
- ✅ Cálculo automático de $/hora neto
- ✅ Recomendaciones basadas en objetivos
- ✅ Timezone Argentina (Lunes-Domingo correcto)

## 🛠️ Setup Local

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase (gratis)

### 1. Crear proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea un proyecto
2. Ve a Settings → API
3. Copia:
   - **Project URL** (SUPABASE_URL)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - ⚠️ **NO uses anon key**

### 2. Ejecutar schema SQL

1. Ve a SQL Editor en Supabase
2. Copia y ejecuta el contenido de `supabase-schema.sql`
3. Esto creará las tablas `settings` y `events`

### 3. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env.local`:

```env
# Supabase (server only)
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Admin key para proteger endpoints (server only)
ADMIN_KEY=tu_clave_secreta_aqui

# Admin key para el frontend (pública)
NEXT_PUBLIC_ADMIN_KEY=tu_clave_secreta_aqui
```

**⚠️ IMPORTANTE:**
- `ADMIN_KEY` y `NEXT_PUBLIC_ADMIN_KEY` deben ser la misma clave
- Usa una clave fuerte y aleatoria (puedes generar con: `openssl rand -hex 32`)
- `NEXT_PUBLIC_ADMIN_KEY` es pública (se expone en el bundle), pero es suficiente para una app personal

### 5. Ejecutar en desarrollo

```bash
npm run dev
# o
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
copiloto/
├── app/
│   ├── api/                    # API routes
│   │   ├── settings/          # GET/PUT /api/settings
│   │   └── events/            # GET/POST /api/events
│   │       └── [id]/          # PUT/DELETE /api/events/:id
│   ├── historial/             # Página de historial
│   ├── semana/                # Página semanal
│   ├── turnos/                # Página de turnos
│   └── page.tsx               # Página principal (Hoy)
├── components/                # Componentes React
│   ├── forms/                # Formularios modales
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   ├── supabaseAdmin.ts      # Cliente Supabase (service_role)
│   ├── api.ts                # Cliente API para frontend
│   ├── apiAdapter.ts         # Adaptador entre tipos antiguos y nuevos
│   ├── auth.ts               # Validación de admin key
│   ├── types.ts              # Tipos compartidos
│   ├── calculations.ts       # Funciones de cálculo
│   ├── dates.ts              # Utilidades de fecha/timezone
│   └── utils.ts              # Funciones helper
└── supabase-schema.sql       # Schema SQL para Supabase
```

## 🗄️ Schema de Base de Datos

### Tabla `settings`

Una sola fila con la configuración:

```sql
- id: UUID
- timezone: TEXT (default: 'America/Argentina/Buenos_Aires')
- goals_by_dow: JSONB ({"0": 100000, "1": 65000, ...})
- plan_blocks_by_dow: JSONB ({"1": [{"start": "06:30", "end": "09:00"}, ...], ...})
- weekly_goal: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tabla `events`

Eventos registrados:

```sql
- id: UUID
- type: TEXT ('INCOME' | 'EXPENSE_FUEL' | 'EXPENSE_KIOSCO' | 'PAUSE')
- at: TIMESTAMPTZ (para INCOME y EXPENSE)
- amount: INTEGER
- note: TEXT
- income_type: TEXT ('UBER' | 'TIP' | 'OTHER')
- fuel_liters: NUMERIC
- fuel_price_per_liter: NUMERIC
- fuel_station: TEXT
- pause_start_at: TIMESTAMPTZ
- pause_end_at: TIMESTAMPTZ
- pause_reason: TEXT ('SLEEP' | 'FOOD' | 'REST')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🔐 Seguridad

- **Protección simple**: Todos los endpoints requieren header `x-admin-key`
- **Service Role**: Solo se usa en el backend (nunca en el frontend)
- **Admin Key**: Misma clave en `ADMIN_KEY` (server) y `NEXT_PUBLIC_ADMIN_KEY` (client)

## 🚀 Deploy a Vercel

### 1. Preparar el proyecto

Asegúrate de que el proyecto esté en un repositorio Git.

### 2. Crear proyecto en Vercel

1. Ir a [Vercel](https://vercel.com)
2. Importar el repositorio
3. **Configurar variables de entorno**:
   - `SUPABASE_URL`: Tu URL de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu service_role key
   - `ADMIN_KEY`: Tu clave secreta
   - `NEXT_PUBLIC_ADMIN_KEY`: La misma clave secreta

### 3. Deploy

Vercel detectará automáticamente Next.js y desplegará.

### 4. Listo

La app funcionará completamente. Los datos se guardan en Supabase.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Build de producción
npm start                # Iniciar servidor de producción
```

## 🐛 Troubleshooting

### Error: "Unauthorized"

- Verifica que `NEXT_PUBLIC_ADMIN_KEY` esté configurado
- Verifica que el header `x-admin-key` se esté enviando correctamente

### Error: "SUPABASE_URL no está configurado"

- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de usar `SUPABASE_SERVICE_ROLE_KEY` (no anon key)

### Los datos no se guardan

- Revisa la consola del navegador para ver errores
- Verifica que el schema SQL se haya ejecutado correctamente
- Verifica que las variables de entorno estén configuradas

---

Desarrollado con ❤️ para conductores Uber - Backend mínimo con Supabase
