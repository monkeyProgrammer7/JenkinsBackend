// Acceso a datos de los dispositivos

function toDevice(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    status: row.status,
    lastReading: row.last_reading,
  }
}

export function createDeviceRepository(db) {
  return {
    list({ status, search } = {}) {
      const conditions = []
      const params = []
      if (status) {
        conditions.push('status = ?')
        params.push(status)
      }
      if (search && search.trim()) {
        conditions.push('(LOWER(id) LIKE ? OR LOWER(name) LIKE ? OR LOWER(type) LIKE ? OR LOWER(location) LIKE ?)')
        const term = `%${search.trim().toLowerCase()}%`
        params.push(term, term, term, term)
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      return db.prepare(`SELECT * FROM devices ${where} ORDER BY id`).all(...params).map(toDevice)
    },

    findById(id) {
      return toDevice(db.prepare('SELECT * FROM devices WHERE id = ?').get(id))
    },

    nextId() {
      const { max } = db.prepare("SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS max FROM devices").get()
      return `TEL-${String((max ?? 0) + 1).padStart(3, '0')}`
    },

    create({ name, type, location }) {
      const id = this.nextId()
      db.prepare(
        "INSERT INTO devices (id, name, type, location, status, last_reading) VALUES (?, ?, ?, ?, 'offline', NULL)",
      ).run(id, name.trim(), type, location.trim())
      return this.findById(id)
    },

    updateStatus(id, status) {
      const { changes } = db.prepare('UPDATE devices SET status = ? WHERE id = ?').run(status, id)
      return changes ? this.findById(id) : null
    },

    remove(id) {
      return db.prepare('DELETE FROM devices WHERE id = ?').run(id).changes > 0
    },

    summary() {
      const rows = db.prepare('SELECT status, COUNT(*) AS count FROM devices GROUP BY status').all()
      const result = { total: 0, online: 0, offline: 0, maintenance: 0 }
      for (const { status, count } of rows) {
        result[status] = count
        result.total += count
      }
      return result
    },
  }
}
