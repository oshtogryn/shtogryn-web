# Security policy

## Reporting a vulnerability

Please report security issues privately by email to **alex.shtogryn@gmail.com**.

Do not open a public GitHub issue for vulnerabilities that could expose user data, credentials, tokens, infrastructure details, or a working exploit.

## Secrets policy

Secrets and credentials must never be committed to this repository or exposed in browser-delivered HTML/JavaScript. API keys, Cloudflare credentials, access/service tokens, GitHub tokens, social-platform tokens and future backend credentials must be stored only in the relevant provider's secret store (for example Cloudflare secrets or GitHub Actions secrets).

## Current architecture

This site is intentionally static and has no browser-side privileged API credentials. The public contact form uses a first-party Cloudflare Pages Function. Turnstile and Brevo credentials remain server-side in Cloudflare secret storage; all browser code is still treated as public.
