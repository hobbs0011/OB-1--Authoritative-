# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-portals.test.mjs >> Student-group login portals >> invalid credentials show error and stay on login
- Location: test\login-portals.test.mjs:82:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#error.visible')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for locator('#error.visible')

```

```yaml
- link "Skip to main content":
  - /url: "#main"
- text: GOSPEL 999 SEALED · ACTIVE · ETERNAL
- heading "BLUETECH" [level=1]
- text: Staff English Program G999 ACTIVE Username
- textbox "Username":
  - /placeholder: Enter username
  - text: BlueTech English Class
- text: Password
- textbox "Password":
  - /placeholder: Enter password
- button "Sign In"
- text: BlueTech English · Group Session Access
```

# Test source

```ts
  1   | /**
  2   |  * Browser test for student-group login portals (Playwright)
  3   |  *
  4   |  * Verifies:
  5   |  * 1. BlueTech login page loads and form submits correctly
  6   |  * 2. Quan & Quang login page loads and form submits correctly
  7   |  * 3. Classroom sections appear after successful login
  8   |  * 4. Logout returns to login screen
  9   |  */
  10  | 
  11  | import { test, expect } from "@playwright/test";
  12  | 
  13  | const PROD_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
  14  | 
  15  | test.describe("Student-group login portals", () => {
  16  |   test("BlueTech login works and shows classroom", async ({ browser }) => {
  17  |     const context = await browser.newContext();
  18  |     const page = await context.newPage();
  19  | 
  20  |     const errors = [];
  21  |     page.on("console", (msg) => {
  22  |       if (msg.type() === "error") errors.push(msg.text());
  23  |     });
  24  | 
  25  |     await page.goto(`${PROD_URL}/bluetech-login/`, {
  26  |       waitUntil: "domcontentloaded",
  27  |       timeout: 10000,
  28  |     });
  29  | 
  30  |     // Form fields visible
  31  |     await expect(page.locator("#username")).toBeVisible();
  32  |     await expect(page.locator("#password")).toBeVisible();
  33  |     await expect(page.locator("#loginForm")).toBeVisible();
  34  | 
  35  |     // Submit valid credentials
  36  |     await page.fill("#username", "BlueTech English Class");
  37  |     await page.fill("#password", "BLUETECH2026");
  38  |     await page.click("#loginForm button[type='submit']");
  39  | 
  40  |     // Classroom should appear
  41  |     await expect(page.locator("#app")).toBeVisible({ timeout: 3000 });
  42  |     await expect(page.locator("#loginWrap")).toHaveCount(0); // hidden
  43  | 
  44  |     // No JS errors on login page
  45  |     const jsErrors = errors.filter((e) => !e.includes("net::"));
  46  |     expect(jsErrors).toHaveLength(0);
  47  | 
  48  |     await context.close();
  49  |   });
  50  | 
  51  |   test("Quan & Quang login works and shows classroom", async ({ browser }) => {
  52  |     const context = await browser.newContext();
  53  |     const page = await context.newPage();
  54  | 
  55  |     const errors = [];
  56  |     page.on("console", (msg) => {
  57  |       if (msg.type() === "error") errors.push(msg.text());
  58  |     });
  59  | 
  60  |     await page.goto(`${PROD_URL}/quan-quang-login/`, {
  61  |       waitUntil: "domcontentloaded",
  62  |       timeout: 10000,
  63  |     });
  64  | 
  65  |     await expect(page.locator("#username")).toBeVisible();
  66  |     await expect(page.locator("#password")).toBeVisible();
  67  |     await expect(page.locator("#loginForm")).toBeVisible();
  68  | 
  69  |     await page.fill("#username", "Quan & Quang English");
  70  |     await page.fill("#password", "QUANQUANG2026");
  71  |     await page.click("#loginForm button[type='submit']");
  72  | 
  73  |     await expect(page.locator("#app")).toBeVisible({ timeout: 3000 });
  74  |     await expect(page.locator("#loginWrap")).toHaveCount(0); // hidden
  75  | 
  76  |     const jsErrors = errors.filter((e) => !e.includes("net::"));
  77  |     expect(jsErrors).toHaveLength(0);
  78  | 
  79  |     await context.close();
  80  |   });
  81  | 
  82  |   test("invalid credentials show error and stay on login", async ({ browser }) => {
  83  |     const context = await browser.newContext();
  84  |     const page = await context.newPage();
  85  | 
  86  |     await page.goto(`${PROD_URL}/bluetech-login/`, {
  87  |       waitUntil: "domcontentloaded",
  88  |       timeout: 10000,
  89  |     });
  90  | 
  91  |     await page.fill("#username", "wrong");
  92  |     await page.fill("#password", "wrong");
  93  |     await page.click("#loginForm button[type='submit']");
  94  | 
> 95  |     await expect(page.locator("#error.visible")).toBeVisible({ timeout: 3000 });
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  96  |     await expect(page.locator("#loginWrap")).toBeVisible();
  97  | 
  98  |     await context.close();
  99  |   });
  100 | });
  101 | 
```