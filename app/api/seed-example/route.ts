import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getArgentinaDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "No disponible en producción" },
      { status: 403 }
    );
  }

  try {
    const today = getArgentinaDate();
    today.setHours(0, 0, 0, 0);

    // Crear algunos ingresos de ejemplo
    const exampleIncomes = [
      {
        type: "INCOME" as const,
        amount: 15000,
        incomeType: "UBER" as const,
        at: new Date(today.getTime() + 7 * 60 * 60 * 1000), // 7:00 AM
        note: "Primera hora",
      },
      {
        type: "INCOME" as const,
        amount: 12000,
        incomeType: "UBER" as const,
        at: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        note: null,
      },
      {
        type: "INCOME" as const,
        amount: 2000,
        incomeType: "TIP" as const,
        at: new Date(today.getTime() + 8.5 * 60 * 60 * 1000), // 8:30 AM
        note: "Propina generosa",
      },
      {
        type: "INCOME" as const,
        amount: 18000,
        incomeType: "UBER" as const,
        at: new Date(today.getTime() + 14.5 * 60 * 60 * 1000), // 2:30 PM
        note: "Mediodía",
      },
    ];

    for (const income of exampleIncomes) {
      await prisma.event.create({
        data: income,
      });
    }

    // Ejemplo: un gasto de nafta
    await prisma.event.create({
      data: {
        type: "EXPENSE",
        expenseType: "FUEL",
        amount: 8000,
        fuelLiters: 20,
        fuelPricePerLiter: 400,
        fuelStation: "YPF",
        at: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM
        note: "Carga completa",
      },
    });

    // Ejemplo: gastos de kiosco
    await prisma.event.create({
      data: {
        type: "EXPENSE",
        expenseType: "KIOSCO",
        amount: 500,
        at: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        note: "Café y medialunas",
      },
    });

    await prisma.event.create({
      data: {
        type: "EXPENSE",
        expenseType: "KIOSCO",
        amount: 300,
        at: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
        note: "Agua y snack",
      },
    });

    return NextResponse.json({ success: true, message: "Eventos de ejemplo creados" });
  } catch (error) {
    console.error("Error creating example events:", error);
    return NextResponse.json(
      { error: "Error al crear eventos de ejemplo" },
      { status: 500 }
    );
  }
}
