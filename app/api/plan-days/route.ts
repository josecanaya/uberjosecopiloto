import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const planDays = await prisma.planDay.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json(planDays);
  } catch (error) {
    console.error("Error fetching plan days:", error);
    return NextResponse.json(
      { error: "Error al obtener días planificados" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, dailyGoal } = body;

    const planDay = await prisma.planDay.update({
      where: { id },
      data: { dailyGoal },
    });

    return NextResponse.json(planDay);
  } catch (error) {
    console.error("Error updating plan day:", error);
    return NextResponse.json(
      { error: "Error al actualizar día planificado" },
      { status: 500 }
    );
  }
}
