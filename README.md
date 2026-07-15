# behind-api

Bulk account registration tool for behindtheemail.com using Playwright.

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

1. Add your emails to `emails.txt` (one per line):

```
user1@gmail.com
user2@gmail.com
user3@gmail.com
```

2. Run the registration script:

```bash
# With browser visible (recommended for first run — you can see captcha solving)
npm run register

# Headless mode
npm run register:headless

# Custom email file
node register.js path/to/my-emails.txt
```

## Configuration

Edit `register.js` to change:
- `PASSWORD` — the password used for all accounts (default: `Pixel123@#`)
- `DELAY_BETWEEN_SIGNUPS_MS` — delay between signups in ms (default: 5000)

## Debug mode

To see exactly what's happening (useful on a headless server), run with `DEBUG=true`:

```bash
DEBUG=true xvfb-run -a node register.js
```

This creates a `debug/` folder with a subfolder per email containing:
- **Screenshots** (`.png`) of every step: page loaded, form filled, Turnstile, after submit, dashboard/failure
- **HTML snapshots** (`.html`) of each step
- **network.log** — the signup/tRPC requests and their responses (status + body)
- **console.log** — browser console messages and page errors

The terminal also prints a live step-by-step trace and the HTTP status of the signup response.

## Notes

- The script uses a real browser to handle Cloudflare Turnstile captcha
- Non-headless mode is recommended since Turnstile may block headless browsers
- A 5-second delay between signups helps avoid rate limiting (limit is 50 requests)
- If captcha fails, try running in non-headless mode
