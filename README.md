# Copiloto Uber

Aplicación web para registrar eventos (ingresos, nafta, pausas) y visualizar dashboards por día/semana para conductores Uber.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** para UI
- **Prisma ORM** + **PostgreSQL** (compatible con Neon/Supabase)
- **Deploy target**: Vercel (serverless-friendly)

## 📋 Características

- ✅ Registro rápido de eventos (ingresos, nafta, kiosco, pausas)
- ✅ Dashboard diario con métricas en tiempo real
- ✅ Vista semanal con resumen de métricas
- ✅ Historial de eventos con filtros y edición/borrado
- ✅ Plan semanal configurable con bloques horarios
- ✅ Cálculo automático de $/hora neto
- ✅ Recomendaciones basadas en objetivos
- ✅ Mobile-first design
- ✅ CRUD completo de eventos desde la UI
- ✅ Botón "Cargar ejemplo" para desarrollo

## 🛠️ Setup Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- PostgreSQL (local o remoto - Neon/Supabase recomendado)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar base de datos

#### Opción A: Neon (Recomendado para Vercel)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear un nuevo proyecto
3. Copiar la connection string

#### Opción B: Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a Settings > Database
4. Copiar la connection string (formato: `postgresql://...`)

#### Opción C: PostgreSQL Local

```bash
# Instalar PostgreSQL localmente
# Luego crear una base de datos:
createdb copiloto_uber
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database?schema=public"
```

**Ejemplo para Neon:**
```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Ejemplo para Supabase:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

Esto creará las tablas en la base de datos.

### 5. Poblar datos iniciales (seed)

```bash
npm run db:seed
```

Esto creará:
- Plan semanal con bloques horarios
- Objetivos diarios
- Algunos eventos de ejemplo (opcional)

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
copiloto/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── historial/         # Página de historial
│   ├── semana/            # Página semanal
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal (Hoy)
├── components/            # Componentes React
│   ├── forms/            # Formularios modales
│   ├── ui/               # Componentes shadcn/ui
│   └── navigation.tsx    # Navegación móvil
├── lib/                  # Utilidades
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funciones helper
└── prisma/
    ├── schema.prisma     # Schema de Prisma
    └── seed.ts           # Script de seed
```

## 🗄️ Modelo de Datos

### PlanDay
Plan semanal con bloques horarios y objetivos por día.

- `dayOfWeek`: 0-6 (Domingo-Sábado)
- `dailyGoal`: Objetivo diario en pesos
- `blocks`: Array JSON con `{start, end, label}`

### Event
Eventos registrados (ingresos, gastos, pausas).

- `type`: INCOME | EXPENSE | PAUSE
- `amount`: Monto (para INCOME y EXPENSE)
- `at`: Timestamp del evento
- Campos específicos según tipo:
  - **INCOME**: `incomeType` (UBER|TIP|OTHER)
  - **EXPENSE**: `expenseType` (FUEL|KIOSCO|OTHER)
    - Si `expenseType=FUEL`: `fuelLiters`, `fuelPricePerLiter`, `fuelStation`, `fuelOdometer`
  - **PAUSE**: `pauseStartAt`, `pauseEndAt`, `pauseReason` (SLEEP|FOOD|REST)

## 🚀 Deploy a Vercel

### 1. Preparar el proyecto

Asegúrate de que el proyecto esté en un repositorio Git (GitHub, GitLab, etc.).

### 2. Crear proyecto en Vercel

