import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { validateAdminKey } from "@/lib/auth";
import type { CreateEventRequest } from "@/lib/types";

// GET /api/events?from=ISO&to=ISO - Obtener eventos entre fechas
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabase.from("events").select("*").order("created_at", { ascending: false });

    if (from || to) {
      // Filtrar por fecha (at o pause_start_at)
      // Para Supabase, necesitamos hacer dos queries y combinar, o usar una query más compleja
      // Por simplicidad, filtramos por at primero y luego por pause_start_at
      if (from && to) {
        // Obtener eventos donde at está en el rango
        const { data: eventsByAt } = await supabase
          .from("events")
          .select("*")
          .gte("at", from)
          .lte("at", to);
        
        // Obtener eventos donde pause_start_at está en el rango
        const { data: eventsByPause } = await supabase
          .from("events")
          .select("*")
          .gte("pause_start_at", from)
          .lte("pause_start_at", to);

        // Combinar y eliminar duplicados
        const allEvents = [...(eventsByAt || []), ...(eventsByPause || [])];
        const uniqueEvents = Array.from(
          new Map(allEvents.map((e) => [e.id, e])).values()
        );

        return NextResponse.json(uniqueEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } else if (from) {
        const { data: eventsByAt } = await supabase
          .from("events")
          .select("*")
          .gte("at", from);
        
        const { data: eventsByPause } = await supabase
          .from("events")
          .select("*")
          .gte("pause_start_at", from);

        const allEvents = [...(eventsByAt || []), ...(eventsByPause || [])];
        const uniqueEvents = Array.from(
          new Map(allEvents.map((e) => [e.id, e])).values()
        );

        return NextResponse.json(uniqueEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } else if (to) {
        const { data: eventsByAt } = await supabase
          .from("events")
          .select("*")
          .lte("at", to);
        
        const { data: eventsByPause } = await supabase
          .from("events")
          .select("*")
          .lte("pause_start_at", to);

        const allEvents = [...(eventsByAt || []), ...(eventsByPause || [])];
        const uniqueEvents = Array.from(
          new Map(allEvents.map((e) => [e.id, e])).values()
        );

        return NextResponse.json(uniqueEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    }

    // Si no hay filtros de fecha, obtener todos los eventos
    if (!from && !to) {
      const { data, error } = await query;

      if (error) {
        console.error("Error al obtener events:", error);
        return NextResponse.json(
          { error: "Error al obtener events" },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    }

    // Si llegamos aquí, ya retornamos en los casos con filtros
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error en GET /api/events:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/events - Crear evento
export async function POST(request: NextRequest) {
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

    const body: CreateEventRequest = await request.json();

    // Validaciones
    if (!body.type || !["INCOME", "EXPENSE_FUEL", "EXPENSE_KIOSCO", "PAUSE"].includes(body.type)) {
      return NextResponse.json(
        { error: "type debe ser INCOME, EXPENSE_FUEL, EXPENSE_KIOSCO o PAUSE" },
        { status: 400 }
      );
    }

    // Validar según tipo
    if (body.type === "INCOME") {
      if (!body.amount || body.amount <= 0) {
        return NextResponse.json(
          { error: "amount es requerido y debe ser > 0 para INCOME" },
          { status: 400 }
        );
      }
      if (!body.at) {
        return NextResponse.json(
          { error: "at es requerido para INCOME" },
          { status: 400 }
        );
      }
    }

    if (body.type === "EXPENSE_FUEL" || body.type === "EXPENSE_KIOSCO") {
      if (!body.amount || body.amount <= 0) {
        return NextResponse.json(
          { error: "amount es requerido y debe ser > 0 para EXPENSE" },
          { status: 400 }
        );
      }
      if (!body.at) {
        return NextResponse.json(
          { error: "at es requerido para EXPENSE" },
          { status: 400 }
        );
      }
    }

    if (body.type === "PAUSE") {
      if (!body.pause_start_at) {
        return NextResponse.json(
          { error: "pause_start_at es requerido para PAUSE" },
          { status: 400 }
        );
      }

      // Validar que solo haya una pausa abierta
      if (!body.pause_end_at) {
        const { data: activePauses, error: checkError } = await supabase
          .from("events")
          .select("id")
          .eq("type", "PAUSE")
          .is("pause_end_at", null)
          .limit(1);

        if (checkError) {
          console.error("Error al verificar pausas activas:", checkError);
          return NextResponse.json(
            { error: "Error al verificar pausas activas" },
            { status: 500 }
          );
        }

        if (activePauses && activePauses.length > 0) {
          return NextResponse.json(
            { error: "Ya existe una pausa activa. Cierra la pausa actual antes de crear una nueva." },
            { status: 400 }
          );
        }
      }
    }

    // Preparar datos para insertar
    const insertData: any = {
      type: body.type,
      at: body.at || null,
      amount: body.amount || null,
      note: body.note || null,
      income_type: body.income_type || null,
      fuel_liters: body.fuel_liters || null,
      fuel_price_per_liter: body.fuel_price_per_liter || null,
      fuel_station: body.fuel_station || null,
      pause_start_at: body.pause_start_at || null,
      pause_end_at: body.pause_end_at || null,
      pause_reason: body.pause_reason || null,
    };

    const { data, error } = await supabase
      .from("events")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error al crear event:", error);
      return NextResponse.json(
        { error: "Error al crear event" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/events:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
