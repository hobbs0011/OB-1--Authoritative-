# Mission B — Portal Reachability Wiring

## Command

```bash
node test/portal-reachability.mjs
```

Michael: add `test/portal-reachability.mjs` to Daddy T1. Do not edit `test/daddyshark.mjs` for this mission.

## Sweep result

Final run exits 0 on WebKit with both required usable iPhone viewports:

- `375x553`
- `360x560`

The test starts a local static server for `public/`, loads each page in WebKit, enumerates visible `button`, visible `a[href]`, and visible `[onclick]` controls, checks center coordinates against the viewport after real page/container scroll, and verifies the center is topmost via `elementFromPoint()`. It does not use Playwright `.click()` auto-scroll as proof.

## Per-page report

### huong-portal

Controls found in final green run:

- Login screen: 0 visible controls in authed test mode.
- Top nav closed: 11 controls.
- Nav open: 11 controls.
- Top nav after cleanup: 2 controls.
- Portal main: 4 controls before nav open, 4 controls after nav open.

Pre-fix unreachable controls:

- `Save Notes` was covered by the open mobile nav/logout overlay after the nav-open phase.
- Cause: the mobile nav/backdrop overlay could remain topmost over main content, making main controls fail the `elementFromPoint()` hit test.

CSS/markup fix:

- Added inline portal override in `public/huong-portal.html`:
  - `#navBackdrop { pointer-events: none !important; }`

### mai-tram-portal

Controls found in final green run:

- Login screen: 0 visible controls in authed test mode.
- Top nav closed: 11 controls.
- Nav open: 11 controls.
- Top nav after cleanup: 2 controls.
- Portal main: 29 controls before nav open, 29 controls after nav open.

Pre-fix unreachable controls:

- `🗣️ Keep Practicing` was covered by the top-nav brand span when scrolled near the top.
- `Save Notes` was covered by the open mobile nav overlay.
- Cause: mission CTA sat too close to the fixed top nav, and the mobile nav overlay remained topmost over main content.

CSS/markup fix:

- Added inline portal override in `public/mai-tram-portal.html`:
  - `#navBackdrop { pointer-events: none !important; }`
- Added inline mission CTA spacing in `public/mai-tram-portal.html`:
  - `missionBtn` now has `min-height:44px`, `padding:10px 16px`, and `margin-top:60px`.

### pitch-deck

Controls found in final green run:

- Slides: 4 controls.

Pre-fix unreachable controls:

- None.

CSS/markup fix:

- None required.

### magic-chat

Controls found in final green run:

- Landing before mode selection: 4 controls.
- Landing after mode selection: 4 controls.
- Orb screen: 2 controls.

Pre-fix unreachable controls:

- `Free Talk ▾` was covered by the mic-unavailable banner overlay.
- `#orb` was covered by landing/orb overlay layers during the transition.
- Cause: generated overlays and orb layers had z-index/positioning that could cover thumb targets after mode selection.

CSS/markup fix:

- Added inline CSS in `public/magic-chat.html`:
  - `#micUnavailableBanner` is moved below the top control row and lowered below orb controls.
  - After `#modeLanding.hidden`, `#orbScreen`, `#orbTopBar`, `#orbStage`, `#orb`, and `#orbEndBtn` are raised above landing/orb overlays.

## Non-blocking flags

The sweep reports text smaller than 14px as warnings only. No horizontal overflow was reported at 360px width.

Text < 14px examples remain on:

- `huong-portal`: badges, labels, small notes, `#saveNotesBtn` at 13px.
- `mai-tram-portal`: badges, labels, audio/taster buttons at 13px.
- `pitch-deck`: back/CTA nav labels, slide labels, chips around 11–13.6px.
- `magic-chat`: mode descriptions, `#orbModeChip`, `#orbStatus`, `#orbEndBtn`.

These were flagged, not fixed, per Mission B instructions.
