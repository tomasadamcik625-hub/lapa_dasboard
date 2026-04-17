import { NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "1D4YJH0_4e7ZXnbTd7zvupP4kQ8_vJbpxHYoeWHisohM";
const SHEET_NAME = "Tomáš Adamčík";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function GET() {
  try {
    const sheetsClient = google.sheets({ version: "v4", auth });
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:G`,
    });

    const rows = response.data.values || [];
    const data = rows.map((row: string[], index: number) => ({
      rowIndex: index + 2,
      cisloSkody: row[0] || "",
      datum: row[1] || "",
      meno: row[2] || "",
      popis: row[3] || "",
      hodiny: parseFloat(row[4]) || 0,
      rok: row[5] || "",
      stavSkody: row[6] || "",
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json({ error: "Chyba načítania dát" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { rowIndex, cisloSkody, datum, meno, popis, hodiny, rok, stavSkody } = await request.json();
    const sheetsClient = google.sheets({ version: "v4", auth });

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowIndex}:G${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[cisloSkody, datum, meno, popis, String(hodiny), rok, stavSkody]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Chyba uloženia" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { cisloSkody, datum, meno, popis, hodiny, rok, stavSkody } = await request.json();
    const sheetsClient = google.sheets({ version: "v4", auth });

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[cisloSkody, datum, meno, popis, String(hodiny), rok, stavSkody]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Append error:", error);
    return NextResponse.json({ error: "Chyba zápisu" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { rowIndex } = await request.json();
    const sheetsClient = google.sheets({ version: "v4", auth });

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetId = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME
    )?.properties?.sheetId ?? 0;

    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Chyba mazania" }, { status: 500 });
  }
}
