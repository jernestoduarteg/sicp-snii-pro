-- SICP-SNII Pro — Esquema de base de datos Supabase
-- Ejecutar en SQL Editor de Supabase

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT DEFAULT '',
  institucion TEXT DEFAULT '',
  area TEXT DEFAULT 'Ciencias Sociales',
  linea_investigacion TEXT DEFAULT '',
  orcid TEXT DEFAULT '',
  scholar TEXT DEFAULT '',
  cvu TEXT DEFAULT '',
  nivel_actual TEXT DEFAULT 'Candidato',
  meta_snii TEXT DEFAULT 'Nivel I',
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Metas (strategic goals)
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  categoria TEXT DEFAULT 'Producción científica',
  prioridad TEXT DEFAULT 'Media',
  fecha_inicio DATE,
  fecha_limite DATE,
  estado TEXT DEFAULT 'No iniciada',
  avance INTEGER DEFAULT 0,
  indicador TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  producto_id TEXT DEFAULT '',
  fecha_creacion TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metas_user_id ON metas(user_id);
CREATE INDEX IF NOT EXISTS idx_metas_estado ON metas(estado);

-- 3. Productos (academic products)
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  anno INTEGER,
  autores TEXT DEFAULT '',
  rol TEXT DEFAULT '',
  revista_editorial TEXT DEFAULT '',
  doi TEXT DEFAULT '',
  url TEXT DEFAULT '',
  linea TEXT DEFAULT '',
  estado_producto TEXT DEFAULT 'Publicado',
  notas TEXT DEFAULT '',
  fecha_creacion TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_productos_user_id ON productos(user_id);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);

-- 4. Evidencias (evidence files/records)
CREATE TABLE IF NOT EXISTS evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  estado TEXT DEFAULT 'Pendiente',
  url TEXT DEFAULT '',
  detalle TEXT DEFAULT '',
  file_path TEXT DEFAULT '',
  fecha_registro TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evidencias_user_id ON evidencias(user_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_producto_id ON evidencias(producto_id);

-- 5. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "metas_own" ON metas FOR ALL USING (user_id = auth.uid());
CREATE POLICY "productos_own" ON productos FOR ALL USING (user_id = auth.uid());
CREATE POLICY "evidencias_own" ON evidencias FOR ALL USING (user_id = auth.uid());

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, config)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
