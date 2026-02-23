#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ship.sh --branch <name> --message <text> [options]

Required:
  --branch, -b      Target branch name
  --message, -m     Commit message

Optional:
  --base <name>     Base branch to branch from (auto-detected if omitted)
  --remote <name>   Remote name (default: origin)
  --sync-base       Fast-forward pull base branch before creating target branch
  --no-push         Commit only; skip push
  --allow-empty     Allow empty commit
  --help, -h        Show help
USAGE
}

fail() {
  echo "Error: $*" >&2
  exit 1
}

detect_base_branch() {
  local head_ref
  if head_ref=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null); then
    echo "${head_ref#origin/}"
    return 0
  fi

  local candidate
  for candidate in main master trunk develop; do
    if git show-ref --verify --quiet "refs/heads/$candidate"; then
      echo "$candidate"
      return 0
    fi
  done

  git branch --show-current
}

branch=""
message=""
base=""
remote="origin"
sync_base=0
no_push=0
allow_empty=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch|-b)
      [[ $# -ge 2 ]] || fail "--branch requires a value"
      branch="$2"
      shift 2
      ;;
    --message|-m)
      [[ $# -ge 2 ]] || fail "--message requires a value"
      message="$2"
      shift 2
      ;;
    --base)
      [[ $# -ge 2 ]] || fail "--base requires a value"
      base="$2"
      shift 2
      ;;
    --remote)
      [[ $# -ge 2 ]] || fail "--remote requires a value"
      remote="$2"
      shift 2
      ;;
    --sync-base)
      sync_base=1
      shift
      ;;
    --no-push)
      no_push=1
      shift
      ;;
    --allow-empty)
      allow_empty=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$branch" ]] || fail "--branch is required"
[[ -n "$message" ]] || fail "--message is required"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not inside a Git repository"

if ! git check-ref-format --branch "$branch" >/dev/null 2>&1; then
  fail "Invalid branch name: $branch"
fi

[[ -n "$base" ]] || base="$(detect_base_branch)"
current_branch="$(git branch --show-current)"

branch_exists=0
if git show-ref --verify --quiet "refs/heads/$branch"; then
  branch_exists=1
fi

dirty=0
if [[ -n "$(git status --porcelain)" ]]; then
  dirty=1
fi

if [[ "$branch_exists" -eq 1 ]]; then
  if [[ "$current_branch" != "$branch" ]]; then
    git switch "$branch"
  fi
else
  if [[ "$dirty" -eq 1 || "$current_branch" == "$base" || -z "$base" ]]; then
    git switch -c "$branch"
  else
    git switch "$base"
    if [[ "$sync_base" -eq 1 ]]; then
      if git remote get-url "$remote" >/dev/null 2>&1; then
        git pull --ff-only "$remote" "$base"
      else
        fail "Remote '$remote' not found; cannot sync base"
      fi
    fi
    git switch -c "$branch"
  fi
fi

git add -A

if git diff --cached --quiet && [[ "$allow_empty" -eq 0 ]]; then
  fail "No changes staged after git add -A"
fi

if [[ "$allow_empty" -eq 1 ]]; then
  git commit --allow-empty -m "$message"
else
  git commit -m "$message"
fi

pushed=0
if [[ "$no_push" -eq 0 ]]; then
  if git remote get-url "$remote" >/dev/null 2>&1; then
    git push -u "$remote" HEAD
    pushed=1
  else
    echo "Warning: remote '$remote' not configured; skipped push" >&2
  fi
fi

commit_sha="$(git rev-parse --short HEAD)"
printf 'branch=%s\ncommit=%s\npushed=%s\n' "$branch" "$commit_sha" "$pushed"
