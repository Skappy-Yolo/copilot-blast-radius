# CLAUDE.md — Copilot Blast Radius Simulator

## What This Is

An interactive web app that visualizes the "blast radius" of Microsoft 365 Copilot data exposure in an enterprise environment. When an organization enables Copilot, it uses the Microsoft Graph to surface information — but most enterprise SharePoint and Teams permissions are misconfigured. This tool shows, visually and instantly, what any given employee role could access via Copilot based on their current Graph permissions.

**This is a career fair demo for the Microsoft Belgium booth at Evolv Expo (March 26, 2026).** It must be visually striking, immediately understandable in under 60 seconds, and demonstrate both product management thinking and technical execution.

## Why This Problem Matters (verified facts — use these in the UI)

- Gartner VP Dennis Xu flagged SharePoint oversharing as the #1 Copilot security risk (Gartner Security Summit, March 17, 2026 — source: WinBuzzer)
- 15%+ of business-critical files are at risk from oversharing (Metomic / HyperShift research)
- 67% of enterprise security teams are concerned about AI data exposure (Metomic)
- Most Copilot deployments stall between weeks 6–12 due to governance, oversharing, and unproven ROI (2toLead, March 2026)
- Microsoft's own Alex Pozin (Director Product Marketing) at Ignite: "It can be hard to get started with AI because you have to address these problems first"
- DLP bypass bug CW1226324 confirmed January 21, 2026, patched March 11, 2026 (The Register)
- CVE-2026-26133 cross-prompt injection vulnerability patched March 11, 2026 (WinBuzzer)
- The Flemish government signed Europe's largest public-sector Copilot deal: 10,000 licenses across Flemish administration and local authorities

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

6. **Optional: Before/After toggle.** A toggle that switches the graph to a "remediated" state — showing what the blast radius looks like AFTER applying the recommended Purview labels and permission fixes. The graph contracts visibly. This is hardcoded, not computed live.

## Tech Stack — Microsoft-First

### Core
- **React 18** with **TypeScript** — Microsoft created TypeScript
- **Vite** for build tooling (fast, modern)
- **Fluent UI v9** (@fluentui/react-components) — Microsoft's own design system. Use this for all UI components: dropdowns, cards, panels, badges, toggles, buttons. Do NOT use Tailwind, Chakra, or MUI.
- **D3.js v7** — for the force-directed network graph. There is no Microsoft equivalent for this type of visualization. This is the one non-Microsoft dependency and that's fine.

### Data Layer — Live Microsoft Graph API
- **M365 Developer Program tenant** — Sign up at https://developer.microsoft.com/en-us/microsoft-365/dev-program
  - Provides 25 E5 user licenses in a sandbox tenant
  - Full SharePoint Online, Teams, OneDrive, Exchange
  - Full Microsoft Graph API access
  - Sample data packs available (auto-populate users, mail, events, SharePoint content)
- **Set up the tenant with deliberate misconfigurations:**
  - Create 5 departments: "Departement Onderwijs", "Departement Mobiliteit & Openbare Werken", "Agentschap Wegen en Verkeer", "HR & Personeelszaken", "Lokale Besturen"
  - Create SharePoint sites per department with document libraries
  - Create security groups and M365 groups with nested membership
  - Deliberately misconfigure:
    - A "HR Salarisgegevens" (salary data) library shared with "Everyone except external users"
    - A "Strategische Beleidsnota 2026" (strategic policy doc) accessible via nested group that includes an intern group
    - A "Citizen Data - Burgerzaken" site with overly broad permissions
    - A document library where sensitivity labels exist but Copilot indexing isn't restricted

### Graph API Endpoints to Query
```
GET /groups — list all groups
GET /groups/{id}/members — group membership (follow nesting)
GET /groups/{id}/transitiveMembers — flattened membership including nested groups
GET /sites — list SharePoint sites
GET /sites/{siteId}/permissions — site-level permissions
GET /sites/{siteId}/drives — document libraries
GET /drives/{driveId}/items/{itemId}/permissions — item-level permissions
GET /users/{userId}/memberOf — which groups a user belongs to
GET /users/{userId}/transitiveMemberOf — including nested groups
```

