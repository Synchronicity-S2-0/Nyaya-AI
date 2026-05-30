create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'Untitled case',
  case_type text,
  status text not null default 'open',
  latest_urgency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id text not null,
  source_type text not null,
  file_url text,
  file_name text,
  extracted_text text not null,
  analysis_json jsonb not null,
  document_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('user', 'assistant')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id text not null,
  event_type text not null check (
    event_type in (
      'case_created',
      'document_uploaded',
      'text_submitted',
      'analysis_completed',
      'user_question',
      'assistant_response'
    )
  ),
  summary text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cases_user_id_updated_at_idx
  on public.cases(user_id, updated_at desc);

create index if not exists case_documents_case_id_created_at_idx
  on public.case_documents(case_id, created_at asc);

create index if not exists case_messages_case_id_created_at_idx
  on public.case_messages(case_id, created_at asc);

create index if not exists case_events_case_id_created_at_idx
  on public.case_events(case_id, created_at asc);

insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', true)
on conflict (id) do nothing;
