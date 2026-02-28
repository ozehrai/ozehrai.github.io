# OzEHR Contact Mail Worker

Cloudflare Worker that receives contact form submissions and sends email through Resend.

## Endpoint

- `POST /api/contact`

## Environment Variables

- `RESEND_API_KEY` (preferred)
- `resend_key` (fallback compatibility)

## Local Development

```bash
cd workers/contact-mail
npm install
npm run dev
```

The worker runs on `http://127.0.0.1:8787/api/contact`.

## Deploy

```bash
cd workers/contact-mail
npm install
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

After deploy, map route `api.ozehr.com/api/contact*` to this worker in Cloudflare.
