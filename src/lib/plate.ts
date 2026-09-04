/** "B1473CKY" -> "B 1473 CKY" — Indonesian plates read as area, number, series. */
export function formatPlate(raw: string): string {
  const m = /^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/.exec(raw)
  return m ? [m[1], m[2], m[3]].filter(Boolean).join(' ') : raw
}
