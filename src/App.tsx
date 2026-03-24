import { useState, useCallback, useEffect, useMemo } from 'react';
import { FluentProvider, webDarkTheme, Text } from '@fluentui/react-components';
import { nodes as rawNodes, edges as rawEdges, roles } from './data/tenantData';
import { remediatedNodes, remediatedEdges } from './data/remediatedState';
import { computeBlastRadius } from './services/graphTransformer';
import { detectAnomalies, computeRiskScore } from './services/anomalyDetector';
import type { GraphEdge, GraphNode } from './types';
import BlastGraph from './components/BlastGraph';
import AnomalyPanel from './components/AnomalyPanel';
import RoleSelector from './components/RoleSelector';
import StatsBar from './components/StatsBar';
import BeforeAfterToggle from './components/BeforeAfterToggle';
import MobileView from './components/MobileView';

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

const DEFAULT_STATS = {
  totalFilesAccessible: 0,
  anomalyCount: 0,
  sensitiveFilesExposed: 0,
  eeeUSites: 0,
  riskScore: 0,
};

export default function App() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isRemediated, setIsRemediated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  // Choose active graph data based on remediation toggle
  const activeNodes: GraphNode[] = isRemediated ? remediatedNodes : rawNodes;
  const activeEdges: GraphEdge[] = isRemediated ? remediatedEdges : rawEdges;

  // Derive selected user ID from role
  const selectedUserId = useMemo(() => {
    if (!selectedRoleId) return null;
    return roles.find((r) => r.id === selectedRoleId)?.userId ?? null;
  }, [selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  // Compute blast radius whenever user or graph data changes
  const blastResult = useMemo(() => {
    if (!selectedUserId) return null;
    return computeBlastRadius(selectedUserId, activeNodes, activeEdges);
  }, [selectedUserId, activeNodes, activeEdges]);

  // Detect anomalies
  const anomalies = useMemo(() => {
    if (!selectedUserId || !blastResult) return [];
    return detectAnomalies(
      selectedUserId,
      blastResult.reachableNodeIds,
      blastResult.reachableEdges,
      activeNodes
    );
  }, [selectedUserId, blastResult, activeNodes]);

  // Stats for StatsBar
  const stats = useMemo(() => {
    if (!blastResult) return DEFAULT_STATS;
    const riskScore = computeRiskScore(
      anomalies,
      blastResult.stats.sensitiveFilesExposed,
      blastResult.stats.totalFilesAccessible
    );
    return {
      totalFilesAccessible: blastResult.stats.totalFilesAccessible,
      anomalyCount: anomalies.length,
      sensitiveFilesExposed: blastResult.stats.sensitiveFilesExposed,
      eeeUSites: blastResult.stats.eeeUSites,
      riskScore,
    };
  }, [blastResult, anomalies]);

  const handleRoleSelect = useCallback((roleId: string | null) => {
    setSelectedRoleId(roleId);
    setAcknowledgedIds(new Set()); // Reset acknowledgements when role changes
    if (roleId) {
      setIsAnimating(true);
    }
  }, []);

  const handleDismiss = useCallback((anomalyId: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      const dismissKey = anomalyId + ':dismissed';
      const intentionalKey = anomalyId + ':intentional';
      if (next.has(dismissKey)) {
        next.delete(dismissKey);
      } else {
        next.delete(intentionalKey);
        next.add(dismissKey);
      }
      return next;
    });
  }, []);

  const handleMarkIntentional = useCallback((anomalyId: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      const dismissKey = anomalyId + ':dismissed';
      const intentionalKey = anomalyId + ':intentional';
      if (next.has(intentionalKey)) {
        next.delete(intentionalKey);
      } else {
        next.delete(dismissKey);
        next.add(intentionalKey);
      }
      return next;
    });
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const handleRemediationToggle = useCallback((remediated: boolean) => {
    setIsRemediated(remediated);
    if (selectedRoleId) {
      // Re-run animation for new graph state
      setIsAnimating(true);
    }
  }, [selectedRoleId]);

  // Mobile view
  if (isMobile) {
    return (
      <FluentProvider theme={webDarkTheme}>
        <MobileView
          roles={roles}
          selectedRoleId={selectedRoleId}
          onRoleSelect={handleRoleSelect}
          anomalies={anomalies}
          stats={stats}
        />
      </FluentProvider>
    );
  }

  // Desktop layout
  return (
    <FluentProvider theme={webDarkTheme}>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A1120',
          overflow: 'hidden',
          fontFamily: 'Segoe UI, sans-serif',
        }}
      >
        {/* Stats Bar */}
        <StatsBar
          totalFilesAccessible={stats.totalFilesAccessible}
          anomalyCount={stats.anomalyCount}
          sensitiveFilesExposed={stats.sensitiveFilesExposed}
          eeeUSites={stats.eeeUSites}
          riskScore={stats.riskScore}
          selectedRoleLabel={selectedRole?.label ?? null}
        />

        {/* Main split layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: D3 graph (65%) */}
          <div style={{ flex: '0 0 65%', position: 'relative', padding: 12 }}>
            <BlastGraph
              nodes={activeNodes}
              edges={activeEdges}
              selectedUserId={selectedUserId}
              reachableNodeIds={blastResult?.reachableNodeIds ?? new Set()}
              reachableEdges={blastResult?.reachableEdges ?? []}
              isAnimating={isAnimating}
              onAnimationComplete={handleAnimationComplete}
            />

            {/* Before/After toggle — bottom-left of graph */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 10, width: 240 }}>
              <BeforeAfterToggle
                isRemediated={isRemediated}
                onChange={handleRemediationToggle}
                disabled={!selectedRoleId}
              />
            </div>
          </div>

          {/* Right: control panel (35%) */}
          <div
            style={{
              flex: '0 0 35%',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              background: '#0F172A',
              overflow: 'hidden',
            }}
          >
            {/* Role selector */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
              }}
            >
              <RoleSelector
                roles={roles}
                selectedRoleId={selectedRoleId}
                onRoleSelect={handleRoleSelect}
                disabled={isAnimating}
              />
            </div>

            {/* Context info */}
            {!selectedRoleId && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Text style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, display: 'block' }}>
                  Selecteer een medewerkerrol om te zien welke SharePoint-sites, documentbibliotheken
                  en gevoelige bestanden bereikbaar zijn via Microsoft 365 Copilot — inclusief toegang
                  verkregen via geneste beveiligingsgroepen.
                </Text>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    '⚠ Gemiddeld 802.000 bestanden blootgesteld per tenant',
                    '⚠ #1 Copilot-adoptieblokker: oversharing (Gartner, 2026)',
                    '⚠ Vlaamse overheid: 10.000 Copilot-licenties actief',
                  ].map((fact, i) => (
                    <Text key={i} style={{ fontSize: 10, color: '#64748B' }}>{fact}</Text>
                  ))}
                </div>
              </div>
            )}

            {/* Anomaly panel label */}
            {selectedRoleId && (
              <div
                style={{
                  padding: '10px 20px 6px',
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: '#64748B',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Permissie-anomalieën ({anomalies.length})
                  {isRemediated && (
                    <span style={{ color: '#22C55E', marginLeft: 6 }}>— na remediatie</span>
                  )}
                </Text>
              </div>
            )}

            {/* Anomaly cards */}
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                padding: selectedRoleId ? '4px 16px 16px' : '0',
              }}
            >
              <AnomalyPanel
                anomalies={anomalies}
                isVisible={!!selectedRoleId}
                dismissedIds={acknowledgedIds}
                onDismiss={handleDismiss}
                onMarkIntentional={handleMarkIntentional}
                isRemediated={isRemediated}
              />
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '8px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 9, color: '#475569' }}>
                Gesimuleerde tenant · Microsoft Graph API-schema · Fase 2: live Graph-integratie
              </Text>
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>
  );
}
