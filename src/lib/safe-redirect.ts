/** Solo rutas relativas del mismo origen (evita open redirect). */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || typeof next !== "string") return fallback;
  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  if (path.includes(":")) return fallback;
  return path;
}
