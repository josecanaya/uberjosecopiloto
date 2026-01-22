import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
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

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        amount,
        at: at ? new Date(at) : undefined,
        note,
        incomeType,
        expenseType,
        fuelLiters,
        fuelPricePerLiter,
        fuelStation,
        fuelOdometer,
        pauseStartAt: pauseStartAt ? new Date(pauseStartAt) : undefined,
        pauseEndAt: pauseEndAt ? new Date(pauseEndAt) : undefined,
        pauseReason,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
}
