# CLAUDE.md — Copilot Blast Radius Simulator

## What This Is

An interactive web app that visualizes the "blast radius" of Microsoft 365 Copilot data exposure in an enterprise environment. When an organization enables Copilot, it uses the Microsoft Graph to surface information — but most enterprise SharePoint and Teams permissions are misconfigured. This tool shows, visually and instantly, what any given employee role could access via Copilot based on their current Graph permissions.

**This is a career fair demo for the Microsoft Belgium booth at Evolv Expo (March 26, 2026).** It must be visually striking, immediately understandable in under 60 seconds, and demonstrate both product management thinking and technical execution.

**Expo is March 26.**

---

## Current Status (as of March 24, 2026)

- ✅ CLAUDE.md spec written and updated
- ✅ GitHub repo created: https://github.com/Skappy-Yolo/copilot-blast-radius
- ✅ Azure Static Web Apps resource created, GitHub Actions deployment pipeline set up
- ✅ React + TypeScript + Vite scaffold complete
- ✅ Fluent UI v9 (webDarkTheme) + D3.js v7 integrated
- ✅ Hardcoded Flemish government tenant data: 92 nodes (16 users, 15 groups, 9 sites, 9 libraries, 43 documents), 110+ edges
- ✅ `graphTransformer.ts` — BFS blast radius traversal working
- ✅ `anomalyDetector.ts` — 5 detection rules, all naming specific Microsoft products
- ✅ `BlastGraph.tsx` — D3 force graph with 3-wave blast animation
- ✅ `AnomalyPanel.tsx` — severity cards with permission paths and recommendations
- ✅ `StatsBar.tsx` — file count, anomaly count, EEEU sites, risk score gauge
- ✅ `RoleSelector.tsx` — 5 Flemish government roles
- ✅ `BeforeAfterToggle.tsx` — switches between current and remediated graph state
- ✅ `MobileView.tsx` — fallback for <768px screens
- ✅ `remediatedState.ts` — pre-computed "after fix" graph
- ✅ TypeScript strict mode: zero compile errors
- ✅ Build passes (`npm run build`)
- 🔄 Azure Static Web Apps deployment: PR to main needed to trigger first deploy

**Next:** Merge to main → verify Azure deployment → polish animation timing → test offline on expo laptop.

---

## Honest Assessment & Competitive Context

### The problem is real
- Gartner VP Dennis Xu flagged SharePoint oversharing as the #1 Copilot security risk (March 17, 2026)
- 802,000+ files at risk on average in enterprise M365 tenants (Metomic research)
- The Flemish government just signed Europe's largest public-sector Copilot deal: 10,000 licenses
- Most Copilot deployments stall at weeks 6–12 due to governance and oversharing (2toLead, March 2026)

### Competitors exist — know your answer
Varonis, Opsin, and Bonfy all sell versions of this to enterprises. When a Microsoft employee asks "how is this different from Varonis?", your answer is:

> "It's not competing with Varonis. I built this to understand the problem deeply — because this is the #1 thing blocking your customers from activating Copilot. As a CSAM, I'd be helping unblock this. I wanted to show I already understand what I'm walking into."

Do NOT say "Microsoft should build this." Do NOT claim this is production-ready.

### Role alignment
CSAM (Customer Success Account Manager) owns post-sale adoption. Copilot governance is the #1 adoption blocker in enterprise. This demo shows you understand that blocker at a technical level. That is the entire point.

---

## Decision Log

### DD-01 | Data Layer: Hardcoded simulated tenant, NOT live Graph API
**Date:** 2026-03-23
**Decision:** Build with a realistic hardcoded dataset that simulates a Flemish government M365 tenant. Do NOT build live Graph API integration for the expo demo.
**Why:** The expo is in 3 days. Live Graph API requires: M365 dev tenant setup, Azure AD app registration, MSAL auth, Azure Functions proxy, token management, and offline fallback. Any single failure at the expo (WiFi, token expiry, rate limiting, cold start) kills the demo. A polished hardcoded demo that works 100% of the time is more valuable than a live demo with 30% failure risk in a noisy expo hall.
**What to tell Microsoft employees:** "The data layer is simulated based on the Graph API schema — the real integration would follow the same transformation pipeline. The demo is about the visualization and the problem framing, not the API plumbing."
**Phase 2 (after expo, if needed):** Add live Graph API. The architecture allows this — graphClient.ts and graphTransformer.ts are designed to be swappable with live data.

