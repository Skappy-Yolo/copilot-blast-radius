import {
  Badge,
  Card,
  CardHeader,
  Text,
  Subtitle2,
  Caption1,
  Divider,
  Button,
} from '@fluentui/react-components';
import {
  ShieldErrorFilled,
  WarningFilled,
  InfoFilled,
  ArrowRightFilled,
  CheckmarkCircleFilled,
  DismissCircleFilled,
} from '@fluentui/react-icons';
import type { Anomaly } from '../types';

interface AnomalyPanelProps {
  anomalies: Anomaly[];
  isVisible: boolean;
  dismissedIds: Set<string>;
  onDismiss: (id: string) => void;
  onMarkIntentional: (id: string) => void;
  isRemediated: boolean;
}

const SEVERITY_CONFIG = {
  Critical: {
    color: '#F03030' as const,
    badgeColor: 'danger' as const,
    Icon: ShieldErrorFilled,
    bg: 'rgba(240,48,48,0.08)',
    border: 'rgba(240,48,48,0.25)',
  },
  High: {
    color: '#FFB340' as const,
    badgeColor: 'warning' as const,
    Icon: WarningFilled,
    bg: 'rgba(255,179,64,0.08)',
    border: 'rgba(255,179,64,0.25)',
  },
  Medium: {
    color: '#60CDFF' as const,
    badgeColor: 'informative' as const,
    Icon: InfoFilled,
    bg: 'rgba(96,205,255,0.08)',
    border: 'rgba(96,205,255,0.2)',
  },
};

function PathChain({ path }: { path: string[] }) {
  // Convert node IDs to short readable labels
  const toLabel = (id: string): string => {
    const map: Record<string, string> = {
      'group-all-staff': 'Alle Personeelsleden',
      'group-onderwijs-all': 'Onderwijs Alle',
      'group-onderwijs-stagiairs': 'Onderwijs Stagiairs',
      'group-beleid-algemeen': 'Beleid Algemeen',
      'group-hr-salary': 'HR Salarisverwerking',
      'group-mow-all': 'MOW Alle',
      'group-project-nv2026': 'Project NV2026',
      'lib-hr-salarisgegevens': 'HR Salarisgegevens 2025',
      'lib-burgerzaken': 'Citizen Data',
      'lib-strategische-nota': 'Strategische Nota 2026',
      'doc-salarisgegevens-2025': 'Salarisoverzicht.xlsx',
      'doc-burgerzaken-bsn': 'BurgerData RRN.csv',
      'doc-strategische-nota': 'Beleidsnota 2026.docx',
      'site-burgerzaken': 'Burgerzaken Site',
    };
    if (id in map) return map[id];
    if (id.startsWith('user-')) return id.replace('user-', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (id === '...geneste groepen...') return '… (geneste groepen)';
    if (id === '...') return '…';
    return id.replace(/^(group|lib|site|doc)-/, '').replace(/-/g, ' ');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        marginTop: 6,
        padding: '4px 8px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 4,
      }}
    >
      {path.map((id, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span
            style={{
              fontSize: 10,
              color: '#94A3B8',
              fontFamily: 'Segoe UI, sans-serif',
              fontStyle: id.includes('...') ? 'italic' : 'normal',
            }}
          >
            {toLabel(id)}
          </span>
          {i < path.length - 1 && (
            <ArrowRightFilled style={{ fontSize: 9, color: '#475569' }} />
          )}
        </span>
      ))}
    </div>
  );
}

