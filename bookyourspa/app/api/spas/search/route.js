import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Spa from '@/models/Spa';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ spas: [] });
    }

    const spas = await Spa.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } },
        { 'location.region': { $regex: query, $options: 'i' } },
        { services: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title location services')
    .limit(10);

    return NextResponse.json({ spas });
  } catch (error) {
    console.error('Search spas error:', error);
    return NextResponse.json(
      { error: 'Failed to search spas' },
      { status: 500 }
    );
  }
}
