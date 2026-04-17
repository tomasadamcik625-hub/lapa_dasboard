import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "1Yiegj7dNcZ-iqme76yif9ORgBZH5euGvtBmarsI8u6Q";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function GET() {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const tabName = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

    const [headerRes, dataRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1:NB1`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A2:NB`,
      }),
    ]);

    const headers: string[] = headerRes.data.values?.[0] || [];
    const rows: string[][] = dataRes.data.values || [];

    return NextResponse.json({ headers, rows });
  } catch (error) {
    console.error("Kalendár error:", error);
    return NextResponse.json({ error: "Chyba načítania" }, { status: 500 });
  }
}

function colIndexToLetter(colIndex: number): string {
  // colIndex is 0-based JS array index in headers → 1-based sheet col = colIndex + 1
  let n = colIndex + 1;
  let letter = "";
  while (n > 0) {
    const mod = (n - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

export async function PUT(req: NextRequest) {
  try {
    const { startColIndex, endColIndex, value, rowName } = await req.json();
    if (!rowName?.trim()) {
      return NextResponse.json({ error: "Chýba meno zamestnanca" }, { status: 400 });
    }
    const userName = rowName.trim();

    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const tabName = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

    // Find user row
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A2:A`,
    });
    const nameCol: string[][] = dataRes.data.values || [];
    const rowIdx = nameCol.findIndex(
      (r) => (r[0] || "").trim().toLowerCase() === userName.trim().toLowerCase()
    );
    if (rowIdx === -1) {
      return NextResponse.json({ error: "Tvoje meno sa nenašlo v kalendári" }, { status: 403 });
    }
    const sheetRow = rowIdx + 2; // +1 for 1-based, +1 for header row

    const startLetter = colIndexToLetter(startColIndex);
    const endLetter = colIndexToLetter(endColIndex);
    const colCount = endColIndex - startColIndex + 1;
    const range = `${tabName}!${startLetter}${sheetRow}:${endLetter}${sheetRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [Array(colCount).fill(value)] },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kalendár PUT error:", error);
    return NextResponse.json({ error: "Chyba zápisu" }, { status: 500 });
  }
}