function AnomalyCard({
  anomaly,
  index,
  isDismissed,
  isIntentional,
  onDismiss,
  onMarkIntentional,
}: {
  anomaly: Anomaly;
  index: number;
  isDismissed: boolean;
  isIntentional: boolean;
  onDismiss: (id: string) => void;
  onMarkIntentional: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[anomaly.severity];
  const { Icon } = config;
  const isAcknowledged = isDismissed || isIntentional;

  return (
    <div
      style={{
        animation: `fadeSlideIn 0.3s ease forwards`,
        animationDelay: `${index * 100}ms`,
        opacity: 0,
      }}
    >
      <Card
        style={{
          background: isAcknowledged ? 'rgba(255,255,255,0.02)' : config.bg,
          border: `1px solid ${isAcknowledged ? 'rgba(255,255,255,0.06)' : config.border}`,
          marginBottom: 10,
          borderRadius: 8,
          padding: '12px 14px',
          transition: 'all 0.2s ease',
        }}
      >
        <CardHeader
          image={
            isAcknowledged
              ? <CheckmarkCircleFilled style={{ color: '#475569', fontSize: 18 }} />
              : <Icon style={{ color: config.color, fontSize: 18 }} />
          }
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {!isAcknowledged && (
                <Badge
                  appearance="filled"
                  color={config.badgeColor}
                  size="small"
                  style={{ fontWeight: 700, letterSpacing: '0.03em' }}
                >
                  {anomaly.severity.toUpperCase()}
                </Badge>
              )}
              {isIntentional && (
                <Badge appearance="tint" color="subtle" size="small">
                  Intentioneel
                </Badge>
              )}
              {isDismissed && !isIntentional && (
                <Badge appearance="tint" color="subtle" size="small">
                  Gesloten
                </Badge>
              )}
              <Subtitle2
                style={{
                  color: isAcknowledged ? '#475569' : '#F1F5F9',
                  fontSize: 12,
                  lineHeight: 1.3,
                }}
              >
                {anomaly.title}
              </Subtitle2>
            </div>
          }
        />

        {!isAcknowledged && (
          <>
            <Text
              style={{
                fontSize: 11,
                color: '#94A3B8',
                lineHeight: 1.5,
                marginTop: 6,
                display: 'block',
              }}
            >
              {anomaly.description}
            </Text>

            <PathChain path={anomaly.path} />

            <Divider style={{ margin: '8px 0', opacity: 0.2 }} />

            <div>
              <Caption1 style={{ color: '#64748B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Aanbeveling
              </Caption1>
              <Text
                style={{
                  fontSize: 11,
                  color: '#CBD5E1',
                  lineHeight: 1.5,
                  marginTop: 3,
                  display: 'block',
                }}
              >
                {anomaly.recommendation}
              </Text>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 6,
                  padding: '3px 8px',
                  background: 'rgba(96,205,255,0.1)',
                  border: '1px solid rgba(96,205,255,0.2)',
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 10, color: '#60CDFF', fontWeight: 600 }}>
                  🛡 {anomaly.microsoftTool}
                </span>
              </div>
            </div>

            {/* Review actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <Button
                size="small"
                appearance="subtle"
                icon={<CheckmarkCircleFilled style={{ color: '#22C55E' }} />}
                onClick={() => onMarkIntentional(anomaly.id)}
                style={{ fontSize: 10, color: '#4ADE80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6 }}
              >
                Intentioneel
              </Button>
              <Button
                size="small"
                appearance="subtle"
                icon={<DismissCircleFilled style={{ color: '#64748B' }} />}
                onClick={() => onDismiss(anomaly.id)}
                style={{ fontSize: 10, color: '#64748B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}
              >
                Sluiten
              </Button>
            </div>
          </>
        )}

        {isAcknowledged && (
          <Button
            size="small"
            appearance="subtle"
            onClick={() => isDismissed ? onDismiss(anomaly.id) : onMarkIntentional(anomaly.id)}
            style={{ fontSize: 10, color: '#475569', marginTop: 4 }}
          >
            Terugdraaien
          </Button>
        )}
      </Card>
    </div>
  );
}

export default function AnomalyPanel({
  anomalies,
  isVisible,
  dismissedIds,
  onDismiss,
  onMarkIntentional,
  isRemediated,
}: AnomalyPanelProps) {
  if (!isVisible) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          textAlign: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <ShieldErrorFilled style={{ fontSize: 40, opacity: 0.3 }} />
        <Text style={{ fontSize: 13, color: '#475569' }}>
          Selecteer een rol om de blast radius te visualiseren en permissie-anomalieën te detecteren.
        </Text>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22C55E',
          textAlign: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 36 }}>✓</span>
        <Text style={{ fontSize: 13, color: '#22C55E' }}>
          Geen permissie-anomalieën gedetecteerd voor deze rol.
        </Text>
      </div>
    );
  }

  // Sort by severity
  const sorted = [...anomalies].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2 };
    return order[a.severity] - order[b.severity];
  });

  const activeCount = sorted.filter((a) => !dismissedIds.has(a.id + ':dismissed') && !dismissedIds.has(a.id + ':intentional')).length;

  return (
    <div
      style={{
        overflowY: 'auto',
        height: '100%',
        paddingRight: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ flex: 1 }}>
        {sorted.map((anomaly, i) => (
          <AnomalyCard
            key={anomaly.id}
            anomaly={anomaly}
            index={i}
            isDismissed={dismissedIds.has(anomaly.id + ':dismissed')}
            isIntentional={dismissedIds.has(anomaly.id + ':intentional')}
            onDismiss={onDismiss}
            onMarkIntentional={onMarkIntentional}
          />
        ))}
      </div>

      {/* Toggle CTA — only shown in "before" state with active anomalies */}
      {!isRemediated && activeCount > 0 && (
        <div
          style={{
            margin: '4px 0 8px',
            padding: '10px 12px',
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 11, color: '#4ADE80', lineHeight: 1.5, display: 'block' }}>
            ↙ Schakel naar <strong>Na remediatie</strong> (linksonder) om te zien hoe de blast radius krimpt na het toepassen van de aanbevolen fixes.
          </Text>
        </div>
      )}
    </div>
  );
}
