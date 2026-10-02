import { describe, expect, it } from 'vitest'
import { isValidStatus, validateDevice } from '../src/validation.js'

describe('validateDevice', () => {
  it('acepta un dispositivo válido', () => {
    expect(validateDevice({ name: 'Sensor 1', type: 'GPS', location: 'Cali' })).toEqual({})
  })

  it('rechaza nombre corto, tipo inválido y ubicación vacía', () => {
    const errors = validateDevice({ name: 'ab', type: 'Radio', location: ' ' })
    expect(Object.keys(errors)).toEqual(['name', 'type', 'location'])
  })

  it('rechaza un cuerpo vacío', () => {
    expect(Object.keys(validateDevice())).toHaveLength(3)
  })
})

describe('isValidStatus', () => {
  it('acepta los estados conocidos', () => {
    expect(['online', 'offline', 'maintenance'].every(isValidStatus)).toBe(true)
  })

  it('rechaza estados desconocidos', () => {
    expect(isValidStatus('apagado')).toBe(false)
  })
})
