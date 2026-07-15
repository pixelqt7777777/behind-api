import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve } from "path";

const SIGNUP_URL = "https://behindtheemail.com/signup";
const PASSWORD = "Pixel123@#";
const DELAY_BETWEEN_SIGNUPS_MS = 5000;

function loadEmails() {
  const filePath = process.argv[2] || resolve("emails.txt");
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function waitForTurnstile(page) {
  try {
    const frame = page.frameLocator(
      'iframe[src*="challenges.cloudflare.com"]'
    );
    const checkbox = frame.locator("#challenge-stage");
    await checkbox.waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(2000);
    try {
      await checkbox.click({ timeout: 5000 });
    } catch {
      // checkbox may auto-complete
    }
    await page.waitForTimeout(3000);
  } catch {
    // turnstile may not appear or may auto-solve
    await page.waitForTimeout(2000);
  }
}

async function registerAccount(page, email) {
  await page.goto(SIGNUP_URL, { waitUntil: "networkidle", timeout: 30000 });

  const emailInput = page.locator('input[type="email"], input[name="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill(email);

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
      await termsCheckbox.first().click();
    }
  }

  await waitForTurnstile(page);

  const submitButton = page.locator(
    'button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")'
  );
  await submitButton.first().click();

  try {
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    return { email, success: true };
  } catch {
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
    console.log(`Registering: ${email}`);
    const page = await context.newPage();

    try {
      const result = await registerAccount(page, email);
      results.push(result);
      console.log(
        result.success ? `  ✓ Success` : `  ✗ Failed: ${result.error}`
      );
    } catch (err) {
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
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
