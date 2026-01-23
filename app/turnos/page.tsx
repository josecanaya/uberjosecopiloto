"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getState, defaultState } from "@/lib/data";
import { getArgentinaDate, getDayOfWeek, formatCurrency } from "@/lib/utils";
import type { PlanBlock } from "@/lib/data";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function TurnosPage() {
  const [state, setState] = useState(defaultState);
  const today = getArgentinaDate();
  const todayDow = getDayOfWeek(today);

  useEffect(() => {
    setState(getState());
  }, []);

  const getBlockStatus = (dayOfWeek: number, block: PlanBlock) => {
    if (dayOfWeek !== todayDow) return "other";
    
    const now = getArgentinaDate();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });
    
    if (currentTime < block.start) return "future";
    if (currentTime >= block.start && currentTime <= block.end) return "current";
    return "past";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Turnos</h1>
        <p className="text-sm text-muted-foreground">
          Plan semanal de horarios de trabajo
        </p>
      </div>

      <div className="space-y-3">
        {dayNames.map((dayName, index) => {
          const dayOfWeek = index; // 0=Domingo, 1=Lunes, etc.
          const blocks = state.settings.planBlocksByDow[dayOfWeek] || [];
          const goal = state.settings.goalsByDow[dayOfWeek] || 0;
          const isToday = dayOfWeek === todayDow;

          return (
            <Card
              key={dayOfWeek}
              className={isToday ? "border-primary border-2" : ""}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{dayName}</span>
                    {isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Hoy
                      </span>
                    )}
                  </div>
                  {goal > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Obj: {formatCurrency(goal)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blocks.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Descanso
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {blocks.map((block, blockIndex) => {
                      const status = getBlockStatus(dayOfWeek, block);
                      return (
                        <div
                          key={blockIndex}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                            status === "current"
                              ? "bg-primary text-primary-foreground border-primary"
                              : status === "past"
                              ? "bg-muted text-muted-foreground border-muted"
                              : status === "future"
                              ? "bg-background text-foreground border-border"
                              : "bg-background text-muted-foreground border-border"
                          }`}
                        >
                          <div className="font-semibold">
                            {block.start} - {block.end}
                          </div>
                          {status === "current" && (
                            <div className="text-xs mt-0.5 opacity-90">En curso</div>
                          )}
                          {status === "past" && (
                            <div className="text-xs mt-0.5 opacity-70">Pasado</div>
                          )}
                          {status === "future" && isToday && (
                            <div className="text-xs mt-0.5 opacity-70">Próximo</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              Los horarios se configuran en <code className="bg-muted px-1 rounded">/data/settings.json</code>.
            </p>
            <p>
              Edita el archivo en GitHub para actualizar el plan semanal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
