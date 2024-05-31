export function formatMessageDate(date: Date): string {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = startOfDay.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < 0) {
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (diff < oneDay) {
    return "Yesterday";
  } else {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }
}

export function formatConversationMessageDate(date: Date): string {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = startOfDay.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < 0) {
    return "Today";
  } else if (diff < oneDay) {
    return "Yesterday";
  } else {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }
}
