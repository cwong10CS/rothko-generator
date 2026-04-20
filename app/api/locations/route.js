import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    return NextResponse.json({ results: data.results || [] });
  } catch (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
