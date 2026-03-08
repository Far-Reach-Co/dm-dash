# Pro Limits and Usage Enforcement

This document inventories every current usage limit tied to Pro status and where the enums in `src/lib/enums.ts` are used.

## Enums

Source: `src/lib/enums.ts`

- `userSubscriptionStatus`
  - `USER_IS_NOT_PRO`
  - `PROJECT_IS_NOT_PRO`
  - `USER_DATA_HARD_LIMIT_REACHED`
  - `PROJECT_DATA_HARD_LIMIT_REACHED`
- `megabytesInBytes`
  - `fifty = 52428800` (50 MB)
  - `fiveHundred = 524288000` (500 MB)

Source of effective plan limits: `src/lib/subscription.ts`

- Free user data cap: `50 MB`
- Pro user hard data cap: `500 MB`
- Free Wyrld data cap: `50 MB`
- Pro Wyrld hard data cap: `500 MB`
- Free owned Wyrlds: `2`
- Free personal tables: `5`
- Free Wyrld tables: `5`
- Free Wyrld character links: `5`

## Image Upload Usage Limits (Enforced)

Source: `src/api/controllers/s3.ts`, `src/lib/subscription.ts`

Limits are enforced against projected post-upload usage (`current_used_data_in_bytes + incoming_image_size`).

- User-level usage cap
  - Function: `checkUserDataUsageLimitReachedAndAuth`
  - Free logic: if projected usage exceeds `50 MB` and user is not Pro, reject with HTTP `402` and `USER_IS_NOT_PRO`.
  - Pro logic: if projected usage exceeds `500 MB`, reject with HTTP `413` and `USER_DATA_HARD_LIMIT_REACHED`.
  - Used by: `newImageForUser`

- Wyrld/project-level usage cap
  - Function: `checkProjectDataUsageLimitReachedAndAuth`
  - Free logic: if projected usage exceeds `50 MB` and project is not Pro, reject with HTTP `402` and `PROJECT_IS_NOT_PRO`.
  - Pro logic: if projected usage exceeds `500 MB`, reject with HTTP `413` and `PROJECT_DATA_HARD_LIMIT_REACHED`.
  - Used by: `newImageForProject`

## Wyrlds Created (Enforced)

Source: `src/api/controllers/projects.ts`

- Hard limit of 2 Wyrlds for non‑Pro users.
  - Function: `addProject`
  - Logic: If owned project count `>= 2` and `users.is_pro` is false, reject with HTTP `402` and message `USER_IS_NOT_PRO`.
  - This limit applies only to Wyrlds the user owns (not joined Wyrlds).

## Tables Created (Enforced)

Source: `src/api/controllers/tableViews.ts`

- Project tables cap: 5 tables per Wyrld for non‑Pro projects.
  - Function: `addTableViewByProject`
  - Logic: If table count `>= 5` and `projects.is_pro` is false, reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
- User tables cap: 5 tables per user for non‑Pro users.
  - Function: `addTableViewByUser`
  - Logic: If table count `>= 5` and `users.is_pro` is false, reject with HTTP `402` and message `USER_IS_NOT_PRO`.

## Wyrld Connections for Character Sheets (Enforced From Wyrld Side)

Relevant sources:

- `src/api/controllers/5eCharGeneral.ts` (linking a character to a Wyrld on creation)
- `src/api/controllers/projectPlayers.ts` (Wyrld ↔ character linking and limit enforcement)

Enforcement:

- Wyrld-side cap: 5 character connections per Wyrld for non‑Pro projects.
  - Function: `addProjectPlayer`
  - Logic: If project player count `>= 5` and `projects.is_pro` is false, reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
  - Function: `add5eChar` (when `wyrld_id` is provided)
  - Logic: Same project-side count check and `PROJECT_IS_NOT_PRO` response.

Notes:

- Both `addProjectPlayer` and `add5eChar` enforce the same project-side cap to avoid bypassing via character creation.

## Wyrld Banner Image (Feature Gating Enforced)

Source: `src/api/controllers/projects.ts`

- Banner images are a Pro Wyrld feature.
  - Function: `editProjectBannerImage`
  - Logic: Setting `Project.image_id` to a banner image requires `projects.is_pro = true`.
  - Failure behavior: Reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
  - Additional guard: The selected image must already be linked to the same project (cannot point at arbitrary image IDs).

Notes:

