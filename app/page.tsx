"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Clock, Target, Pencil, Trash2, DollarSign, Fuel, ShoppingBag } from "lucide-react";
import { IncomeForm } from "@/components/forms/income-form";
import { FuelForm } from "@/components/forms/fuel-form";
import { KioscoForm } from "@/components/forms/kiosco-form";
import { PauseForm } from "@/components/forms/pause-form";
import { formatCurrency, formatTime, formatDuration, formatDateTime, getArgentinaDate } from "@/lib/utils";

interface Stats {
  bruto: number;
  gastoNafta: number;
  gastoKiosco: number;
  gastosTotal: number;
  neto: number;
  pausasMinutos: number;
  horasPlanificadas: number;
  horasEfectivas: number;
  porHoraNeto: number;
  planDay: {
    id: string;
    dayOfWeek: number;
    dailyGoal: number;
    blocks: Array<{ start: string; end: string; label?: string }>;
  } | null;
}

interface Event {
  id: string;
  type: string;
  amount: number | null;
  at: string;
  note: string | null;
  incomeType: string | null;
  expenseType: string | null;
  pauseStartAt: string | null;
  pauseEndAt: string | null;
  pauseReason: string | null;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [kioscoOpen, setKioscoOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [activePause, setActivePause] = useState<{ id: string; pauseStartAt: Date; pauseReason: string | null } | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);

  const today = getArgentinaDate();
  const todayStr = today.toISOString().split("T")[0];

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?period=day&date=${todayStr}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        if (data.planDay) {
          setGoalValue(data.planDay.dailyGoal.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/events?date=${todayStr}`);
      if (response.ok) {
        const data: Event[] = await response.json();
        setEvents(data.slice(0, 5)); // Últimos 5 eventos
        
        // Buscar pausa activa
        const active = data.find((e) => e.type === "PAUSE" && !e.pauseEndAt);
        if (active && active.pauseStartAt) {
          setActivePause({
            id: active.id,
            pauseStartAt: new Date(active.pauseStartAt),
            pauseReason: active.pauseReason,
          });
        } else {
          setActivePause(null);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const handleSuccess = () => {
    fetchStats();
    fetchEvents();
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        handleSuccess();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error al eliminar evento");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    if (event.type === "INCOME") {
      setIncomeOpen(true);
    } else if (event.type === "EXPENSE" && event.expenseType === "FUEL") {
      setFuelOpen(true);
    } else if (event.type === "EXPENSE" && event.expenseType === "KIOSCO") {
      setKioscoOpen(true);
    }
  };

  const handleGoalSave = async () => {
    if (!stats?.planDay) return;
    try {
      const response = await fetch("/api/plan-days", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stats.planDay.id,
          dailyGoal: parseFloat(goalValue),
        }),
      });
      if (response.ok) {
        setEditingGoal(false);
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const getEventIcon = (type: string, expenseType?: string | null) => {
    if (type === "INCOME") return <DollarSign className="h-4 w-4 text-green-600" />;
    if (type === "EXPENSE" && expenseType === "FUEL") return <Fuel className="h-4 w-4 text-red-600" />;
    if (type === "EXPENSE" && expenseType === "KIOSCO") return <ShoppingBag className="h-4 w-4 text-orange-600" />;
    if (type === "PAUSE") return <Clock className="h-4 w-4 text-blue-600" />;
    return null;
  };

  const getEventLabel = (event: Event) => {
    if (event.type === "INCOME") {
      return `Ingreso: ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "EXPENSE" && event.expenseType === "FUEL") {
      return `Nafta: ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "EXPENSE" && event.expenseType === "KIOSCO") {
      return `Kiosco: ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "PAUSE") {
      return "Pausa";
    }
    return "";
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">Error al cargar datos</div>;
  }

  const objetivo = stats.planDay?.dailyGoal || 0;
  const progreso = objetivo > 0 ? (stats.neto / objetivo) * 100 : 0;
  const faltante = Math.max(0, objetivo - stats.neto);
  const tiempoEstimado = stats.porHoraNeto > 0 ? faltante / stats.porHoraNeto : 0;

