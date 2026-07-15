import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";

const SIGNUP_URL = "https://behindtheemail.com/signup";
const PASSWORD = "Pixel123@#";
const DELAY_BETWEEN_SIGNUPS_MS = 5000;

// Debug mode: set DEBUG=true to capture screenshots, HTML, console + network logs.
const DEBUG = process.env.DEBUG === "true";
const DEBUG_DIR = resolve("debug");

let stepCounter = 0;

function loadEmails() {
  const filePath = process.argv[2] || resolve("emails.txt");
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function sanitize(name) {
  return name.replace(/[^a-z0-9._@-]/gi, "_");
}

// Capture a screenshot + HTML snapshot at a named step.
async function debugStep(page, email, label) {
  if (!DEBUG) return;
  stepCounter += 1;
  const prefix = `${String(stepCounter).padStart(2, "0")}_${sanitize(email)}_${sanitize(label)}`;
  const dir = join(DEBUG_DIR, sanitize(email));
  mkdirSync(dir, { recursive: true });
  try {
    await page.screenshot({
      path: join(dir, `${prefix}.png`),
      fullPage: true,
    });
  } catch (e) {
    console.log(`    [debug] screenshot failed at "${label}": ${e.message}`);
  }
  try {
    const html = await page.content();
    writeFileSync(join(dir, `${prefix}.html`), html);
  } catch (e) {
    console.log(`    [debug] html dump failed at "${label}": ${e.message}`);
  }
  console.log(`    [debug] step "${label}" -> url: ${page.url()}`);
}

// Attach console + network listeners so we can see what the page does.
function attachDebugListeners(page, email) {
  if (!DEBUG) return;
  const dir = join(DEBUG_DIR, sanitize(email));
  mkdirSync(dir, { recursive: true });
  const netLogPath = join(dir, "network.log");
  const consoleLogPath = join(dir, "console.log");

  page.on("console", (msg) => {
    const line = `[${msg.type()}] ${msg.text()}\n`;
    writeFileSync(consoleLogPath, line, { flag: "a" });
  });

  page.on("pageerror", (err) => {
    writeFileSync(consoleLogPath, `[pageerror] ${err.message}\n`, { flag: "a" });
  });

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("signup") || url.includes("trpc") || url.includes("auth")) {
      const line = `>>> ${req.method()} ${url}\n    body: ${req.postData() || "(none)"}\n`;
      writeFileSync(netLogPath, line, { flag: "a" });
    }
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("signup") || url.includes("trpc") || url.includes("auth")) {
      let body = "(unreadable)";
      try {
        body = await res.text();
      } catch {
        // ignore
      }
      const line = `<<< ${res.status()} ${url}\n    resp: ${body}\n`;
      writeFileSync(netLogPath, line, { flag: "a" });
      console.log(`    [debug] response ${res.status()} for ${url.split("?")[0]}`);
    }
  });
}

async function waitForTurnstile(page, email) {
  console.log("    Looking for Turnstile captcha...");
  try {
    const frame = page.frameLocator(
      'iframe[src*="challenges.cloudflare.com"]'
    );
    const checkbox = frame.locator("#challenge-stage");
    await checkbox.waitFor({ state: "visible", timeout: 10000 });
    console.log("    Turnstile iframe found, waiting for it to process...");
    await debugStep(page, email, "turnstile_visible");
    await page.waitForTimeout(2000);
    try {
      await checkbox.click({ timeout: 5000 });
      console.log("    Clicked Turnstile checkbox.");
    } catch {
      console.log("    Turnstile did not need a click (auto-solving).");
    }
    await page.waitForTimeout(3000);
    await debugStep(page, email, "turnstile_after");
  } catch {
    console.log("    No Turnstile challenge appeared (may auto-solve or not required).");
    await page.waitForTimeout(2000);
  }
}

// Dump the current state of the form + any captcha widgets so we can see
// exactly why the submit button is (or isn't) enabled.
async function diagnoseForm(page, email, label) {
  const info = await page.evaluate(() => {
    const q = (sel) => Array.from(document.querySelectorAll(sel));
    const iframes = q("iframe").map((f) => ({
      src: f.src || "(no src)",
      name: f.name || "(no name)",
      id: f.id || "(no id)",
    }));
    const submit = document.querySelector('button[type="submit"]');
    const turnstileInput = document.querySelector(
      'input[name="cf-turnstile-response"], input[name="g-recaptcha-response"]'
    );
    const checkboxes = q('input[type="checkbox"]').map((c) => ({
      name: c.name || "(no name)",
      checked: c.checked,
    }));
    // any element whose class/id hints at captcha
    const captchaEls = q("[class*='turnstile'], [class*='captcha'], [id*='turnstile'], [id*='captcha'], .cf-turnstile")
      .map((e) => e.tagName + "." + (e.className || e.id));
    return {
      iframes,
      submitDisabled: submit ? submit.disabled : "(no submit button)",
      submitText: submit ? submit.textContent.trim() : null,
      turnstileTokenPresent: turnstileInput ? !!turnstileInput.value : "(no token input found)",
      turnstileTokenLen: turnstileInput ? (turnstileInput.value || "").length : 0,
      checkboxes,
      captchaEls,
    };
  });
  console.log(`    [diagnose:${label}]`);
  console.log(`      submit disabled: ${info.submitDisabled} (text: "${info.submitText}")`);
  console.log(`      turnstile token present: ${info.turnstileTokenPresent} (len ${info.turnstileTokenLen})`);
  console.log(`      checkboxes: ${JSON.stringify(info.checkboxes)}`);
  console.log(`      captcha elements: ${JSON.stringify(info.captchaEls)}`);
  console.log(`      iframes: ${JSON.stringify(info.iframes, null, 0)}`);
  if (DEBUG) {
    const dir = join(DEBUG_DIR, sanitize(email));
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, `diagnose_${sanitize(label)}.json`),
      JSON.stringify(info, null, 2)
    );
  }
  return info;
}

