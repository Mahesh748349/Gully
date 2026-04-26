export const formatGameDate = (value) => {
  if (!value) {
    return "Time not available";
  }

  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};
