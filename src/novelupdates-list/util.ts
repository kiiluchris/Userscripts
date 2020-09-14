export function jsTimeDiffNow(date: Date) {
  return (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)
}
