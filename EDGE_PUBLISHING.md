# 🪟 Mosaic — Microsoft Edge Add-ons Publishing Guide

> **Free to publish.** No registration fee. Reaches all Microsoft Edge users (300M+).  
> Edge is Chromium-based — Mosaic works with zero code changes.  
> Estimated time: 20–40 minutes. Review takes **3–7 business days**.

---

## Pre-flight Checklist

- [ ] Microsoft account ready (personal or work)
- [ ] `manifest.json` version is correct
- [ ] All 4 icon sizes exist in `icons/` with **transparent backgrounds**
- [ ] Extension loads correctly in Edge via `edge://extensions/` → Load unpacked
- [ ] Screenshots prepared at **1280×800** (use files in `store-listing/ready/`)
- [ ] Production ZIP created (see Phase 1 below)

---

## Phase 1 — Create the Production ZIP

Run from your terminal:

```bash
cd /code/jin

zip -r mosaic-v1.0.0.zip mosaic/ \
  --exclude "mosaic/store-listing/*" \
  --exclude "mosaic/README.md" \
  --exclude "mosaic/PUBLISHING.md" \
  --exclude "mosaic/EDGE_PUBLISHING.md" \
  --exclude "mosaic/GITHUB_RELEASES.md" \
  --exclude "mosaic/CHANGELOG.md" \
  --exclude "mosaic/image.png" \
  --exclude "mosaic/.DS_Store" \
  --exclude "mosaic/*.zip"

echo "ZIP created: $(du -sh mosaic-v1.0.0.zip)"
```

Verify contents:
```bash
unzip -l mosaic-v1.0.0.zip
```

Expected:
```
mosaic/index.html
mosaic/styles.css
mosaic/app.js
mosaic/manifest.json
mosaic/icons/icon-16.png
mosaic/icons/icon-32.png
mosaic/icons/icon-48.png
mosaic/icons/icon-128.png
mosaic/icons/icon.svg
```

---

## Phase 2 — Access the Edge Add-ons Developer Dashboard

> The generic Partner Center home redirects to account settings — go directly to the Edge portal.

**Direct URL (use this):**
```
https://partner.microsoft.com/dashboard/microsoftedge/overview
```

### If you land on an enrollment screen:

1. In the left sidebar click **"Programs"** → find **"Microsoft Edge"** → click **"Get started"**
2. Accept the **Microsoft Edge Add-ons Developer Agreement** (no fee)
3. You'll be redirected to the Edge Add-ons dashboard

### Alternative legacy portal (also works):
```
https://microsoftedge.microsoft.com/insider/adt/crx/dashboard
```

Once you're on the Edge Add-ons dashboard you'll see a **"+ New extension"** button in the top-right.

---

## Phase 3 — Create a New Submission

1. In your Edge workspace, click **"Create new extension"**
2. Upload `mosaic-v1.0.0.zip`
3. Wait for validation (takes ~30 seconds — Edge parses the manifest automatically)
4. You'll land on the submission editor

---

## Phase 4 — Fill in the Store Listing

### Availability

| Field | Value |
|---|---|
| **Visibility** | Public |
| **Markets** | All markets |

### Properties

| Field | Value |
|---|---|
| **Category** | Productivity |
| **Privacy policy URL** | `https://github.com/adi-uchiha/mosaic#privacy` |
| **Website URL** | `https://github.com/adi-uchiha/mosaic` |
| **Support URL** | `https://github.com/adi-uchiha/mosaic/issues` |

### Store listing (English — United States)

**Name:**
```
Mosaic
```

**Description (short, 250 chars max):**
```
A premium minimal new tab with a bento grid. Add unlimited shortcuts, drag to reorder, auto-loads favicons. Dark & light themes. Zero dependencies.
```

**Description (full — paste as-is):**
```
Mosaic replaces your new tab with a premium, dark-glass bento grid dashboard.

✦ SHORTCUTS
Add unlimited site shortcuts. Each one auto-loads the site's real favicon.
Drag any card to reorder exactly how you want. Hover to edit or delete.

✦ SEARCH
Built-in multi-engine search — Google, GitHub, DuckDuckGo, YouTube.
Press Tab to cycle engines. Press Enter to search.

✦ THEMES
Full dark and light mode. Toggle with the ☀️/🌙 button.
Powered by the native View Transition API for a smooth cross-fade.

✦ KEYBOARD FIRST
/ to focus search. Tab / Shift+Tab to cycle shortcuts.
Enter to open. E to edit. Delete to remove.

✦ PERFORMANCE
Zero dependencies. Pure HTML + CSS + JS. Loads in under 5ms.
Everything persists in localStorage — no account, no tracking, no cloud.

✦ OPEN SOURCE
MIT licensed. Source on GitHub: github.com/adi-uchiha/mosaic
```

---

## Phase 5 — Upload Store Assets

### Screenshots (required — min 1, max 10)

Upload from `store-listing/ready/`:
- `image_1280x800.png`
- `image_copy_1280x800.png`
- `image_copy_2_1280x800.png`
- `image_copy_3_1280x800.png`

> Edge accepts **1366×768** minimum — your 1280×800 files are accepted.

### Store logo (required)

Use `icons/icon-128.png` — transparent background, 128×128.

---

## Phase 6 — Privacy & Permissions Justification

Edge requires you to declare what each permission is used for.

| Permission | Justification to enter |
|---|---|
| `storage` | Stores user shortcuts, theme preference, and name in browser localStorage. No data leaves the device. |

**Data collection declaration:** Select **"This extension does not collect any user data"**

---

## Phase 7 — Submit

1. Review all sections — all must show green checkmarks
2. Click **"Publish"**
3. Status changes to **"In review"** — typically **3–7 business days**
4. You'll receive an email from Microsoft when approved or if changes needed

---

## Phase 8 — After Approval

Your listing will be live at:
```
https://microsoftedge.microsoft.com/addons/detail/mosaic/<extension-id>
```

Add this badge to your GitHub README:

```markdown
[![Available on Edge Add-ons](https://img.shields.io/badge/Edge%20Add--ons-Mosaic-0078D7?logo=microsoftedge)](https://microsoftedge.microsoft.com/addons/detail/mosaic/YOUR-ID)
```

---

## Publishing Updates

1. Bump version in `manifest.json` (e.g. `"version": "1.0.1"`)
2. Re-create the ZIP (same command as Phase 1)
3. Dashboard → your extension → **"Update"** → upload new ZIP
4. Submit — updates review in **1–3 business days**
