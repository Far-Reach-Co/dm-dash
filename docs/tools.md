# Tools

## Migrations

```bash
npm run migrate:create <name>
npm run migrate:up
npm run migrate:down
npm run migrate:redo
```

## Backups

```bash
npm run backup:db
npm run backup:db:once
npm run backup:db:once:full
npm run backup:db:restore-check
```

Prod aliases:

```bash
npm run prod:backup:db:once
npm run prod:backup:db:once:full
npm run prod:backup:db:restore-check
```

## Product Update Emails

```bash
npm run email:product-update -- --list
npm run email:product-update -- --campaign 2026-02-public-wyrlds-community --dry-run
npm run email:product-update -- --campaign 2026-02-public-wyrlds-community
```

## Utility Scripts

```bash
npm run sitemap
npm run sitemap:prod
npm run srd:download -- 2014
npm run srd:download:prod -- 2014
npm run guest-sandbox:import-images -- --help
npm run guest-sandbox:import-images:prod -- --help
```
