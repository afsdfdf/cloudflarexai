import { NextResponse } from "next/server";
import { searchDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { chain, address } = await request.json();

    if (!chain || !address) {
      return NextResponse.json(
        { success: false, error: "Missing chain or address" },
        { status: 400 }
      );
    }

    searchDB.recordSearch(chain, address);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording search:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record search" },
      { status: 500 }
    );
  }
} 