# shtogryn.com

Personal technical-services website for Oleksandr Shtohryn.

## Public structure

- `/` — English
- `/sv/` — Swedish
- `/uk/` — Ukrainian
- `/ru/` — Russian
- `/privacy` — canonical contact/privacy information (`/privacy.html` remains a compatibility redirect)
- `/services/*` — English service landing pages
- `/sv/tjanster/*` — Swedish service landing pages
- `/uk/services/*` — Ukrainian service landing pages
- `/ru/services/*` — Russian service landing pages
- `/.well-known/security.txt` — security contact

## Security model

The public site is intentionally static. Browser-delivered code must never contain privileged credentials.

Cloudflare Pages security headers are defined in `_headers` and include HSTS, CSP, `nosniff`, anti-framing, referrer policy, permissions policy and COOP. The current CSP permits local scripts/styles/assets, the required Google Analytics endpoints, and form submission only to FormSubmit.

Secrets such as Cloudflare API credentials, GitHub tokens, API keys, social-platform tokens or future backend credentials belong only in provider secret stores, never in this repository.

## Contact form

The current form posts to FormSubmit. Input lengths and duplicate-submit handling are enforced client-side as UX safeguards. Client-side validation is not a substitute for a future server-side endpoint.

Preferred future architecture: `/api/contact` on Cloudflare Pages Functions/Worker + Turnstile server-side validation + rate limiting + provider-side mail delivery.

## Validation

`.github/workflows/security-audit.yml` performs:

- required-file checks;
- security-header contract checks;
- contact-form transport checks;
- basic committed-secret pattern scanning;
- sitemap route checks;
- CodeQL JavaScript analysis.

Do not weaken these checks merely to make CI green. Fix the underlying regression.

## Deployment

The repository itself is not configured as GitHub Pages. Production deployment is expected to be handled externally (currently consistent with Cloudflare Pages architecture). After security-sensitive changes, verify the production response headers in a real browser or Cloudflare deployment preview before considering the change complete.
