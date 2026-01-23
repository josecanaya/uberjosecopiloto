# Copiloto Uber

Aplicación web **100% frontend** para registrar eventos (ingresos, nafta, kiosco, pausas) y visualizar dashboards por día/semana para conductores Uber.

**✨ Característica principal**: Los datos se leen y guardan desde archivos JSON en el repositorio Git (`/data/settings.json` y `/data/events.json`). Puedes editar desde la UI y los cambios se guardan automáticamente en Git mediante GitHub API.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** para UI
- **Archivos JSON en Git** para persistencia
- **GitHub API** para guardar cambios desde la UI
- **Deploy**: Vercel (con API routes para GitHub API)

## 📋 Características

- ✅ **100% Frontend**: Sin backend propio, usa GitHub API
- ✅ **Datos desde Git**: Edita desde la UI o desde GitHub
- ✅ **Guardado automático**: Los cambios desde la UI se guardan en Git automáticamente
- ✅ **Mobile-first design perfecto** (360-430px optimizado)
- ✅ **UX estilo "Grows"** con botones grandes tipo banco
- ✅ Registro de eventos (ingresos, nafta, kiosco, pausas)
- ✅ Dashboard diario con métricas en tiempo real
- ✅ Vista semanal con cards apiladas (sin tablas)
- ✅ Historial de eventos con filtros
- ✅ **Pantalla "Turnos"** con plan semanal visual día por día
- ✅ Plan de hoy visible en la página principal
- ✅ Cálculo automático de $/hora neto
- ✅ Recomendaciones basadas en objetivos
- ✅ Timezone Argentina (Lunes-Domingo correcto)

## 🛠️ Setup Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

**NO necesitas PostgreSQL ni ninguna base de datos.**

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local`:

```env
GITHUB_TOKEN=tu_token_de_github
GITHUB_REPO_OWNER=josecanaya
GITHUB_REPO_NAME=uberjosecopiloto
GITHUB_BRANCH=main
```

**Cómo obtener GITHUB_TOKEN:**

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre (ej: "Copiloto Uber")
4. Selecciona el scope `repo` (acceso completo a repositorios)
5. Genera el token y cópialo
6. Pégalo en `.env.local`

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
copiloto/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── git/           # Rutas para actualizar Git
│   ├── historial/         # Página de historial
│   ├── semana/            # Página semanal
│   ├── turnos/            # Página de turnos (plan semanal)
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal (Hoy)
├── components/            # Componentes React
│   ├── forms/            # Formularios modales
│   ├── ui/               # Componentes shadcn/ui
│   └── navigation.tsx    # Navegación móvil
├── data/                 # Datos en JSON (Git)
│   ├── settings.json     # Configuración (objetivos, bloques)
│   └── events.json       # Eventos registrados
├── public/               # Archivos estáticos
│   └── data/            # Copia de JSONs para fetch en runtime
├── lib/                  # Utilidades
│   ├── data.ts           # Sistema de lectura/escritura desde Git
│   ├── storage.ts        # Tipos y interfaces
│   ├── dates.ts          # Utilidades de fecha/timezone
│   ├── calculations.ts   # Funciones de cálculo
│   └── utils.ts          # Funciones helper
└── README.md
```

## 🗄️ Almacenamiento de Datos

### Estructura de Datos (JSON en Git)

Los datos se almacenan en dos archivos JSON en el repositorio:

#### `/data/settings.json`

```json
{
  "timezone": "America/Argentina/Buenos_Aires",
  "goalsByDow": {
    "0": 100000,  // Domingo
    "1": 65000,   // Lunes
    "2": 0,       // Martes (descanso)
    "3": 0,       // Miércoles (descanso)
    "4": 65000,   // Jueves
    "5": 70000,   // Viernes
    "6": 120000   // Sábado
  },
  "planBlocksByDow": {
    "1": [
      {"start": "06:30", "end": "09:00"},
      {"start": "14:00", "end": "16:30"},
      {"start": "21:00", "end": "23:00"}
    ],
    // ... más días
  },
  "weeklyGoal": 400000
}
```

#### `/data/events.json`

```json
[
  {
    "id": "evt_...",
    "type": "INCOME" | "EXPENSE_FUEL" | "EXPENSE_KIOSCO" | "PAUSE",
    "at": "2024-01-22T10:00:00.000Z",
    "amount": 15000,
    "incomeType": "UBER",
    "note": "..."
  }
]
```

### Cómo Funciona el Guardado

