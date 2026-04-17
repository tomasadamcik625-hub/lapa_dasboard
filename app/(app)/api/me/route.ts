import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const name = cookies().get("userName")?.value || null;
  return NextResponse.json({ name });
}
