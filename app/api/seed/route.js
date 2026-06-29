import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';

export async function POST() {
  try {
    // Fetch exercises from GitHub
    const response = await fetch(GITHUB_RAW_URL);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from GitHub: ${response.status}` },
        { status: 502 }
      );
    }

    const exercises = await response.json();

    // Extract unique filter values
    const categories = [...new Set(exercises.map(ex => ex.category).filter(Boolean))].sort();
    const equipment = [...new Set(exercises.map(ex => ex.equipment).filter(Boolean))].sort();
    const targets = [...new Set(exercises.map(ex => ex.target).filter(Boolean))].sort();

    // Store in Redis
    await redis.set('exercises:data', JSON.stringify(exercises));
    await redis.set('exercises:categories', JSON.stringify(categories));
    await redis.set('exercises:equipment', JSON.stringify(equipment));
    await redis.set('exercises:targets', JSON.stringify(targets));

    return NextResponse.json({
      success: true,
      count: exercises.length,
      categories: categories.length,
      equipment: equipment.length,
      targets: targets.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
