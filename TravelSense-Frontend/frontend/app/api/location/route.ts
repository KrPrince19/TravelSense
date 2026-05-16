import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TravelSenseApp/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract preferred geocoding results
    const address = data.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      "Unknown City";
    
    const state = address.state || address.region || "Unknown State";
    const country = address.country || "Unknown Country";

    return NextResponse.json({
      city,
      state,
      country,
    });
  } catch (error: any) {
    console.error(`[API Location] Reverse Geocoding Error for ${lat},${lon}:`, error.message);
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}
