import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "day";
    const date = searchParams.get("date") || new Date().toISOString();

    const dateObj = new Date(date);
    let start: Date;
    let end: Date;

    if (period === "week") {
      start = getStartOfWeek(dateObj);
      end = getEndOfWeek(dateObj);
    } else {
      start = getStartOfDay(dateObj);
      end = getEndOfDay(dateObj);
    }

    const events = await prisma.event.findMany({
      where: {
        at: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { at: "asc" },
    });

    // Calcular estadísticas
    const incomes = events.filter((e) => e.type === "INCOME");
    const expenses = events.filter((e) => e.type === "EXPENSE");
    const pauses = events.filter((e) => e.type === "PAUSE");

    const bruto = incomes.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Separar gastos por tipo
    const gastoNafta = expenses
      .filter((e) => e.expenseType === "FUEL")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const gastoKiosco = expenses
      .filter((e) => e.expenseType === "KIOSCO")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const gastoOtros = expenses
      .filter((e) => e.expenseType === "OTHER")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const gastosTotal = gastoNafta + gastoKiosco + gastoOtros;
    const neto = bruto - gastosTotal;

    // Calcular duración de pausas
    let pausasMinutos = 0;
    pauses.forEach((pause) => {
      if (pause.pauseStartAt && pause.pauseEndAt) {
        const start = new Date(pause.pauseStartAt);
        const end = new Date(pause.pauseEndAt);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        pausasMinutos += diff;
      } else if (pause.pauseStartAt) {
        // Pausa activa
        const start = new Date(pause.pauseStartAt);
        const now = new Date();
        const diff = (now.getTime() - start.getTime()) / (1000 * 60);
        pausasMinutos += diff;
      }
    });

    // Obtener plan del día
    const dayOfWeek = dateObj.getDay();
    const planDay = await prisma.planDay.findUnique({
      where: { dayOfWeek },
    });

    let horasPlanificadas = 0;
    if (planDay && Array.isArray(planDay.blocks)) {
      planDay.blocks.forEach((block: any) => {
        const start = new Date(`1970-01-01T${block.start}`);
        const end = new Date(`1970-01-01T${block.end}`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        horasPlanificadas += diff;
      });
    }

    const horasEfectivas = Math.max(0, horasPlanificadas - pausasMinutos / 60);
    const porHoraNeto = horasEfectivas > 0 ? neto / horasEfectivas : 0;

    return NextResponse.json({
      bruto,
      gastoNafta,
      gastoKiosco,
      gastoOtros,
      gastosTotal,
      neto,
      pausasMinutos,
      horasPlanificadas,
      horasEfectivas,
      porHoraNeto,
      planDay,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
