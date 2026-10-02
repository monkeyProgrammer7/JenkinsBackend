import express from 'express'
import { createDeviceRepository } from './deviceRepository.js'
import { isValidStatus, validateDevice } from './validation.js'

// Crea la app sin arrancar el servidor, para poder probarla con supertest
export function createApp(db) {
  const devices = createDeviceRepository(db)
  const app = express()
  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/devices', (req, res) => {
    const { status, search } = req.query
    if (status && !isValidStatus(status)) {
      return res.status(400).json({ error: `Estado inválido: ${status}` })
    }
    res.json(devices.list({ status, search }))
  })

  app.get('/api/devices/summary', (req, res) => {
    res.json(devices.summary())
  })

  app.get('/api/devices/:id', (req, res) => {
    const device = devices.findById(req.params.id)
    if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' })
    res.json(device)
  })

  app.post('/api/devices', (req, res) => {
    const errors = validateDevice(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ errors })
    res.status(201).json(devices.create(req.body))
  })

  app.patch('/api/devices/:id/status', (req, res) => {
    const { status } = req.body ?? {}
    if (!isValidStatus(status)) return res.status(400).json({ error: `Estado inválido: ${status}` })
    const device = devices.updateStatus(req.params.id, status)
    if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' })
    res.json(device)
  })

  app.delete('/api/devices/:id', (req, res) => {
    if (!devices.remove(req.params.id)) return res.status(404).json({ error: 'Dispositivo no encontrado' })
    res.status(204).end()
  })

  return app
}
