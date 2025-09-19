# Database Setup Guide

Single authoritative database setup for the FrostFoe CTF web application.

## ✅ One File To Rule Them All

Use `supabase/database_setup.sql` for ALL new or reset environments. It contains:
- Extensions
- Tables & constraints
- Row Level Security policies
- Functions (both simple & advanced)
- Views (leaderboard & profile aggregates)
- Triggers
- Realtime publication
- Storage bucket & policies (avatars)
- Seed challenge data
- Grants & completion notice

The file is ordered to avoid dependency errors (tables -> functions -> views -> dependent functions -> triggers -> seed).

## Quick Start

1. Connect to your Supabase Postgres instance (psql or dashboard SQL editor)
2. Run:
   ```sql
   \i supabase/database_setup.sql
   ```
3. Done. The script prints a completion summary via NOTICEs.

Re-running the file is safe (uses IF NOT EXISTS / ON CONFLICT where practical). Avoid using it to DROP data in production; it will not delete existing rows.

## Migration Strategy

For iterative changes going forward:
- Create new migration files (e.g. `2024MMDDHHMM_description.sql`)
- After production deployment, optionally fold changes back into `database_setup.sql` to keep the canonical snapshot current.

## Validation (Manual Checks)

After running the setup you can manually verify core objects:
```sql
SELECT count(*) FROM public.challenges;                    -- seed rows
SELECT * FROM public.get_user_stats_simple(auth.uid());    -- as an authenticated user
SELECT * FROM public.user_leaderboard LIMIT 5;             -- leaderboard works
```
If a brand‑new auth user is created, its profile row should auto‑appear (trigger + function).

## Database Schema

### Tables

#### `profiles`
- User profiles linked to Supabase auth
- Stores username, full name, spendable points
- Auto-created via trigger on user signup

#### `challenges`
- CTF challenges with metadata
- Categories: 'beginner', 'hacker'
- Difficulties: 'easy', 'medium', 'hard'
- Includes flags, points, resources

#### `solved_challenges`
- Junction table for user-challenge relationships
- Prevents duplicate solves
- Tracks solve timestamps

### Key Relationships

```
auth.users (Supabase Auth)
    ↓ CASCADE DELETE
profiles
    ↓
solved_challenges ←→ challenges
    ↓ CASCADE DELETE
```

### Security Features

- **Row Level Security (RLS)** on all tables
- Admin-only challenge management
- Users can only access their own data
- Secure file storage for avatars

### Functions

- `handle_new_user()` - Auto-creates profiles on signup
- `award_points()` - Validates + inserts solve and increments points
- `get_user_stats_simple()` - View-independent stats (used by the app UI)
- `get_user_stats_with_profile()` - View-based variant if you prefer pre-aggregated leaderboard views

### Views

- `user_total_points` - Aggregated user scores
- `user_leaderboard` - Ranked users with deterministic tie-break
- `user_profile_overview` - Profile + rank + solved count
- `solved_challenges_with_details` - Enriched solve rows

## Troubleshooting

### Common Issues

1. "relation does not exist" – This unified script fixes ordering; ensure you ran the correct file.
2. Permission errors – Run with an admin / service role connection.
3. Missing extension – Confirm `uuid-ossp` is enabled (script attempts CREATE EXTENSION).
4. RLS blocked query – Use service role key for admin tasks; otherwise ensure policies cover the action.

### Rollback

If you need to rollback EVERYTHING (destructive!):
```sql
DROP VIEW IF EXISTS solved_challenges_with_details;
DROP VIEW IF EXISTS user_profile_overview;
DROP VIEW IF EXISTS user_leaderboard;
DROP VIEW IF EXISTS user_total_points;
DROP TABLE IF EXISTS solved_challenges;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS profiles;
```

## Performance Optimizations

- Indexes on frequently queried columns
- Composite indexes for complex queries
-- Efficient function definitions
-- Proper foreign key constraints

## Next Steps

You now have a single source of truth. Future improvements:
- Add additional challenge categories or difficulty tiers (ALTER TABLE + CHECK constraint updates)
- Introduce submissions table if you add dynamic flag verification
- Add materialized leaderboard for very large user counts

Enjoy building FrostFoe! ❄️

## Support

For issues with the database setup:
1. Try the simplified setup first
2. Check the validation queries above
3. Review Supabase logs
4. Ensure all prerequisites are met
5. Test with the provided seed data