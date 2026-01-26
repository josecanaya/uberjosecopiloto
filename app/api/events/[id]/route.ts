import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { validateAdminKey } from "@/lib/auth";
import type { UpdateEventRequest } from "@/lib/types";

// PUT /api/events/:id - Actualizar evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados" },
        { status: 500 }
      );
    }

    if (!validateAdminKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body: UpdateEventRequest = await request.json();

    // Validar que el evento existe
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Validar tipo si se está actualizando
    if (body.type && !["INCOME", "EXPENSE_FUEL", "EXPENSE_KIOSCO", "PAUSE"].includes(body.type)) {
      return NextResponse.json(
        { error: "type debe ser INCOME, EXPENSE_FUEL, EXPENSE_KIOSCO o PAUSE" },
        { status: 400 }
      );
    }

    // Validar amount si se está actualizando
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: "amount debe ser > 0" },
        { status: 400 }
      );
    }

    // Validar pausa única si se está cerrando una pausa
    if (existingEvent.type === "PAUSE" && !existingEvent.pause_end_at && body.pause_end_at) {
      // Está cerrando una pausa, verificar que no haya otra activa
      const { data: otherActivePauses, error: checkError } = await supabase
        .from("events")
        .select("id")
        .eq("type", "PAUSE")
        .is("pause_end_at", null)
        .neq("id", id)
        .limit(1);

      if (checkError) {
        console.error("Error al verificar pausas activas:", checkError);
        return NextResponse.json(
          { error: "Error al verificar pausas activas" },
          { status: 500 }
        );
      }

      if (otherActivePauses && otherActivePauses.length > 0) {
        return NextResponse.json(
          { error: "Ya existe otra pausa activa" },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.type !== undefined) updateData.type = body.type;
    if (body.at !== undefined) updateData.at = body.at;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.income_type !== undefined) updateData.income_type = body.income_type;
    if (body.fuel_liters !== undefined) updateData.fuel_liters = body.fuel_liters;
    if (body.fuel_price_per_liter !== undefined) updateData.fuel_price_per_liter = body.fuel_price_per_liter;
    if (body.fuel_station !== undefined) updateData.fuel_station = body.fuel_station;
    if (body.pause_start_at !== undefined) updateData.pause_start_at = body.pause_start_at;
    if (body.pause_end_at !== undefined) updateData.pause_end_at = body.pause_end_at;
    if (body.pause_reason !== undefined) updateData.pause_reason = body.pause_reason;

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar event:", error);
      return NextResponse.json(
        { error: "Error al actualizar event" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en PUT /api/events/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - Eliminar evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados" },
        { status: 500 }
      );
    }

    if (!validateAdminKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar event:", error);
      return NextResponse.json(
        { error: "Error al eliminar event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/events/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
