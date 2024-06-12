export function timeStringToSeconds(time: string): number {
  console.log('time', time);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}
