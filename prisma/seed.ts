import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpiar datos existentes
  await prisma.event.deleteMany();
  await prisma.planDay.deleteMany();

  // Crear PlanDays
  const planDays = [
    // Lunes (1)
    {
      dayOfWeek: 1,
      dailyGoal: 65000,
      blocks: [
        { start: "06:30", end: "09:00", label: "Mañana" },
        { start: "14:00", end: "16:30", label: "Mediodía" },
        { start: "21:00", end: "23:00", label: "Noche" },
      ],
    },
    // Martes (2) - Descanso
    {
      dayOfWeek: 2,
      dailyGoal: 0,
      blocks: [],
    },
    // Miércoles (3) - Descanso
    {
      dayOfWeek: 3,
      dailyGoal: 0,
      blocks: [],
    },
    // Jueves (4)
    {
      dayOfWeek: 4,
      dailyGoal: 65000,
      blocks: [
        { start: "06:30", end: "09:00", label: "Mañana" },
        { start: "14:00", end: "16:30", label: "Mediodía" },
        { start: "21:00", end: "23:00", label: "Noche" },
      ],
    },
    // Viernes (5)
    {
      dayOfWeek: 5,
      dailyGoal: 70000,
      blocks: [
        { start: "06:30", end: "09:00", label: "Mañana" },
        { start: "14:00", end: "16:30", label: "Mediodía" },
        { start: "21:00", end: "23:00", label: "Noche" },
      ],
    },
    // Sábado (6)
    {
      dayOfWeek: 6,
      dailyGoal: 120000,
      blocks: [
        { start: "04:00", end: "08:00", label: "Madrugada" },
        { start: "18:00", end: "23:00", label: "Noche" },
      ],
    },
    // Domingo (0)
    {
      dayOfWeek: 0,
      dailyGoal: 100000,
      blocks: [
        { start: "04:00", end: "08:00", label: "Madrugada" },
        { start: "18:00", end: "22:00", label: "Noche" },
      ],
    },
  ];

  for (const planDay of planDays) {
    await prisma.planDay.create({
      data: planDay,
    });
  }

  console.log("✅ PlanDays creados");

  // Crear algunos eventos de ejemplo (opcional, para testing)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ejemplo: algunos ingresos de hoy
  const todayDayOfWeek = today.getDay();
  const todayPlan = planDays.find((p) => p.dayOfWeek === todayDayOfWeek);

  if (todayPlan && todayPlan.dailyGoal > 0) {
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

    // Ejemplo: un gasto de kiosco
    await prisma.event.create({
      data: {
        type: "EXPENSE",
        expenseType: "KIOSCO",
        amount: 500,
        at: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        note: "Café y medialunas",
      },
    });

    console.log("✅ Eventos de ejemplo creados");
  }

  console.log("🎉 Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