### DD-02 | Scope: Drop Azure Functions backend entirely
**Date:** 2026-03-23
**Decision:** No Azure Functions backend. No `/api` folder. Pure static frontend.
**Why:** DD-01 removes the need for a Graph API proxy. Without live API calls, there are no credentials to protect and no backend needed. Azure Static Web Apps hosts the frontend directly.
**Impact:** Simplifies deployment significantly. staticwebapp.config.json only needs SPA routing rules.

### DD-03 | Timeline: 3-day build, not 5-day
**Date:** 2026-03-23
**Revised build plan:**
- Day 1 (March 23): ✅ Scaffold + hardcoded data + D3 graph rendering + all components built
- Day 2 (March 24): ✅ Bug fixes + graph density (57→92 nodes) + data model corrections + code review
- Day 3 (March 25): Deploy to Azure via merge to main + polish animation timing + test offline on expo laptop
- March 26: Expo. Demo works or it doesn't. No coding on expo day.

---

## Why This Problem Matters (verified facts — use these in the UI)

- Gartner VP Dennis Xu flagged SharePoint oversharing as the #1 Copilot security risk (Gartner Security Summit, March 17, 2026 — source: WinBuzzer)
- 15%+ of business-critical files are at risk from oversharing (Metomic / HyperShift research)
- 67% of enterprise security teams are concerned about AI data exposure (Metomic)
- Most Copilot deployments stall between weeks 6–12 due to governance, oversharing, and unproven ROI (2toLead, March 2026)
- Microsoft's own Alex Pozin (Director Product Marketing) at Ignite: "It can be hard to get started with AI because you have to address these problems first"
- DLP bypass bug CW1226324 confirmed January 21, 2026, patched March 11, 2026 (The Register)
- CVE-2026-26133 cross-prompt injection vulnerability patched March 11, 2026 (WinBuzzer)
- The Flemish government signed Europe's largest public-sector Copilot deal: 10,000 licenses across Flemish administration and local authorities

---

## The Demo Flow (60 seconds)

1. **Open the app.** Dark-mode screen with a force-directed network graph showing ~200-500 nodes (users, groups, SharePoint sites, document libraries, individual documents). Nodes are color-coded by type.

2. **Select a role from the dropdown.** Options include roles modeled on a Flemish government-style tenant: "Junior Beleidsmedewerker" (Junior Policy Officer), "IT Helpdesk Medewerker", "Departementshoofd Onderwijs" (Education Department Head), "Externe Consultant", "Nieuwe Stagiair" (New Intern).

3. **The blast animation fires.** When a role is selected, red edges trace outward from that user node through group memberships and permissions in a 2-3 second animation, lighting up every document and site the role can access. The graph physically expands to show the reach.

4. **The anomaly panel updates.** A side panel shows the top 5 permission anomalies detected for this role, each with:
   - What it is ("Intern has read access to 'HR Salarisgegevens 2025' via nested group inheritance")
   - Severity score (Critical / High / Medium)
   - The permission path (User → Group A → Group B → Site → Document Library)
   - Recommended Microsoft fix ("Apply Purview sensitivity label 'Confidential' and restrict Copilot indexing via SharePoint Advanced Management")

5. **Stats bar at the top** shows: Total files accessible | Anomalies detected | Sensitivity-labeled files exposed | Sites with "Everyone except external users" permissions

6. **Before/After toggle.** Switches the graph to a "remediated" state — showing what the blast radius looks like AFTER applying the recommended Purview labels and permission fixes. The graph contracts visibly. This is hardcoded, not computed live.

