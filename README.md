# ozehr.com (Marketing Site)

Static, customer-facing marketing website for **OzEHR** (college health EHR).

## Preview locally

From the repo root:

```bash
cd ozehrcom
python3 -m http.server 8080
```

Then open:

- http://localhost:8080/

Note: the site uses relative links, so you can preview either via a local server or by opening index.html directly.

## Site map

- `/index.html` (Home)
- `/pages/product.html`
- `/pages/features.html`
- `/pages/pricing.html`
- `/pages/security.html`
- `/pages/resources.html`
- `/pages/about.html`
- `/pages/contact.html`
- `/pages/privacy.html` (placeholder)
- `/pages/terms.html` (placeholder)

## Placeholders to replace

- Phone number: `(888) 555-0123`
- Email: `contact@ozehr.com`
- Pricing: pages show `Custom quote` by default.
- Privacy/Terms: placeholders only; replace with counsel-approved text.

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
