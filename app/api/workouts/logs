import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET — fetch workout history (all logs for a workout)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const ids = await redis.lrange(`logs:${id}`, 0, -1);

    if (!ids || ids.length === 0) {
      return NextResponse.json({ logs: [] });
    }

    const pipeline = redis.pipeline();
    ids.forEach(logId => pipeline.get(`log:${logId}`));
    const results = await pipeline.exec();

    const logs = results
      .map(r => {
        if (!r) return null;
        return typeof r === 'string' ? JSON.parse(r) : r;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST — save a completed workout log
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { exercises, started_at, notes } = body;

    if (!exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: 'At least one exercise required' },
        { status: 400 }
      );
    }

    // Get workout name
    const workoutRaw = await redis.get(`workout:${id}`);
    const workout = workoutRaw
      ? (typeof workoutRaw === 'string' ? JSON.parse(workoutRaw) : workoutRaw)
      : null;

    const logId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // Calculate totals
    let totalVolume = 0;
    let totalSets = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight || 0) * (set.reps || 0);
          totalSets++;
        }
      });
    });

    const log = {
      id: logId,
      workout_id: id,
      workout_name: workout?.name || 'Workout',
      started_at: started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      exercises,
      notes: notes || '',
      total_volume: totalVolume,
      total_sets: totalSets,
    };

    // Save log and add to workout's log index
    await redis.set(`log:${logId}`, JSON.stringify(log));
    await redis.lpush(`logs:${id}`, logId);

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Log POST error:', error);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
