import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      {
        headers: {
          "User-Agent": "TravelSenseApp/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API Search] Search Geocoding Error for ${q}:`, error.message);
    return NextResponse.json(
      { error: "Failed to search location" },
      { status: 500 }
    );
  }
}
