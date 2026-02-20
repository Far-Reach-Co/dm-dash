# Pro Limits and Usage Enforcement

This document inventories every current usage limit tied to Pro status and where the enums in `src/lib/enums.ts` are used.

## Enums

Source: `src/lib/enums.ts`

- `userSubscriptionStatus`
  - `USER_IS_NOT_PRO`
  - `PROJECT_IS_NOT_PRO`
- `megabytesInBytes`
  - `fifty = 52428800` (50 MB)

## Image Upload Usage Limits (Enforced)

Source: `src/api/controllers/s3.ts`

Limits are enforced using `megabytesInBytes.fifty` and `userSubscriptionStatus` when uploading images.

- User-level usage cap (50 MB)
  - Function: `checkUserProLimitReachedAndAuth`
  - Logic: If `users.used_data_in_bytes >= 50 MB` and `users.is_pro` is false, reject with HTTP `402` and message `USER_IS_NOT_PRO`.
  - Used by: `newImageForUser`

- Project-level usage cap (50 MB)
  - Function: `checkProjectProLimitReachedAndAuth`
  - Logic: If `projects.used_data_in_bytes >= 50 MB` and `projects.is_pro` is false, reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
  - Auth: Ensures the session user is the project owner or an authorized project user before applying the limit.
  - Used by: `newImageForProject`

## Wyrlds Created (Enforced)

Source: `src/api/controllers/projects.ts`

- Hard limit of 2 Wyrlds for non‑Pro users.
  - Function: `addProject`
  - Logic: If owned project count `>= 2` and `users.is_pro` is false, reject with HTTP `402` and message `USER_IS_NOT_PRO`.
  - This limit applies only to Wyrlds the user owns (not joined Wyrlds).

## Tables Created (Enforced)

Source: `src/api/controllers/tableViews.ts`

- Project tables cap: 10 tables per Wyrld for non‑Pro projects.
  - Function: `addTableViewByProject`
  - Logic: If table count `>= 10` and `projects.is_pro` is false, reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
- User tables cap: 10 tables per user for non‑Pro users.
  - Function: `addTableViewByUser`
  - Logic: If table count `>= 10` and `users.is_pro` is false, reject with HTTP `402` and message `USER_IS_NOT_PRO`.

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

## Public Wyrld Discovery Listing (Feature Gating Enforced)

Sources:

- `src/api/controllers/publicWyrlds.ts`
- `src/api/queries/publicWyrlds.ts`
- `src/routes/wyrld.ts`

- Public listing is a Pro Wyrld feature.
  - Function: `editProjectPublicSettings`
  - Logic: If `is_public_listed` is set to true and `projects.is_pro` is false, reject with HTTP `402` and message `PROJECT_IS_NOT_PRO`.
- Public directory only returns Pro listed Wyrlds.
  - Query: `getPublicWyrldDirectoryQuery`
  - Logic: SQL filter requires `p.is_public_listed = true` and `p.is_pro = true`.
- Public Wyrld page routes enforce Pro + listed checks.
  - Routes: `/wyrlds/public/:id` and `/wyrlds/public/:id/:slug`
  - Logic: non-Pro or non-listed Wyrlds redirect to `/404`.

Notes:

- Owners can still edit join mode/capacity/featured record while not listed, but non-Pro Wyrlds cannot be listed publicly.
- Join requests are blocked unless the target Wyrld is both Pro and publicly listed.

## Featured Record Public Visibility (Bound to Public Pro Listing)

Sources:

- `src/lib/authz.ts`
- `src/routes/wyrld.ts`

- Public viewers can only access one record per listed Wyrld: the selected featured record.
  - Function: `requireRecordAccessOrRedirect`
  - Logic: record can be viewed by non-members when all are true:
    - `project.is_pro = true`
    - `project.is_public_listed = true`
    - `project.featured_record_id` matches the record id
- Directory/public pages display this selected featured record as the onboarding entry.

Notes:

- This is selective visibility control, not a separate quantity limit.
- Other Wyrld records remain non-public unless user has normal Wyrld membership access.

## Other Pro-Related References

- `src/api/controllers/5eCharGeneral.ts` imports `userSubscriptionStatus` but does not use it.
