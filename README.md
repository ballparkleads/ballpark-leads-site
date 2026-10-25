# Ballpark Leads website

Plain HTML/CSS/JS — no build step. Upload the contents of this folder to the root of a GitHub repo.

## Pages
- `index.html` — home: hero + live demo calculator, value props, how it works, industries, pricing teaser
- `features.html` — why Ballpark Leads: key selling points, comparison table
- `industries.html` — trades we serve (roofing and HVAC live; pools, landscaping coming soon)
- `pricing.html` — free demo, $250 setup, $2–$5 per lead, FAQ
- `signup.html` — main "Try it free" capture page
- `roofing.html`, `hvac.html` — trade landing pages with calculator widget + sign-up form (good for ads)
- `thanks.html` — shown after a sign-up; `404.html` — not-found page

## Going live on Netlify
1. Netlify → Add new site → Import from GitHub → pick this repo. Build command: none. Publish directory: `/` (root).
2. Sign-ups are captured by Netlify Forms (form name `signup`). After the first deploy, open the site → Forms and confirm the form is detected.
3. Email alerts: Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add → Email notification → your Gmail.
4. Custom domain: Domain management → add `ballparkleads.com` once you own it.

Every form records which page it came from (`source`), the plan clicked on the pricing page (`plan`), and the trade.
