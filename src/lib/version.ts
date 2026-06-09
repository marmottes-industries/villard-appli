// Compare deux versions "x.y.z" (ignore tout suffixe éventuel après le 3e segment).
// Renvoie -1 si a < b, 0 si égales, 1 si a > b. Les segments manquants comptent pour 0.
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}

function parse(v: string): [number, number, number] {
  const parts = v.split('.').slice(0, 3).map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}
