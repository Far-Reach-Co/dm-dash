# Performance & Load Testing Guide

This document identifies the heaviest API endpoints and provides guidance for performance testing.

**Last Updated**: 2026-02-10

---

## Authentication Setup for Testing

Most endpoints require session-based authentication. To test authenticated endpoints:

1. **Login to get session cookie**:

```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

2. **Use session cookie in subsequent requests**:

```bash
curl -X GET http://localhost:4000/api/get_projects \
  -b cookies.txt
```

### Test User Creation

```bash
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"loadtest@example.com","username":"LoadTest","password":"password123"}'
```

---

## Heavy Endpoints

### 1. Image Upload - `POST /api/new_image_for_project`

**Location**: `src/api/controllers/s3.ts:214`

**Why it's heavy**:

- Multipart form data parsing (multer)
- Optional image resizing (sharp library)
- S3 upload via AWS SDK
- Database insert for image metadata
- Project storage quota calculation and check
- Deletes old image if replacing

**Test setup**:

```bash
# Requires: session auth, project ownership, multipart file
curl -X POST http://localhost:4000/api/new_image_for_project \
  -b cookies.txt \
  -F "bucket_name=wyrld" \
  -F "folder_name=images" \
  -F "project_id=1" \
  -F "make_image_small=false" \
  -F "file=@test-image.jpg"
```

**Expected time**: 1-5 seconds (depends on image size and network to S3)

**Watch for**:

- S3 upload timeouts (default 2min)
- Image resize failures for large images
- Storage quota exceeded errors (100MB limit for non-pro)
- File system cleanup failures

**Monitoring points**:

- Time to upload to S3
- Image resize duration
- Database query time for quota check

---

### 2. Image Upload (User) - `POST /api/new_image_for_user`

**Location**: `src/api/controllers/s3.ts:317`

**Why it's heavy**: Same as project image upload but checks user quota instead of project quota

**Test setup**:

```bash
curl -X POST http://localhost:4000/api/new_image_for_user \
  -b cookies.txt \
  -F "bucket_name=wyrld" \
  -F "folder_name=images" \
  -F "make_image_small=true" \
  -F "file=@test-image.jpg"
```

**Expected time**: 1-5 seconds

**Watch for**: Same as project image upload

---

### 3. Get All Projects - `GET /api/get_projects`

**Status**: ✅ Optimized (2026-02-10)

**Location**: `src/api/controllers/projects.ts`

**Why it's heavy**:

- Queries user's owned projects
- Queries all shared projects (project_user join)
- Batch fetches project details for joined projects
- Batch fetches project invites
- No pagination

**Test setup**:

```bash
curl -X GET http://localhost:4000/api/get_projects \
  -b cookies.txt
```

**Expected time**: 100-500ms (depends on number of projects)

**Watch for**:

- Slow response with users in 10+ projects
- Missing indexes on project_user table

**Performance improvement ideas**:

- Add pagination
- Consider JOIN-based aggregation to reduce round trips further

---

### 4. Delete Project - `DELETE /api/remove_project/:id`

**Location**: `src/api/controllers/projects.ts:139`

**Status**: ✅ Optimized (2026-01-23)

**How it works**:

- Cleans up TableImages manually (S3 deletion + database) - project_id is optional
- Cleans up TableViews manually - project_id is optional
- Deletes project record, triggering CASCADE DELETE on foreign keys
- Database handles cascading deletes for: Calendar, Month, Day, ProjectInvite, ProjectUser, ProjectPlayer

**Migration**: `1769195631078_foreign-relations-project.sql` adds ON DELETE CASCADE constraints

**Test setup**:

```bash
curl -X DELETE http://localhost:4000/api/remove_project/1 \
  -b cookies.txt
