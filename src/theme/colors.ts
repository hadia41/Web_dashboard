export const colors = {
  primary: "#E53935",
  primaryMuted: "#B71C1C",
  background: "#0B0F19",
  card: "#121826",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  error: "#FF5C5C",
  success: "#2ECC71",
  danger: "#FF5C5C",
  warning: "#F5A623",
  info: "#4A90E2",
};

export function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