- Clearing a banner (`image_id: null`) is allowed for the owner regardless of Pro status.
- This is feature gating, not a numeric usage cap.

## Public Wyrld Discovery Listing (Current Enforcement)

Sources:

- `src/api/controllers/publicWyrlds.ts`
- `src/api/queries/publicWyrlds.ts`
- `src/routes/wyrld.ts`

- Public listing is owner-controlled via public settings.
  - Function: `editProjectPublicSettings`
  - Logic: Owner can set `is_public_listed` without an `is_pro` check.
- Public directory returns listed Wyrlds (no Pro filter).
  - Query: `getPublicWyrldDirectoryQuery`
  - Logic: SQL filter requires `p.is_public_listed = true`.
- Public Wyrld page routes enforce listed checks.
  - Routes: `/wyrlds/public/:id` and `/wyrlds/public/:id/:slug`
  - Logic: non-listed Wyrlds redirect to `/404`.

Notes:

- Owners can still edit join mode/capacity/featured record while not listed.
- Join requests are blocked unless the target Wyrld is publicly listed and request mode is enabled.

## Featured Record Public Visibility (Bound to Public Listing)

Sources:

- `src/lib/authz.ts`
- `src/routes/wyrld.ts`

- Public viewers can only access one record per listed Wyrld: the selected featured record.
  - Function: `requireRecordAccessOrRedirect`
  - Logic: record can be viewed by non-members when all are true:
    - `project.is_public_listed = true`
    - `project.featured_record_id` matches the record id
- Directory/public pages display this selected featured record as the onboarding entry.

Notes:

- This is selective visibility control, not a separate quantity limit.
- Other Wyrld records remain non-public unless user has normal Wyrld membership access.

## Library Packs (Feature Gating Enforced)

Sources:

- `src/api/controllers/libraryPacks.ts`
- `src/lib/tableAuthz.ts`

- Creating packs is Pro-gated by scope.
  - User scope: `addLibraryPackByUser` requires `users.is_pro = true`, else HTTP `402` + `USER_IS_NOT_PRO`.
  - Wyrld scope: `addLibraryPackByProject` requires `projects.is_pro = true`, else HTTP `402` + `PROJECT_IS_NOT_PRO`.
- Installing Pro/public_pro packs is Pro-gated by target scope.
  - User install: `installLibraryPackByUser` requires user Pro for Pro-only/public_pro packs.
  - Wyrld install: `installLibraryPackByProject` requires Wyrld Pro for Pro-only/public_pro packs.
- Table capability exposure is Pro-gated.
  - `resolveTableAuth` enables library pack capabilities only when user scope (personal table) or project scope (Wyrld table) is Pro.

## Table Templates (Feature Gating Enforced)

Sources:

- `src/api/controllers/tableViewTemplates.ts`
- `src/lib/tableAuthz.ts`

- Template actions are Pro-gated by scope.
  - User scope: requires `users.is_pro = true`, else HTTP `402` + `USER_IS_NOT_PRO`.
  - Wyrld scope: requires `projects.is_pro = true`, else HTTP `402` + `PROJECT_IS_NOT_PRO`.
- Enforced actions:
  - list templates (`getTableViewTemplatesByUser`, `getTableViewTemplatesByProject`)
  - create template (`addTableViewTemplateByUser`, `addTableViewTemplateByProject`)
  - apply template (`applyTableViewTemplate`)
  - delete template (`removeTableViewTemplate`)
- Table capability exposure is Pro-gated.
  - `resolveTableAuth` sets `canUseTableTemplates` only when the current table scope is Pro and table settings access is allowed.
  - In sandbox mode, non-owner/non-editor collaborators lose table settings access and therefore do not receive template capability.

## User-Facing Pro Docs

- Pricing page: `views/pricing.ejs` at route `/pricing`

## Cross-Service Pro Gate (FRC Radio)

Source: `../music_stream_server`

- `GET /playlists` returns full playlists for Pro users, otherwise free playlists.
  - Reference: `../music_stream_server/radio.py` (`get_playlists_route`)
- Pro-only playlist selection is blocked for non-Pro users.
  - Reference: `../music_stream_server/radio.py` (`POST /command`)
- Pro state is read from the same `public."User".is_pro` field.
  - Reference: `../music_stream_server/radio.py` (`_get_user_is_pro`)

This means one account-level Pro entitlement can unlock both DM Dash user limits and FRC Radio Pro playlists.
