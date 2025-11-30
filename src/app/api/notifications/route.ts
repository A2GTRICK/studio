import { NextResponse } from "next/server";
import { fetchAllNotifications } from "@/services/notifications";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await fetchAllNotifications();
    return NextResponse.json(list);
  } catch (error) {
    console.error("API Error fetching notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch notifications", details: errorMessage }, { status: 500 });
  }
}
