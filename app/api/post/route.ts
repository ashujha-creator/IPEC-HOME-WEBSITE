import { NextRequest, NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email,phone } = body;

      await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email, phone]],
      },
    });

    // Do something with the data
    console.log(name, email);

    return NextResponse.json(
      {
        success: true,
        message: "Student registered successfully",
        data: body,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request: " + error,
      },
      { status: 400 },
    );
  }
}