---

## Tech Stack — Microsoft-First

### Core
- **React 18** with **TypeScript** — Microsoft created TypeScript
- **Vite** for build tooling (fast, modern)
- **Fluent UI v9** (@fluentui/react-components) — Microsoft's own design system. Use this for ALL UI components: dropdowns, cards, panels, badges, toggles, buttons. Do NOT use Tailwind, Chakra, or MUI.
- **D3.js v7** — for the force-directed network graph. This is the one non-Microsoft dependency and that's fine.

### Data Layer (hardcoded — see DD-01)
All data lives in `src/data/tenantData.ts`. It simulates a realistic Flemish government M365 tenant with deliberate misconfigurations. Structure matches the Graph API response shape so it can be swapped for live API calls in Phase 2.

Simulated tenant includes:
- 5 departments: Departement Onderwijs, Departement Mobiliteit & Openbare Werken, Agentschap Wegen en Verkeer, HR & Personeelszaken, Lokale Besturen
- ~25 users across departments including an intern and external consultant
- Security groups with nested membership (3+ levels deep in some cases)
- SharePoint sites per department with document libraries
- Deliberate misconfigurations:
  - "HR Salarisgegevens 2025" library shared via "Everyone except external users"
  - "Strategische Beleidsnota 2026" accessible to intern via nested group inheritance
  - "Citizen Data - Burgerzaken" with overly broad permissions
  - A document library where sensitivity labels exist but Copilot indexing is not restricted

### Hosting
- **Azure Static Web Apps** (free tier) — deploy via GitHub Actions
- No backend (see DD-02)

---

## Architecture (simplified — DD-01 and DD-02 applied)

```
┌──────────────────────────────────────┐
│        Azure Static Web Apps         │
│                                      │
│   React Frontend (Fluent UI + D3)    │
│   reads from src/data/tenantData.ts  │
│   (hardcoded, Graph API schema shape)│
└──────────────────────────────────────┘
```

Phase 2 (post-expo): add Azure Functions proxy + live Graph API as a drop-in replacement for tenantData.ts.

---

## Data Model

```typescript
// Nodes
interface GraphNode {
  id: string;
  type: 'user' | 'group' | 'site' | 'library' | 'document';
  label: string;
  department?: string;
  role?: string;                    // Maps to dropdown options
  sensitivityLabel?: string;        // None | Internal | Confidential | Highly Confidential
  hasEEEU?: boolean;                // "Everyone except external users" permission
}

// Edges
interface GraphEdge {
  source: string;
  target: string;
  type: 'memberOf' | 'permission' | 'nested_group' | 'inherited';
  permissionLevel?: 'read' | 'write' | 'fullControl';
  isAnomaly?: boolean;
}

// Anomaly
interface Anomaly {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  path: string[];                   // Node IDs showing the permission chain
  recommendation: string;
  microsoftTool: string;            // Which Microsoft product fixes this
}

// Role (for dropdown)
interface Role {
  id: string;
  label: string;                    // Dutch label for Flemish gov context
  userId: string;                   // Maps to a GraphNode of type 'user'
}
```

---

## Anomaly Detection Rules (hardcoded logic in anomalyDetector.ts)

1. **Over-broad group permissions:** Site/library includes "Everyone except external users" AND contains documents with sensitivity labels >= Confidential → **Critical**
2. **Nested group inheritance exposure:** User reaches a sensitive resource through 3+ levels of group nesting → **High**
3. **Cross-department access:** User in "Lokale Besturen" can reach documents in "HR Salarisgegevens" → **Critical**
4. **Intern/external access to strategy docs:** User with role containing "stagiair" or "extern" can access anything labeled Confidential or above → **Critical**
5. **Stale permissions:** Site has permissions from disabled/deleted user accounts → **Medium**

