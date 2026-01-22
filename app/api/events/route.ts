import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const type = searchParams.get("type");

    let where: any = {};

    if (date) {
      const dateObj = new Date(date);
      const start = getStartOfDay(dateObj);
      const end = getEndOfDay(dateObj);
      where.at = {
        gte: start,
        lte: end,
      };
    }

    if (type) {
      where.type = type;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { at: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      amount,
      at,
      note,
      incomeType,
      expenseType,
      fuelLiters,
      fuelPricePerLiter,
      fuelStation,
      fuelOdometer,
      pauseStartAt,
      pauseEndAt,
      pauseReason,
    } = body;

    // Validar que no haya pausa activa si se está creando una nueva pausa
    if (type === "PAUSE" && !pauseEndAt) {
      const activePause = await prisma.event.findFirst({
        where: {
          type: "PAUSE",
          pauseEndAt: null,
        },
      });

      if (activePause) {
        return NextResponse.json(
          { error: "Ya existe una pausa activa" },
          { status: 400 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        type,
        amount,
        at: at ? new Date(at) : new Date(),
        note,
        incomeType,
        expenseType,
        fuelLiters,
        fuelPricePerLiter,
        fuelStation,
        fuelOdometer,
        pauseStartAt: pauseStartAt ? new Date(pauseStartAt) : null,
        pauseEndAt: pauseEndAt ? new Date(pauseEndAt) : null,
        pauseReason,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
