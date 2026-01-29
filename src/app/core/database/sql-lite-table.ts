export const SQLTABLES = [
    `CREATE TABLE IF NOT EXISTS gasto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,    
        monto REAL NOT NULL,
        descripcion TEXT,
        cuotas INTEGER DEFAULT 0,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        etiquetas TEXT, 
        categoria_id INTEGER,
        estado INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS categoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        color TEXT,
        tipo TEXT,
        activo INTEGER DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS etiqueta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS gasto_cuota (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gasto_id INTEGER,
        numero_cuota INTEGER,
        monto_cuota REAL,
        fecha_pago TEXT,
        estado_cuota INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS presupuesto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER,
        monto REAL,
        fecha TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS gasto_recurrente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        monto REAL,
        descripcion TEXT,
        etiquetas TEXT,
        categoria_id INTEGER,
        activo INTEGER DEFAULT 1,
        frecuencia TEXT,
        proxima_fecha TEXT
    );`
]