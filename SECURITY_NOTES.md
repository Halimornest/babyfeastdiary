# Security Notes

Last updated: April 28, 2026

## Current Status

- `npm audit` reports **5 moderate** vulnerabilities.
- `npm audit --omit=dev` reports the same unresolved set.
- There are currently **no high/critical vulnerabilities** after upgrading:
  - `next` to `16.2.4`
  - `prisma` and `@prisma/client` to `7.8.0`

## Why 5 moderate issues remain

1. `next -> postcss` advisory
- Source: `next` bundles `postcss@8.4.31` internally.
- Attempting to force-override `postcss` causes dependency-tree invalid state (`ELSPROBLEMS`), so it is not safe.
- This must be fixed upstream by a new `next` release.

2. `prisma -> @prisma/dev -> @hono/node-server` advisory
- `npm audit` suggests `npm audit fix --force` with `prisma@6.19.3`.
- That is a major downgrade from `prisma@7.8.0` and is a breaking-risk change.
- Current decision: keep Prisma 7 and wait for upstream patch in Prisma 7 line.

## Operational Policy

- Use these scripts for routine checks:
  - `npm run audit`
  - `npm run audit:prod`
  - `npm run audit:high`
  - `npm run audit:prod:high`
- CI should fail only on `high`/`critical` by default, while moderate issues are tracked here until upstream fixes are available.

## Revisit Trigger

Re-check and remove this note when:
- A newer `next` release removes the bundled vulnerable `postcss`.
- A Prisma 7 patch release resolves the `@prisma/dev` transitive advisory.
