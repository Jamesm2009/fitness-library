import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [categories, equipment, targets] = await Promise.all([
      redis.get('exercises:categories'),
      redis.get('exercises:equipment'),
      redis.get('exercises:targets'),
    ]);

    return NextResponse.json({
      categories: categories || [],
      equipment: equipment || [],
      targets: targets || [],
    });
  } catch (error) {
    console.error('Filters API error:', error);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}
