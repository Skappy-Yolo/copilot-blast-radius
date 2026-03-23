import type { GraphNode, GraphEdge, Anomaly } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// anomalyDetector.ts
// Implements 5 hardcoded detection rules for the simulated tenant.
// Each anomaly names a specific Microsoft product as the fix.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs all anomaly detection rules against the nodes/edges reachable
 * by the given user, and returns matching anomalies.
 */
export function detectAnomalies(
  userId: string,
  reachableNodeIds: Set<string>,
  reachableEdges: GraphEdge[],
  allNodes: GraphNode[]
): Anomaly[] {
  const nodeMap = new Map<string, GraphNode>(allNodes.map((n) => [n.id, n]));
  const anomalies: Anomaly[] = [];
  const userNode = nodeMap.get(userId);
  if (!userNode) return anomalies;

  const isIntern =
    userNode.role?.toLowerCase().includes('stagiair') ||
    userNode.role?.toLowerCase().includes('student') ||
    userNode.label.toLowerCase().includes('stagiair');

  const isExternal =
    userNode.role?.toLowerCase().includes('extern') ||
    userNode.label.toLowerCase().includes('extern');

  // ── RULE 1: EEEU + Confidential content ────────────────────────────────────
  // "Site or library has Everyone-except-external-users permission AND contains
  // documents with sensitivity label >= Confidential" → Critical
  for (const id of reachableNodeIds) {
    const node = nodeMap.get(id);
    if (!node) continue;
    if (
      (node.type === 'library' || node.type === 'site') &&
      node.hasEEEU &&
      (node.sensitivityLabel === 'Confidential' ||
        node.sensitivityLabel === 'Highly Confidential')
    ) {
      anomalies.push({
        id: `anomaly-eeeu-${node.id}`,
        severity: 'Critical',
        title: `EEEU-toegang tot geclassificeerde bibliotheek`,
        description: `"${node.label}" is toegankelijk voor alle personeelsleden via "Iedereen behalve externe gebruikers"-toestemming, maar bevat documenten met gevoeligheidslabel ${node.sensitivityLabel}. Microsoft Copilot indexeert en oppervlakt deze inhoud voor elke gebruiker die een vraag stelt.`,
        path: [userId, 'group-all-staff', node.id],
        recommendation: `Verwijder de EEEU-toestemming van "${node.label}". Pas een Purview-gevoeligheidslabel "Vertrouwelijk" toe en activeer Restricted Access Control via SharePoint Advanced Management om Copilot-indexering te blokkeren.`,
        microsoftTool: 'Microsoft Purview Information Protection + SharePoint Advanced Management',
      });
    }
  }

  // ── RULE 2: Nested group inheritance exposure (3+ levels deep) ─────────────
  // User reaches sensitive resource via 3+ levels of nested group membership
  const nestedGroupEdges = reachableEdges.filter((e) => e.type === 'nested_group');
  if (nestedGroupEdges.length >= 2) {
    // Find sensitive resources reached through the nested chain
    for (const id of reachableNodeIds) {
      const node = nodeMap.get(id);
      if (!node) continue;
      if (
        node.type === 'library' &&
        (node.sensitivityLabel === 'Confidential' ||
          node.sensitivityLabel === 'Highly Confidential') &&
        !node.hasEEEU // Already caught by Rule 1
      ) {
        anomalies.push({
          id: `anomaly-nested-${node.id}`,
          severity: 'High',
          title: `Gevoelige toegang via geneste groepsinheritance`,
          description: `Toegang tot "${node.label}" (${node.sensitivityLabel}) is verkregen via een keten van geneste beveiligingsgroepen. Dit is een veelvoorkomende misconfiguratie bij fusies van organisatie-eenheden en is moeilijk te detecteren zonder tooling.`,
          path: [userId, '...geneste groepen...', node.id],
          recommendation: `Voer een toegangsoverzicht uit via Microsoft Entra ID Governance om overbodige geneste groepsrelaties te identificeren en te verwijderen. Overweeg Conditional Access-beleid voor toegang tot Confidential-gelabelde SharePoint-sites.`,
          microsoftTool: 'Microsoft Entra ID Governance + Microsoft Purview DLP',
        });
        break; // One nested anomaly per user is enough for the demo
      }
    }
  }

  // ── RULE 3: Cross-department access to HR salary data ──────────────────────
  // User NOT in HR department can reach HR salary library
  const userDept = userNode.department ?? '';
  if (
    !userDept.includes('HR') &&
    (reachableNodeIds.has('lib-hr-salarisgegevens') ||
      reachableNodeIds.has('doc-salarisgegevens-2025'))
  ) {
    anomalies.push({
      id: 'anomaly-cross-dept-hr',
      severity: 'Critical',
      title: `Afdelingsoverschrijdende toegang tot salarisdata`,
      description: `${userNode.label} (${userNode.department ?? 'onbekende afdeling'}) heeft leestoegang tot "HR Salarisgegevens 2025" — een bibliotheek met salarisgegevens van alle personeelsleden. Copilot kan deze data oppervlakken als reactie op vragen als "wat verdient mijn manager?".`,
      path: [userId, 'group-all-staff', 'lib-hr-salarisgegevens', 'doc-salarisgegevens-2025'],
      recommendation: `Verwijder de EEEU-groepstoestemming van "HR Salarisgegevens 2025". Beperk toegang tot uitsluitend de groep "HR Salarisverwerking" via SharePoint Advanced Management Restricted Access Control. Pas een Purview-label "Strikt Vertrouwelijk" toe met DLP-beleid dat Copilot-oppervlakking blokkeert.`,
      microsoftTool: 'SharePoint Advanced Management + Microsoft Purview DLP',
    });
  }

  // ── RULE 4: Intern or external accessing Confidential content ──────────────
  if (isIntern || isExternal) {
    const sensitiveAccess: GraphNode[] = [];
    for (const id of reachableNodeIds) {
      const node = nodeMap.get(id);
      if (!node) continue;
      if (
        node.sensitivityLabel === 'Confidential' ||
        node.sensitivityLabel === 'Highly Confidential'
      ) {
        sensitiveAccess.push(node);
      }
    }

    if (sensitiveAccess.length > 0) {
      const examples = sensitiveAccess.slice(0, 2).map((n) => `"${n.label}"`).join(' en ');
      anomalies.push({
        id: `anomaly-intern-sensitive-${userId}`,
        severity: 'Critical',
        title: isIntern
          ? `Stagiair heeft toegang tot vertrouwelijke documenten`
          : `Externe consultant heeft toegang tot vertrouwelijke documenten`,
        description: isIntern
          ? `${userNode.label} (stagiair) heeft via geneste groepsinheritance toegang tot geclassificeerde inhoud, waaronder ${examples}. Een stagiair die Copilot gebruikt kan vertrouwelijke beleidsdocumenten ophalen zonder te weten dat ze toegang hebben.`
          : `${userNode.label} (extern) heeft toegang tot ${sensitiveAccess.length} geclassificeerde resources waaronder ${examples}. Externe gebruikers mogen nooit Confidential-gelabelde inhoud kunnen bereiken.`,
        path: [userId, '...', sensitiveAccess[0]?.id ?? ''],
        recommendation: isIntern
          ? `Verwijder de Onderwijs Stagiairs-groep uit de algemene Onderwijs-groep. Pas een Purview-toegangsbeleid toe dat Confidential-gelabelde inhoud uitsluit van Copilot-indexering voor gebruikers met de rol "Stagiair". Gebruik Microsoft Entra ID Governance voor periodieke toegangsoverzichten.`
          : `Activeer Conditional Access voor externe gebruikers die toegang vragen tot SharePoint. Verwijder de project-naar-MOW geneste groepslink. Pas DLP-beleid toe dat Copilot-antwoorden blokkeert wanneer de bron Confidential of hoger is.`,
        microsoftTool: isIntern
          ? 'Microsoft Entra ID Governance + Microsoft Purview Information Protection'
          : 'Microsoft Purview DLP + Conditional Access',
      });
    }
  }

  // ── RULE 5: Citizen data (BSN/RRN) accessible broadly ──────────────────────
  if (
    reachableNodeIds.has('doc-burgerzaken-bsn') ||
    reachableNodeIds.has('lib-burgerzaken')
  ) {
    const isDeptLocalBesturen = userDept.includes('Lokale Besturen');
    if (!isDeptLocalBesturen) {
      anomalies.push({
        id: 'anomaly-citizen-data',
        severity: 'Critical',
        title: `Burgerdata (RRN) toegankelijk buiten Lokale Besturen`,
        description: `${userNode.label} heeft toegang tot "Citizen Data - Burgerzaken", inclusief een RRN-export van Antwerpse burgers. Dit zijn AVG/GDPR-gevoelige persoonsgegevens. Copilot kan worden gevraagd om namen, adressen of rijksregisternummers op te halen.`,
        path: [userId, 'group-all-staff', 'site-burgerzaken', 'lib-burgerzaken', 'doc-burgerzaken-bsn'],
        recommendation: `Verwijder de EEEU-toestemming van de Burgerzaken-site. Beperk toegang tot uitsluitend de groep "Lokale Besturen" via SharePoint Advanced Management. Pas een Purview-label "Strikt Vertrouwelijk - GDPR" toe en activeer DLP-beleid om Copilot-oppervlakking van persoonsgegevens te voorkomen.`,
        microsoftTool: 'Microsoft Purview DLP + SharePoint Advanced Management',
      });
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return anomalies.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

/**
 * Compute a risk score 0-100 for the stats bar.
 * Based on: anomaly count, critical count, sensitive files exposed.
 */
export function computeRiskScore(
  anomalies: Anomaly[],
  sensitiveFilesExposed: number,
  totalFilesAccessible: number
): number {
  const criticalCount = anomalies.filter((a) => a.severity === 'Critical').length;
  const highCount = anomalies.filter((a) => a.severity === 'High').length;

  const baseScore = Math.min(
    100,
    criticalCount * 20 + highCount * 10 + Math.min(30, sensitiveFilesExposed * 2)
  );

  // Bonus penalty if more than 50% of accessible files are sensitive
  const sensitiveRatio = totalFilesAccessible > 0 ? sensitiveFilesExposed / totalFilesAccessible : 0;
  const penalty = sensitiveRatio > 0.5 ? 10 : 0;

  return Math.min(100, baseScore + penalty);
}
