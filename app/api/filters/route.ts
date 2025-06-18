import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

export async function GET() {
  const client = await clientPromise
  const db = client.db('test')
  const collection = db.collection('insights')

  const pipeline = [
    {
      $group: {
        _id: null,
        countries: { $addToSet: '$country' },
        cities: { $addToSet: '$city' },
        regions: { $addToSet: '$region' },
        topics: { $addToSet: '$topic' },
        sectors: { $addToSet: '$sector' },
        pestles: { $addToSet: '$pestle' },
        swots: { $addToSet: '$swot' },
        sources: { $addToSet: '$source' },
        end_years: { $addToSet: '$end_year' }
      }
    },
    {
      $project: {
        _id: 0,
        countries: 1,
        cities: 1,
        regions: 1,
        topics: 1,
        sectors: 1,
        pestles: 1,
        swots: 1,
        sources: 1,
        end_years: 1
      }
    }
  ]

  const result = await collection.aggregate(pipeline).toArray()
  const jsonSerializableResult = JSON.parse(JSON.stringify(result[0]))
  return NextResponse.json(jsonSerializableResult)
}
