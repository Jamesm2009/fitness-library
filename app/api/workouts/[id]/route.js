import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Helper to safely extract id from params (handles both sync and async)
async function getId(params) {
  const resolved = await params;
  return resolved.id;
}

// GET — fetch a single workout
export async function GET(request, { params }) {
  try {
    const id = await getId(params);
    const raw = await redis.get(`workout:${id}`);
    if (!raw) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    const workout = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Workout GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch workout' }, { status: 500 });
  }
}

// PUT — update a workout (name, exercises, sets/reps/rest)
export async function PUT(request, { params }) {
  try {
    const id = await getId(params);
    const body = await request.json();
    const { name, exercises } = body;

    const raw = await redis.get(`workout:${id}`);
    if (!raw) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    const existing = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const updated = {
      ...existing,
      name: name || existing.name,
      exercises: exercises || existing.exercises,
      exercise_count: (exercises || existing.exercises).length,
      updated_at: new Date().toISOString(),
    };

    await redis.set(`workout:${id}`, JSON.stringify(updated));
    return NextResponse.json({ workout: updated });
  } catch (error) {
    console.error('Workout PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update workout' }, { status: 500 });
  }
}

// DELETE — remove a workout and optionally its history
export async function DELETE(request, { params }) {
  try {
    const id = await getId(params);
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('include_history') === 'true';

    await redis.del(`workout:${id}`);
    await redis.lrem('workouts:list', 0, id);

    if (includeHistory) {
      const logIds = await redis.lrange(`logs:${id}`, 0, -1);
      if (logIds && logIds.length > 0) {
        const pipeline = redis.pipeline();
        logIds.forEach(logId => pipeline.del(`log:${logId}`));
        pipeline.del(`logs:${id}`);
        await pipeline.exec();
      }
    }

    return NextResponse.json({ success: true, history_deleted: includeHistory });
  } catch (error) {
    console.error('Workout DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete workout' }, { status: 500 });
  }
}
