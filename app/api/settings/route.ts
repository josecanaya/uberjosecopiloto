import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { validateAdminKey } from "@/lib/auth";
import type { UpdateSettingsRequest } from "@/lib/types";

// GET /api/settings - Obtener settings
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

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error al obtener settings:", error);
      return NextResponse.json(
        { error: "Error al obtener settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/settings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Actualizar settings
export async function PUT(request: NextRequest) {
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

    const body: UpdateSettingsRequest = await request.json();

    // Obtener settings actuales
    const { data: currentSettings, error: fetchError } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, está bien si no existe
      console.error("Error al obtener settings:", fetchError);
      return NextResponse.json(
        { error: "Error al obtener settings actuales" },
        { status: 500 }
      );
    }

    const updateData = {
      timezone: body.timezone ?? currentSettings?.timezone ?? "America/Argentina/Buenos_Aires",
      goals_by_dow: body.goals_by_dow ?? currentSettings?.goals_by_dow ?? {},
      plan_blocks_by_dow: body.plan_blocks_by_dow ?? currentSettings?.plan_blocks_by_dow ?? {},
      weekly_goal: body.weekly_goal ?? currentSettings?.weekly_goal ?? 400000,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (currentSettings) {
      // Update existing
      const { data, error } = await supabase
        .from("settings")
        .update(updateData)
        .eq("id", currentSettings.id)
        .select()
        .single();

      if (error) {
        console.error("Error al actualizar settings:", error);
        return NextResponse.json(
          { error: "Error al actualizar settings" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("settings")
        .insert(updateData)
        .select()
        .single();

      if (error) {
        console.error("Error al crear settings:", error);
        return NextResponse.json(
          { error: "Error al crear settings" },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en PUT /api/settings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
