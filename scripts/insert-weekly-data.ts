// Script para insertar datos reales de la semana en Supabase
// Ejecutar con: npx tsx scripts/insert-weekly-data.ts

import { createClient } from "@supabase/supabase-js";

// Configuración desde variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || "Copilotouber2026";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Función para obtener fecha de un día de la semana (0=Domingo, 1=Lunes, etc.) en Argentina
function getDateForDayOfWeek(dayOfWeek: number): Date {
  const now = new Date();
  
  // Obtener fecha actual en Argentina
  const argDateStr = now.toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  // Parsear fecha Argentina (formato: MM/DD/YYYY)
  const parts = argDateStr.split("/");
  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  const argDate = new Date(year, month - 1, day);
  
  // Obtener día de la semana actual (0=Domingo, 1=Lunes, etc.)
  const currentDay = argDate.getDay();
  
  // Calcular diferencia de días
  let diff = dayOfWeek - currentDay;
  
  // Si el día ya pasó esta semana, ir a la semana siguiente
  // Si no, usar la semana actual
  const targetDate = new Date(argDate);
  targetDate.setDate(argDate.getDate() + diff);
  
  return targetDate;
}

// Función para crear timestamp ISO en un horario específico del día en Argentina
function createTimestamp(date: Date, hour: number, minute: number = 0): string {
  // Crear string de fecha/hora en formato ISO pero interpretándolo como hora Argentina
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");
  
  // Crear fecha interpretándola como hora local (Argentina UTC-3)
  // Usar formato que JavaScript interprete correctamente
  const dateStr = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00-03:00`;
  const argDate = new Date(dateStr);
  
  return argDate.toISOString();
}

async function insertWeeklyData() {
  console.log("🚀 Iniciando inserción de datos semanales...\n");

  try {
    // JUEVES (4)
    const jueves = getDateForDayOfWeek(4);
    console.log(`📅 Jueves: ${jueves.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
    
    // Jueves - Ingresos (distribuidos en bloques del día)
    const juevesIncome1 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 25000,
      income_type: "UBER",
      at: createTimestamp(jueves, 7, 30),
      note: "Mañana",
    });
    
    const juevesIncome2 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 25000,
      income_type: "UBER",
      at: createTimestamp(jueves, 14, 30),
      note: "Mediodía",
    });
    
    const juevesIncome3 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 20000,
      income_type: "UBER",
      at: createTimestamp(jueves, 21, 30),
      note: "Noche",
    });

    // Jueves - Nafta
    const juevesFuel1 = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 15000,
      at: createTimestamp(jueves, 16, 0),
      note: "Nafta 1",
    });
    
    const juevesFuel2 = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 15000,
      at: createTimestamp(jueves, 22, 0),
      note: "Nafta 2",
    });

    // Jueves - Kiosco
    const juevesKiosco = await supabase.from("events").insert({
      type: "EXPENSE_KIOSCO",
      amount: 3000,
      at: createTimestamp(jueves, 10, 0),
      note: "Kiosco",
    });

    console.log("✅ Jueves: $70.000 ingresos, $30.000 nafta, $3.000 kiosco");

    // VIERNES (5)
    const viernes = getDateForDayOfWeek(5);
    console.log(`\n📅 Viernes: ${viernes.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
    
    // Viernes - Ingresos
    const viernesIncome1 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 30000,
      income_type: "UBER",
      at: createTimestamp(viernes, 7, 0),
      note: "Mañana",
    });
    
    const viernesIncome2 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 28000,
      income_type: "UBER",
      at: createTimestamp(viernes, 15, 0),
      note: "Mediodía",
    });
    
    const viernesIncome3 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 25000,
      income_type: "UBER",
      at: createTimestamp(viernes, 22, 0),
      note: "Noche",
    });

    // Viernes - Nafta
    const viernesFuel1 = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 15000,
      at: createTimestamp(viernes, 16, 30),
      note: "Nafta 1",
    });
    
    const viernesFuel2 = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 10000,
      at: createTimestamp(viernes, 22, 30),
      note: "Nafta 2",
    });

    // Viernes - Kiosco
    const viernesKiosco = await supabase.from("events").insert({
      type: "EXPENSE_KIOSCO",
      amount: 4500,
      at: createTimestamp(viernes, 11, 0),
      note: "Kiosco",
    });

    console.log("✅ Viernes: $83.000 ingresos, $25.000 nafta, $4.500 kiosco");

    // SÁBADO (6)
    const sabado = getDateForDayOfWeek(6);
    console.log(`\n📅 Sábado: ${sabado.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
    
    // Sábado - Ingresos
    const sabadoIncome1 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 40000,
      income_type: "UBER",
      at: createTimestamp(sabado, 5, 0),
      note: "Madrugada",
    });
    
    const sabadoIncome2 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 40000,
      income_type: "UBER",
      at: createTimestamp(sabado, 20, 0),
      note: "Noche",
    });

    // Sábado - Nafta
    const sabadoFuel = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 20000,
      at: createTimestamp(sabado, 21, 0),
      note: "Nafta",
    });

    // Sábado - Kiosco
    const sabadoKiosco = await supabase.from("events").insert({
      type: "EXPENSE_KIOSCO",
      amount: 3500,
      at: createTimestamp(sabado, 6, 0),
      note: "Kiosco",
    });

    console.log("✅ Sábado: $80.000 ingresos, $20.000 nafta, $3.500 kiosco");

    // DOMINGO (0) - FINAL, NO PARCIAL
    const domingo = getDateForDayOfWeek(0);
    console.log(`\n📅 Domingo: ${domingo.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
    
    // Domingo - Ingresos
    const domingoIncome1 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 50000,
      income_type: "UBER",
      at: createTimestamp(domingo, 5, 0),
      note: "Madrugada",
    });
    
    const domingoIncome2 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 35000,
      income_type: "UBER",
      at: createTimestamp(domingo, 19, 0),
      note: "Noche",
    });
    
    const domingoIncome3 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 24000,
      income_type: "UBER",
      at: createTimestamp(domingo, 21, 30),
      note: "Noche final",
    });

    // Domingo - Nafta
    const domingoFuel = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 20000,
      at: createTimestamp(domingo, 20, 0),
      note: "Nafta",
    });

    // Domingo - Kiosco
    const domingoKiosco = await supabase.from("events").insert({
      type: "EXPENSE_KIOSCO",
      amount: 3500,
      at: createTimestamp(domingo, 6, 0),
      note: "Kiosco",
    });

    console.log("✅ Domingo: $109.000 ingresos, $20.000 nafta, $3.500 kiosco");

    // LUNES (1) - PARCIAL
    const lunes = getDateForDayOfWeek(1);
    console.log(`\n📅 Lunes: ${lunes.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
    
    // Lunes - Ingresos (parcial)
    const lunesIncome1 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 15000,
      income_type: "UBER",
      at: createTimestamp(lunes, 7, 30),
      note: "Mañana parcial",
    });
    
    const lunesIncome2 = await supabase.from("events").insert({
      type: "INCOME",
      amount: 15000,
      income_type: "UBER",
      at: createTimestamp(lunes, 14, 30),
      note: "Mediodía parcial",
    });

    // Lunes - Nafta
    const lunesFuel = await supabase.from("events").insert({
      type: "EXPENSE_FUEL",
      amount: 10000,
      at: createTimestamp(lunes, 15, 0),
      note: "Nafta parcial",
    });

    // Lunes - Kiosco
    const lunesKiosco = await supabase.from("events").insert({
      type: "EXPENSE_KIOSCO",
      amount: 2000,
      at: createTimestamp(lunes, 8, 0),
      note: "Kiosco parcial",
    });

    console.log("✅ Lunes (parcial): $30.000 ingresos, $10.000 nafta, $2.000 kiosco");

    // Verificar errores
    const allResults = [
      juevesIncome1, juevesIncome2, juevesIncome3, juevesFuel1, juevesFuel2, juevesKiosco,
      viernesIncome1, viernesIncome2, viernesIncome3, viernesFuel1, viernesFuel2, viernesKiosco,
      sabadoIncome1, sabadoIncome2, sabadoFuel, sabadoKiosco,
      domingoIncome1, domingoIncome2, domingoIncome3, domingoFuel, domingoKiosco,
      lunesIncome1, lunesIncome2, lunesFuel, lunesKiosco,
    ];

    const errors = allResults.filter(r => r.error);
    if (errors.length > 0) {
      console.error("\n❌ Errores al insertar:");
      errors.forEach((r, i) => {
        if (r.error) console.error(`  Error ${i + 1}:`, r.error);
      });
      process.exit(1);
    }

    console.log("\n✅ ¡Todos los datos se insertaron correctamente!");
    console.log("\n📊 Resumen:");
    console.log("   Jueves: $70.000 ingresos, $30.000 nafta, $3.000 kiosco");
    console.log("   Viernes: $83.000 ingresos, $25.000 nafta, $4.500 kiosco");
    console.log("   Sábado: $80.000 ingresos, $20.000 nafta, $3.500 kiosco");
    console.log("   Domingo: $109.000 ingresos, $20.000 nafta, $3.500 kiosco");
    console.log("   Lunes (parcial): $30.000 ingresos, $10.000 nafta, $2.000 kiosco");
    console.log("\n🎉 Total semanal: $372.000 ingresos, $105.000 nafta, $16.500 kiosco");

  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  }
}

// Ejecutar
insertWeeklyData();
