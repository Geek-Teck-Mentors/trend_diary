export const toJaDateString = (value: string | Date): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
}
