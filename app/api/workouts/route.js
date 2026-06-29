import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET — list all saved workouts
export async function GET() {
  try {
    const ids = await redis.lrange('workouts:list', 0, -1);
    if (!ids || ids.length === 0) {
      return NextResponse.json({ workouts: [] });
    }

    // Fetch all workout data
    const pipeline = redis.pipeline();
    ids.forEach(id => pipeline.get(`workout:${id}`));
    const results = await pipeline.exec();

    const workouts = results
      .map(r => {
        if (!r) return null;
        return typeof r === 'string' ? JSON.parse(r) : r;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Workouts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// POST — save a new workout
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, exercises } = body;

    if (!name || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Workout name and at least one exercise required' },
        { status: 400 }
      );
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const workout = {
      id,
      name,
      exercises,
      created_at: new Date().toISOString(),
      exercise_count: exercises.length,
    };

    // Save workout and add to index
    await redis.set(`workout:${id}`, JSON.stringify(workout));
    await redis.lpush('workouts:list', id);

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Workouts POST error:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
