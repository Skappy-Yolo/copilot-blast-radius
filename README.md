# Copilot Blast Radius Simulator

An interactive web app that visualises the data exposure risk introduced when Microsoft 365 Copilot is enabled on an enterprise tenant with misconfigured SharePoint and Azure AD permissions.

Select a user role. The graph animates outward through their group memberships and inherited permissions, showing every file, library, and site that Copilot could surface for that user. An anomaly panel identifies the specific misconfigurations driving the exposure and maps each one to the Microsoft product that remediates it.

**Live:** [Azure Static Web Apps deployment](#) *(link updates after first deployment)*

---

## The Problem

Copilot respects existing M365 permissions — it does not introduce new access. But most enterprise tenants have years of accumulated permission drift: overly broad security groups, deeply nested group inheritance reaching sensitive libraries, and "Everyone except external users" applied to sites containing confidential content. Copilot makes that existing exposure immediately visible to end users in a way that passive file access did not.

Key figures:
- Gartner flagged SharePoint oversharing as the #1 Copilot security risk (March 2026)
- 15%+ of business-critical files are at risk in the average M365 tenant (Metomic)
- 67% of enterprise security teams are concerned about AI data exposure (Metomic)
- Most Copilot deployments stall at weeks 6–12 due to governance and oversharing issues (2toLead)

---

## Features

- **Force-directed network graph** — 92 nodes (users, groups, SharePoint sites, document libraries, documents), 110+ permission edges
- **Blast animation** — three-wave red edge traversal from selected user, driven by D3 transitions
- **Anomaly detection** — 5 rules detecting critical misconfigurations with severity scores and permission path traces
- **Remediation panel** — each anomaly maps to a specific Microsoft product (Purview, SharePoint Advanced Management, Entra ID Governance)
- **Before/After toggle** — switches between current misconfigured state and post-remediation graph
- **Mobile fallback** — stats + anomaly list on screens < 768px

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

The dataset simulates a Flemish government M365 tenant with deliberate misconfigurations representative of what Microsoft's SharePoint Advanced Management oversharing reports surface in production. The data structure matches the Microsoft Graph API response shape — replacing `src/data/tenantData.ts` with a live Graph client is a drop-in change to the transformation pipeline.
