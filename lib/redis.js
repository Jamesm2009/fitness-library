import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

// Helper: extract ExerciseDB CDN id from file path like "videos/0025-EIeI8Vf.gif"
export function getCdnGifUrl(gifPath) {
  if (!gifPath) return null;
  const filename = gifPath.split('/').pop();        // "0025-EIeI8Vf.gif"
  const exerciseId = filename.split('-').slice(1).join('-').replace(/\.\w+$/, ''); // "EIeI8Vf"
  return `https://static.exercisedb.dev/media/${exerciseId}.gif`;
}

// Helper: get thumbnail from GitHub raw URL
export function getThumbUrl(imagePath) {
  if (!imagePath) return null;
  const filename = imagePath.split('/').pop();
  return `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/${filename}`;
}
