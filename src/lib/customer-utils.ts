/**
 * Parse customer JSON string to extract customer name
 * @param customerJson - JSON string containing customer data
 * @returns Customer name or empty string if not found
 */
export function parseCustomerName(customerJson: string | null | undefined): string {
  if (!customerJson) return ''
  
  try {
    const customerData = JSON.parse(customerJson)
    return customerData.name || ''
  } catch {
    // If parsing fails, return the raw string (fallback for legacy data)
    return customerJson
  }
}

/**
 * Parse customer JSON string to get full customer data
 * @param customerJson - JSON string containing customer data
 * @returns Customer data object or null
 */
export function parseCustomerData(customerJson: string | null | undefined): { name?: string } | null {
  if (!customerJson) return null
  
  try {
    return JSON.parse(customerJson)
  } catch {
    return null
  }
}