### Authentication
- Register an app in Azure AD (Entra ID) of the dev tenant
- Use **MSAL.js v2** (@azure/msal-browser) for authentication
- Request permissions: `Sites.Read.All`, `GroupMember.Read.All`, `User.Read.All`, `Directory.Read.All`
- For the demo: use **application permissions** with admin consent (not delegated) so you don't need to log in at the booth — the app authenticates silently using client credentials
- **CRITICAL:** Store the client secret in an environment variable, NOT in the frontend code. Use a minimal Azure Functions backend to proxy the Graph API calls, or use the client credentials flow from a lightweight backend.
- **Alternative for pure frontend:** Use delegated permissions with MSAL and pre-authenticate before the demo. Store the access token in session storage. Less clean but simpler to build.

### Offline Fallback
- On every successful Graph API call, cache the full response in localStorage
- If the Graph API is unreachable (bad WiFi at the expo), load from cache
- Show a small Fluent UI `MessageBar` at the top: "Offline mode — using cached data from [timestamp]"
- The demo MUST work without internet. Test this.

### Hosting
- **Azure Static Web Apps** (free tier) — deploy via GitHub Actions
- Custom domain optional but nice-to-have
- The Azure Functions backend (for Graph API proxy) can be included in the same Static Web Apps project as a `/api` folder

## Architecture

```
┌──────────────────────────────────────────┐
│           Azure Static Web Apps          │
│                                          │
│  ┌──────────────────┐  ┌──────────────┐ │
│  │  React Frontend  │  │ /api (Azure  │ │
│  │  (Fluent UI +    │──│  Functions)  │ │
│  │   D3.js graph)   │  │  Graph proxy │ │
│  └──────────────────┘  └──────┬───────┘ │
│                               │         │
└───────────────────────────────┼─────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Microsoft Graph API │
                    │  (M365 Dev Tenant)   │
                    └──────────────────────┘
```

## Data Model

The Graph API responses need to be transformed into a graph structure for D3:

```typescript
// Nodes
interface GraphNode {
  id: string;
  type: 'user' | 'group' | 'site' | 'library' | 'document';
  label: string;                    // Display name
  department?: string;              // For users
  role?: string;                    // For the dropdown mapping
  sensitivityLabel?: string;        // None | Internal | Confidential | Highly Confidential
  hasEEEU?: boolean;               // "Everyone except external users" permission
}

// Edges
interface GraphEdge {
  source: string;                   // Node ID
  target: string;                   // Node ID
  type: 'memberOf' | 'permission' | 'nested_group' | 'inherited';
  permissionLevel?: 'read' | 'write' | 'fullControl';
  isAnomaly?: boolean;              // Flagged by anomaly detection
}

// Anomaly
interface Anomaly {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;                    // e.g., "Intern has access to salary data"
  description: string;              // Full explanation
  path: string[];                   // Node IDs showing the permission chain
  recommendation: string;           // Microsoft-specific fix
  microsoftTool: string;            // Which Microsoft product fixes this
}
```

### Anomaly Detection Rules (hardcoded logic, not ML)

1. **Over-broad group permissions:** If a site/library permission includes "Everyone except external users" AND the site contains documents with sensitivity labels >= "Confidential" → Critical
2. **Nested group inheritance exposure:** If a user reaches a sensitive resource through 3+ levels of group nesting → High (because nobody realizes this access exists)
3. **Cross-department access via group nesting:** If a user in "Lokale Besturen" can reach documents in "HR Salarisgegevens" → Critical
4. **Intern/external access to internal strategy docs:** If a user with role containing "stagiair" or "extern" can access anything labeled "Confidential" or above → Critical
5. **Stale permissions:** If a SharePoint site has permissions from groups that include users who've been disabled/deleted in the dev tenant → Medium

### Recommended Fixes (map to real Microsoft products)

