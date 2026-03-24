# Decision Log — Copilot Blast Radius Simulator

All decisions that deviate from the original spec, shape the architecture, or affect the demo are recorded here.

---

## DD-01 | Data Layer: Hardcoded simulated tenant, NOT live Graph API
**Date:** 2026-03-23
**Status:** ACTIVE
**Decision:** Build with a realistic hardcoded dataset in `src/data/tenantData.ts`. No live Microsoft Graph API calls for the expo demo.
**Why:** The expo is March 26 — 3 days away. Live Graph API requires M365 dev tenant setup, Azure AD app registration, MSAL auth configuration, Azure Functions proxy, token lifecycle management, and offline fallback. Any single failure at the expo (WiFi, token expiry, rate limiting, Azure Functions cold start) kills the demo in a noisy hall with no recovery time. A polished hardcoded demo that works 100% of the time is strictly more valuable than a live demo with 30% failure risk.
**Talking point:** "The data layer is simulated based on the real Graph API schema — the same transformation pipeline would work with live data. The demo is about visualizing the problem, not the API plumbing."
**Phase 2 (post-expo):** graphClient.ts + Azure Functions proxy + MSAL replaces tenantData.ts. The rest of the architecture does not change.

---

## DD-02 | No Azure Functions backend
**Date:** 2026-03-23
**Status:** ACTIVE
**Decision:** No `/api` folder. No Azure Functions. Pure static frontend deployed to Azure Static Web Apps.
**Why:** DD-01 removes the only reason for a backend (Graph API proxy + credential protection). Without live API calls there are no credentials to protect. Static hosting is simpler, faster to deploy, and has zero cold-start risk at the expo.
**Impact:** staticwebapp.config.json only needs SPA routing rules (404 → index.html).

---

## DD-03 | Revised timeline: 3-day build
**Date:** 2026-03-23
**Status:** ACTIVE
**Decision:** Original spec said 5-day sprint. Expo is March 26, today is March 23. Build plan compressed to 3 days.
**Day 1 (March 23):** Scaffold + tenantData.ts + D3 graph renders nodes
**Day 2 (March 24):** Blast animation + AnomalyPanel + StatsBar + RoleSelector
**Day 3 (March 25):** Before/After toggle + mobile fallback + polish + final deploy + demo rehearsal
**March 26:** Expo only. No coding.

---

## DD-04 | Competitive awareness: Varonis, Opsin, Bonfy
**Date:** 2026-03-23
**Status:** INFORMATIONAL
**Context:** Multiple funded companies (Varonis, Opsin, Bonfy) already sell Copilot permission visibility tools to enterprises. Microsoft employees at the booth may know this.
**Talking point:** "This isn't competing with Varonis. I built it to understand the problem — because Copilot governance is the #1 adoption blocker your customers face, and as a CSAM that's exactly what I'd be helping unblock. I wanted to show I already understand what I'm walking into, not just that I read a job description."
**What NOT to say:** "Microsoft should build something like this." / "This could be a product." — both positions invite pushback and shift the conversation away from your candidacy.