```

**Expected time**: 500ms-2s (depends on number of S3 images to delete)

**Watch for**:

- S3 deletion failures leaving orphaned files
- CASCADE constraint violations if foreign keys are misconfigured

---

### 5. User Registration - `POST /api/register`

**Location**: `src/api/controllers/users.ts:97`

**Why it's heavy**:

- bcrypt password hashing (10 salt rounds - CPU intensive)
- Creates user
- Creates first project ("First Wyrld")
- Creates 2 table views (project table + user table)
- Sends welcome email via SMTP
- Rate limited to 5 requests per hour per IP

**Test setup**:

```bash
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"perf-test-'$(date +%s)'@example.com","username":"PerfTest","password":"password123"}'
```

**Expected time**: 500ms-2s (bcrypt hashing is intentionally slow)

**Watch for**:

- bcrypt blocking the event loop (CPU bound)
- Email sending timeouts
- Transaction failures leaving partial user data

**Monitoring points**:

- bcrypt hash time (should be ~300-500ms)
- Email send duration
- Database transaction time

---

### 6. User Login - `POST /api/login`

**Location**: `src/api/controllers/users.ts:160`

**Why it's heavy**:

- bcrypt password comparison (CPU intensive)
- Session creation and save to Redis
- Rate limited to 10 requests per hour per IP

**Test setup**:

```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected time**: 300ms-1s (bcrypt comparison is intentionally slow)

**Watch for**:

- Rate limit triggering
- Session store write failures
- bcrypt blocking event loop under load

**Monitoring points**:

- bcrypt compare time
- Session save time

---

### 7. Duplicate Character - `POST /api/duplicate_5e_character`

**Location**: `src/api/controllers/5eCharGeneral.ts:98`

**Why it's heavy**:

- Duplicates 9+ database tables:
  - dnd_5e_character_general
  - dnd_5e_character_proficiencies
  - dnd_5e_character_background
  - dnd_5e_spell_slots
  - dnd_5e_character_attack
  - dnd_5e_character_equipment
  - dnd_5e_character_feat_trait
  - dnd_5e_character_spell
  - dnd_5e_character_other_pro_lang
  - dnd_5e_class
- Multiple sequential queries
- No transaction wrapper (risk of partial duplication)

**Test setup**:

```bash
curl -X POST http://localhost:4000/api/duplicate_5e_character \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"general_id":1}'
```

**Expected time**: 500ms-2s (depends on character complexity)

**Watch for**:

- Partial duplication if queries fail midway
- Duplicate key violations
- Slow performance with heavily equipped characters

**Performance improvement ideas**:

- Wrap in database transaction
- Use batch inserts instead of individual queries

---

### 8. Get Calendars - `GET /api/get_calendars/:project_id`

**Location**: `src/api/controllers/calendars.ts:27`

**Why it's heavy**:

- Fetches all calendars for project
- For EACH calendar, fetches all months (nested query)
- For EACH calendar, fetches all days (nested query)
- N+1 query problem

**Test setup**:

```bash
curl -X GET http://localhost:4000/api/get_calendars/1 \
  -b cookies.txt
```

**Expected time**: 100-500ms (depends on number of calendars)

**Watch for**:

- Slow response with multiple calendars
- N+1 queries

**Performance improvement ideas**:

- Use JOIN to fetch calendars + months + days in one query
- Add eager loading

---

### 9. Signed URL Generation - `POST /api/signed_URL_download_multi`

**Location**: `src/api/controllers/s3.ts:55`

**Status**: ✅ Optimized (2026-01-23)

**How it works**:

- CloudFront private key cached at module level (read once on startup)
- CloudFront.Signer instance created once and reused for all requests
- Generates signed URLs for multiple images in a single request

**Test setup**:

```bash
curl -X POST http://localhost:4000/api/signed_URL_download_multi \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"image_ids":[1,2,3,4,5]}'
```

**Expected time**: 5-20ms per image (improved from 50-200ms)

**Previous issues fixed**:

- ~~File I/O for private key on every request~~ → cached at module level
- ~~New Signer instance per image~~ → single cached signer reused

---

### 10. Delete Image - `DELETE /api/remove_image_by_project/:image_id/:project_id`

**Location**: `src/api/controllers/s3.ts:459`

**Why it's heavy**:

- S3 deletion (network call)
- Database deletion
- Project storage quota recalculation

**Test setup**:

```bash
curl -X DELETE http://localhost:4000/api/remove_image_by_project/123/1 \
  -b cookies.txt
```

**Expected time**: 500ms-2s

**Watch for**:

- S3 deletion failures (orphaned files)
- Quota not updated if deletion fails
