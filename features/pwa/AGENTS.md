# PWA & Push Notifications

## Environment variables

| Variable                       | Scope       | Purpose                        |
| ------------------------------ | ----------- | ------------------------------ |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public      | Browser push subscription      |
| `VAPID_PRIVATE_KEY`            | Server only | Signs outgoing push payloads   |
| `VAPID_SUBJECT`                | Server only | VAPID contact URI (`mailto:…`) |
| `CRON_SECRET`                  | Server only | Authorizes cron endpoints      |

Generate VAPID keys locally:

```bash
npx web-push generate-vapid-keys
```

## Subscribe API

`POST /api/push/subscribe` — upserts a push subscription for the authenticated session user.

`DELETE /api/push/subscribe` — removes a subscription by endpoint for the authenticated session user.

Both endpoints require a session cookie (`requireSessionAuth`). API keys are not accepted.

Request body:

```json
{
    "endpoint": "https://…",
    "keys": {
        "p256dh": "…",
        "auth": "…"
    }
}
```

Response: `{ "ok": true }`

## Service worker

`app/sw.ts` handles:

- `push` — shows a notification from JSON payload (`title`, `body`, optional `url`)
- `notificationclick` — opens `/tournaments` (or payload `url`)

## Cron: missing bet reminders

`POST /api/cron/notify-missing-bets` (also `GET` for Vercel Cron) runs daily at 10:00 UTC.

Authorization header: `Authorization: Bearer <CRON_SECRET>`

Logic lives in `features/pwa/api/notify-missing-bets.ts`.

## Adding a new notification type

1. Add server logic in `features/pwa/api/` (or reuse `lib/webpush.ts`).
2. Call `sendPushNotification(subscription, { title, body, url })`.
3. Handle stale subscriptions with `isStalePushSubscriptionError` and delete from `PushSubscription`.
4. Add tests under `features/pwa/__tests__/`.
5. Document the new cron route or trigger in this file.
