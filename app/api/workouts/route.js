import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

// GET — list all workouts, or fetch single workout if ?id= provided
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');

    // Single workout fetch
    if (singleId) {
      const raw = await redis.get(`workout:${singleId}`);
      if (!raw) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
      const workout = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return NextResponse.json({ workout });
    }

    // List all workouts
    const ids = await redis.lrange('workouts:list', 0, -1);
    if (!ids || ids.length === 0) {
      return NextResponse.json({ workouts: [] });
    }

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
    return NextResponse.json({ error: error.message || 'Failed to fetch workouts' }, { status: 500 });
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

    await redis.set(`workout:${id}`, JSON.stringify(workout));
    await redis.lpush('workouts:list', id);

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Workouts POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save workout' }, { status: 500 });
  }
}

// PUT — update a workout (id in body)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, exercises } = body;

    if (!id) {
      return NextResponse.json({ error: 'Workout id required' }, { status: 400 });
    }

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
    console.error('Workouts PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update workout' }, { status: 500 });
  }
}

// DELETE — remove a workout (id in query param)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const includeHistory = searchParams.get('include_history') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Workout id required' }, { status: 400 });
    }

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
    console.error('Workouts DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete workout' }, { status: 500 });
  }
}
