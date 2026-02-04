export const SQLTABLES = [
    `CREATE TABLE IF NOT EXISTS gasto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,    
        monto REAL NOT NULL,
        descripcion TEXT,
        cuotas INTEGER DEFAULT 0,
        fecha TEXT NOT NULL,
        fechaEnd TEXT,
        tipo TEXT NOT NULL,
        etiquetas TEXT, 
        categoria_id INTEGER,
        recurrente_id INTEGER,
        estado INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS categoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        icono TEXT,
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
        monto REAL,
        fecha TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS gasto_recurrente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        monto REAL,
        descripcion TEXT,
        etiquetas TEXT,
        fechaInicio TEXT NOT NULL,
        categoria_id INTEGER,
        activo INTEGER DEFAULT 1,
        frecuencia TEXT,
        proxima_fecha TEXT
    );`
]