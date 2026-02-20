# Authorization and Permissions Reference

This document summarizes the current permission model so we can convert it into user-facing info pages.

Primary sources:

- `src/lib/authz.ts`
- `src/api/controllers/accessControl.ts`
- `src/lib/tableAuthz.ts`
- `src/api/controllers/publicWyrlds.ts`
- `src/api/controllers/projectDiscussion.ts`

## Core Identity States

- `Guest`: no account/session user.
- `Logged-in user`: account with session.
- `Wyrld member`: logged-in user who joined a specific Wyrld.
- `Wyrld manager/editor`: member with `is_editor = true`.
- `Wyrld owner`: creator (`project.user_id`).

Owner is always treated as editor in auth checks.

## Wyrld Role Permissions

For a given Wyrld:

- Owner:
  - Full control.
  - Can manage members, roles, invites, public settings, banner, featured record, and join requests.
- Manager/editor:
  - Can edit shared Wyrld content (tables/records/calendars/sheets where editor access is required).
  - Cannot manage owner-only settings like member role assignment or public discovery settings.
- Member (non-editor):
  - Can access Wyrld pages as a participant.
  - Can view/edit only the parts explicitly allowed to members (for example sandbox table collaboration and community posting).

## Public Wyrld Discovery Permissions

Source: `src/api/controllers/publicWyrlds.ts`, `src/routes/wyrld.ts`

- Browsing `/wyrlds/public`:
  - Allowed for guests and logged-in users.
- Listing a Wyrld publicly:
  - Owner only.
  - Pro required to set `is_public_listed = true`.
- Join mode:
  - `invite_only`: requests disabled.
  - `request`: logged-in users can submit request.
- Join request review:
  - Owner only can approve/reject pending requests.
- Capacity:
  - If configured, approvals/requests are blocked when full.
- Public Wyrld page visibility:
  - Wyrld must be both `is_public_listed = true` and `is_pro = true`.

## Featured Record Visibility Rules

Source: `src/lib/authz.ts`, `src/routes/wyrld.ts`

- Owner selects `featured_record_id` in Wyrld public settings.
- Non-members (including guests) can view only that selected record when the Wyrld is public + Pro.
- Other Wyrld records remain private to normal Wyrld access rules.

## Community Discussion Permissions

Source: `src/api/controllers/projectDiscussion.ts`

- View thread list/content: Wyrld members.
- Create thread: Wyrld members.
- Reply: Wyrld members, unless thread is locked.
- Lock/unlock thread: managers/editors.
- Delete thread: thread creator or manager/editor.
- Delete reply: reply author or manager/editor.

## Table Access and Capabilities

Source: `src/lib/tableAuthz.ts`, `src/api/controllers/tableViews.ts`

### Table visibility by context

- User table, private:
  - Owner only.
- User table, public:
  - Anyone can view.
- Project/Wyrld table, standard mode:
  - Managers/editors can edit.
  - Members can view only if table is public.
- Project/Wyrld table, sandbox mode:
  - All Wyrld members can view and collaborate.

### Sandbox capability rules (important current behavior)

- Sandbox collaborators can work on canvas and drag images from sidebar.
- Regular sandbox collaborators do not get table settings menu access.
- Image/folder management capabilities remain disabled for sandbox collaborators unless they are table owners/editors in non-sandbox/full-edit contexts.

## Member Management Permissions

Source: `src/api/controllers/projectUsers.ts`

- Invite accept/join via invite link: logged-in user.
- Remove member from Wyrld: owner only.
- Promote/demote manager (`is_editor`): owner only.
- Leave Wyrld:
  - Non-owner members can leave.
  - Owner cannot leave their own Wyrld.

## Record Access Summary

Source: `src/lib/authz.ts`, `src/api/controllers/accessControl.ts`

- Personal (non-Wyrld) record:
  - Owner can edit.
  - Public read allowed only if `record.is_public = true`.
- Wyrld record:
  - Editors can edit.
  - Members can view according to record/public rules and Wyrld membership.
  - Featured-record exception applies for public Pro Wyrlds (see above).

## Notes for User-Facing Docs

- Use simple wording: `Owner`, `Manager`, `Member`, `Guest`.
- Separate `Can view`, `Can post/edit`, and `Can configure`.
- Call out sandbox mode separately so users understand why canvas tools are available while settings are locked.
