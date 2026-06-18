# Copilot Blast Radius Simulator

Shows what files Microsoft 365 Copilot can surface for a given user when SharePoint and Azure AD permissions are misconfigured.

Select a user role. The graph animates outward through their group memberships and inherited permissions, showing every file, library, and site Copilot could surface for that user. An anomaly panel identifies the specific misconfigurations driving the exposure and maps each one to the Microsoft product that remediates it.

**Live:** https://skappy-yolo.github.io/copilot-blast-radius/

---

## The Problem

Copilot respects existing M365 permissions. It does not introduce new access. But most enterprise tenants have permission drift built up over years: overly broad security groups, deeply nested group inheritance reaching sensitive libraries, and "Everyone except external users" applied to sites containing confidential content. Passive file access hid that exposure. Copilot surfaces it.

Key figures:
- Gartner flagged SharePoint oversharing as the #1 Copilot security risk (March 2026)
- 15%+ of business-critical files are at risk in the average M365 tenant (Metomic)
- 67% of enterprise security teams are concerned about AI data exposure (Metomic)
- Most Copilot deployments stall at weeks 6–12 due to governance and oversharing issues (2toLead)

---

## Features

- **Force-directed network graph:** 92 nodes (users, groups, SharePoint sites, document libraries, documents) with 110+ permission edges
- **Blast animation:** three-wave red edge traversal from the selected user, driven by D3 transitions
- **Anomaly detection:** 5 rules identifying critical misconfigurations with severity scores and permission path traces
- **Remediation panel** maps each anomaly to a specific Microsoft product (Purview, SharePoint Advanced Management, Entra ID Governance)
- **Before/After toggle:** switches between the current misconfigured state and the post-remediation graph
- **Mobile fallback:** stats and anomaly list on screens narrower than 768px

---

## Stack

- React 18 + TypeScript
- Fluent UI v9 (`webDarkTheme`)
- D3.js v7
- Vite
- Azure Static Web Apps

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

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full data model, transformation pipeline, anomaly detection rules, and layout specification.

See [DECISIONS.md](DECISIONS.md) for architectural decisions including why the data layer is simulated and why there is no backend.

---

## Simulated Data

The dataset simulates a Flemish government M365 tenant with deliberate misconfigurations representative of what Microsoft's SharePoint Advanced Management oversharing reports surface in production. The data structure matches the Microsoft Graph API response shape. Replacing `src/data/tenantData.ts` with a live Graph client is a drop-in change to the transformation pipeline.