async function registerAccount(page, email) {
  console.log("    Navigating to signup page...");
  // Use "domcontentloaded" instead of "networkidle": the site has constant
  // background traffic (analytics, Sentry) so it never reaches network idle.
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await debugStep(page, email, "loaded");

  console.log("    Waiting for email field...");
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 20000 });

  console.log("    Filling email...");
  await emailInput.fill(email);

  console.log("    Filling password...");
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]'
  );
  await passwordInput.first().fill(PASSWORD);

  const termsCheckbox = page.locator(
    'input[type="checkbox"], [role="checkbox"]'
  );
  const checkboxCount = await termsCheckbox.count();
  if (checkboxCount > 0) {
    const isChecked = await termsCheckbox.first().isChecked().catch(() => false);
    if (!isChecked) {
      console.log("    Accepting terms checkbox...");
      await termsCheckbox.first().click();
    }
  } else {
    console.log("    No terms checkbox found.");
  }

  await debugStep(page, email, "form_filled");
  await diagnoseForm(page, email, "form_filled");

  await waitForTurnstile(page, email);

  const submitButton = page.locator('button[type="submit"]').first();

  // The button stays disabled until validation + captcha token are ready.
  // Wait for it to become enabled (captcha may take a few seconds), and
  // diagnose what's blocking if it never enables.
  console.log("    Waiting for submit button to become enabled...");
  try {
    await submitButton.waitFor({ state: "visible", timeout: 10000 });
    await page
      .locator("button[type=\"submit\"]:not([disabled])")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    console.log("    Submit button is now enabled.");
  } catch {
    console.log("    Submit button never became enabled — diagnosing...");
    await diagnoseForm(page, email, "button_still_disabled");
    await debugStep(page, email, "button_disabled");
    return {
      email,
      success: false,
      error:
        "Submit button stayed disabled (captcha token or validation not satisfied — see diagnose output)",
    };
  }

  await diagnoseForm(page, email, "before_submit");
  console.log("    Clicking submit...");
  await submitButton.click();
  await debugStep(page, email, "after_submit");

  try {
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await debugStep(page, email, "dashboard");
    return { email, success: true };
  } catch {
    await debugStep(page, email, "no_redirect");
    const errorEl = page.locator(
      '[role="alert"], .error, [class*="error"], [class*="Error"]'
    );
    const errorCount = await errorEl.count();
    let errorMsg = "Signup may have failed — did not redirect to dashboard";
    if (errorCount > 0) {
      errorMsg = await errorEl.first().textContent().catch(() => errorMsg);
    }
    return { email, success: false, error: errorMsg };
  }
}

async function main() {
  const emails = loadEmails();

  if (emails.length === 0) {
    console.log("No emails found. Add emails to emails.txt (one per line).");
    console.log("Or pass a file path: node register.js myemails.txt");
    process.exit(1);
  }

  console.log(`Found ${emails.length} email(s) to register.`);
  console.log(`Password: ${"*".repeat(PASSWORD.length)}`);
  if (DEBUG) {
    console.log(`Debug mode ON — artifacts will be saved to: ${DEBUG_DIR}`);
  } else {
    console.log("Tip: run with DEBUG=true to capture screenshots, HTML, console + network logs.");
  }
  console.log("---");

  const headless = process.env.HEADLESS === "true";
  const executablePath = process.env.CHROME_PATH || undefined;

  const browser = await chromium.launch({
    headless,
    ...(executablePath && { executablePath }),
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
  });

  const results = [];

  for (const email of emails) {
    console.log(`\nRegistering: ${email}`);
    const page = await context.newPage();
    attachDebugListeners(page, email);

    try {
      const result = await registerAccount(page, email);
      results.push(result);
      console.log(
        result.success ? `  ✓ Success` : `  ✗ Failed: ${result.error}`
      );
    } catch (err) {
      await debugStep(page, email, "exception").catch(() => {});
      results.push({ email, success: false, error: err.message });
      console.log(`  ✗ Error: ${err.message}`);
    } finally {
      await page.close();
    }

    if (emails.indexOf(email) < emails.length - 1) {
      console.log(
        `  Waiting ${DELAY_BETWEEN_SIGNUPS_MS / 1000}s before next signup...`
      );
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SIGNUPS_MS));
    }
  }

  await browser.close();

  console.log("\n=== Results ===");
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  console.log(`Total: ${results.length} | Success: ${succeeded.length} | Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed registrations:");
    for (const f of failed) {
      console.log(`  ${f.email}: ${f.error}`);
    }
  }

  if (DEBUG) {
    console.log(`\nDebug artifacts saved under: ${DEBUG_DIR}`);
    console.log("Each email has its own folder with screenshots (.png), HTML (.html),");
    console.log("network.log (signup/trpc requests + responses) and console.log.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
