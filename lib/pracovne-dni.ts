// Štátne sviatky SR 2024, 2025 a 2026
const SVIATKY: Record<string, string[]> = {
  "2024": [
    "2024-01-01", "2024-01-06", "2024-03-29", "2024-04-01",
    "2024-05-01", "2024-05-08", "2024-07-05", "2024-08-29",
    "2024-09-01", "2024-09-15", "2024-11-01", "2024-11-17",
    "2024-12-24", "2024-12-25", "2024-12-26",
  ],
  "2025": [
    "2025-01-01", "2025-01-06", "2025-04-18", "2025-04-21",
    "2025-05-01", "2025-05-08", "2025-07-05", "2025-08-29",
    "2025-09-01", "2025-09-15", "2025-11-01", "2025-11-17",
    "2025-12-24", "2025-12-25", "2025-12-26",
  ],
  "2026": [
    "2026-01-01", "2026-01-06", "2026-04-03", "2026-04-06",
    "2026-05-01", "2026-05-08", "2026-07-05", "2026-08-29",
    "2026-09-01", "2026-09-15", "2026-11-01", "2026-11-17",
    "2026-12-24", "2026-12-25", "2026-12-26",
  ],
};

export function getPracovneDni(rok: number, mesiac: number): number {
  const sviatky = SVIATKY[String(rok)] || [];
  let pocet = 0;

  const dni = new Date(rok, mesiac, 0).getDate();

  for (let d = 1; d <= dni; d++) {
    const datum = new Date(rok, mesiac - 1, d);
    const denTyzdna = datum.getDay();
    if (denTyzdna === 0 || denTyzdna === 6) continue;

    const datumStr = datum.toISOString().split("T")[0];
    if (sviatky.includes(datumStr)) continue;

    pocet++;
  }

  return pocet;
}

export function getNormohodiny(rok: number, mesiac: number): number {
  return getPracovneDni(rok, mesiac) * 8;
}

export const MESIACE = [
  "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
  "Júl", "August", "September", "Október", "November", "December",
];