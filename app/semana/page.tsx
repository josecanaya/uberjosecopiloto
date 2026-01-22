"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getStartOfWeek, getArgentinaDate } from "@/lib/utils";

interface DayStats {
  dayOfWeek: number;
  dayName: string;
  objetivo: number;
  bruto: number;
  gastoNafta: number;
  gastoKiosco: number;
  gastosTotal: number;
  neto: number;
  horasEfectivas: number;
  porHoraNeto: number;
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function SemanaPage() {
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(getArgentinaDate()));

  const fetchWeekStats = async () => {
    setLoading(true);
    try {
      const stats: DayStats[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        
        const response = await fetch(`/api/stats?period=day&date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          stats.push({
            dayOfWeek: date.getDay(),
            dayName: dayNames[date.getDay()],
            objetivo: data.planDay?.dailyGoal || 0,
            bruto: data.bruto || 0,
            gastoNafta: data.gastoNafta || 0,
            gastoKiosco: data.gastoKiosco || 0,
            gastosTotal: data.gastosTotal || 0,
            neto: data.neto || 0,
            horasEfectivas: data.horasEfectivas || 0,
            porHoraNeto: data.porHoraNeto || 0,
          });
        }
      }
      
      setWeekStats(stats);
    } catch (error) {
      console.error("Error fetching week stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekStats();
  }, [weekStart]);

  const totals = weekStats.reduce(
    (acc, day) => ({
      objetivo: acc.objetivo + day.objetivo,
      bruto: acc.bruto + day.bruto,
      gastoNafta: acc.gastoNafta + day.gastoNafta,
      gastoKiosco: acc.gastoKiosco + day.gastoKiosco,
      gastosTotal: acc.gastosTotal + day.gastosTotal,
      neto: acc.neto + day.neto,
      horasEfectivas: acc.horasEfectivas + day.horasEfectivas,
    }),
    { objetivo: 0, bruto: 0, gastoNafta: 0, gastoKiosco: 0, gastosTotal: 0, neto: 0, horasEfectivas: 0 }
  );

  const porHoraNetoSemanal = totals.horasEfectivas > 0 ? totals.neto / totals.horasEfectivas : 0;

  const handlePreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() - 7);
    setWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + 7);
    setWeekStart(newDate);
  };

  const handleToday = () => {
    setWeekStart(getStartOfWeek(getArgentinaDate()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Semana</h1>
          <p className="text-muted-foreground">
            Resumen semanal de métricas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-3 py-1 rounded-md border hover:bg-accent"
          >
            ←
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-md border hover:bg-accent text-sm"
          >
            Hoy
          </button>
          <button
            onClick={handleNextWeek}
            className="px-3 py-1 rounded-md border hover:bg-accent"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Día</th>
                  <th className="text-right p-3 font-semibold">Objetivo</th>
                  <th className="text-right p-3 font-semibold">Bruto</th>
                  <th className="text-right p-3 font-semibold">Nafta</th>
                  <th className="text-right p-3 font-semibold">Kiosco</th>
                  <th className="text-right p-3 font-semibold">Gastos</th>
                  <th className="text-right p-3 font-semibold">Neto</th>
                  <th className="text-right p-3 font-semibold">Horas</th>
                  <th className="text-right p-3 font-semibold">$/h Neto</th>
                </tr>
              </thead>
              <tbody>
                {weekStats.map((day) => (
                  <tr key={day.dayOfWeek} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{day.dayName}</td>
                    <td className="p-3 text-right">{formatCurrency(day.objetivo)}</td>
                    <td className="p-3 text-right text-green-600">
                      {formatCurrency(day.bruto)}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {formatCurrency(day.gastoNafta)}
                    </td>
                    <td className="p-3 text-right text-orange-600">
                      {formatCurrency(day.gastoKiosco)}
                    </td>
                    <td className="p-3 text-right text-red-600 font-semibold">
                      {formatCurrency(day.gastosTotal)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(day.neto)}
                    </td>
                    <td className="p-3 text-right">
                      {day.horasEfectivas.toFixed(1)}h
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(day.porHoraNeto)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 font-bold bg-muted/50">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">{formatCurrency(totals.objetivo)}</td>
                  <td className="p-3 text-right text-green-600">
                    {formatCurrency(totals.bruto)}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.gastoNafta)}
                  </td>
                  <td className="p-3 text-right text-orange-600">
                    {formatCurrency(totals.gastoKiosco)}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.gastosTotal)}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(totals.neto)}
                  </td>
                  <td className="p-3 text-right">
                    {totals.horasEfectivas.toFixed(1)}h
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(porHoraNetoSemanal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumen en cards para mobile */}
          <div className="grid gap-4 md:hidden">
            {weekStats.map((day) => (
              <Card key={day.dayOfWeek}>
                <CardHeader>
                  <CardTitle>{day.dayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Objetivo:</span>
                    <span>{formatCurrency(day.objetivo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bruto:</span>
                    <span className="text-green-600">{formatCurrency(day.bruto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nafta:</span>
                    <span className="text-red-600">{formatCurrency(day.gastoNafta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kiosco:</span>
                    <span className="text-orange-600">{formatCurrency(day.gastoKiosco)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos:</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(day.gastosTotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Neto:</span>
                    <span>{formatCurrency(day.neto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas:</span>
                    <span>{day.horasEfectivas.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>$/h Neto:</span>
                    <span>{formatCurrency(day.porHoraNeto)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
