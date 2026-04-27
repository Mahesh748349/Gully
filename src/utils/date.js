export const formatGameDate = (value) => {
  if (!value) {
    return "Time not available";
  }

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : typeof value === "number"
      ? new Date(value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
