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
import { Pencil, Trash2, DollarSign, Fuel, Clock, ShoppingBag, History } from "lucide-react";
import { formatTime, formatDuration, getArgentinaDate, sameLocalDay } from "@/lib/utils";
import { getState, deleteEvent, updateEvent, type Event } from "@/lib/data";
import { IncomeForm } from "@/components/forms/income-form";
import { FuelForm } from "@/components/forms/fuel-form";
import { KioscoForm } from "@/components/forms/kiosco-form";
import { PauseForm } from "@/components/forms/pause-form";

export default function HistorialPage() {
  const [state, setState] = useState(getState());
  const [date, setDate] = useState(getArgentinaDate().toISOString().split("T")[0]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [kioscoOpen, setKioscoOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [activePause, setActivePause] = useState<Event | null>(null);

  const refreshState = async () => {
    if (typeof window !== "undefined") {
      const { reloadData } = await import("@/lib/data");
      await reloadData();
    }
    setState(getState());
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Filtrar eventos
  const selectedDate = new Date(date + "T00:00:00");
  const filteredEvents = state.events
    .filter((e) => {
      // Filtro por fecha
      if (e.at || e.pauseStartAt) {
        const eventDate = new Date(e.at || e.pauseStartAt || "");
        if (!sameLocalDay(eventDate, selectedDate)) {
          return false;
        }
      } else {
        return false;
      }

      // Filtro por tipo
      if (typeFilter === "all") return true;
      if (typeFilter === "INCOME" && e.type === "INCOME") return true;
      if (typeFilter === "EXPENSE" && (e.type === "EXPENSE_FUEL" || e.type === "EXPENSE_KIOSCO")) return true;
      if (typeFilter === "PAUSE" && e.type === "PAUSE") return true;
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.at || a.pauseStartAt || 0).getTime();
      const dateB = new Date(b.at || b.pauseStartAt || 0).getTime();
      return dateB - dateA; // Más recientes primero
    });

  // Buscar pausa activa
  useEffect(() => {
    const active = state.events.find(
      (e) => e.type === "PAUSE" && e.pauseStartAt && !e.pauseEndAt
    );
    setActivePause(active || null);
  }, [state.events]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    try {
      await deleteEvent(id);
      await refreshState();
      alert("Evento eliminado. Los cambios se guardarán en Git.");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar evento. Verifica la consola.");
    }
  };

  const handleClosePause = async (id: string) => {
    try {
      await updateEvent(id, {
        pauseEndAt: new Date().toISOString(),
      });
      await refreshState();
      alert("Pausa cerrada. Los cambios se guardarán en Git.");
    } catch (error) {
      console.error(error);
      alert("Error al cerrar pausa. Verifica la consola.");
    }
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

  const getEventIcon = (type: string) => {
    if (type === "INCOME") return <DollarSign className="h-5 w-5 text-green-600" />;
    if (type === "EXPENSE_FUEL") return <Fuel className="h-5 w-5 text-red-600" />;
    if (type === "EXPENSE_KIOSCO") return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    if (type === "PAUSE") return <Clock className="h-5 w-5 text-blue-600" />;
    return null;
  };

  const getEventLabel = (event: Event) => {
    if (event.type === "INCOME") {
      return `Ingreso: $${(event.amount || 0).toLocaleString("es-AR")}`;
    }
    if (event.type === "EXPENSE_FUEL") {
      const liters = event.fuelLiters ? `${event.fuelLiters.toFixed(2)}L` : "";
      return `Nafta: $${(event.amount || 0).toLocaleString("es-AR")} ${liters}`.trim();
    }
    if (event.type === "EXPENSE_KIOSCO") {
      return `Kiosco: $${(event.amount || 0).toLocaleString("es-AR")}`;
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Revisa y gestiona tus movimientos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="date" className="text-xs">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-xs">Tipo</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9">
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
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <History className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <div className="font-semibold mb-2">No hay movimientos</div>
              <div className="text-sm text-muted-foreground">
                No hay eventos registrados para esta fecha
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{getEventLabel(event)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(new Date(event.at || event.pauseStartAt || ""))}
                    </div>
                    {event.note && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {event.note}
                      </div>
                    )}
                    {event.type === "EXPENSE_FUEL" && event.fuelStation && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Estación: {event.fuelStation}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {event.type === "PAUSE" && !event.pauseEndAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePause(event.id)}
                        className="h-8 px-2 text-xs"
                      >
                        Cerrar
                      </Button>
                    )}
                    {(event.type === "INCOME" || event.type === "EXPENSE_FUEL" || event.type === "EXPENSE_KIOSCO") && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(event)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(event.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modales */}
      <IncomeForm
        open={incomeOpen}
        onOpenChange={(open) => {
          setIncomeOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={() => {
          refreshState();
          setEditingEvent(null);
        }}
        editingEvent={editingEvent && editingEvent.type === "INCOME" ? editingEvent : null}
      />
      <FuelForm
        open={fuelOpen}
        onOpenChange={(open) => {
          setFuelOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={() => {
          refreshState();
          setEditingEvent(null);
        }}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE_FUEL" ? editingEvent : null}
      />
      <KioscoForm
        open={kioscoOpen}
        onOpenChange={(open) => {
          setKioscoOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSuccess={() => {
          refreshState();
          setEditingEvent(null);
        }}
        editingEvent={editingEvent && editingEvent.type === "EXPENSE_KIOSCO" ? editingEvent : null}
      />
      <PauseForm
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onSuccess={refreshState}
        activePause={activePause}
      />
    </div>
  );
}
