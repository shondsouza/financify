-- Simple chat tables (no encryption)

create table if not exists public.simple_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a text not null,
  user_b text not null,
  created_at timestamptz default now(),
  constraint simple_chat_conversations_pair_unique unique (user_a, user_b)
);

create table if not exists public.simple_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.simple_chat_conversations(id) on delete cascade,
  sender_id text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Optional: Add indexes for better performance
create index if not exists idx_simple_chat_messages_conversation on public.simple_chat_messages(conversation_id);
create index if not exists idx_simple_chat_messages_created_at on public.simple_chat_messages(created_at);
