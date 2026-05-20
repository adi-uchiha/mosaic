# 🚀 Mosaic — Chrome Web Store Publishing Guide

> Complete step-by-step walkthrough to publish **Mosaic** to the Chrome Web Store.  
> Estimated time: 30–60 minutes (review takes 1–3 business days after submission).

---

## Pre-flight Checklist

Before submitting, verify all of these:

- [ ] `manifest.json` — `name`, `version`, `description`, and all icon paths are correct
- [ ] All 4 icon sizes exist: `icons/icon-16.png`, `icons/icon-32.png`, `icons/icon-48.png`, `icons/icon-128.png`
- [ ] Icons have **transparent backgrounds** (PNG format)
- [ ] Extension loads correctly locally via `chrome://extensions/` → Load unpacked
- [ ] No JavaScript errors in DevTools Console on the new tab page
- [ ] Dark **and** light mode both look correct
- [ ] `localStorage` data persists correctly after browser restart
- [ ] A **1280×800 or 640×400** screenshot of the extension is ready (for the store listing)
- [ ] A **440×280** small promo tile image is ready (optional but highly recommended)
- [ ] A **1400×560** marquee promo image (optional — for featured slot)

---

## Phase 1 — Register as a Chrome Web Store Developer

> Skip this phase if you already have a developer account.