Each anomaly recommendation MUST reference a specific Microsoft product:
- **Microsoft Purview Information Protection** — Apply sensitivity labels, restrict Copilot from indexing labeled content
- **SharePoint Advanced Management (SAM)** — Oversharing baseline reports, restricted access control for SharePoint sites
- **Microsoft Entra ID Governance** — Access reviews to clean up stale group memberships
- **Microsoft Purview Data Loss Prevention** — DLP policies to prevent Copilot from surfacing content matching sensitive info types
- **Copilot Studio guardrails** — Custom guardrails for Copilot responses in specific contexts

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
│     with blast animation       │  │ 🔴 CRITICAL       │  │
│                                │  │ Intern → Salary   │  │
│                                │  │ data via nested   │  │
│                                │  │ group inheritance │  │
│                                │  │ Fix: Purview +    │  │
│                                │  │ SAM restriction   │  │
│                                │  ├──────────────────┤  │
│                                │  │ 🟠 HIGH           │  │
│                                │  │ 3-level nesting   │  │
│                                │  │ to policy docs    │  │
│                                │  └──────────────────┘  │
│                                │                        │
│  [Before/After Toggle]         │  [Legend]               │
│  ○ Current  ● Remediated       │  🔵 User  🟢 Group     │
│                                │  🟡 Site  📄 Document  │
└────────────────────────────────┴────────────────────────┘
```

Split: ~65% graph, ~35% panel. The graph is the hero.

### Mobile (fallback — simplified view)

On screens < 768px:
- **Hide the D3 force graph entirely.** It doesn't work on small screens.
- Show a simplified **radial/sunburst diagram** or just the **stats + anomaly list** as the main content
- The anomaly panel becomes the full-width main view
- Stats bar stacks vertically
- Role selector stays at the top
- Add a note: "View on desktop for the full network visualization"

Use Fluent UI's responsive utilities and CSS media queries. The app should not break on mobile — it should gracefully degrade to the anomaly-focused view.

## Visual Design

### Color Scheme (Dark Mode — better for demo impact)

Use Fluent UI's dark theme (`webDarkTheme` from @fluentui/react-components):

```typescript
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

// Wrap your app:
<FluentProvider theme={webDarkTheme}>
  <App />
</FluentProvider>
```

Node colors (for D3, outside Fluent's theme):
- Users: `#60CDFF` (Fluent blue)
- Groups: `#60E0A0` (green)
- Sites: `#FFB340` (amber)
- Document Libraries: `#E0E0E0` (light grey)
- Documents: `#FFFFFF` (white, smaller nodes)
- Anomaly highlight: `#F03030` (red) — edges and node borders when blast fires

### The Blast Animation

When a role is selected:
1. All edges and non-connected nodes fade to 15% opacity (grey out the noise)
2. Starting from the selected user node, edges light up in red in sequence:
   - First: direct group memberships (user → groups) — 0.5s
   - Then: group → site/library permissions — 0.5s
   - Then: inherited/nested access — 0.5s
3. Each newly "reached" node scales up slightly and gets a red border
4. The force simulation gently pushes connected nodes outward to show the spread
5. The anomaly panel populates with a staggered fade-in (100ms delay per item)

Use D3 transitions for this. The animation should feel smooth and dramatic — this is the "wow moment."

### Typography

Fluent UI uses Segoe UI by default (a Microsoft font). Let it. Don't override with Inter or other fonts.

## Project Structure

```
copilot-blast-radius/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Azure Static Web Apps deployment
├── api/
│   └── graphProxy/
│       ├── function.json
│       └── index.ts                # Azure Function to proxy Graph API calls
├── src/
│   ├── components/
│   │   ├── BlastGraph.tsx          # D3 force graph + blast animation
│   │   ├── AnomalyPanel.tsx        # Side panel with anomaly cards
│   │   ├── RoleSelector.tsx        # Dropdown for role selection
│   │   ├── StatsBar.tsx            # Top stats bar
│   │   ├── BeforeAfterToggle.tsx   # Remediation toggle
│   │   ├── MobileView.tsx          # Simplified mobile layout
│   │   └── OfflineBanner.tsx       # Offline mode indicator
│   ├── services/
│   │   ├── graphClient.ts          # Microsoft Graph API client (via /api proxy)
│   │   ├── graphTransformer.ts     # Transform Graph API responses → D3 graph data
│   │   ├── anomalyDetector.ts      # Permission anomaly detection rules
│   │   ├── cacheManager.ts         # localStorage caching for offline fallback
│   │   └── msalConfig.ts           # MSAL authentication configuration
│   ├── data/
│   │   ├── fallbackData.json       # Static fallback if Graph API and cache both fail
│   │   └── remediatedState.json    # Pre-computed "after fix" graph state
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (GraphNode, GraphEdge, Anomaly)
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── staticwebapp.config.json        # Azure SWA routing config
└── README.md
```

