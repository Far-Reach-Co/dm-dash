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

## Other Pro-Related References

- `src/api/controllers/5eCharGeneral.ts` imports `userSubscriptionStatus` but does not use it.
