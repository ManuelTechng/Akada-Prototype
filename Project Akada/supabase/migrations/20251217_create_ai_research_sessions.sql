-- Create table for tracking AI research sessions
create table if not exists ai_research_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  query text not null,
  status text check (status in ('pending', 'screening', 'analyzing', 'completed', 'failed')) default 'pending',
  
  -- Output storage
  screener_output jsonb, -- Stores the list of CLEAN_URLS
  writer_output jsonb,   -- Stores the final markdown report or structured data
  error_message text,    -- For debugging failures
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table ai_research_sessions enable row level security;

-- Policies
create policy "Users can view their own research sessions"
  on ai_research_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own research sessions"
  on ai_research_sessions for insert
  with check (auth.uid() = user_id);
  
-- Allow Service Role (Azure Function) to update everything
-- (Service role bypasses RLS, so no explicit policy needed usually, 
-- but sometimes good to be explicit if using a specific user. 
-- For now, standard RLS is fine for Client. Azure will use Service Key).
