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

    // Načítaj register prípadov (A:AM) — AM = stav škody (O/U)
    const registerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_REGISTER,
      range: `${registerTab}!A2:AM`,
    });

    // Načítaj denník aktivít (A:G)
    const aktivityRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_AKTIVITY,
      range: "Tomáš Adamčík!A2:G",
    });

    const registerRows = registerRes.data.values || [];
    const aktivityRows = aktivityRes.data.values || [];

    // Agreguj všetky aktivity Adamčíka podľa čísla škody
    const aktivityMap = new Map<string, { hodiny: number; datumPosledny: string }>();

    const parseDateVal = (d: string): number => {
      const p = d.split(".");
      if (p.length < 3) return 0;
      return Number(p[2]) * 10000 + Number(p[1]) * 100 + Number(p[0]);
    };

    for (const row of aktivityRows) {
      const cislo = (row[0] || "").trim();
      if (!cislo || cislo.toUpperCase() === "X" || cislo.toUpperCase() === "D") continue;

      const hodiny = parseFloat(row[4]) || 0;
      const datum = row[1] || "";

      if (!aktivityMap.has(cislo)) {
        aktivityMap.set(cislo, { hodiny, datumPosledny: datum });
      } else {
        const e = aktivityMap.get(cislo)!;
        e.hodiny += hodiny;
        // Zachovaj vždy najnovší dátum, nie posledný fyzický riadok
        if (parseDateVal(datum) > parseDateVal(e.datumPosledny)) {
          e.datumPosledny = datum;
        }
      }
    }

    // Zdroj pravdy = register, stĺpec AM = "O" → otvorená škoda
    // Aktivita z denníka je voliteľné obohatenie (ak existuje)
    const result = registerRows
      .map((row) => {
        const cislo = (row[0] || "").trim();
        const poisteny = row[3] || "";
        const poskodeny = row[4] || "";
        const meno = row[8] || "";
        const stavRegister = (row[38] || "").trim().toUpperCase();
        const aktivita = aktivityMap.get(cislo);

        return {
          cislo,
          poisteny,
          poskodeny,
          meno,
          datumPosledny: aktivita?.datumPosledny ?? "",
          hodiny: aktivita?.hodiny ?? 0,
          stavRegister,
        };
      })
      .filter((r) => r.cislo && r.stavRegister === "O");

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Otvorené škody error:", error);
    return NextResponse.json({ error: "Chyba načítania" }, { status: 500 });
  }
}
