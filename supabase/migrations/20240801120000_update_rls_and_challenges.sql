-- Enable RLS for the challenges table if not already enabled
alter table "public"."challenges" enable row level security;

-- Drop existing policies if they exist, to prevent conflicts
drop policy if exists "Allow authenticated users to read challenges" on "public"."challenges";
drop policy if exists "Allow authenticated users to update challenges" on "public"."challenges";

-- Create a policy to allow any authenticated user to read all challenges
create policy "Allow authenticated users to read challenges"
on "public"."challenges"
as permissive
for select
to authenticated
using (true);

-- Create a policy to allow any authenticated user to update challenges
create policy "Allow authenticated users to update challenges"
on "public"."challenges"
as permissive
for update
to authenticated
using (true)
with check (true);
