import type { GraphNode, GraphEdge, Role, TenantData } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Simulated Flemish Government M365 Tenant
// Modeled after a realistic enterprise tenant with deliberate misconfigurations.
// Data structure matches Microsoft Graph API response shape for Phase 2 swap-in.
// ─────────────────────────────────────────────────────────────────────────────

export const nodes: GraphNode[] = [
  // ── USERS ────────────────────────────────────────────────────────────────

  // Departement Onderwijs
  {
    id: 'user-lieven-devos',
    type: 'user',
    label: 'Lieven De Vos',
    department: 'Departement Onderwijs',
    role: 'Departementshoofd Onderwijs',
  },
  {
    id: 'user-sarah-claes',
    type: 'user',
    label: 'Sarah Claes',
    department: 'Departement Onderwijs',
    role: 'Junior Beleidsmedewerker',
  },
  {
    id: 'user-tom-wouters',
    type: 'user',
    label: 'Tom Wouters',
    department: 'Departement Onderwijs',
    role: 'Senior Beleidsmedewerker',
  },
  {
    id: 'user-an-vandenberghe',
    type: 'user',
    label: 'An Vandenberghe',
    department: 'Departement Onderwijs',
    role: 'Nieuwe Stagiair',
  },

  // Departement Mobiliteit & Openbare Werken
  {
    id: 'user-koen-martens',
    type: 'user',
    label: 'Koen Martens',
    department: 'Departement Mobiliteit & Openbare Werken',
    role: 'Departementshoofd MOW',
  },
  {
    id: 'user-ines-de-smedt',
    type: 'user',
    label: 'Ines De Smedt',
    department: 'Departement Mobiliteit & Openbare Werken',
    role: 'Junior Beleidsmedewerker',
  },
  {
    id: 'user-pieter-aerts',
    type: 'user',
    label: 'Pieter Aerts',
    department: 'Departement Mobiliteit & Openbare Werken',
    role: 'Projectingenieur',
  },

  // Agentschap Wegen en Verkeer
  {
    id: 'user-nathalie-bogaert',
    type: 'user',
    label: 'Nathalie Bogaert',
    department: 'Agentschap Wegen en Verkeer',
    role: 'Projectleider AWV',
  },
  {
    id: 'user-bert-hermans',
    type: 'user',
    label: 'Bert Hermans',
    department: 'Agentschap Wegen en Verkeer',
    role: 'IT Helpdesk Medewerker',
  },

  // HR & Personeelszaken
  {
    id: 'user-els-peeters',
    type: 'user',
    label: 'Els Peeters',
    department: 'HR & Personeelszaken',
    role: 'HR Manager',
  },
  {
    id: 'user-marc-leclercq',
    type: 'user',
    label: 'Marc Leclercq',
    department: 'HR & Personeelszaken',
    role: 'Salarisadministrateur',
  },

  // Lokale Besturen
  {
    id: 'user-hilde-janssen',
    type: 'user',
    label: 'Hilde Janssen',
    department: 'Lokale Besturen',
    role: 'Coördinator Lokale Besturen',
  },
  {
    id: 'user-filip-cools',
    type: 'user',
    label: 'Filip Cools',
    department: 'Lokale Besturen',
    role: 'Junior Beleidsmedewerker',
  },

  // External / Special
  {
    id: 'user-externe-consultant',
    type: 'user',
    label: 'Xavier Dubois (Extern)',
    department: 'Extern',
    role: 'Externe Consultant',
  },
  {
    id: 'user-stagiair-nduka',
    type: 'user',
    label: 'Amara Nduka (Stagiair)',
    department: 'Departement Onderwijs',
    role: 'Nieuwe Stagiair',
  },

  // IT
  {
    id: 'user-it-admin',
    type: 'user',
    label: 'Joren Van Acker (IT)',
    department: 'IT',
    role: 'IT Helpdesk Medewerker',
  },

  // ── SECURITY GROUPS ──────────────────────────────────────────────────────

  { id: 'group-all-staff', type: 'group', label: 'Alle Personeelsleden', hasEEEU: true },
  { id: 'group-onderwijs-all', type: 'group', label: 'Departement Onderwijs - Alle medewerkers' },
  { id: 'group-onderwijs-beleid', type: 'group', label: 'Onderwijs Beleidsmedewerkers' },
  { id: 'group-mow-all', type: 'group', label: 'MOW - Alle medewerkers' },
  { id: 'group-awv-all', type: 'group', label: 'AWV - Alle medewerkers' },
  { id: 'group-hr-core', type: 'group', label: 'HR Kernteam' },
  { id: 'group-hr-salary', type: 'group', label: 'HR Salarisverwerking' },
  { id: 'group-lokale-besturen', type: 'group', label: 'Lokale Besturen Team' },
  { id: 'group-stagiairs', type: 'group', label: 'Stagiairs & Jobstudenten' },
  { id: 'group-externen', type: 'group', label: 'Externe Medewerkers' },
  { id: 'group-it-helpdesk', type: 'group', label: 'IT Helpdesk' },
  { id: 'group-management', type: 'group', label: 'Management Team Vlaanderen' },
  // Nested group — the misconfiguration root
  { id: 'group-beleid-algemeen', type: 'group', label: 'Algemeen Beleid Vlaanderen' },
  { id: 'group-onderwijs-stagiairs', type: 'group', label: 'Onderwijs Stagiairs' },
  { id: 'group-project-nv2026', type: 'group', label: 'Project NoodVeiligheid 2026' },

  // ── SHAREPOINT SITES ─────────────────────────────────────────────────────

  {
    id: 'site-intranet',
    type: 'site',
    label: 'Intranet Vlaanderen',
    hasEEEU: true,
    sensitivityLabel: 'Internal',
  },
  {
    id: 'site-onderwijs',
    type: 'site',
    label: 'Departement Onderwijs',
    sensitivityLabel: 'Internal',
  },
  {
    id: 'site-mow',
    type: 'site',
    label: 'Mobiliteit & Openbare Werken',
    sensitivityLabel: 'Internal',
  },
  {
    id: 'site-awv',
    type: 'site',
    label: 'Agentschap Wegen en Verkeer',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'site-hr',
    type: 'site',
    label: 'HR Portaal',
    sensitivityLabel: 'Highly Confidential',
  },
  {
    id: 'site-burgerzaken',
    type: 'site',
    label: 'Burgerzaken & Citizen Data',
    hasEEEU: true,
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'site-lokale-besturen',
    type: 'site',
    label: 'Lokale Besturen',
    sensitivityLabel: 'Internal',
  },
  {
    id: 'site-strategisch-beleid',
    type: 'site',
    label: 'Strategisch Beleid Vlaanderen',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'site-it',
    type: 'site',
    label: 'IT Portaal',
    sensitivityLabel: 'Internal',
  },

  // ── DOCUMENT LIBRARIES ───────────────────────────────────────────────────

  {
    id: 'lib-onderwijs-beleid',
    type: 'library',
    label: 'Beleidsdocumenten Onderwijs',
    department: 'Departement Onderwijs',
    sensitivityLabel: 'Internal',
  },
  {
    id: 'lib-onderwijs-projecten',
    type: 'library',
    label: 'Onderwijsprojecten 2025-2026',
    department: 'Departement Onderwijs',
    sensitivityLabel: 'Internal',
  },
  {
    id: 'lib-hr-personeelsdata',
    type: 'library',
    label: 'Personeelsdata & Dossiers',
    department: 'HR & Personeelszaken',
    sensitivityLabel: 'Highly Confidential',
  },
  {
    id: 'lib-hr-salarisgegevens',
    type: 'library',
    label: 'HR Salarisgegevens 2025',
    department: 'HR & Personeelszaken',
    sensitivityLabel: 'Highly Confidential',
    hasEEEU: true, // ← THE CRITICAL MISCONFIGURATION
  },
  {
    id: 'lib-awv-infrastructuur',
    type: 'library',
    label: 'AWV Infrastructuurplannen',
    department: 'Agentschap Wegen en Verkeer',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'lib-burgerzaken',
    type: 'library',
    label: 'Citizen Data - Burgerzaken',
    department: 'Lokale Besturen',
    sensitivityLabel: 'Confidential',
    hasEEEU: true,
  },
  {
    id: 'lib-strategische-nota',
    type: 'library',
    label: 'Strategische Beleidsnota 2026',
    department: 'Strategisch Beleid',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'lib-mow-contracten',
    type: 'library',
    label: 'MOW Aannemerscontracten',
    department: 'Departement Mobiliteit & Openbare Werken',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'lib-it-beheer',
    type: 'library',
    label: 'IT Systeembeheer',
    department: 'IT',
    sensitivityLabel: 'Internal',
  },

  // ── DOCUMENTS (selected high-risk examples) ──────────────────────────────

  {
    id: 'doc-salarisgegevens-2025',
    type: 'document',
    label: 'Salarisoverzicht_alle_personeelsleden_2025.xlsx',
    department: 'HR & Personeelszaken',
    sensitivityLabel: 'Highly Confidential',
  },
  {
    id: 'doc-ontslagprocedures',
    type: 'document',
    label: 'Ontslagprocedures_vertrouwelijk_2025.docx',
    department: 'HR & Personeelszaken',
    sensitivityLabel: 'Highly Confidential',
  },
  {
    id: 'doc-strategische-nota',
    type: 'document',
    label: 'Strategische_Beleidsnota_Vlaanderen_2026.docx',
    department: 'Strategisch Beleid',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'doc-awv-raamcontract',
    type: 'document',
    label: 'AWV_Raamcontract_Wegenbouw_2025_2030.pdf',
    department: 'Agentschap Wegen en Verkeer',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'doc-burgerzaken-bsn',
    type: 'document',
    label: 'BurgerData_RRN_Export_Antwerpen_2025.csv',
    department: 'Lokale Besturen',
    sensitivityLabel: 'Highly Confidential',
  },
  {
    id: 'doc-mow-begroting',
    type: 'document',
    label: 'MOW_Begroting_Infraprojecten_2026.xlsx',
    department: 'Departement Mobiliteit & Openbare Werken',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'doc-onderwijs-leerlingendata',
    type: 'document',
    label: 'Leerlingendata_Analyse_2024_2025.xlsx',
    department: 'Departement Onderwijs',
    sensitivityLabel: 'Confidential',
  },
  {
    id: 'doc-it-wachtwoorden',
    type: 'document',
    label: 'Systeembeheer_Toegangsgegevens_Intern.docx',
    department: 'IT',
    sensitivityLabel: 'Confidential',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDGES
// ─────────────────────────────────────────────────────────────────────────────

export const edges: GraphEdge[] = [
  // ── USER → GROUP memberships ──────────────────────────────────────────────

  // All staff in top-level group (EEEU equivalent)
  { source: 'user-sarah-claes', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-tom-wouters', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-an-vandenberghe', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-lieven-devos', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-koen-martens', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-ines-de-smedt', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-pieter-aerts', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-nathalie-bogaert', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-bert-hermans', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-els-peeters', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-marc-leclercq', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-hilde-janssen', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-filip-cools', target: 'group-all-staff', type: 'memberOf' },
  { source: 'user-it-admin', target: 'group-all-staff', type: 'memberOf' },

  // Stagiair memberships
  { source: 'user-an-vandenberghe', target: 'group-stagiairs', type: 'memberOf' },
  { source: 'user-stagiair-nduka', target: 'group-stagiairs', type: 'memberOf' },
  { source: 'user-an-vandenberghe', target: 'group-onderwijs-stagiairs', type: 'memberOf' },
  { source: 'user-stagiair-nduka', target: 'group-onderwijs-stagiairs', type: 'memberOf' },

  // Extern
  { source: 'user-externe-consultant', target: 'group-externen', type: 'memberOf' },
  { source: 'user-externe-consultant', target: 'group-project-nv2026', type: 'memberOf' },

  // Onderwijs
  { source: 'user-sarah-claes', target: 'group-onderwijs-all', type: 'memberOf' },
  { source: 'user-tom-wouters', target: 'group-onderwijs-all', type: 'memberOf' },
  { source: 'user-an-vandenberghe', target: 'group-onderwijs-all', type: 'memberOf' },
  { source: 'user-lieven-devos', target: 'group-onderwijs-all', type: 'memberOf' },
  { source: 'user-sarah-claes', target: 'group-onderwijs-beleid', type: 'memberOf' },
  { source: 'user-tom-wouters', target: 'group-onderwijs-beleid', type: 'memberOf' },
  { source: 'user-lieven-devos', target: 'group-onderwijs-beleid', type: 'memberOf' },
  { source: 'user-lieven-devos', target: 'group-management', type: 'memberOf' },

  // MOW
  { source: 'user-koen-martens', target: 'group-mow-all', type: 'memberOf' },
  { source: 'user-ines-de-smedt', target: 'group-mow-all', type: 'memberOf' },
  { source: 'user-pieter-aerts', target: 'group-mow-all', type: 'memberOf' },
  { source: 'user-koen-martens', target: 'group-management', type: 'memberOf' },

  // AWV
  { source: 'user-nathalie-bogaert', target: 'group-awv-all', type: 'memberOf' },
  { source: 'user-bert-hermans', target: 'group-awv-all', type: 'memberOf' },
  { source: 'user-bert-hermans', target: 'group-it-helpdesk', type: 'memberOf' },
  { source: 'user-it-admin', target: 'group-it-helpdesk', type: 'memberOf' },

  // HR
  { source: 'user-els-peeters', target: 'group-hr-core', type: 'memberOf' },
  { source: 'user-marc-leclercq', target: 'group-hr-core', type: 'memberOf' },
  { source: 'user-marc-leclercq', target: 'group-hr-salary', type: 'memberOf' },
  { source: 'user-els-peeters', target: 'group-hr-salary', type: 'memberOf' },

  // Lokale Besturen
  { source: 'user-hilde-janssen', target: 'group-lokale-besturen', type: 'memberOf' },
  { source: 'user-filip-cools', target: 'group-lokale-besturen', type: 'memberOf' },

  // ── NESTED GROUP memberships (the dangerous part) ─────────────────────────

  // group-onderwijs-stagiairs is nested inside group-onderwijs-all
  // This means interns inherit access to everything Onderwijs-all can reach
  {
    source: 'group-onderwijs-stagiairs',
    target: 'group-onderwijs-all',
    type: 'nested_group',
    isAnomaly: true,
  },
  // group-onderwijs-all is nested inside group-beleid-algemeen
  // Beleid Algemeen has access to the strategische nota
  {
    source: 'group-onderwijs-all',
    target: 'group-beleid-algemeen',
    type: 'nested_group',
    isAnomaly: true,
  },
  // group-all-staff is nested inside group-beleid-algemeen (EEEU path to Confidential docs)
  {
    source: 'group-all-staff',
    target: 'group-beleid-algemeen',
    type: 'nested_group',
    isAnomaly: true,
  },
  // Project group contains externals who get MOW contract access
  {
    source: 'group-project-nv2026',
    target: 'group-mow-all',
    type: 'nested_group',
    isAnomaly: true,
  },
  // IT helpdesk nested into all-staff for "convenience"
  {
    source: 'group-it-helpdesk',
    target: 'group-all-staff',
    type: 'nested_group',
    isAnomaly: false,
  },

  // ── GROUP → SITE/LIBRARY permissions ─────────────────────────────────────

  // All staff → Intranet (EEEU)
  {
    source: 'group-all-staff',
    target: 'site-intranet',
    type: 'permission',
    permissionLevel: 'read',
  },
  // HR salary — EEEU permission (THE CRITICAL BUG: Everyone can reach salary data)
  {
    source: 'group-all-staff',
    target: 'lib-hr-salarisgegevens',
    type: 'permission',
    permissionLevel: 'read',
    isAnomaly: true,
  },
  // HR core → HR site
  {
    source: 'group-hr-core',
    target: 'site-hr',
    type: 'permission',
    permissionLevel: 'write',
  },
  {
    source: 'group-hr-salary',
    target: 'lib-hr-salarisgegevens',
    type: 'permission',
    permissionLevel: 'fullControl',
  },
  {
    source: 'group-hr-core',
    target: 'lib-hr-personeelsdata',
    type: 'permission',
    permissionLevel: 'fullControl',
  },
  // Onderwijs → Onderwijs site
  {
    source: 'group-onderwijs-all',
    target: 'site-onderwijs',
    type: 'permission',
    permissionLevel: 'read',
  },
  {
    source: 'group-onderwijs-beleid',
    target: 'lib-onderwijs-beleid',
    type: 'permission',
    permissionLevel: 'write',
  },
  {
    source: 'group-onderwijs-all',
    target: 'lib-onderwijs-projecten',
    type: 'permission',
    permissionLevel: 'read',
  },
  // Beleid Algemeen → Strategische Nota (via nested group chain this reaches interns)
  {
    source: 'group-beleid-algemeen',
    target: 'lib-strategische-nota',
    type: 'permission',
    permissionLevel: 'read',
    isAnomaly: true,
  },
  {
    source: 'group-management',
    target: 'site-strategisch-beleid',
    type: 'permission',
    permissionLevel: 'read',
  },
  // MOW
  {
    source: 'group-mow-all',
    target: 'site-mow',
    type: 'permission',
    permissionLevel: 'read',
  },
  {
    source: 'group-mow-all',
    target: 'lib-mow-contracten',
    type: 'permission',
    permissionLevel: 'read',
    isAnomaly: true, // externals via nested group reach this
  },
  // AWV
  {
    source: 'group-awv-all',
    target: 'site-awv',
    type: 'permission',
    permissionLevel: 'read',
  },
  {
    source: 'group-awv-all',
    target: 'lib-awv-infrastructuur',
    type: 'permission',
    permissionLevel: 'read',
  },
  // Burgerzaken — EEEU access (citizen data exposed broadly)
  {
    source: 'group-all-staff',
    target: 'site-burgerzaken',
    type: 'permission',
    permissionLevel: 'read',
    isAnomaly: true,
  },
  {
    source: 'group-lokale-besturen',
    target: 'lib-burgerzaken',
    type: 'permission',
    permissionLevel: 'write',
  },
  {
    source: 'group-all-staff',
    target: 'lib-burgerzaken',
    type: 'permission',
    permissionLevel: 'read',
    isAnomaly: true,
  },
  // Lokale Besturen
  {
    source: 'group-lokale-besturen',
    target: 'site-lokale-besturen',
    type: 'permission',
    permissionLevel: 'read',
  },
  // IT Helpdesk → IT site + broad read on all sites for "support"
  {
    source: 'group-it-helpdesk',
    target: 'site-it',
    type: 'permission',
    permissionLevel: 'fullControl',
  },
  {
    source: 'group-it-helpdesk',
    target: 'lib-it-beheer',
    type: 'permission',
    permissionLevel: 'fullControl',
  },

  // ── LIBRARY → DOCUMENT (containment edges) ───────────────────────────────

  {
    source: 'lib-hr-salarisgegevens',
    target: 'doc-salarisgegevens-2025',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-hr-personeelsdata',
    target: 'doc-ontslagprocedures',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-strategische-nota',
    target: 'doc-strategische-nota',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-awv-infrastructuur',
    target: 'doc-awv-raamcontract',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-burgerzaken',
    target: 'doc-burgerzaken-bsn',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-mow-contracten',
    target: 'doc-mow-begroting',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-onderwijs-beleid',
    target: 'doc-onderwijs-leerlingendata',
    type: 'inherited',
    permissionLevel: 'read',
  },
  {
    source: 'lib-it-beheer',
    target: 'doc-it-wachtwoorden',
    type: 'inherited',
    permissionLevel: 'read',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROLES (dropdown options)
// ─────────────────────────────────────────────────────────────────────────────

export const roles: Role[] = [
  {
    id: 'role-junior-beleid',
    label: 'Junior Beleidsmedewerker',
    labelEn: 'Junior Policy Officer',
    userId: 'user-sarah-claes',
  },
  {
    id: 'role-it-helpdesk',
    label: 'IT Helpdesk Medewerker',
    labelEn: 'IT Helpdesk Staff',
    userId: 'user-bert-hermans',
  },
  {
    id: 'role-dept-hoofd',
    label: 'Departementshoofd Onderwijs',
    labelEn: 'Education Department Head',
    userId: 'user-lieven-devos',
  },
  {
    id: 'role-externe-consultant',
    label: 'Externe Consultant',
    labelEn: 'External Consultant',
    userId: 'user-externe-consultant',
  },
  {
    id: 'role-stagiair',
    label: 'Nieuwe Stagiair',
    labelEn: 'New Intern',
    userId: 'user-stagiair-nduka',
  },
];

const tenantData: TenantData = { nodes, edges, roles };
export default tenantData;
