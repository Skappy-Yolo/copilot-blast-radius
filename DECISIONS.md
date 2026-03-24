# Decision Log — Copilot Blast Radius Simulator

Architectural decisions that shape the codebase are recorded here.

---

## DD-01 | Data Layer: Simulated tenant, not live Graph API

**Status:** Active

**Decision:** All tenant data is hardcoded in `src/data/tenantData.ts`. No live Microsoft Graph API calls.

**Rationale:** Live Graph API integration requires an M365 developer tenant, Azure AD app registration, MSAL authentication, an Azure Functions proxy to protect credentials, token lifecycle management, and an offline fallback. The simulated dataset covers the same misconfigurations that appear in real enterprise tenants and produces identical visualization behaviour. The data structure matches the Graph API response shape precisely, so replacing the static file with a live client is a drop-in change to `graphTransformer.ts`.

**Phase 2:** Add `graphClient.ts` + Azure Functions proxy + MSAL. The transformation pipeline does not change.

---

## DD-02 | No backend

**Status:** Active

**Decision:** No `/api` folder. No Azure Functions. Pure static frontend deployed to Azure Static Web Apps.

**Rationale:** DD-01 removes the only reason for a backend — proxying Graph API calls and protecting credentials. Without live API calls there are no credentials to protect. Static hosting is simpler to deploy and reason about, and `staticwebapp.config.json` only needs SPA routing rules (404 → index.html).

---

## DD-03 | Competitive context: Varonis, Opsin, Bonfy

**Status:** Informational

**Context:** Commercial products exist in this space. Varonis, Opsin, and Bonfy all offer enterprise-grade Copilot permission visibility and remediation tooling. This project is an open-source reference implementation, not a competing product. The architecture prioritises clarity and reproducibility over scale.
