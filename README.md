# ozehr.com (Marketing Site)

Static, customer-facing marketing website for **OzEHR** (college health EHR).

## Preview locally

From this project directory:

```bash
python3 -m http.server 8080
```

Then open:

- http://localhost:8080/

Note: the site uses relative links, so you can preview either via a local server or by opening index.html directly.

## Site map

- `/index.html` (Home)
- `/product.html`
- `/features.html`
- `/pricing.html`
- `/security.html`
- `/resources.html`
- `/about.html`
- `/contact.html`
- `/privacy.html`
- `/terms.html`

## Contact form delivery

The contact form posts to:

- `https://api.ozehr.com/api/contact`

This endpoint is implemented in:

- `workers/contact-mail`

Worker env vars:

- `RESEND_API_KEY` (preferred)
- `resend_key` (fallback compatibility with local `.env.local`)

## Image generation (optional)

This repo has an ImageGen skill available, but `OPENAI_API_KEY` is **not** set in the current environment.

To generate additional hero/section imagery later:

1. Set `OPENAI_API_KEY` in your shell environment.
2. Use the skill CLI at `/Users/m/.codex/skills/imagegen/scripts/image_gen.py`.

Suggested assets to generate:

- Abstract product illustration (soft gradients, minimal, brand colors)
- Student portal illustration (student + clinician, campus clinic vibe)
- Clinician workflow illustration (doctor + student, intake on tablet)
- Security/IT illustration (shield + network motif)
- Immunization workflow illustrations (extract, verify, reconcile)

Keep output under `ozehrcom/assets/img/`.