  const now = getArgentinaDate();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const getBlockStatus = (start: string, end: string) => {
    if (currentTime < start) return "future";
    if (currentTime >= start && currentTime <= end) return "current";
    return "past";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hoy</h1>
          <p className="text-muted-foreground">
            {today.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setLoadingExample(true);
            try {
              const response = await fetch("/api/seed-example", {
                method: "POST",
              });
              if (response.ok) {
                handleSuccess();
              } else {
                const error = await response.json();
                alert(error.error || "Error al cargar ejemplo");
              }
            } catch (error) {
              console.error(error);
              alert("Error al cargar ejemplo");
            } finally {
              setLoadingExample(false);
            }
          }}
          disabled={loadingExample}
        >
          {loadingExample ? "Cargando..." : "Cargar Ejemplo"}
        </Button>
      </div>

      {/* Objetivo del día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivo del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingGoal ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2"
                autoFocus
              />
              <Button size="sm" onClick={handleGoalSave}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingGoal(false);
                  setGoalValue(stats.planDay?.dailyGoal.toString() || "0");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatCurrency(objetivo)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingGoal(true)}
              >
                Editar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.bruto)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.gastosTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Nafta: {formatCurrency(stats.gastoNafta)} | Kiosco: {formatCurrency(stats.gastoKiosco)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.neto)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">$/hora Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.porHoraNeto)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso</span>
              <span>{progreso.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${Math.min(100, progreso)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Faltante:</span>
              <div className="text-lg font-semibold">
                {formatCurrency(faltante)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Horas efectivas:</span>
              <div className="text-lg font-semibold">
                {stats.horasEfectivas.toFixed(1)}h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendación */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendación</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.neto >= objetivo ? (
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Objetivo logrado → cortar</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-5 w-5" />
                <span className="font-semibold">
                  Faltan {formatCurrency(faltante)}
                </span>
              </div>
              {stats.porHoraNeto > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tiempo estimado: {tiempoEstimado.toFixed(1)} horas
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Últimos registros */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No hay eventos registrados hoy
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getEventIcon(event.type, event.expenseType)}
                    <div className="flex-1">
                      <div className="font-medium">{getEventLabel(event)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(new Date(event.at))}
                      </div>
                      {event.note && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {event.type !== "PAUSE" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloques de hoy */}
      {stats.planDay && stats.planDay.blocks && stats.planDay.blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bloques de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.planDay.blocks.map((block: any, index: number) => {
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
                    <div>
                      <div className="font-medium">
                        {block.start} - {block.end}
                      </div>
                      {block.label && (
                        <div className="text-sm text-muted-foreground">
                          {block.label}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
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

      {/* Pausas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pausas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(stats.pausasMinutos)}
          </div>
          {activePause && (
            <div className="mt-2 text-sm text-orange-600">
              Pausa activa desde {formatTime(activePause.pauseStartAt)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="grid gap-3 md:grid-cols-4">
        <Button
          size="lg"
          className="h-16"
          onClick={() => {
            setEditingEvent(null);
            setIncomeOpen(true);
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Ingreso
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16"
          onClick={() => {
            setEditingEvent(null);
            setFuelOpen(true);
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nafta
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16"
          onClick={() => {
            setEditingEvent(null);
            setKioscoOpen(true);
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Kiosco
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16"
          onClick={() => setPauseOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          {activePause ? "Terminar Pausa" : "Pausa"}
        </Button>
      </div>

      <IncomeForm
        open={incomeOpen}
        onOpenChange={(open) => {
          setIncomeOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        defaultDate={today}
      />
      <FuelForm
        open={fuelOpen}
        onOpenChange={(open) => {
          setFuelOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        defaultDate={today}
      />
      <KioscoForm
        open={kioscoOpen}
        onOpenChange={(open) => {
          setKioscoOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        defaultDate={today}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE" && editingEvent.expenseType === "KIOSCO" ? editingEvent : null}
      />
      <PauseForm
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onSuccess={handleSuccess}
        activePause={activePause}
      />
    </div>
  );
}
