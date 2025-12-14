import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "Missing uri parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(uri, {
      headers: {
        "User-Agent": "FairSwap/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

