# 📦 Mosaic — GitHub Releases Setup Guide

> Distribute Mosaic directly from GitHub — free, instant, and ideal for open-source users.  
> Anyone can install from a GitHub Release without the Chrome Web Store.

---

## What GitHub Releases Gives You

- Direct ZIP download for users to install via "Load unpacked"
- Version history with changelogs automatically on GitHub
- A stable, permanent URL per version for linking
- Foundation for automated releases via GitHub Actions (set up below)

---

## Part A — Manual First Release

### Step 1 — Create a GitHub Repository

```bash
# From the project root
cd /code/jin/mosaic

git init
git add .
git commit -m "feat: initial release of Mosaic v1.0.0"

# Create repo on GitHub first (github.com/new), then:
git remote add origin https://github.com/adixcode/mosaic.git
git branch -M main
git push -u origin main
```

### Step 2 — Create the Production ZIP

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

echo "$(du -sh mosaic-v1.0.0.zip)"
```

### Step 3 — Create the Release on GitHub

**Via GitHub web UI:**

1. Go to your repo → **Releases** (right sidebar) → **"Draft a new release"**
2. Click **"Choose a tag"** → type `v1.0.0` → click **"Create new tag: v1.0.0"**
3. Target branch: `main`
4. **Release title:** `Mosaic v1.0.0`
5. **Description:** (copy from the template below)
6. Under **"Assets"** → **"Attach binaries"** → upload `mosaic-v1.0.0.zip`
7. Click **"Publish release"** ✅

**Release description template:**
```markdown
## Mosaic v1.0.0 — Initial Release

A premium, minimal Chrome/Edge new tab page with a dark-glass bento grid.

### Installation
1. Download `mosaic-v1.0.0.zip` below
2. Unzip it
3. Open Chrome → `chrome://extensions/` or Edge → `edge://extensions/`
4. Enable **Developer mode**
5. Click **"Load unpacked"** → select the `mosaic/` folder
6. Open a new tab ✅

### Features
- Unlimited drag-and-drop shortcuts with auto favicon loading
- Multi-engine search (Google, GitHub, DuckDuckGo, YouTube)
- Dark & light theme with View Transition API
- Live clock with context-aware greeting
- Editable name, Web Audio tones, full keyboard navigation
- Zero dependencies — loads in <5ms
```

---

## Part B — Automated Releases with GitHub Actions

This workflow automatically builds and publishes a GitHub Release whenever you push a version tag (`v1.0.0`, `v1.0.1`, etc.).

### The Workflow File

The file `.github/workflows/release.yml` is already set up in this repo.

**How to trigger a release:**

```bash
# 1. Bump version in manifest.json first, then commit
git add manifest.json CHANGELOG.md
git commit -m "chore: bump version to v1.0.1"

# 2. Tag it
git tag v1.0.1

# 3. Push tag — this triggers the GitHub Action automatically
git push origin main --tags
```

GitHub Actions will:
1. Check out the code
2. Create a clean production ZIP (excluding docs and dev files)
3. Publish a GitHub Release with the ZIP attached
4. Use the latest entry from `CHANGELOG.md` as the release description

---

## Part C — Add Install Badge to README

Add these badges to the top of your `README.md`:

```markdown
[![GitHub Release](https://img.shields.io/github/v/release/adixcode/mosaic?label=Download&logo=github)](https://github.com/adixcode/mosaic/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
```

### Direct install link (always points to latest ZIP)

```
https://github.com/adixcode/mosaic/releases/latest/download/mosaic.zip
```

Use this in your README installation section so users always get the newest version:

```markdown
## Installation

1. [Download the latest ZIP](https://github.com/adixcode/mosaic/releases/latest/download/mosaic.zip)
2. Unzip it
3. Open `chrome://extensions/` → enable Developer mode → Load unpacked → select the folder
```

---

## Part D — Version Strategy

Follow [Semantic Versioning](https://semver.org/):

| Change type | Example | When to use |
|---|---|---|
| **Patch** `1.0.x` | `1.0.1` | Bug fix, small CSS tweak |
| **Minor** `1.x.0` | `1.1.0` | New feature (new shortcut option, new search engine) |
| **Major** `x.0.0` | `2.0.0` | Breaking redesign or architecture change |

Always update `manifest.json` **and** `CHANGELOG.md` before tagging.