1. Go to [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the **one-time $5 USD developer registration fee** (required by Google)
4. Accept the **Chrome Web Store Developer Agreement**
5. Your developer dashboard is now active

---

## Phase 2 — Prepare the Extension ZIP

> Google requires a `.zip` of the extension folder — not the folder itself.

**Run this from your terminal:**

```bash
cd /code/jin

# Create a clean ZIP excluding dev-only files
zip -r mosaic-v1.0.0.zip mosaic/ \
  --exclude "mosaic/icon-source.png" \
  --exclude "mosaic/.DS_Store" \
  --exclude "mosaic/*.md" \
  --exclude "mosaic/image.png"
```

> **Why exclude `.md` and `image.png`?**  
> These are repository documentation files. The extension itself only needs `index.html`, `styles.css`, `app.js`, `manifest.json`, and the `icons/` folder.

**Verify the ZIP contents:**
```bash
unzip -l mosaic-v1.0.0.zip
```

Expected files inside:
```
mosaic/index.html
mosaic/styles.css
mosaic/app.js
mosaic/manifest.json
mosaic/icons/icon-16.png
mosaic/icons/icon-32.png
mosaic/icons/icon-48.png
mosaic/icons/icon-128.png
```

---

## Phase 3 — Create a New Item on the Developer Dashboard

1. Go to [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Click **"+ New Item"** (top-right)
3. Click **"Choose file"** and upload `mosaic-v1.0.0.zip`
4. Wait for the upload to complete — Google parses the manifest automatically
5. You'll be taken to the **Store Listing** editor

---

## Phase 4 — Fill in the Store Listing

### Required Fields

| Field | Value |
|---|---|
| **Name** | `Mosaic` |
| **Summary** (132 chars max) | `A premium minimal new tab with a bento grid. Add shortcuts, drag to reorder, auto-loads favicons, dark & light themes.` |
| **Category** | `Productivity` |
| **Language** | `English` |

### Description (paste this into the description field)

```
Mosaic replaces your new tab with a premium, dark-glass bento grid dashboard.

✦ SHORTCUTS
Add unlimited site shortcuts. Each one auto-loads the site's real favicon.
Drag any card to reorder them exactly how you want. Hover to edit or delete.

✦ SEARCH
Built-in multi-engine search bar. Press Tab to cycle between Google, GitHub,
DuckDuckGo, and YouTube. Press Enter to search.

✦ THEMES
Full dark and light mode support. Toggle with the ☀️/🌙 button — powered by the
native View Transition API for a smooth, cinematic cross-fade.

✦ KEYBOARD FIRST
/ to focus search. Tab / Shift+Tab to cycle shortcuts. Enter to open.
E to edit a focused shortcut. Delete to remove it.

✦ PERFORMANCE
Zero dependencies. Pure HTML + CSS + JS. Loads in under 5ms.
Everything persists in localStorage — no account, no tracking, no cloud.

✦ OPEN SOURCE
MIT licensed. Contributions welcome on GitHub.
```

### Screenshots (Required — minimum 1)

- Use the `image.png` screenshot from the repository
- Resolution must be exactly **1280×800** or **640×400**
- If your screenshot is a different resolution, resize it:
  ```bash
  magick image.png -resize 1280x800! store-screenshot.png
  ```

### Promo Images (Optional but recommended)

| Size | Purpose |
|---|---|
| 440×280 | Small promo tile (shown in search results) |
| 1400×560 | Marquee promo (featured placement — rare) |

---

## Phase 5 — Privacy Practices

> Chrome Web Store now requires privacy disclosures for all extensions.

1. Go to the **"Privacy practices"** tab in the dashboard
2. Answer the questions:

| Question | Answer |
|---|---|
| Does your extension collect any user data? | **No** |
| Does your extension use remote code? | **No** |
| Single purpose description | "Replaces the new tab page with a bento grid shortcut dashboard." |

3. Justify each permission used:

| Permission | Justification |
|---|---|
| `storage` | Used to persist user shortcuts, theme preference, and name in localStorage |

---

## Phase 6 — Distribution Settings

1. Go to the **"Distribution"** tab
2. Set visibility:
   - **Public** — anyone can find and install it on the Web Store
   - *Or* **Unlisted** — only people with the direct link can install (good for beta)
3. Set countries to **All regions** (unless you want to restrict)
4. Click **"Save Draft"**

---

## Phase 7 — Submit for Review

1. Review all tabs (Store Listing, Privacy, Distribution) — all should show green checkmarks
2. Click **"Submit for Review"**
3. Google's automated and human review typically takes **1–3 business days**
4. You'll receive an email when the extension is approved or if changes are required

---

## Phase 8 — Post-Publish

Once approved:

1. Your extension is live at:  
   `https://chrome.google.com/webstore/detail/mosaic/<extension-id>`

2. Copy the **Extension ID** from the dashboard and update `manifest.json` homepage_url:
   ```json
   "homepage_url": "https://github.com/adi-uchiha/mosaic"
   ```

3. Share the Web Store link in your portfolio, GitHub README, and social media

---

## Publishing Updates (Future Versions)

When you make changes:

1. Increment the version in `manifest.json`:
   ```json
   "version": "1.0.1"
   ```

2. Re-create the ZIP:
   ```bash
   zip -r mosaic-v1.0.1.zip mosaic/ \
     --exclude "mosaic/icon-source.png" \
     --exclude "mosaic/*.md" \
     --exclude "mosaic/image.png"
   ```

3. Go to Developer Dashboard → your extension → **"Package"** tab → **"Upload new package"**

4. Submit for review again — updates typically review within **24 hours**

---

## Troubleshooting Common Rejections

| Rejection reason | Fix |
|---|---|
| "Insufficient description of functionality" | Expand the store description with more detail |
| "Missing privacy policy" | Add a privacy policy URL (can be a GitHub page) |
| "Icon does not match extension functionality" | Ensure icons are the correct sizes and PNG format |
| "Remote code execution" | Ensure no `eval()` calls or externally loaded scripts |
| "Single purpose violation" | Make sure description matches the `manifest.json` |

---

## Useful Links

| Resource | URL |
|---|---|
| Developer Dashboard | https://chrome.google.com/webstore/devconsole |
| Chrome Extension Docs | https://developer.chrome.com/docs/extensions/ |
| Manifest v3 Reference | https://developer.chrome.com/docs/extensions/mv3/manifest/ |
| Web Store Program Policies | https://developer.chrome.com/docs/webstore/program_policies/ |
| Chrome Extension Samples | https://github.com/GoogleChrome/chrome-extensions-samples |
