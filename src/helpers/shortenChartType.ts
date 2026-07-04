export function shortenChartType(type: string) {
  if (type === "Single") return "S";
  if (type === "Double") return "D";
  if (type === "Co-Op") return "C";
  if (type === "UCS") return "U";
  return type;
};