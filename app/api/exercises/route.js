import { NextResponse } from 'next/server';
import redis, { getCdnGifUrl, getThumbUrl } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const equipment = searchParams.get('equipment') || '';
    const target = searchParams.get('target') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    // Get all exercises from Redis
    const raw = await redis.get('exercises:data');
    if (!raw) {
      return NextResponse.json({ exercises: [], total: 0, filters: {} });
    }

    let exercises = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Apply filters
    if (search) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search) ||
        ex.target?.toLowerCase().includes(search) ||
        ex.muscle_group?.toLowerCase().includes(search)
      );
    }
    if (category) {
      exercises = exercises.filter(ex => ex.category === category);
    }
    if (equipment) {
      exercises = exercises.filter(ex => ex.equipment === equipment);
    }
    if (target) {
      exercises = exercises.filter(ex => ex.target === target);
    }

    const total = exercises.length;

    // Paginate
    const start = (page - 1) * limit;
    const paginated = exercises.slice(start, start + limit);

    // Add CDN URLs
    const withUrls = paginated.map(ex => ({
      ...ex,
      cdn_gif: getCdnGifUrl(ex.gif_url),
      thumb_url: getThumbUrl(ex.image),
    }));

    return NextResponse.json({
      exercises: withUrls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Exercises API error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
