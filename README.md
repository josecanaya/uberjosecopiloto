# Copiloto Uber

Aplicación web **100% frontend** para registrar eventos (ingresos, nafta, kiosco, pausas) y visualizar dashboards por día/semana para conductores Uber.

**✨ Característica principal**: Todo se guarda localmente en el navegador (localStorage). No requiere backend ni base de datos. Funciona completamente offline.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** para UI
- **localStorage** para persistencia (con versionado y migración)
- **Deploy**: Vercel (sin backend, solo estático)

## 📋 Características

- ✅ **100% Frontend**: Sin backend, sin base de datos, funciona offline
- ✅ **Mobile-first design perfecto** (360-430px optimizado)
- ✅ **UX estilo "Grows"** con botones grandes tipo banco
- ✅ Registro rápido de eventos (ingresos, nafta, kiosco, pausas)
- ✅ Dashboard diario con métricas en tiempo real
- ✅ Vista semanal con cards apiladas (sin tablas)
- ✅ Historial de eventos con filtros y edición/borrado
- ✅ Plan semanal configurable con bloques horarios
- ✅ Cálculo automático de $/hora neto
- ✅ Recomendaciones basadas en objetivos
- ✅ **Export/Import de datos** (JSON)
- ✅ **Botón "Cargar demo"** para testing
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
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal (Hoy)
├── components/            # Componentes React
│   ├── forms/            # Formularios modales
│   ├── ui/               # Componentes shadcn/ui
│   └── navigation.tsx    # Navegación móvil
├── lib/                  # Utilidades
│   ├── storage.ts        # Sistema de localStorage
│   ├── dates.ts          # Utilidades de fecha/timezone
│   ├── calculations.ts   # Funciones de cálculo
│   └── utils.ts          # Funciones helper
└── README.md
```

## 🗄️ Almacenamiento Local

### Estructura de Datos (localStorage)

**Key**: `copiloto_uber_v1`

```typescript
{
  version: 1,
  settings: {
    timezone: "America/Argentina/Buenos_Aires",
    goalsByDow: {
      0: 100000,  // Domingo
      1: 65000,   // Lunes
      2: 0,       // Martes (descanso)
      3: 0,       // Miércoles (descanso)
      4: 65000,   // Jueves
      5: 70000,   // Viernes
      6: 120000,  // Sábado
    },
    planBlocksByDow: {
      1: [{start: "06:30", end: "09:00"}, ...],
      // ... más días
    }
  },
  events: [
    {
      id: "evt_...",
      type: "INCOME" | "EXPENSE_FUEL" | "EXPENSE_KIOSCO" | "PAUSE",
      at?: string, // ISO string
      amount?: number,
      // ... campos específicos según tipo
    }
  ]
}
```

### Funciones de Storage

- `getState()`: Obtener estado actual
- `addEvent(event)`: Agregar evento
- `updateEvent(id, updates)`: Actualizar evento
- `deleteEvent(id)`: Eliminar evento
- `updateDayGoal(dayOfWeek, goal)`: Actualizar objetivo del día
- `exportData()`: Exportar a JSON
- `importData(json, merge)`: Importar desde JSON
- `resetData()`: Resetear todos los datos

## 🎯 Uso de la Aplicación

### Página Principal (Hoy)

- **Acciones Rápidas**: Grid 2x2 de botones grandes (Ingreso, Nafta, Kiosco, Pausa)
- **Totales de Hoy**: Cards con bruto, gastos, neto, progreso
- **Movimientos de Hoy**: Grid de mini-cards editables (máx 6)
- **Bloques de Hoy**: Chips con horarios planificados
- **Export/Import**: Botones en el header

### Historial

- Filtrar eventos por fecha y tipo
- Editar o eliminar eventos
- Cerrar pausas activas
- Cards individuales por evento

### Semana

- Navegación semana anterior/siguiente
- Cards apiladas por día (Lunes-Domingo)
- Card "Total Semana" destacada
- Empty state cuando no hay datos

## 📊 Export/Import de Datos

### Exportar

1. Click en botón "Exportar" (icono descarga) en el header
2. Se descarga un archivo JSON con todos tus datos
3. Guarda este archivo como backup

### Importar

1. Click en botón "Importar" (icono subida) en el header
2. Selecciona el archivo JSON
3. Elige:
   - **Combinar**: Agrega eventos a los existentes
   - **Reemplazar**: Reemplaza todos los datos

### Reset

En modo desarrollo, hay un botón "Resetear Todos los Datos" que limpia localStorage.

## 🧪 Datos de Ejemplo

En modo desarrollo, hay un botón "Cargar Datos Demo" que agrega eventos de ejemplo distribuidos en la semana actual para probar la aplicación.

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

### 4. Listo

La app funcionará completamente en el navegador del usuario. Cada usuario tiene su propio localStorage.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Build de producción
npm start                # Iniciar servidor de producción
```

## 🔧 Configuración del Plan Semanal

El plan semanal está en `lib/storage.ts` en el estado inicial (`defaultState`). Puedes editarlo directamente o desde la UI (objetivos editables).

Por defecto:
- **Lunes, Jueves, Viernes**: 06:30-09:00, 14:00-16:30, 21:00-23:00
- **Sábado**: 04:00-08:00, 18:00-23:00
- **Domingo**: 04:00-08:00, 18:00-22:00
- **Martes, Miércoles**: Descanso (sin bloques)

## ⚠️ Limitaciones

- **localStorage tiene límite**: ~5-10MB dependiendo del navegador
- **Sin sincronización**: Los datos solo están en el navegador del usuario
- **Sin backup automático**: Usa Export para hacer backups manuales
- **Sin multi-dispositivo**: Cada navegador/dispositivo tiene sus propios datos

## 💡 Tips

1. **Haz backups regulares**: Usa Export para guardar tus datos
2. **Si cambias de navegador**: Exporta antes y luego Importa en el nuevo
3. **Si limpias el navegador**: Los datos se pierden, por eso es importante Exportar

## 🐛 Troubleshooting

### Los datos desaparecieron

- Verifica que no hayas limpiado el localStorage del navegador
- Si tienes un backup (JSON), usa Import para restaurarlo

### Error al importar

- Verifica que el archivo JSON sea válido
- Asegúrate de que el formato coincida con el schema

### La semana muestra datos incorrectos

- Verifica que la fecha/hora de tu dispositivo esté correcta
- La app usa timezone Argentina (America/Argentina/Buenos_Aires)

---

Desarrollado con ❤️ para conductores Uber - 100% local, 100% tuyo