### Recommended Fixes (always name a specific Microsoft product)
- **Microsoft Purview Information Protection** — sensitivity labels, restrict Copilot indexing
- **SharePoint Advanced Management (SAM)** — oversharing baseline reports, restricted access control
- **Microsoft Entra ID Governance** — access reviews for stale group memberships
- **Microsoft Purview DLP** — prevent Copilot from surfacing sensitive content types
- **Copilot Studio guardrails** — custom guardrails for Copilot responses

---

## UI Layout

### Desktop (primary — this is what you show at the booth)

```
┌─────────────────────────────────────────────────────────┐
│ [Stats Bar]  Files: 2,847 | Anomalies: 12 | EEEU: 8   │
│              Sensitive Exposed: 247 | Risk Score: 78/100│
├────────────────────────────────┬────────────────────────┤
│                                │                        │
│                                │  [Role Selector]       │
│                                │  ▼ Junior Beleidsmede. │
│                                │                        │
│     [D3 Force Graph]           │  [Anomaly Panel]       │
│     Full network visualization │  ┌──────────────────┐  │
│     with blast animation       │  │ CRITICAL          │  │
│                                │  │ Intern → Salary   │  │
│                                │  │ data via nested   │  │
│                                │  │ group inheritance │  │
│                                │  │ Fix: Purview +    │  │
│                                │  │ SAM restriction   │  │
│                                │  ├──────────────────┤  │
│                                │  │ HIGH              │  │
│                                │  │ 3-level nesting   │  │
│                                │  │ to policy docs    │  │
│                                │  └──────────────────┘  │
│                                │                        │
│  [Before/After Toggle]         │  [Legend]              │
│  ○ Current  ● Remediated       │  Blue=User Green=Group │
│                                │  Amber=Site Grey=Doc   │
└────────────────────────────────┴────────────────────────┘
```

Split: ~65% graph, ~35% panel. The graph is the hero.

### Mobile (fallback — simplified view)

On screens < 768px:
- **Hide the D3 force graph entirely.** It doesn't work on small screens.
- Show stats bar + anomaly list as the main content
- Role selector stays at the top
- Add a note: "View on desktop for the full network visualization"

---

## Visual Design

### Color Scheme — Dark Mode (webDarkTheme)

```typescript
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
<FluentProvider theme={webDarkTheme}><App /></FluentProvider>
```

Node colors (D3, outside Fluent theme):
- Users: `#60CDFF` (Fluent blue)
- Groups: `#60E0A0` (green)
- Sites: `#FFB340` (amber)
- Document Libraries: `#E0E0E0` (light grey)
- Documents: `#FFFFFF` (white, smaller nodes)
- Anomaly highlight: `#F03030` (red)

### The Blast Animation

When a role is selected:
1. All non-connected edges/nodes fade to 15% opacity
2. Edges light up red in sequence from the selected user node:
   - Direct group memberships (user → groups): 0.5s
   - Group → site/library permissions: 0.5s
   - Inherited/nested access: 0.5s
3. Each reached node scales up slightly and gets a red border
4. Force simulation gently pushes connected nodes outward
5. Anomaly panel populates with staggered fade-in (100ms delay per item)

Use D3 transitions. Smooth and dramatic — this is the wow moment.

### Typography
Fluent UI uses Segoe UI by default. Do not override with Inter or other fonts.

---

## Project Structure

```
copilot-blast-radius/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Azure Static Web Apps deployment
├── src/
│   ├── components/
│   │   ├── BlastGraph.tsx          # D3 force graph + blast animation
│   │   ├── AnomalyPanel.tsx        # Side panel with anomaly cards
│   │   ├── RoleSelector.tsx        # Dropdown for role selection
│   │   ├── StatsBar.tsx            # Top stats bar
│   │   ├── BeforeAfterToggle.tsx   # Remediation toggle
│   │   └── MobileView.tsx          # Simplified mobile layout
│   ├── services/
│   │   ├── graphTransformer.ts     # Transform tenantData → D3 nodes/edges
│   │   └── anomalyDetector.ts      # Permission anomaly detection rules
│   ├── data/
│   │   ├── tenantData.ts           # Hardcoded simulated Flemish gov tenant
│   │   └── remediatedState.ts      # Pre-computed "after fix" graph state
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── staticwebapp.config.json
├── DECISIONS.md
└── README.md
```

