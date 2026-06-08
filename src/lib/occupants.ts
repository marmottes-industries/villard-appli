import { occupantPalette } from '@/src/theme';
import { idFromIri, type ApiUser } from '@/src/api/users';

export interface DisplayUser {
  id: number;
  uuid: string;
  iri: string;
  username: string;
  short: string;
  color: string;
  bg: string;
}

function initials(name: string): string {
  return (
    name
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '??'
  );
}

function paletteFor(id: number) {
  return occupantPalette[id % occupantPalette.length];
}

export function decorate(u: ApiUser): DisplayUser {
  const id = idFromIri(u['@id']) ?? 0;
  const p = paletteFor(id);
  return {
    id,
    uuid: u.uuid,
    iri: u['@id'],
    username: u.username,
    short: initials(u.username),
    color: p.color,
    bg: p.bg,
  };
}

export function fallback(iri: string): DisplayUser {
  const id = idFromIri(iri) ?? 0;
  const p = paletteFor(id);
  return {
    id,
    uuid: '',
    iri,
    username: `Utilisateur #${id}`,
    short: '??',
    color: p.color,
    bg: p.bg,
  };
}

export function resolveUser(users: DisplayUser[], iri: string): DisplayUser {
  return users.find((u) => u.iri === iri) ?? fallback(iri);
}
