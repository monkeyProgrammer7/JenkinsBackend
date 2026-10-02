import { beforeEach, describe, expect, it } from 'vitest'
import { createDatabase } from '../src/db.js'
import { createDeviceRepository } from '../src/deviceRepository.js'

let repo

// Cada prueba recibe una base en memoria nueva con los 4 dispositivos de ejemplo
beforeEach(() => {
  repo = createDeviceRepository(createDatabase({ seed: true }))
})

describe('deviceRepository', () => {
  it('lista todos los dispositivos ordenados por ID', () => {
    expect(repo.list().map((d) => d.id)).toEqual(['TEL-001', 'TEL-002', 'TEL-003', 'TEL-004'])
  })

  it('filtra por estado', () => {
    expect(repo.list({ status: 'online' })).toHaveLength(2)
  })

  it('busca por texto sin distinguir mayúsculas', () => {
    expect(repo.list({ search: 'MEDELLÍN'.toLowerCase() }).map((d) => d.id)).toEqual(['TEL-002'])
  })

  it('crea un dispositivo desconectado con el siguiente ID', () => {
    const device = repo.create({ name: '  Sensor Nuevo ', type: 'Presión', location: 'Pasto' })
    expect(device).toEqual({
      id: 'TEL-005',
      name: 'Sensor Nuevo',
      type: 'Presión',
      location: 'Pasto',
      status: 'offline',
      lastReading: null,
    })
  })

  it('empieza en TEL-001 cuando la base está vacía', () => {
    const empty = createDeviceRepository(createDatabase())
    expect(empty.nextId()).toBe('TEL-001')
  })

  it('actualiza el estado y devuelve null si no existe', () => {
    expect(repo.updateStatus('TEL-004', 'online').status).toBe('online')
    expect(repo.updateStatus('TEL-999', 'online')).toBeNull()
  })

  it('elimina un dispositivo', () => {
    expect(repo.remove('TEL-001')).toBe(true)
    expect(repo.findById('TEL-001')).toBeNull()
    expect(repo.remove('TEL-001')).toBe(false)
  })

  it('resume los dispositivos por estado', () => {
    expect(repo.summary()).toEqual({ total: 4, online: 2, offline: 1, maintenance: 1 })
  })
})
