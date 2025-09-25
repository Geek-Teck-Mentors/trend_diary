export const toJaDateString = (value: string | Date): string => {
  const date = new Date(value);
  return date.toLocaleDateString('ja-JP')
}
