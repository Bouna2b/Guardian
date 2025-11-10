export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatStatus(s?: string) {
  return (s || '').replace(/\b\w/g, (m) => m.toUpperCase());
}
