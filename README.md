# Copiloto Uber

Aplicación web **100% frontend** para registrar eventos (ingresos, nafta, kiosco, pausas) y visualizar dashboards por día/semana para conductores Uber.

**✨ Característica principal**: Los datos se leen desde archivos JSON en el repositorio Git (`/data/settings.json` y `/data/events.json`). Edita los archivos en GitHub y Vercel redeployará automáticamente.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** para UI
- **Archivos JSON en Git** para persistencia (solo lectura desde la UI)
- **Deploy**: Vercel (sin backend, solo estático)

## 📋 Características

- ✅ **100% Frontend**: Sin backend, sin base de datos
- ✅ **Datos desde Git**: Edita JSONs en GitHub, Vercel redeploya automáticamente
- ✅ **Mobile-first design perfecto** (360-430px optimizado)
- ✅ **UX estilo "Grows"** con botones grandes tipo banco
- ✅ Visualización de eventos (ingresos, nafta, kiosco, pausas)
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

### 2. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

¡Eso es todo! No necesitas configurar nada más.

## 📁 Estructura del Proyecto

```
copiloto/
├── app/                    # Next.js App Router
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
├── lib/                  # Utilidades
│   ├── data.ts           # Sistema de lectura desde JSON
│   ├── storage.ts        # Tipos y interfaces (compatibilidad)
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

### Cómo Editar los Datos

1. **Edita los archivos JSON en GitHub**:
   - Ve a tu repositorio en GitHub
   - Navega a `/data/settings.json` o `/data/events.json`
   - Haz click en el ícono de lápiz (Edit)
   - Edita el contenido
   - Haz commit de los cambios

2. **Vercel redeployará automáticamente**:
   - Si tienes un webhook configurado, Vercel detectará el push
   - O puedes hacer un redeploy manual desde el dashboard de Vercel

3. **Los cambios se reflejarán en la app**:
   - Después del redeploy, la app mostrará los nuevos datos

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
- Cards individuales por evento

### Semana

- Navegación semana anterior/siguiente
- Objetivo semanal editable (solo visual, no persiste)
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
3. **NO necesitas configurar variables de entorno** (no hay backend)

### 3. Deploy

Vercel detectará automáticamente Next.js y desplegará. El build es:

```bash
next build
```

### 4. Configurar Webhook (Opcional)

Para que Vercel redeploye automáticamente cuando edites los JSONs en GitHub:

1. Ve a tu proyecto en Vercel
2. Settings → Git → Deploy Hooks
3. O simplemente haz push a la rama principal y Vercel redeployará

### 5. Listo

La app funcionará completamente en el navegador. Los datos se leen desde los archivos JSON en el repositorio.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Build de producción
npm start                # Iniciar servidor de producción
```

## 🔧 Configuración del Plan Semanal

El plan semanal está en `/data/settings.json`. Edita este archivo en GitHub para actualizar los horarios.

Por defecto:
- **Lunes, Jueves, Viernes**: 06:30-09:00, 14:00-16:30, 21:00-23:00
- **Sábado**: 04:00-08:00, 18:00-23:00
- **Domingo**: 04:00-08:00, 18:00-22:00
- **Martes, Miércoles**: Descanso (sin bloques)

## ⚠️ Limitaciones Actuales

- **Solo lectura desde la UI**: Los formularios no guardan datos (muestran warnings en consola)
- **Edición manual requerida**: Debes editar los JSONs en GitHub para actualizar datos
- **Redeploy necesario**: Después de editar JSONs, Vercel debe redeployar para ver cambios

## 💡 Tips

1. **Edita desde GitHub**: Usa la interfaz web de GitHub para editar los JSONs fácilmente
2. **Formato JSON válido**: Asegúrate de que el JSON sea válido antes de hacer commit
3. **Backup**: Haz commit de tus cambios regularmente para tener historial
4. **Redeploy manual**: Si el webhook no funciona, haz redeploy manual desde Vercel

## 🐛 Troubleshooting

### Los datos no se actualizan

- Verifica que hayas hecho commit de los cambios en GitHub
- Verifica que Vercel haya redeployado (revisa el dashboard)
- Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

### Error al cargar la app

- Verifica que los archivos JSON sean válidos (formato correcto)
- Revisa la consola del navegador para ver errores

### La semana muestra datos incorrectos

- Verifica que la fecha/hora de tu dispositivo esté correcta
- La app usa timezone Argentina (America/Argentina/Buenos_Aires)

---

Desarrollado con ❤️ para conductores Uber - Datos desde Git, control total