Note: No `/api` folder (DD-02). No `cacheManager.ts` (no live API to cache). No `graphClient.ts` (no live API).

---

## Revised 3-Day Build Plan

### Day 1 — March 23: Scaffold + Data + Graph Rendering
- `npm create vite@latest . -- --template react-ts` inside repo folder
- Install dependencies (see below)
- Write `src/types/index.ts` — all interfaces
- Write `src/data/tenantData.ts` — full hardcoded Flemish gov tenant (25+ users, 5 departments, nested groups, misconfigurations)
- Write `src/services/graphTransformer.ts` — converts tenantData into D3 nodes/edges arrays
- Build `BlastGraph.tsx` — D3 force graph renders all nodes, no animation yet
- App.tsx shows the graph. Deploy to Azure SWA. Verify deployment works.

### Day 2 — March 24: Animation + Anomaly Panel + UI
- Implement blast animation in `BlastGraph.tsx` (D3 transitions, red edge tracing)
- Write `src/services/anomalyDetector.ts` — 5 detection rules
- Build `AnomalyPanel.tsx` — severity cards, recommendation text, Microsoft product names
- Build `StatsBar.tsx` — file count, anomaly count, EEEU count, sensitive exposed count
- Build `RoleSelector.tsx` — Fluent UI Dropdown with 5 Flemish gov roles
- Wire everything together in `App.tsx`
- Deploy and test full interaction loop end to end

### Day 3 — March 25: Toggle + Mobile + Polish + Final Deploy
- Write `src/data/remediatedState.ts` — contracted graph after fixes applied
- Build `BeforeAfterToggle.tsx` — switches between current and remediated D3 data
- Build `MobileView.tsx` — stats + anomaly list only, no D3 graph
- Polish: animation timing, anomaly descriptions in Dutch/Flemish gov context, node labels
- Test offline (no internet — everything is static, should work by default)
- Final deploy. Open on actual laptop. Walk through 60-second demo 3 times.

### March 26: Expo day. No coding. Demo only.

---

## Dependencies

```bash
# Inside the copilot-blast-radius folder:
npm create vite@latest . -- --template react-ts
npm install @fluentui/react-components @fluentui/react-icons
npm install d3
npm install --save-dev @types/d3
```

No MSAL. No Graph client. No Azure Functions tools. (DD-01, DD-02)

---

## Critical Constraints

1. **Every anomaly recommendation names a specific Microsoft product.** Never "fix your permissions." Always "Apply a Purview sensitivity label of 'Confidential' and enable Restricted Access Control via SharePoint Advanced Management."

2. **Flemish government context must be authentic.** Use real department names. Use Dutch labels where natural.

3. **Demo must work without internet.** It will — all data is static. Test anyway.

4. **Do not expose this as "just hardcoded."** It's a simulated tenant based on the real Graph API schema. The architecture is designed for live data in Phase 2. Say that if asked.

5. **Framing at the booth:** "I applied for the CSAM role. I researched what blocks your customers from activating Copilot — oversharing is #1. I built this to understand the problem deeply and show I already know what I'd be helping unblock."

6. **Do not say "Microsoft should build this."** Say "I built this to understand the problem. I'd love to hear how it compares to what you're seeing internally."

---

## What Success Looks Like

A Microsoft employee at the booth sees the graph, watches the blast animation fire, reads the anomaly panel, and says: "This is literally the problem our customers have. How did you build this?" Then you explain, hand them a leave-behind or LinkedIn QR code, and they either pass you to someone internally or connect on the spot.

The GitHub repo should be clean enough that a Microsoft engineer could clone it and understand it in 10 minutes.
