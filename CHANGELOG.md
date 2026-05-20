# Changelog

All notable changes to Mosaic are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-05-20

### Added
- Bento grid new tab page with dark-glass glassmorphic aesthetic
- Unlimited shortcuts with drag-and-drop reordering
- Automatic favicon loading via Google S2 API with letter-badge fallback
- Multi-engine search bar: Google, GitHub, DuckDuckGo, YouTube
- `Tab` key to cycle search engines; `Enter` to execute
- Dark and light theme toggle with native View Transition API cross-fade
- Web Audio API synth tones on interactions (mutable)
- Live clock with context-aware greeting (morning/afternoon/evening/night)
- Editable greeting name — persists in `localStorage`
- `Tab` / `Shift+Tab` keyboard navigation through shortcut grid
- `/` key to focus search from anywhere on the page
- `Enter` / `Space` to open focused shortcut, `E` to edit, `Delete` to remove
- GPU-composited bento spotlight hover effect (zero repaint)
- Fully transparent icon at 16/32/48/128px sizes
- Manifest v3 compliant
- Zero external dependencies — loads in < 5ms
