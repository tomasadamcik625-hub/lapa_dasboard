import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "1ViygaoXEYgV3dRpDhoIWGcQU6CBy_bq0gDxXxpYO7TM";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getTabName() {
  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  return meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";
}

export async function GET() {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const tabName = await getTabName();

    const [headerRes, dataRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1:AM1`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A2:AM`,
      }),
    ]);

    const headers = headerRes.data.values?.[0] || [];
    const rows = dataRes.data.values || [];
    const colCount = Math.max(
      headers.length,
      rows.reduce((max: number, row: string[]) => Math.max(max, row.length), 0)
    );

    return NextResponse.json({ rows, colCount, headers });
  } catch (error) {
    console.error("Zákazky error:", error);
    return NextResponse.json({ error: "Chyba načítania" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { values } = await req.json();
    const sheets = google.sheets({ version: "v4", auth });
    const tabName = await getTabName();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:AM`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zákazky POST error:", error);
    return NextResponse.json({ error: "Chyba pridávania" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { rowIndex, values } = await req.json();
    const sheets = google.sheets({ version: "v4", auth });
    const tabName = await getTabName();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A${rowIndex}:AM${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zákazky PUT error:", error);
    return NextResponse.json({ error: "Chyba ukladania" }, { status: 500 });
  }
}
