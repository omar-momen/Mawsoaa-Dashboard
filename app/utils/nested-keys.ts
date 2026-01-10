/**
 * Converts bracket notation to dot notation
 * @param key - Key in bracket notation (e.g., 'name[ar]')
 * @returns Key in dot notation (e.g., 'name.ar')
 */
export function bracketToDot(key: string): string {
  return key.replace(/\[(\w+)\]/g, '.$1')
}

/**
 * Converts dot notation to bracket notation
 * @param key - Key in dot notation (e.g., 'name.ar')
 * @returns Key in bracket notation (e.g., 'name[ar]')
 */
export function dotToBracket(key: string): string {
  return key.replace(/\.(\w+)/g, '[$1]')
}

/**
 * Gets a nested value from an object using either bracket or dot notation
 * @param obj - The object to access
 * @param key - The key in bracket notation (e.g., 'name[ar]') or dot notation (e.g., 'name.ar')
 * @returns The value at the path or undefined
 */
export function getNestedValue(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined
  }

  // Convert bracket notation to dot notation for easier parsing
  const dotKey = bracketToDot(key)
  const keys = dotKey.split('.')
  let current: unknown = obj

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Sets a nested value in an object using either bracket or dot notation
 * @param obj - The object to modify
 * @param key - The key in bracket notation (e.g., 'name[ar]') or dot notation (e.g., 'name.ar')
 * @param value - The value to set
 */
export function setNestedValue(obj: Record<string, unknown>, key: string, value: unknown): void {
  // Convert bracket notation to dot notation for easier parsing
  const dotKey = bracketToDot(key)
  const keys = dotKey.split('.')
  let current: Record<string, unknown> = obj

  // Navigate to the parent object, creating nested objects as needed
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!(k && k in current) || typeof current[k as keyof typeof current] !== 'object' || current[k as keyof typeof current] === null) {
      current[k!] = {}
    }
    current = current[k!] as Record<string, unknown>
  }

  // Set the final value
  const finalKey = keys[keys.length - 1]
  current[finalKey as keyof typeof current] = value
}
