CREATE TABLE IF NOT EXISTS categoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  color TEXT,
  tipo TEXT
);

CREATE TABLE IF NOT EXISTS etiqueta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT
);

CREATE TABLE IF NOT EXISTS gasto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  monto REAL,
  descripcion TEXT,
  cuotas INTEGER,
  fecha TEXT,
  tipo TEXT,
  etiquetas TEXT,
  categoria_id INTEGER,
  estado_cuota INTEGER
);


CREATE TABLE IF NOT EXISTS gasto_cuota (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gasto_id INTEGER,
  numero_cuota INTEGER,
  monto_cuota REAL,
  fecha_pago TEXT
);

CREATE TABLE IF NOT EXISTS presupuesto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER,
  monto REAL,
  fecha TEXT
);

CREATE TABLE IF NOT EXISTS gasto_fav (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  monto REAL,
  descripcion TEXT,
  etiquetas TEXT,
  categoria_id INTEGER,
);