# Clutch Clicks — Growth Plan Call Script

A live, dynamic sales-call script for Clutch Clicks growth plan calls. Reps open it in a browser
tab next to Zoom and follow the straight-line framework stage by stage, without forgetting a step
before they move to checkout.

Built from the **Growth Plan Call SOP — Closer Edition** (Brandon Ly's 14 recorded calls).

## Run it

It is a static site with no build step. Open `index.html` directly, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Deploy anywhere that hosts static files (Netlify, Vercel, GitHub Pages, GoHighLevel custom page).

## What it does

**Five sections, one page each.** The rep sees the straight line, not eleven steps:

1. **Intro + Discovery** — intro, video check, decision-maker check, "what questions came up?"
2. **ROI Bridge** — the transition plus Metric 1, 2 and 3 stacked on one page. The three
   metrics are the checklist inside this section.
3. **The Money** — the ROI sequence with live math.
4. **Diagnose the GMB** — the three findings, in order.
5. **Closing** — transition to checkout, offer, pushbacks, payment and onboarding.

Then **Post-Call** to log the outcome.

**Objections don't break the line.** If a prospect asks about missed calls during discovery, the
rep hits "Teach Metric 2 now" on that question (or the red **Objection?** button from anywhere),
covers it, marks it covered, and lands back where they were. The ROI Bridge then only asks for
the metrics still open, its "Done" button stays owed until all three are covered, and the sidebar
always shows what is **owed before the close** (Metric 1, 2, 3, the money, the GMB diagnosis).
"Back to the line" jumps to the first section that isn't done yet.

**Call type.** Initial call or follow-up. Follow-up swaps the intro and questions scripts and
drops the "watch together" part.

**Numbers that fill the script.** Prospect name, shop, city, trade and the average ticket live in
the Numbers drawer and appear as highlighted fields inside the word-for-word copy. The Money
section runs the ROI sequence automatically: their ticket, the halving rule (conservative number),
one missed call every two weeks, the multiple on $297, and the low-ticket exception under $150.

**Guardrails from the SOP.** Early-yes warning with the exact line to say, the decision-maker
check that flags the champion track, STOP markers where the rep must wait for the answer, the
three GMB findings in order, the four onboarding things, the offer picker (3-month special,
monthly + listing, monthly, downsell) and the four pushback scripts.

**Timer.** Overall clock plus time in the current section against its target. Space bar toggles
it when no input is focused. `N` opens notes, `M` numbers, `O` objections.

**Post-call.** Outcome (closed, follow-up, not interested, no-show), follow-up sub-options
(send recap yes/no, follow-up time, special grandfathered), the GHL pipeline stage, a copyable
call summary and the JSON payload the future GoHighLevel sync will send.

Everything autosaves to the browser (`localStorage`), so a refresh mid-call loses nothing.
**New call** clears it.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `css/styles.css` | Styling, dark theme, responsive layout |
| `js/script-content.js` | **All script copy and structure.** Edit this to change what reps say. |
| `js/app.js` | State, section/checklist logic, detours, ROI math, timer, rendering |

### Editing the script

`js/script-content.js` is plain data. `CC_SECTIONS` defines the five sections and which SOP
steps stack inside each. Each step in `CC_STAGES` has `blocks` of these types:

- `say` word-for-word copy (gold bar), `ask` a question to land (green bar)
- `stop` wait for the answer, `tip` closer tip, `warn` watch-for, `rule` a rule box
- `capture` an input that saves into the Numbers state (`text`, `money`, `textarea`, `choice`)
- `cond` blocks shown only when `when(state)` is true
- `widget` an interactive piece implemented in `app.js`

Use `{{name}}`, `{{shop}}`, `{{city}}`, `{{trade}}`, `{{aov}}`, `{{conservative}}`,
`{{monthly}}`, `{{multiple}}` inside any text to get a live field.

Pricing lives in `CC_PRICING` at the top of the same file.

## Not built yet (next)

- **GoHighLevel sync.** The post-call screen already builds the payload. Next step is a small
  serverless endpoint that matches the contact by name + email, updates the opportunity stage,
  writes the call summary to notes, and applies tags that fire the automations
  (`send-recap` vs `showed-no-email`, `special-grandfathered`, `no-show`).
- Per-rep login / call history (today each browser holds one call at a time).
- Brand colours and logo.
