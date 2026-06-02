# PF-3 CTA WIRE SPEC — Landing Page → Assessment

**Run:** 047
**Owner:** Kilo (PA T1 / PCClaw)
**File:** `APPS/PAGES/net-marketing-landing/index.html`
**Mission:** Wire the two dead CTA buttons so they actually navigate to the assessment.

---

## 0. VERIFIED STATE

Landing page has TWO CTA buttons (lines 27–29 and 41–43). Both render correctly. Neither has any onclick, href, or navigation. They do nothing when clicked. Confirmed via grep — zero onclick/href/navigate hits.

The assessment lives on a **different origin** (CF Pages vs CF Worker), so relative paths don't work.

- **Assessment URL (prod):** `https://net-pet-ai.mrmichaelhobbs123.workers.dev/net-tiger-assessment.html`
- **Assessment URL (dev):** `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/net-tiger-assessment.html`

---

## 1. THE GAP (exact lines)

```html
<!-- Line 27-29 — first CTA (no action) -->
<button class="cta soul-purple">
  START ASSESSMENT - BẮT ĐẦU ĐÁNH GIÁ
</button>

<!-- Line 41-43 — second CTA (no action) -->
<button class="cta gold-glow">
  START ASSESSMENT - BẮT ĐẦU ĐÁNH GIÁ
</button>
```

---

## 2. THE FIX

Add `onclick` to both buttons pointing to prod assessment URL:

```html
<button class="cta soul-purple" onclick="window.location.href='https://net-pet-ai.mrmichaelhobbs123.workers.dev/net-tiger-assessment.html'">
  START ASSESSMENT - BẮT ĐẦU ĐÁNH GIÁ
</button>
```

Same for the second button.

**Why onclick not `<a>`:** Buttons have existing CSS class styling — changing to `<a>` risks layout regression. `onclick` is the zero-risk drop-in.

**Why hard-coded prod URL:** This is the marketing landing page — it always points to prod. Dev testing of this page is Michael's manual check.

---

## 3. GATE

After edit: open `index.html` in a browser locally, click both buttons, confirm navigation fires. (No `node --check` for HTML — visual confirm is the gate, or grep that onclick is present on both buttons.)

Grep confirm: `onclick` appears twice in index.html after edit.

---

## 4. OUT OF SCOPE

- Do not change button text, classes, or any other HTML.
- Do not add analytics/tracking.
- Do not touch `style.css`.
