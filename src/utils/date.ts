export function formatLongDate(input: string): string {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(input: string): string {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);

  if (secondsAgo < 60) {
    return "just now";
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, unitInSeconds] of units) {
    if (secondsAgo >= unitInSeconds) {
      const value = Math.floor(secondsAgo / unitInSeconds);
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -value,
        unit,
      );
    }
  }

  return "just now";
}
