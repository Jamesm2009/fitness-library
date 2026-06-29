# Fitness Library

Exercise library and workout builder powered by Next.js, Upstash Redis, and the ExerciseDB dataset.

## Features

**Phase 1 — Exercise Library**
- Browse 1,324 exercises with animated GIFs from ExerciseDB CDN
- Search by name, target muscle, or muscle group
- Filter by body part, equipment, and target muscle
- Exercise detail modal with multilingual instructions (EN/ES/IT/TR)

**Phase 2 — Workout Builder**
- Add exercises to a workout from the library
- Set reps, sets, and rest time for each exercise
- Name and save custom workouts to Redis
- View, expand, and delete saved workouts

## Setup & Deploy

### 1. Create Upstash Redis Database
- Go to [console.upstash.com](https://console.upstash.com)
- Create a new Redis database (any region)
- Copy the **REST URL** and **REST Token**

### 2. Deploy to Vercel
- Push this repo to GitHub (`fitness-library`)
- Go to [vercel.com](https://vercel.com) → Import Project → select the repo
- In the Environment Variables step, add:
  - `UPSTASH_REDIS_REST_URL` → your Upstash REST URL
  - `UPSTASH_REDIS_REST_TOKEN` → your Upstash REST Token
- Deploy

### 3. Seed the Database
- Visit `your-app-url.vercel.app/seed`
- Click **Seed Database**
- This pulls all 1,324 exercises from GitHub into your Redis (one-time step)

### 4. Start Using
- Browse exercises at `/`
- Build and save workouts
- View saved workouts at `/workouts`

## Architecture

- **Next.js 14** (App Router) on Vercel
- **Upstash Redis** for exercise data + saved workouts
- **ExerciseDB CDN** (`static.exercisedb.dev`) for GIF animations — no media stored locally
- **GitHub Raw** (`raw.githubusercontent.com`) for thumbnail images

## Data Source

Exercise data from [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset),
originally sourced from [ExerciseDB v1 by AscendAPI](https://oss.exercisedb.dev).
Educational/non-commercial use only.
