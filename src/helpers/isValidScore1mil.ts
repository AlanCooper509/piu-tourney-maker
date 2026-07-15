export function isValidScore1mil(score: number) {
  return !Number.isNaN(score) && score >= 0 && score <= 1000000;
}
