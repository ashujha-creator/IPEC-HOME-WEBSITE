import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello this is coming from Next.js API!",
  });
}
