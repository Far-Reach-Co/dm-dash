alter table public."LibraryPack"
  add column if not exists "tags" text[] not null default '{}';

create index if not exists "LibraryPack_tags_gin_idx"
  on public."LibraryPack" using gin ("tags");
