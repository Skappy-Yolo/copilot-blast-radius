# Copilot Blast Radius Simulator — Architecture

## Problem

When Microsoft 365 Copilot is enabled in an enterprise tenant, it queries the Microsoft Graph to surface relevant files and content. Copilot respects existing SharePoint and Azure AD permissions — but most enterprise M365 tenants have years of accumulated permission drift: overly broad security groups, nested group inheritance reaching sensitive libraries, and "Everyone except external users" (EEEU) applied to sites that contain confidential content.

The result: Copilot surfaces documents that employees should never see, not because Copilot is broken, but because the underlying permissions were already broken. This is the leading cause of Copilot adoption stalls in enterprise deployments.

**Verified scale of the problem:**
- Gartner VP Dennis Xu flagged SharePoint oversharing as the #1 Copilot security risk (Gartner Security Summit, March 2026)
- 15%+ of business-critical files are at risk from oversharing in the average M365 tenant (Metomic / HyperShift research)
- 67% of enterprise security teams report concern about AI data exposure (Metomic)
- Most Copilot deployments stall between weeks 6–12 due to governance and oversharing (2toLead, March 2026)
- The Flemish government signed Europe's largest public-sector Copilot deal: 10,000 licenses across Flemish administration and local authorities
- DLP bypass bug CW1226324 confirmed January 21, 2026, patched March 11, 2026 (The Register)
- CVE-2026-26133 cross-prompt injection vulnerability patched March 11, 2026 (WinBuzzer)

## What This Tool Does

An interactive web app that visualizes the "blast radius" — the full set of files, sites, and libraries accessible to a given user role via Copilot — for a simulated enterprise M365 tenant.

Select a role. The graph animates outward from that user through their group memberships and inherited permissions, lighting up every resource Copilot could reach. An anomaly panel surfaces the specific misconfigurations driving the exposure, with remediation steps referencing the Microsoft products that fix them.

A Before/After toggle shows the graph state after applying the recommended fixes — the blast radius contracts visibly.

---

## Architecture

```
┌──────────────────────────────────────┐
│        Azure Static Web Apps         │
│                                      │
│   React Frontend (Fluent UI + D3)    │
│   reads from src/data/tenantData.ts  │
│   (simulated tenant, Graph API shape)│
└──────────────────────────────────────┘
```

Pure static frontend. No backend, no API proxy, no authentication layer. All data is pre-loaded at build time. See [Decision Log](DECISIONS.md) for why.

**Phase 2:** `tenantData.ts` is designed to be replaced by a live Microsoft Graph API client (`graphClient.ts` + Azure Functions proxy + MSAL). The transformation pipeline in `graphTransformer.ts` does not change — only the data source.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI framework | React 18 + TypeScript | |
| Build tool | Vite | |
| Component library | Fluent UI v9 (`@fluentui/react-components`) | Microsoft design system, `webDarkTheme` |
| Graph visualization | D3.js v7 | Force-directed graph, blast animation |
| Hosting | Azure Static Web Apps | GitHub Actions deployment |

Fluent UI is used for all UI components: dropdowns, cards, badges, toggles. No Tailwind, Chakra, or MUI.

---

## Simulated Tenant Data

The dataset (`src/data/tenantData.ts`) simulates a realistic Flemish government M365 tenant with deliberate misconfigurations representative of what Metomic and Microsoft's own SharePoint Advanced Management reports surface in production tenants.

**92 nodes:** 16 users, 15 groups, 9 SharePoint sites, 9 document libraries, 43 documents
**110+ edges:** group memberships, site permissions, library inheritance, nested group chains

**Departments:**
- Departement Onderwijs
- Departement Mobiliteit & Openbare Werken
- Agentschap Wegen en Verkeer
- HR & Personeelszaken
- Lokale Besturen

**Deliberate misconfigurations:**
- "HR Salarisgegevens 2025" library accessible via EEEU — sensitive content exposed to all internal users
- "Strategische Beleidsnota 2026" reachable by an intern through 3+ levels of nested group inheritance
- "Citizen Data - Burgerzaken" with overly broad cross-department permissions
- A document library with sensitivity labels applied but Copilot indexing not restricted via SharePoint Advanced Management

