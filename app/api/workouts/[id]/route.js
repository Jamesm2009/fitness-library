import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET — fetch a single workout
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const raw = await redis.get(`workout:${id}`);
    if (!raw) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    const workout = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Workout GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}

// DELETE — remove a workout
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await redis.del(`workout:${id}`);
    await redis.lrem('workouts:list', 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workout DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
