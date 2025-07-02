export function timeStringToSeconds(time: string): number | null {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  if (seconds === undefined) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds;
}
