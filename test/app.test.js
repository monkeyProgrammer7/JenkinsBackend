import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { createDatabase } from '../src/db.js'

let app

// Cada prueba usa su propia base en memoria, así no se afectan entre sí
beforeEach(() => {
  app = createApp(createDatabase({ seed: true }))
})

describe('API de dispositivos', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('GET /api/devices lista los dispositivos', async () => {
    const res = await request(app).get('/api/devices')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(4)
  })

  it('GET /api/devices filtra por estado y rechaza estados inválidos', async () => {
    const ok = await request(app).get('/api/devices?status=maintenance')
    expect(ok.body.map((d) => d.id)).toEqual(['TEL-003'])

    const bad = await request(app).get('/api/devices?status=apagado')
    expect(bad.status).toBe(400)
  })

  it('GET /api/devices/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/devices/TEL-999')
    expect(res.status).toBe(404)
  })

  it('POST /api/devices crea un dispositivo', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ name: 'Sensor Cuarto Frío', type: 'Temperatura', location: 'Barranquilla' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'TEL-005', status: 'offline' })

    const list = await request(app).get('/api/devices')
    expect(list.body).toHaveLength(5)
  })

  it('POST /api/devices valida los datos', async () => {
    const res = await request(app).post('/api/devices').send({ name: 'x' })
    expect(res.status).toBe(400)
    expect(Object.keys(res.body.errors)).toEqual(['name', 'type', 'location'])
  })

  it('PATCH /api/devices/:id/status cambia el estado', async () => {
    const res = await request(app).patch('/api/devices/TEL-004/status').send({ status: 'online' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('online')

    const bad = await request(app).patch('/api/devices/TEL-004/status').send({ status: 'roto' })
    expect(bad.status).toBe(400)
  })

  it('DELETE /api/devices/:id elimina y luego responde 404', async () => {
    expect((await request(app).delete('/api/devices/TEL-002')).status).toBe(204)
    expect((await request(app).delete('/api/devices/TEL-002')).status).toBe(404)
  })

  it('GET /api/devices/summary cuenta por estado', async () => {
    const res = await request(app).get('/api/devices/summary')
    expect(res.body).toEqual({ total: 4, online: 2, offline: 1, maintenance: 1 })
  })

  it('un dispositivo creado aparece en la búsqueda y en el resumen al ponerlo en línea', async () => {
    const created = await request(app)
      .post('/api/devices')
      .send({ name: 'Sensor Muelle 3', type: 'Presión', location: 'Cartagena' })
    const { id } = created.body

    await request(app).patch(`/api/devices/${id}/status`).send({ status: 'online' })

    const found = await request(app).get('/api/devices?status=online&search=cartagena')
    expect(found.body.map((d) => d.id)).toEqual([id])

    const summary = await request(app).get('/api/devices/summary')
    expect(summary.body).toEqual({ total: 5, online: 3, offline: 1, maintenance: 1 })
  })

  // Prueba que falla a propósito para ver cómo Jenkins reporta un build fallido
  it('rechaza crear un dispositivo con un nombre duplicado (demo: falla)', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ name: 'Camión 17', type: 'GPS', location: 'Medellín' })
    // Falla: la API todavía no valida duplicados y responde 201
    expect(res.status).toBe(409)
  })
})
