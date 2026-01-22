"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, DollarSign, Fuel, Clock, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDateTime, formatDuration, getArgentinaDate, getStartOfDay, getEndOfDay } from "@/lib/utils";
import { IncomeForm } from "@/components/forms/income-form";
import { FuelForm } from "@/components/forms/fuel-form";
import { KioscoForm } from "@/components/forms/kiosco-form";
import { PauseForm } from "@/components/forms/pause-form";

interface Event {
  id: string;
  type: "INCOME" | "EXPENSE" | "PAUSE";
  amount: number | null;
  at: string;
  note: string | null;
  incomeType: string | null;
  expenseType: string | null;
  fuelLiters: number | null;
  fuelPricePerLiter: number | null;
  fuelStation: string | null;
  pauseStartAt: string | null;
  pauseEndAt: string | null;
  pauseReason: string | null;
}

export default function HistorialPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getArgentinaDate().toISOString().split("T")[0]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [kioscoOpen, setKioscoOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [activePause, setActivePause] = useState<{ id: string; pauseStartAt: Date; pauseReason: string | null } | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        
        // Buscar pausa activa
        const active = data.find((e: Event) => e.type === "PAUSE" && !e.pauseEndAt);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [date, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error al eliminar evento");
    }
  };

  const handleClosePause = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pauseEndAt: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Error closing pause:", error);
      alert("Error al cerrar pausa");
    }
  };

  const getEventIcon = (type: string, expenseType?: string | null) => {
    if (type === "INCOME") return <DollarSign className="h-5 w-5 text-green-600" />;
    if (type === "EXPENSE" && expenseType === "FUEL") return <Fuel className="h-5 w-5 text-red-600" />;
    if (type === "EXPENSE" && expenseType === "KIOSCO") return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    if (type === "PAUSE") return <Clock className="h-5 w-5 text-blue-600" />;
    return null;
  };

  const getEventLabel = (event: Event) => {
    if (event.type === "INCOME") {
      return `Ingreso: ${formatCurrency(event.amount || 0)} (${event.incomeType || "UBER"})`;
    }
    if (event.type === "EXPENSE" && event.expenseType === "FUEL") {
      const liters = event.fuelLiters ? `${event.fuelLiters.toFixed(2)}L` : "";
      const price = event.fuelPricePerLiter ? `@${formatCurrency(event.fuelPricePerLiter)}/L` : "";
      return `Nafta: ${formatCurrency(event.amount || 0)} ${liters} ${price}`.trim();
    }
    if (event.type === "EXPENSE" && event.expenseType === "KIOSCO") {
      return `Kiosco: ${formatCurrency(event.amount || 0)}`;
    }
    if (event.type === "PAUSE") {
      const reason = event.pauseReason === "SLEEP" ? "Dormir" : event.pauseReason === "FOOD" ? "Comer" : "Descanso";
      if (!event.pauseEndAt) {
        return `Pausa activa: ${reason}`;
      }
      const start = event.pauseStartAt ? new Date(event.pauseStartAt) : null;
      const end = event.pauseEndAt ? new Date(event.pauseEndAt) : null;
      if (start && end) {
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
        return `Pausa: ${reason} (${formatDuration(minutes)})`;
      }
      return `Pausa: ${reason}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-muted-foreground">
          Revisa y gestiona tus eventos registrados
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="INCOME">Ingresos</SelectItem>
                  <SelectItem value="EXPENSE">Gastos</SelectItem>
                  <SelectItem value="PAUSE">Pausas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay eventos registrados para esta fecha
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getEventIcon(event.type, event.expenseType)}
                    <div className="flex-1">
                      <div className="font-medium">{getEventLabel(event)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(new Date(event.at))}
                      </div>
                      {event.note && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.note}
                        </div>
                      )}
                      {event.type === "EXPENSE" && event.expenseType === "FUEL" && event.fuelStation && (
                        <div className="text-sm text-muted-foreground">
                          Estación: {event.fuelStation}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {event.type === "PAUSE" && !event.pauseEndAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePause(event.id)}
                      >
                        Cerrar
                      </Button>
                    )}
                    {(event.type === "INCOME" || event.type === "EXPENSE") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (event.type === "INCOME") {
                            setEditingEvent(event);
                            setIncomeOpen(true);
                          } else if (event.type === "EXPENSE" && event.expenseType === "FUEL") {
                            setEditingEvent(event);
                            setFuelOpen(true);
                          } else if (event.type === "EXPENSE" && event.expenseType === "KIOSCO") {
                            setEditingEvent(event);
                            setKioscoOpen(true);
                          }
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <IncomeForm
        open={incomeOpen}
        onOpenChange={(open) => {
          setIncomeOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onSuccess={() => {
          fetchEvents();
          setEditingEvent(null);
        }}
        defaultDate={editingEvent ? new Date(editingEvent.at) : undefined}
      />
      <FuelForm
        open={fuelOpen}
        onOpenChange={(open) => {
          setFuelOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onSuccess={() => {
          fetchEvents();
          setEditingEvent(null);
        }}
        defaultDate={editingEvent ? new Date(editingEvent.at) : undefined}
      />
      <KioscoForm
        open={kioscoOpen}
        onOpenChange={(open) => {
          setKioscoOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onSuccess={() => {
          fetchEvents();
          setEditingEvent(null);
        }}
        defaultDate={editingEvent ? new Date(editingEvent.at) : undefined}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE" && editingEvent.expenseType === "KIOSCO" ? editingEvent : null}
      />
      <PauseForm
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onSuccess={fetchEvents}
        activePause={activePause}
      />
    </div>
  );
}
