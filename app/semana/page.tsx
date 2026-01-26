"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatCurrency, startOfWeek, getArgentinaDate, formatDate, getDayOfWeek } from "@/lib/utils";
import { getState, updateWeeklyGoal, defaultState } from "@/lib/apiAdapter";
import { calculateWeekStats } from "@/lib/calculations";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function SemanaPage() {
  const [state, setState] = useState(defaultState);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [editingWeeklyGoal, setEditingWeeklyGoal] = useState(false);
  const [weeklyGoalValue, setWeeklyGoalValue] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== "undefined") {
        const currentState = await getState();
        setState(currentState);
        setWeeklyGoalValue((currentState.settings.weeklyGoal || 400000).toString());
        // Inicializar weekStart solo en el cliente
        if (weekStart === null) {
          setWeekStart(startOfWeek(getArgentinaDate()));
        }
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solo calcular si weekStart está inicializado
  const weekStats = weekStart
    ? calculateWeekStats(
        state.events,
        weekStart,
        state.settings.goalsByDow,
        state.settings.planBlocksByDow,
        state.manualAdjustments
      )
    : [];

  const totals = weekStats.reduce(
    (acc, day) => ({
      bruto: acc.bruto + day.stats.bruto,
      gastoNafta: acc.gastoNafta + day.stats.gastoNafta,
      gastoKiosco: acc.gastoKiosco + day.stats.gastoKiosco,
      gastosTotal: acc.gastosTotal + day.stats.gastosTotal,
      neto: acc.neto + day.stats.neto,
      horasEfectivas: acc.horasEfectivas + day.stats.horasEfectivas,
    }),
    { bruto: 0, gastoNafta: 0, gastoKiosco: 0, gastosTotal: 0, neto: 0, horasEfectivas: 0 }
  );

  const weeklyGoal = state.settings.weeklyGoal || 400000;
  // Progreso basado en BRUTO
  const progreso = weeklyGoal > 0 ? (totals.bruto / weeklyGoal) * 100 : 0;
  const faltante = Math.max(0, weeklyGoal - totals.bruto);
  const porHoraNetoSemanal = totals.horasEfectivas > 0 ? totals.neto / totals.horasEfectivas : 0;

  const handlePreviousWeek = () => {
    if (!weekStart) return;
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() - 7);
    setWeekStart(newDate);
  };

  const handleNextWeek = () => {
    if (!weekStart) return;
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + 7);
    setWeekStart(newDate);
  };

  const handleToday = () => {
    setWeekStart(startOfWeek(getArgentinaDate()));
  };

  const handleWeeklyGoalSave = async () => {
    try {
      await updateWeeklyGoal(parseFloat(weeklyGoalValue));
      const currentState = await getState();
      setState(currentState);
      setEditingWeeklyGoal(false);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar objetivo. Verifica la consola.");
    }
  };

  const weekStartStr = weekStart
    ? weekStart.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    : "";
  const weekEnd = weekStart ? new Date(weekStart) : null;
  if (weekEnd) {
    weekEnd.setDate(weekStart!.getDate() + 6);
  }
  const weekEndStr = weekEnd
    ? weekEnd.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    : "";

  // Datos para el gráfico
  const chartData = weekStats.map((day) => ({
    name: day.dayName.substring(0, 3), // Lun, Mar, etc.
    bruto: day.stats.bruto,
    objetivo: day.goal || 0,
    neto: day.stats.neto,
  }));

  const maxBruto = Math.max(...weekStats.map((d) => d.stats.bruto), weeklyGoal, 10000);

  // Si weekStart no está inicializado, mostrar loading
  if (!weekStart) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Semana</h1>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Semana</h1>
          <p className="text-sm text-muted-foreground">
            {weekStartStr} - {weekEndStr}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="text-xs"
        >
          Hoy
        </Button>
      </div>

      {/* Navegación de semana */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs">Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          className="flex items-center gap-1"
        >
          <span className="text-xs">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ============================================ */}
      {/* RESUMEN SEMANAL */}
      {/* ============================================ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Resumen Semana</span>
            {editingWeeklyGoal ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weeklyGoalValue}
                  onChange={(e) => setWeeklyGoalValue(e.target.value)}
                  className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleWeeklyGoalSave} className="h-7 px-2">
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingWeeklyGoal(false);
                    setWeeklyGoalValue(weeklyGoal.toString());
                  }}
                  className="h-7 px-2"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingWeeklyGoal(true)}
                className="h-6 px-2 text-xs"
              >
                Editar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Objetivo Semanal (BRUTO) */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Objetivo Semanal (Bruto)</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(weeklyGoal)}</span>
          </div>

          {/* Bruto Semanal */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <span className="text-base font-semibold text-green-900">Bruto Semanal</span>
            <span className="text-2xl font-bold text-green-700">{formatCurrency(totals.bruto)}</span>
          </div>

          {/* Gastos desglosados */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-900 mb-1">Nafta</div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(totals.gastoNafta)}
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-900 mb-1">Kiosco</div>
              <div className="text-lg font-bold text-orange-700">
                {formatCurrency(totals.gastoKiosco)}
              </div>
            </div>
          </div>

          {/* Gastos Totales */}
          <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-300">
            <span className="text-sm font-semibold text-red-900">Gastos Totales</span>
            <span className="text-xl font-bold text-red-700">
              {formatCurrency(totals.gastosTotal)}
            </span>
          </div>

          {/* Neto Semanal */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <span className="text-base font-semibold">Neto Semanal</span>
            <span className="text-2xl font-bold">{formatCurrency(totals.neto)}</span>
          </div>

          {/* Progreso basado en BRUTO */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso (Bruto)</span>
              <span className="font-semibold">{progreso.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, progreso)}%` }}
              />
            </div>
            {faltante > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Faltan {formatCurrency(faltante)} de bruto
              </div>
            )}
          </div>

          {/* Recomendación */}
          {totals.bruto >= weeklyGoal ? (
            <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-300">
              <TrendingUp className="h-5 w-5 text-green-700" />
              <span className="text-sm font-semibold text-green-900">¡Objetivo semanal logrado!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg border border-orange-300">
              <TrendingDown className="h-5 w-5 text-orange-700" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-orange-900">
                  Faltan {formatCurrency(faltante)} de bruto
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* GRÁFICO DE BARRAS */}
      {/* ============================================ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bruto por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full" style={{ minHeight: "250px" }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number | undefined) => formatCurrency(value || 0)}
                  labelStyle={{ color: "#000" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <Bar
                  dataKey="bruto"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="Bruto"
                />
                {weekStats.some((d) => d.goal > 0) && (
                  <ReferenceLine
                    y={weeklyGoal / 7}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    label={{ value: "Promedio objetivo", position: "top", fontSize: 10 }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* POR DÍA */}
      {/* ============================================ */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Por Día</h2>
        {weekStats.map((day) => {
          // Progreso del día basado en BRUTO
          const dayProgress = day.goal > 0 ? (day.stats.bruto / day.goal) * 100 : 0;
          const dayRemaining = Math.max(0, day.goal - day.stats.bruto);

          return (
            <Card key={day.dayOfWeek} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{day.dayName}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(day.date)}
                    </p>
                  </div>
                  {day.goal > 0 && (
                    <div className="px-2 py-1 bg-primary/10 rounded-md">
                      <span className="text-xs font-semibold text-primary">
                        Obj: {formatCurrency(day.goal)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Bruto */}
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-900">Bruto</span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(day.stats.bruto)}
                  </span>
                </div>

                {/* Gastos desglosados */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nafta</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(day.stats.gastoNafta)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kiosco</span>
                    <span className="text-orange-600 font-medium">
                      {formatCurrency(day.stats.gastoKiosco)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200 mt-2">
                    <span className="text-sm font-semibold text-red-900">Gastos</span>
                    <span className="text-base font-bold text-red-700">
                      {formatCurrency(day.stats.gastosTotal)}
                    </span>
                  </div>
                </div>

                {/* Neto */}
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                  <span className="text-base font-semibold">Neto</span>
                  <span className="text-xl font-bold">{formatCurrency(day.stats.neto)}</span>
                </div>

                {/* Progreso del día (basado en BRUTO) */}
                {day.goal > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progreso (Bruto)</span>
                      <span className="font-semibold">{dayProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          day.stats.bruto >= day.goal ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(100, dayProgress)}%` }}
                      />
                    </div>
                    {dayRemaining > 0 && (
                      <div className="text-center text-xs text-muted-foreground">
                        Faltan {formatCurrency(dayRemaining)} de bruto
                      </div>
                    )}
                  </div>
                )}

                {/* Horas y $/h */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground">Horas planificadas</div>
                    <div className="text-sm font-semibold">{day.stats.horasPlanificadas.toFixed(1)}h</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Horas efectivas</div>
                    <div className="text-sm font-semibold">{day.stats.horasEfectivas.toFixed(1)}h</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">$/hora neto</div>
                    <div className="text-base font-bold">{formatCurrency(day.stats.porHoraNeto)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
