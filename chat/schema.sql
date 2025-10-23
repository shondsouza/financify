-- Chat tables (E2EE, stores only ciphertext and public keys)

create table if not exists public.chat_users_keys (
  user_id text primary key,
  public_jwk jsonb not null,
  enc_private_key jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  a_user_id text not null,
  b_user_id text not null,
  created_at timestamptz default now(),
  constraint chat_conversations_pair_unique unique (a_user_id, b_user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade,
  sender_id text not null,
  iv_b64 text not null,
  ciphertext_b64 text not null,
  created_at timestamptz default now()
);

-- Recommended RLS policies (enable RLS and restrict by user)
-- alter table public.chat_users_keys enable row level security;
-- alter table public.chat_conversations enable row level security;
-- alter table public.chat_messages enable row level security;
-- Define policies to ensure only participants can read/write their rows.