## Build Plan (5-day sprint)

### Day 1: Foundation
- Sign up for M365 Developer Program, provision tenant
- Set up Azure AD app registration with Graph API permissions
- Scaffold React + Vite + TypeScript + Fluent UI project
- Create Azure Static Web Apps resource and GitHub Actions deployment
- Verify deployment pipeline works (deploy a "Hello World")

### Day 2: Tenant Setup + Graph Integration
- Create users across 5 Flemish government departments in the dev tenant
- Create SharePoint sites with document libraries per department
- Create security groups with deliberate nested misconfigurations
- Set up overly broad permissions on sensitive sites
- Build the Azure Functions proxy for Graph API
- Build graphClient.ts and verify you can fetch users, groups, sites, permissions
- Build cacheManager.ts for offline fallback

### Day 3: Graph Visualization
- Build graphTransformer.ts to convert Graph API responses into D3 nodes/edges
- Build BlastGraph.tsx with D3 force-directed layout
- Implement node coloring by type
- Implement the blast animation (role selection → edge tracing → node highlighting)
- Get the basic graph rendering and animating correctly

### Day 4: Anomaly Detection + UI Polish
- Build anomalyDetector.ts with the 5 detection rules
- Build AnomalyPanel.tsx with severity cards and recommendations
- Build StatsBar.tsx and RoleSelector.tsx
- Build BeforeAfterToggle.tsx with pre-computed remediated state
- Implement Fluent UI dark theme
- Implement responsive layout (desktop vs mobile)

### Day 5: Testing + Polish
- Test offline mode (disconnect WiFi, verify cache fallback works)
- Test on actual laptop you'll bring to the expo
- Polish animations (timing, easing)
- Polish the anomaly descriptions (make them specific to Flemish government context)
- Write README.md for the GitHub repo
- Final deployment to Azure Static Web Apps
- Practice the 60-second demo walkthrough

## Critical Constraints

1. **Every anomaly recommendation must name a specific Microsoft product.** Never say "fix your permissions" — say "Apply a Purview sensitivity label of 'Confidential' to this library and enable Restricted Access Control via SharePoint Advanced Management."

2. **The Flemish government context must be authentic.** Use real department names (Departement Onderwijs en Vorming, Agentschap Wegen en Verkeer, Departement Mobiliteit en Openbare Werken, HR & Personeelszaken, Lokale Besturen). Use Dutch labels where appropriate.

3. **The demo must work without internet.** Test this. If Graph API fails AND localStorage cache is empty, fall back to fallbackData.json (a static dataset baked into the build).

4. **Do not expose credentials in the frontend.** The Azure Function proxy handles Graph API authentication. The frontend never touches the client secret.

5. **This is NOT a product pitch.** The framing at the booth is: "I applied for the CSAM role. I researched what blocks your customers from activating Copilot — oversharing is the #1 issue. I built this to understand the problem deeply and to show I already know what I'd be helping unblock as a CSAM."

6. **Do not say "Microsoft should build this."** Say "I built this to understand the problem. I'd love to hear how it compares to what you're seeing internally."

## Dependencies to Install

```bash
npm create vite@latest copilot-blast-radius -- --template react-ts
cd copilot-blast-radius
npm install @fluentui/react-components @fluentui/react-icons
npm install d3 @types/d3
npm install @azure/msal-browser @azure/msal-react
npm install @microsoft/microsoft-graph-client
```

For the Azure Functions backend:
```bash
npm install -g azure-functions-core-tools@4
# In the /api directory:
npm install @azure/identity @microsoft/microsoft-graph-client
```

## What Success Looks Like

A Microsoft employee at the booth sees the graph, watches the blast animation fire, reads the anomaly panel, and says: "This is literally the problem our customers have. How did you build this?" Then you explain, hand them the leave-behind PDF, and they either pass you to someone internally or connect on LinkedIn.

The GitHub repo should be clean enough that a Microsoft engineer could clone it and understand it in 10 minutes.
