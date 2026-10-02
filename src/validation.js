// Reglas de validación de los dispositivos (sin dependencias, fáciles de probar)

export const DEVICE_TYPES = ['Temperatura', 'Humedad', 'GPS', 'Presión', 'Energía']
export const STATUSES = ['online', 'offline', 'maintenance']

export function validateDevice({ name, type, location } = {}) {
  const errors = {}
  if (typeof name !== 'string' || name.trim().length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres'
  if (!DEVICE_TYPES.includes(type)) errors.type = `El tipo debe ser uno de: ${DEVICE_TYPES.join(', ')}`
  if (typeof location !== 'string' || !location.trim()) errors.location = 'La ubicación es obligatoria'
  return errors
}

export function isValidStatus(status) {
  return STATUSES.includes(status)
}
