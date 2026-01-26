-- Schema de Supabase para Copiloto Uber
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de settings (solo una fila)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timezone TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  goals_by_dow JSONB NOT NULL DEFAULT '{}',
  plan_blocks_by_dow JSONB NOT NULL DEFAULT '{}',
  weekly_goal INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE_FUEL', 'EXPENSE_KIOSCO', 'PAUSE')),
  at TIMESTAMPTZ,
  amount INTEGER,
  note TEXT,
  -- INCOME
  income_type TEXT CHECK (income_type IN ('UBER', 'TIP', 'OTHER')),
  -- EXPENSE_FUEL
  fuel_liters NUMERIC(10, 2),
  fuel_price_per_liter NUMERIC(10, 2),
  fuel_station TEXT,
  -- PAUSE
  pause_start_at TIMESTAMPTZ,
  pause_end_at TIMESTAMPTZ,
  pause_reason TEXT CHECK (pause_reason IN ('SLEEP', 'FOOD', 'REST')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_events_at ON events(at);
CREATE INDEX IF NOT EXISTS idx_events_pause_start_at ON events(pause_start_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar settings iniciales
INSERT INTO settings (goals_by_dow, plan_blocks_by_dow, weekly_goal)
VALUES (
  '{"0": 100000, "1": 65000, "2": 0, "3": 0, "4": 65000, "5": 70000, "6": 120000}'::jsonb,
  '{
    "1": [{"start": "06:30", "end": "09:00"}, {"start": "14:00", "end": "16:30"}, {"start": "21:00", "end": "23:00"}],
    "4": [{"start": "06:30", "end": "09:00"}, {"start": "14:00", "end": "16:30"}, {"start": "21:00", "end": "23:00"}],
    "5": [{"start": "06:30", "end": "09:00"}, {"start": "14:00", "end": "16:30"}, {"start": "21:00", "end": "23:00"}],
    "6": [{"start": "04:00", "end": "08:00"}, {"start": "18:00", "end": "23:00"}],
    "0": [{"start": "04:00", "end": "08:00"}, {"start": "18:00", "end": "22:00"}],
    "2": [],
    "3": []
  }'::jsonb,
  400000
)
ON CONFLICT (id) DO NOTHING;
