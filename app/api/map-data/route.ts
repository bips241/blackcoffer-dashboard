import clientPromise from '@/lib/db';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const rawInsights = await db.collection("insights").find({}).toArray();

    // Aggregate data by country
    const countryData: Record<string, number> = {};
    for (const item of rawInsights) {
      const country = item.country?.trim();
      const value = item.intensity ?? 0; // you can also use 'relevance', 'likelihood', etc.

      if (country) {
        countryData[country] = (countryData[country] || 0) + value;
      }
    }

    const formatted = Object.entries(countryData).map(([id, value]) => ({
      id, // Must match GeoJSON feature id (e.g., "USA", "IND", "CN")
      value,
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
