create table public."LibraryPackInstall" (
  "id" serial primary key,
  "owner_user_id" integer references public."User" ("id") on delete cascade,
  "owner_project_id" integer references public."Project" ("id") on delete cascade,
  "pack_id" integer not null references public."LibraryPack" ("id") on delete cascade,
  "created_at" timestamptz not null default now(),
  constraint "LibraryPackInstall_owner_scope_check"
    check (
      ((case when "owner_user_id" is null then 0 else 1 end) +
       (case when "owner_project_id" is null then 0 else 1 end)) = 1
    ),
  constraint "LibraryPackInstall_user_pack_unique"
    unique ("owner_user_id", "pack_id"),
  constraint "LibraryPackInstall_project_pack_unique"
    unique ("owner_project_id", "pack_id")
);

create index "LibraryPackInstall_owner_user_idx"
  on public."LibraryPackInstall" ("owner_user_id");
create index "LibraryPackInstall_owner_project_idx"
  on public."LibraryPackInstall" ("owner_project_id");
create index "LibraryPackInstall_pack_idx"
  on public."LibraryPackInstall" ("pack_id");