1. Ir a [Vercel](https://vercel.com)
2. Importar el repositorio
3. Configurar variables de entorno:
   - `DATABASE_URL`: Connection string de tu base de datos (Neon/Supabase)

### 3. Configurar Build Command

Vercel detectará automáticamente Next.js, pero asegúrate de que el build command incluya:

```bash
prisma generate && next build
```

### 4. Configurar Post-deploy (opcional)

Si quieres ejecutar migraciones automáticamente, puedes agregar un script en `package.json`:

```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

Y configurarlo en Vercel como build command.

### 5. Deploy

Vercel desplegará automáticamente en cada push a la rama principal.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar datos iniciales
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Generar cliente Prisma

# Producción
npm run build            # Build de producción
npm start                # Iniciar servidor de producción
```

## 🎯 Uso de la Aplicación

### Página Principal (Hoy)

- Ver objetivo del día (editable)
- Ver métricas: bruto, gastos (nafta + kiosco), neto, $/hora
- Ver progreso vs objetivo
- Ver bloques planificados del día
- Registrar eventos rápidamente (Ingreso, Nafta, Kiosco, Pausa)
- Ver últimos registros con acciones editar/borrar
- Botón "Cargar ejemplo" (solo en desarrollo)

### Historial

- Filtrar eventos por fecha y tipo (Ingreso, Gastos, Pausas)
- Editar o eliminar eventos
- Cerrar pausas activas
- Timeline completo de eventos del día

### Semana

- Ver resumen semanal con datos reales
- Columnas: Día, Objetivo, Bruto, Nafta, Kiosco, Gastos, Neto, Horas, $/h Neto
- Navegar entre semanas (anterior/siguiente)
- Ver totales y promedios semanales

## 🔧 Configuración del Plan Semanal

El plan semanal se configura en el seed (`prisma/seed.ts`). Por defecto incluye:

- **Lunes, Jueves, Viernes**: 06:30-09:00, 14:00-16:30, 21:00-23:00
- **Sábado**: 04:00-08:00, 18:00-23:00
- **Domingo**: 04:00-08:00, 18:00-22:00
- **Martes, Miércoles**: Descanso (sin bloques)

Los objetivos diarios se pueden editar desde la UI en la página principal.

## 📊 Rangos de Referencia

La aplicación muestra rangos de referencia (no usados para cálculos):

- Semana mañana: $5k-$9k/h
- Semana mediodía: $7.5k-$12k/h
- Semana noche: $10k-$12k/h
- Finde madrugada/noche: $10k-$16k/h
- Finde mañana/mediodía: $7.5k-$12k/h

## 🔄 Cambios Recientes (MVP Completo)

### Modelo de Datos Actualizado

- **Cambio**: `FUEL` → `EXPENSE` con `expenseType` (FUEL|KIOSCO|OTHER)
- **Nuevo tipo de gasto**: KIOSCO para registrar gastos menores (café, snacks, etc.)
- Todos los eventos ahora usan el modelo unificado con campos opcionales según tipo

### Funcionalidades Agregadas

1. **CRUD Completo**: Crear, editar y borrar eventos desde la UI
2. **Formulario Kiosco**: Nuevo formulario para registrar gastos de kiosco
3. **Lista de Últimos Registros**: En la página principal con acciones editar/borrar
4. **Botón "Cargar Ejemplo"**: Crea eventos de ejemplo para testing (solo desarrollo)
5. **Página Semana Mejorada**: Muestra datos reales con cálculos correctos, incluye Kiosco

### Migración de Base de Datos

Al actualizar, necesitarás ejecutar:

```bash
npm run db:migrate
```

Esto actualizará el schema para usar `EXPENSE` en lugar de `FUEL`.

## 🐛 Troubleshooting

### Error de conexión a la base de datos

- Verificar que `DATABASE_URL` esté correctamente configurada
- Verificar que la base de datos esté accesible
- Para Neon/Supabase, verificar que el SSL esté habilitado

### Error en migraciones

```bash
# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# O crear una nueva migración
npm run db:migrate
```

### Error en build de Vercel

- Verificar que `DATABASE_URL` esté configurada en Vercel
- Verificar que el build command incluya `prisma generate`
- Revisar logs de build en Vercel

## 📄 Licencia

Este proyecto es de uso personal.

## 🤝 Contribuciones

Este es un proyecto personal, pero las sugerencias son bienvenidas.

---

Desarrollado con ❤️ para conductores Uber
