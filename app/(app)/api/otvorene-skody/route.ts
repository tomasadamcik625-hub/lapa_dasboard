import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_AKTIVITY = "1D4YJH0_4e7ZXnbTd7zvupP4kQ8_vJbpxHYoeWHisohM";
const SHEET_REGISTER = "1ViygaoXEYgV3dRpDhoIWGcQU6CBy_bq0gDxXxpYO7TM";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

export async function GET() {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Zisti názov prvej záložky v registri prípadov
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_REGISTER });
    const registerTab = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

    // Načítaj hlavičku aj dáta registra
    const [registerHeaderRes, registerRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_REGISTER,
        range: `${registerTab}!1:1`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_REGISTER,
        range: `${registerTab}!A2:AZ`,
      }),
    ]);

    // Načítaj denník aktivít (A:G)
    const aktivityRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_AKTIVITY,
      range: "Tomáš Adamčík!A2:G",
    });

    const registerHeaders: string[] = registerHeaderRes.data.values?.[0] || [];
    const registerRows = registerRes.data.values || [];
    const aktivityRows = aktivityRes.data.values || [];

    // Dynamicky nájdi stĺpec stavu škody (O/U) podľa názvu hlavičky
    const stavColIndex = registerHeaders.findIndex((h) =>
      h.trim().toLowerCase().includes("stav")
    );
    // Fallback na AM = 38 ak hlavička nenájde stĺpec
    const effectiveStavCol = stavColIndex !== -1 ? stavColIndex : 38;

    // Agreguj všetky aktivity Adamčíka podľa čísla škody
    const aktivityMap = new Map<string, { hodiny: number; datumPosledny: string }>();

    const normalizeCislo = (s: string) => s.trim().replace(/\s+/g, "").toLowerCase();

    // Podporuje formáty: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD
    const parseDateVal = (d: string): number => {
      if (!d) return 0;
      const dot = d.split(".");
      if (dot.length >= 3) return Number(dot[2]) * 10000 + Number(dot[1]) * 100 + Number(dot[0]);
      const slash = d.split("/");
      if (slash.length >= 3) return Number(slash[2]) * 10000 + Number(slash[1]) * 100 + Number(slash[0]);
      const iso = d.split("-");
      if (iso.length >= 3) return Number(iso[0]) * 10000 + Number(iso[1]) * 100 + Number(iso[2]);
      return 0;
    };

    for (const row of aktivityRows) {
      const cislo = normalizeCislo(row[0] || "");
      if (!cislo || cislo === "x" || cislo === "d") continue;

      const hodiny = parseFloat((row[4] || "").replace(",", ".")) || 0;
      const datum = row[1] || "";

      if (!aktivityMap.has(cislo)) {
        aktivityMap.set(cislo, { hodiny, datumPosledny: datum });
      } else {
        const e = aktivityMap.get(cislo)!;
        e.hodiny += hodiny;
        if (parseDateVal(datum) > parseDateVal(e.datumPosledny)) {
          e.datumPosledny = datum;
        }
      }
    }

    const result = registerRows
      .map((row) => {
        const cisloRaw = (row[0] || "").trim();
        const cislo = normalizeCislo(cisloRaw);
        const poisteny = row[3] || "";
        const poskodeny = row[4] || "";
        const meno = row[8] || "";
        const stavRegister = (row[effectiveStavCol] || "").trim().toUpperCase();
        const aktivita = aktivityMap.get(cislo);

        return {
          cislo: cisloRaw,
          poisteny,
          poskodeny,
          meno,
          datumPosledny: aktivita?.datumPosledny ?? "",
          hodiny: aktivita?.hodiny ?? 0,
          stavRegister,
        };
      })
      .filter((r) => r.cislo && r.stavRegister === "O")
      .map(({ stavRegister: _, ...rest }) => rest);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Otvorené škody error:", error);
    return NextResponse.json({ error: "Chyba načítania" }, { status: 500 });
  }
}
