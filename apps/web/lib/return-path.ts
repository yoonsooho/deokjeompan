export function internalPath(value: unknown, fallback: string) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')
      || /[\\\u0000-\u001f\u007f]/.test(value) || value.length > 500) return fallback;
  return value;
}

export function loginPath(next: string, register = false) {
  const params = new URLSearchParams({ next });
  if (register) params.set('mode', 'register');
  return `/login?${params}`;
}

export function reviewPath(slug: string, episode: number | null = null) {
  return `/anime/${encodeURIComponent(slug)}${episode === null ? '' : `/episodes/${episode}`}#review`;
}
