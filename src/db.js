import { DatabaseSync } from 'node:sqlite'

const seedDevices = [
  ['TEL-001', 'Sensor Bodega Norte', 'Temperatura', 'Bogotá', 'online', '4.2 °C'],
  ['TEL-002', 'Camión 17', 'GPS', 'Medellín', 'online', '6.2518, -75.5636'],
  ['TEL-003', 'Medidor Planta 2', 'Energía', 'Cali', 'maintenance', '312 kWh'],
  ['TEL-004', 'Sensor Invernadero', 'Humedad', 'Pereira', 'offline', '68 %'],
]

// Base de datos SQLite en memoria: existe solo mientras el proceso está vivo.
// Cada llamada crea una base nueva e independiente (útil para que cada test empiece limpio).
export function createDatabase({ seed = false } = {}) {
  const db = new DatabaseSync(':memory:')

  db.exec(`
    CREATE TABLE devices (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      type         TEXT NOT NULL,
      location     TEXT NOT NULL,
      status       TEXT NOT NULL CHECK (status IN ('online', 'offline', 'maintenance')),
      last_reading TEXT
    )
  `)

  if (seed) {
    const insert = db.prepare(
      'INSERT INTO devices (id, name, type, location, status, last_reading) VALUES (?, ?, ?, ?, ?, ?)',
    )
    for (const row of seedDevices) insert.run(...row)
  }

  return db
}