1. **Desde la UI**: Cuando agregas/editas/eliminas un evento o cambias un objetivo:
   - Se actualiza el estado local inmediatamente
   - Se llama a la API route `/api/git/update-settings` o `/api/git/update-events`
   - La API route usa GitHub API para hacer commit del cambio
   - Vercel redeployará automáticamente (si tienes webhook configurado)

2. **Desde GitHub**: Puedes editar los JSONs directamente en GitHub:
   - Los cambios se reflejarán después del redeploy de Vercel

## 🎯 Uso de la Aplicación

### Página Principal (Hoy)

- **Plan de Hoy**: Chips con horarios planificados (pasado/actual/futuro)
- **Acciones Rápidas**: Grid 2x2 de botones grandes (Ingreso, Nafta, Kiosco, Pausa)
- **Totales de Hoy**: Cards con bruto, gastos, neto, progreso
- **Movimientos de Hoy**: Grid de mini-cards (máx 6)
- **Información**: Card explicando que los datos vienen de Git

### Historial

- Filtrar eventos por fecha y tipo
- Visualización de eventos en cards
- Editar/eliminar eventos (se guardan en Git)

### Semana

- Navegación semana anterior/siguiente
- Objetivo semanal editable (se guarda en Git)
- Cards apiladas por día (Lunes-Domingo)
- Botón "Ver Días" con gráfico de barras y detalles
- Card "Total Semana" destacada

### Turnos

- Vista completa del plan semanal día por día
- Cada día muestra chips con horarios planificados
- Resalta el día actual
- Muestra objetivos diarios
- Días de descanso claramente marcados

## 🚀 Deploy a Vercel

### 1. Preparar el proyecto

Asegúrate de que el proyecto esté en un repositorio Git (GitHub, GitLab, etc.).

### 2. Crear proyecto en Vercel

1. Ir a [Vercel](https://vercel.com)
2. Importar el repositorio
3. **Configurar variables de entorno**:
   - `GITHUB_TOKEN`: Tu token de GitHub (con scope `repo`)
   - `GITHUB_REPO_OWNER`: Tu usuario de GitHub (ej: `josecanaya`)
   - `GITHUB_REPO_NAME`: Nombre del repo (ej: `uberjosecopiloto`)
   - `GITHUB_BRANCH`: Rama (generalmente `main`)

### 3. Deploy

Vercel detectará automáticamente Next.js y desplegará.

### 4. Configurar Webhook (Opcional)

Para que Vercel redeploye automáticamente cuando edites los JSONs en GitHub:

1. Ve a tu proyecto en Vercel
2. Settings → Git → Deploy Hooks
3. O simplemente haz push a la rama principal y Vercel redeployará

### 5. Listo

La app funcionará completamente. Los cambios desde la UI se guardarán en Git automáticamente.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Build de producción
npm start                # Iniciar servidor de producción
```

## 🔧 Configuración del Plan Semanal

El plan semanal está en `/data/settings.json`. Puedes editarlo:
- **Desde la UI**: Cambiando objetivos (se guarda automáticamente)
- **Desde GitHub**: Editando el archivo directamente

Por defecto:
- **Lunes, Jueves, Viernes**: 06:30-09:00, 14:00-16:30, 21:00-23:00
- **Sábado**: 04:00-08:00, 18:00-23:00
- **Domingo**: 04:00-08:00, 18:00-22:00
- **Martes, Miércoles**: Descanso (sin bloques)

## ⚠️ Limitaciones

- **GitHub Token requerido**: Necesitas configurar `GITHUB_TOKEN` para que funcione el guardado desde la UI
- **Redeploy necesario**: Después de editar JSONs en GitHub, Vercel debe redeployar para ver cambios
- **Rate limits**: GitHub API tiene límites de rate, pero para uso personal no debería ser problema

## 💡 Tips

1. **Guarda tu token seguro**: No compartas tu `GITHUB_TOKEN` públicamente
2. **Edita desde la UI**: Es más fácil que editar JSONs manualmente
3. **Backup automático**: Git guarda historial de todos los cambios
4. **Redeploy manual**: Si el webhook no funciona, haz redeploy manual desde Vercel

## 🐛 Troubleshooting

### Los cambios no se guardan

- Verifica que `GITHUB_TOKEN` esté configurado correctamente en Vercel
- Verifica que el token tenga el scope `repo`
- Revisa la consola del navegador para ver errores

### Error al cargar la app

- Verifica que los archivos JSON sean válidos (formato correcto)
- Revisa la consola del navegador para ver errores

### La semana muestra datos incorrectos

- Verifica que la fecha/hora de tu dispositivo esté correcta
- La app usa timezone Argentina (America/Argentina/Buenos_Aires)

---

Desarrollado con ❤️ para conductores Uber - Datos desde Git, control total
