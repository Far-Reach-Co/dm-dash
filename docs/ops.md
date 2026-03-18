# Operations

## Service Control

```bash
./ops/service.sh status all
./ops/service.sh logs web
./ops/service.sh restart backup
./ops/service.sh restart top10
```

## Preflight

```bash
./ops/preflight.sh
```

Targets:
- `web`
- `backup`
- `report`
- `top10`
- `all`

Actions:
- `restart`
- `status`
- `logs`
- `stop`

## Caddy Sync

```bash
./ops/caddy_sync.sh
```

Optional overrides:
- `DM_DASH_CADDYFILE`
- `DM_DASH_REMOTE_CADDYFILE`

## Firewall Hardening

```bash
./ops/firewall_harden.sh
```

Applies UFW defaults and allows only SSH/80/443 inbound.

## Rollback

```bash
./ops/rollback.sh
./ops/rollback.sh dm-dash-<release-id>.tar.gz
```

## Remote Cleanup

Dry run:

```bash
./ops/cleanup_remote.sh
```

Apply:

```bash
DM_DASH_APPLY=1 ./ops/cleanup_remote.sh
```
