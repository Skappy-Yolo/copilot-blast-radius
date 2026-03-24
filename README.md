# Copilot Blast Radius Simulator

An interactive visualisation of Microsoft 365 Copilot data exposure risk, built to demonstrate deep understanding of the #1 enterprise Copilot adoption blocker: SharePoint oversharing and misconfigured permissions.

Select a user role. The graph animates outward through their group memberships and inherited permissions, lighting up every file, library, and site that Copilot could surface for that identity. An anomaly panel identifies the specific misconfigurations driving the exposure, maps each one to the Microsoft product that remediates it, and shows — via a before/after toggle — exactly how much the blast radius shrinks once those fixes are applied.

**Live:** [skappy-yolo.github.io/copilot-blast-radius](https://skappy-yolo.github.io/copilot-blast-radius)

---

## Why This Exists

Gartner flagged SharePoint oversharing as the #1 Copilot security risk in March 2026. Most enterprise Copilot deployments stall between weeks 6 and 12 — not because the product doesn't work, but because tenants have years of accumulated permission drift that Copilot makes suddenly and visibly exploitable.

The remediation tooling already exists in Microsoft's stack: Purview Information Protection, SharePoint Advanced Management, and Entra ID Governance. The gap is that most customers with E5 licenses haven't activated the relevant policies. This tool was built to make that gap visible — to show exactly which permission path leads to which exposure, and which Microsoft product closes it.

Key figures that motivated this:
- Gartner VP Dennis Xu: SharePoint oversharing is the #1 Copilot security risk (March 2026)
- 15%+ of business-critical files are at risk in the average M365 tenant (Metomic)
- 67% of enterprise security teams are concerned about AI data exposure (Metomic)
- Europe's largest public-sector Copilot deal: 10,000 licenses, Flemish government, 2026
- Most Copilot deployments stall at weeks 6–12 due to governance and oversharing (2toLead)

---

## What It Shows

**The problem:** Copilot respects existing M365 permissions — it does not introduce new access. But when a tenant has overly broad security groups, deeply nested group inheritance, and "Everyone except external users" on sites containing confidential content, Copilot surfaces that exposure instantly and at scale. A new intern can retrieve classified policy documents without knowing they have access. An external consultant can reach salary data through a four-hop group chain.

**The solution path:** Every anomaly in the panel maps to a specific Microsoft remediation:
- **Microsoft Purview Information Protection** — sensitivity labels that restrict Copilot indexing
- **SharePoint Advanced Management** — oversharing baseline reports, Restricted Access Control
- **Microsoft Entra ID Governance** — access reviews for stale and nested group memberships
- **Microsoft Purview DLP** — prevent Copilot from surfacing sensitive content types

**The before/after:** Toggle to the remediated state to see the blast radius collapse after those policies are applied. The graph contracts. The anomaly count drops. The risk score falls.

---

## Features

- **Force-directed network graph** — 92 nodes (users, groups, SharePoint sites, document libraries, documents), 110+ permission edges
- **Blast animation** — three-wave red edge traversal from selected user node, driven by D3 transitions
- **Role simulation** — 5 roles modelled on a Flemish government tenant: intern, policy officer, IT helpdesk, department head, external consultant
- **Anomaly detection** — 5 detection rules covering EEEU over-permissions, nested group inheritance, cross-department access, and stale permissions
- **Per-anomaly review** — mark each finding as intentional or dismiss it; acknowledgements reset on role change
- **Remediation panel** — each anomaly names the specific Microsoft product that closes the gap
- **Before/after toggle** — switches between misconfigured and post-remediation graph states
- **Mobile fallback** — stats and anomaly list for screens under 768px

---

## Stack

- React 18 + TypeScript
- Fluent UI v9 (`webDarkTheme`) — Microsoft's own design system
- D3.js v7 — force-directed graph and blast animation
- Vite
- Azure Static Web Apps + GitHub Pages

---

## Running Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

```bash
npm run build   # production build to /dist
```

---

## Architecture

The data layer (`src/data/tenantData.ts`) simulates a Flemish government M365 tenant with deliberate misconfigurations representative of what SharePoint Advanced Management oversharing reports surface in production. The data structure matches the Microsoft Graph API response shape — swapping `tenantData.ts` for a live Graph client is a drop-in change to the transformation pipeline in `graphTransformer.ts`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full data model, transformation pipeline, anomaly detection rules, and layout specification.

See [DECISIONS.md](DECISIONS.md) for architectural decisions including why the data layer is simulated and why there is no backend.
