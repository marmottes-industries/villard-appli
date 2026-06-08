export const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

export const MONTHS_ABBR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
] as const;

export function parseISO(s: string): Date {
  // Accepte 'YYYY-MM-DD' ou un ISO datetime complet ('YYYY-MM-DDTHH:mm:ss+ZZ:ZZ').
  // On garde uniquement la partie date pour éviter les décalages de fuseau.
  const datePart = s.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12);
}

export function todayMidday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
}

export function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function nights(startISO: string, endISO: string): number {
  const ms = parseISO(endISO).getTime() - parseISO(startISO).getTime();
  return Math.round(ms / 86_400_000);
}

export function fmtRange(startISO: string, endISO: string): string {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  const sd = s.getDate();
  const sm = MONTHS_ABBR[s.getMonth()];
  const ed = e.getDate();
  const em = MONTHS_ABBR[e.getMonth()];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sd} – ${ed} ${em}`;
  }
  return `${sd} ${sm} – ${ed} ${em}`;
}
