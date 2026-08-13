import { NextResponse } from "next/server";
import { readRows } from "@/lib/googleSheets";

export async function GET() {
  try {
    const rows = await readRows();

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to read sheet",
      },
      { status: 500 },
    );
  }
}