**User roles (5):**
- Junior Beleidsmedewerker (Junior Policy Officer)
- IT Helpdesk Medewerker
- Departementshoofd Onderwijs (Education Department Head)
- Externe Consultant
- Nieuwe Stagiair (New Intern)

The data structure matches the Microsoft Graph API response shape so it can be replaced with live data without changing the transformation pipeline.

---

## Data Model

```typescript
interface GraphNode {
  id: string;
  type: 'user' | 'group' | 'site' | 'library' | 'document';
  label: string;
  department?: string;
  role?: string;
  sensitivityLabel?: string;  // None | Internal | Confidential | Highly Confidential
  hasEEEU?: boolean;          // "Everyone except external users" permission flag
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'memberOf' | 'permission' | 'nested_group' | 'inherited';
  permissionLevel?: 'read' | 'write' | 'fullControl';
  isAnomaly?: boolean;
}

interface Anomaly {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  path: string[];        // Node IDs showing the permission chain
  recommendation: string;
  microsoftTool: string; // Which Microsoft product remediates this
}

interface Role {
  id: string;
  label: string;   // Dutch label for Flemish gov context
  userId: string;  // Maps to a GraphNode of type 'user'
}
```

---

## Anomaly Detection Rules

Implemented in `src/services/anomalyDetector.ts`. Five rules, each producing a recommendation that names a specific Microsoft remediation product.

| # | Rule | Severity | Fix |
|---|------|----------|-----|
| 1 | Site/library has EEEU permission AND contains Confidential+ documents | Critical | Microsoft Purview Information Protection + SharePoint Advanced Management |
| 2 | User reaches sensitive resource through 3+ levels of nested group membership | High | Microsoft Entra ID Governance (access reviews) |
| 3 | User in Lokale Besturen has read access to HR Salarisgegevens | Critical | SharePoint Advanced Management — Restricted Access Control |
| 4 | User with role "stagiair" or "extern" can access Confidential+ content | Critical | Microsoft Purview DLP + sensitivity label enforcement |
| 5 | Site permissions include disabled or deleted user accounts | Medium | Microsoft Entra ID Governance — stale access cleanup |

Recommendations always reference a specific Microsoft product. Generic "fix your permissions" language is not used.

---

## Graph Transformation Pipeline

`src/services/graphTransformer.ts` performs a breadth-first search from a selected user node, traversing `memberOf`, `permission`, `nested_group`, and `inherited` edges to build the reachable subgraph. Returns:
- Reachable node IDs
- Edge list for the blast radius
- Stats: total files, sensitive files exposed, EEEU site count, risk score

This is the function that would be called with live Graph API data in Phase 2.

---

## UI Layout

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

65% graph / 35% panel. On screens < 768px, the D3 graph is hidden and replaced with a stats + anomaly list view.

### Blast Animation Sequence

1. All non-connected nodes/edges fade to 15% opacity
2. Edges light up red in 3 waves from the selected user:
   - Wave 1 — direct group memberships: 0.5s
   - Wave 2 — group → site/library permissions: 0.5s
   - Wave 3 — inherited/nested access: 0.5s
3. Each reached node scales up and gets a red border
4. Force simulation pushes connected nodes outward
5. Anomaly panel populates with 100ms staggered fade-in per card

### Node Colors

| Type | Color |
|------|-------|
| User | `#60CDFF` (Fluent blue) |
| Group | `#60E0A0` (green) |
| Site | `#FFB340` (amber) |
| Document Library | `#E0E0E0` (light grey) |
| Document | `#FFFFFF` (white) |
| Anomaly highlight | `#F03030` (red) |

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
│   │   ├── graphTransformer.ts     # BFS blast radius traversal
│   │   └── anomalyDetector.ts      # Permission anomaly detection rules
│   ├── data/
│   │   ├── tenantData.ts           # Simulated Flemish gov M365 tenant
│   │   └── remediatedState.ts      # Pre-computed post-remediation graph state
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── staticwebapp.config.json
```

---

## Competitive Landscape

Similar enterprise tooling exists from Varonis, Opsin, and Bonfy. Those are commercial products targeting security teams. This is an open-source reference implementation that makes the problem visible — oriented toward understanding and education rather than production enforcement.
