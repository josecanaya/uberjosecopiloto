"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Target, Pencil, Trash2, DollarSign, Fuel, ShoppingBag, Clock, Download, Upload, RotateCcw } from "lucide-react";
import { IncomeForm } from "@/components/forms/income-form";
import { FuelForm } from "@/components/forms/fuel-form";
import { KioscoForm } from "@/components/forms/kiosco-form";
import { PauseForm } from "@/components/forms/pause-form";
import { formatCurrency, formatTime, getArgentinaDate, getDayOfWeek } from "@/lib/utils";
import { getState, updateDayGoal, deleteEvent, importData, resetData, defaultState, updateWeeklyGoal, type Event } from "@/lib/storage";
import { calculateDayStats } from "@/lib/calculations";
import { loadDemoData } from "@/lib/demo-data";
import { ManualAdjustmentForm } from "@/components/forms/manual-adjustment-form";

export default function HomePage() {
  // Inicializar SIEMPRE con estado por defecto para evitar problemas de hidratación
  // Luego actualizamos en useEffect solo en el cliente
  const [state, setState] = useState(defaultState);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [kioscoOpen, setKioscoOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activePause, setActivePause] = useState<Event | null>(null);
  const [manualAdjustmentOpen, setManualAdjustmentOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = getArgentinaDate();
  const dayOfWeek = getDayOfWeek(today);
  const goal = state.settings.goalsByDow[dayOfWeek] || 0;
  const planBlocks = state.settings.planBlocksByDow[dayOfWeek] || [];

  // Obtener clave de fecha para ajustes manuales (YYYY-MM-DD)
  const dateKey = today.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  
  // Obtener ajuste manual del state (no directamente de localStorage para evitar problemas de hidratación)
  const manualAdjustment = state.manualAdjustments?.[dateKey];

  // Calcular estadísticas del día
  const stats = calculateDayStats(state.events, today, planBlocks, goal, manualAdjustment);

  // Cargar estado real después del montaje y marcar como montado
  useEffect(() => {
    setState(getState());
    setMounted(true);
  }, []);

  // Eventos de hoy (máximo 6)
  const todayEvents = state.events
    .filter((e) => {
      if (!e.at && !e.pauseStartAt) return false;
      const eventDate = new Date(e.at || e.pauseStartAt || "");
      const todayStr = today.toLocaleDateString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
      const eventStr = eventDate.toLocaleDateString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
      return todayStr === eventStr;
    })
    .sort((a, b) => {
      const dateA = new Date(a.at || a.pauseStartAt || 0).getTime();
      const dateB = new Date(b.at || b.pauseStartAt || 0).getTime();
      return dateB - dateA; // Más recientes primero
    })
    .slice(0, 6);

  // Buscar pausa activa
  useEffect(() => {
    const active = state.events.find(
      (e) => e.type === "PAUSE" && e.pauseStartAt && !e.pauseEndAt
    );
    setActivePause(active || null);
  }, [state.events]);

  // Actualizar goal value cuando cambia
  useEffect(() => {
    setGoalValue(goal.toString());
  }, [goal]);

  const refreshState = () => {
    setState(getState());
  };

  const handleSuccess = () => {
    refreshState();
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    deleteEvent(id);
    refreshState();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    if (event.type === "INCOME") {
      setIncomeOpen(true);
    } else if (event.type === "EXPENSE_FUEL") {
      setFuelOpen(true);
    } else if (event.type === "EXPENSE_KIOSCO") {
      setKioscoOpen(true);
    }
  };

  const handleGoalSave = () => {
    updateDayGoal(dayOfWeek, parseFloat(goalValue));
    refreshState();
    setEditingGoal(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(getState(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copiloto_uber_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const merge = confirm("¿Deseas combinar con los datos existentes? (Cancelar = reemplazar todo)");
          
          importData(json, merge);
          refreshState();
          alert("Datos importados correctamente");
        } catch (error) {
          alert("Error al importar datos: " + (error as Error).message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (!confirm("¿Estás seguro? Esto eliminará TODOS los datos.")) return;
    if (!confirm("Esta acción NO se puede deshacer. ¿Continuar?")) return;
    
    resetData();
    refreshState();
    alert("Datos reseteados");
  };

  const handleLoadDemo = () => {
    if (!confirm("¿Cargar datos de ejemplo? Esto agregará eventos a la semana actual.")) return;
    try {
      const count = loadDemoData();
      refreshState();
      alert(`${count} eventos de ejemplo agregados`);
    } catch (error) {
      console.error(error);
      alert("Error al cargar datos de ejemplo");
    }
  };

  const getEventIcon = (type: string) => {
    if (type === "INCOME") return <DollarSign className="h-4 w-4 text-green-600" />;
    if (type === "EXPENSE_FUEL") return <Fuel className="h-4 w-4 text-red-600" />;
    if (type === "EXPENSE_KIOSCO") return <ShoppingBag className="h-4 w-4 text-orange-600" />;
    if (type === "PAUSE") return <Clock className="h-4 w-4 text-blue-600" />;
    return null;
  };

  const getEventLabel = (event: Event) => {
    if (event.type === "INCOME") {
      return `Ingreso ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "EXPENSE_FUEL") {
      return `Nafta ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "EXPENSE_KIOSCO") {
      return `Kiosco ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "PAUSE") {
      return "Pausa";
    }
    return "";
  };

  const progreso = goal > 0 ? (stats.bruto / goal) * 100 : 0;
  const faltante = Math.max(0, goal - stats.bruto);

  const now = getArgentinaDate();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const getBlockStatus = (start: string, end: string) => {
    if (currentTime < start) return "future";
    if (currentTime >= start && currentTime <= end) return "current";
    return "past";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hoy</h1>
          <p className="text-sm text-muted-foreground">
            {today.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-8 w-8 p-0"
            title="Exportar datos"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            className="h-8 w-8 p-0"
            title="Importar datos"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-16 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setEditingEvent(null);
                setIncomeOpen(true);
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-semibold">Ingreso</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 flex-col gap-2 border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                setEditingEvent(null);
                setFuelOpen(true);
              }}
            >
              <Fuel className="h-5 w-5" />
              <span className="text-sm font-semibold">Nafta</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 flex-col gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setEditingEvent(null);
                setKioscoOpen(true);
              }}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-semibold">Kiosco</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 flex-col gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => setPauseOpen(true)}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {activePause ? "Terminar" : "Pausa"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totales de Hoy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Totales de Hoy</span>
              {mounted && manualAdjustment && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Manual
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManualAdjustmentOpen(true)}
                className="h-6 px-2 text-xs"
                title="Editar valores manualmente"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Editar
              </Button>
              {goal > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGoal(true)}
                  className="h-6 px-2 text-xs"
                  title="Editar objetivo"
                >
                  Objetivo
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Objetivo Neto */}
          {editingGoal ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                autoFocus
                placeholder="Objetivo neto (después de gastos)"
              />
              <Button size="sm" onClick={handleGoalSave} className="h-9">
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingGoal(false);
                  setGoalValue(goal.toString());
                }}
                className="h-9"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Objetivo</span>
                </div>
              </div>
              <span className="text-lg font-bold" suppressHydrationWarning>{formatCurrency(goal)}</span>
            </div>
          )}

          {/* Bruto */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-green-900">Bruto</span>
            <span className="text-xl font-bold text-green-700" suppressHydrationWarning>{formatCurrency(stats.bruto)}</span>
          </div>

          {/* Gastos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs font-medium text-red-900">Nafta</span>
              <span className="text-base font-semibold text-red-700" suppressHydrationWarning>{formatCurrency(stats.gastoNafta)}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-xs font-medium text-orange-900">Kiosco</span>
              <span className="text-base font-semibold text-orange-700" suppressHydrationWarning>{formatCurrency(stats.gastoKiosco)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg border-2 border-red-300">
              <span className="text-sm font-semibold text-red-900">Total Gastos</span>
              <span className="text-lg font-bold text-red-700" suppressHydrationWarning>{formatCurrency(stats.gastosTotal)}</span>
            </div>
          </div>

          {/* Neto */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <span className="text-base font-semibold">Neto</span>
            <span className="text-2xl font-bold" suppressHydrationWarning>{formatCurrency(stats.neto)}</span>
          </div>

          {/* Progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso hacia objetivo</span>
              <span className="font-semibold">{progreso.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, progreso)}%` }}
              />
            </div>
          </div>

          {/* Horas y $/h */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Horas planificadas</div>
              <div className="text-sm font-semibold">{stats.horasPlanificadas.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Horas efectivas</div>
              <div className="text-sm font-semibold">{stats.horasEfectivas.toFixed(1)}h</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">$/hora neto</div>
              <div className="text-base font-bold">{formatCurrency(stats.porHoraNeto)}</div>
            </div>
          </div>

          {/* Recomendación */}
          {stats.bruto >= goal ? (
            <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-300">
              <TrendingUp className="h-5 w-5 text-green-700" />
              <span className="text-sm font-semibold text-green-900">¡Objetivo logrado!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg border border-orange-300">
              <TrendingDown className="h-5 w-5 text-orange-700" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-orange-900">
                  Faltan {formatCurrency(faltante)}
                </div>
                {stats.porHoraNeto > 0 && (
                  <div className="text-xs text-orange-700">
                    ~{(faltante / (stats.bruto / Math.max(stats.horasEfectivas, 0.1))).toFixed(1)}h más para alcanzar el objetivo
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloques de hoy */}
      {planBlocks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bloques de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {planBlocks.map((block, index) => {
                const status = getBlockStatus(block.start, block.end);
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      status === "current"
                        ? "bg-primary/10 border-primary"
                        : status === "past"
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {block.start} - {block.end}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {status === "current" && "En curso"}
                      {status === "past" && "Pasado"}
                      {status === "future" && "Próximo"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos Movimientos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Movimientos de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground text-sm">
                Todavía no cargaste movimientos
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIncomeOpen(true)}
                  className="text-xs"
                >
                  + Ingreso
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFuelOpen(true)}
                  className="text-xs"
                >
                  + Nafta
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative p-3 border rounded-lg hover:bg-muted/50 active:bg-muted transition-colors"
                  onClick={() => handleEdit(event)}
                >
                  <div className="flex items-start gap-2">
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{getEventLabel(event)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(new Date(event.at || event.pauseStartAt || ""))}
                      </div>
                      {event.note && (
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 p-0 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración y Datos de Ejemplo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos de Ejemplo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              Los datos se guardan en tu navegador (localStorage). Cada vez que abres la app, se cargan automáticamente.
            </p>
            <p>
              Puedes usar &quot;Cargar Datos Demo&quot; para probar la app con datos de ejemplo.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadDemo}
            className="w-full"
          >
            Cargar Datos Demo
          </Button>
          {process.env.NODE_ENV !== "production" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetear Todos los Datos
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <IncomeForm
        open={incomeOpen}
        onOpenChange={(open) => {
          setIncomeOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        editingEvent={editingEvent && editingEvent.type === "INCOME" ? editingEvent : null}
      />
      <FuelForm
        open={fuelOpen}
        onOpenChange={(open) => {
          setFuelOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE_FUEL" ? editingEvent : null}
      />
      <KioscoForm
        open={kioscoOpen}
        onOpenChange={(open) => {
          setKioscoOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE_KIOSCO" ? editingEvent : null}
      />
      <PauseForm
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onSuccess={handleSuccess}
        activePause={activePause}
      />
      <ManualAdjustmentForm
        open={manualAdjustmentOpen}
        onOpenChange={setManualAdjustmentOpen}
        dateKey={dateKey}
        currentValues={{
          bruto: stats.bruto,
          gastoNafta: stats.gastoNafta,
          gastoKiosco: stats.gastoKiosco,
          horasEfectivas: stats.horasEfectivas,
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
