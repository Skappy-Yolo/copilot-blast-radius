import {
  Text,
  Title3,
  Subtitle2,
  Badge,
  Card,
  Divider,
} from '@fluentui/react-components';
import {
  ShieldErrorFilled,
  WarningFilled,
  InfoFilled,
  DesktopFilled,
} from '@fluentui/react-icons';
import type { Anomaly, Role } from '../types';
import RoleSelector from './RoleSelector';

interface MobileViewProps {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string | null) => void;
  anomalies: Anomaly[];
  stats: {
    totalFilesAccessible: number;
    anomalyCount: number;
    sensitiveFilesExposed: number;
    eeeUSites: number;
    riskScore: number;
  };
}

const SEVERITY_ICONS = {
  Critical: <ShieldErrorFilled style={{ color: '#F03030', fontSize: 16 }} />,
  High: <WarningFilled style={{ color: '#FFB340', fontSize: 16 }} />,
  Medium: <InfoFilled style={{ color: '#60CDFF', fontSize: 16 }} />,
};

const SEVERITY_BADGE_COLORS = {
  Critical: 'danger' as const,
  High: 'warning' as const,
  Medium: 'informative' as const,
};

export default function MobileView({
  roles,
  selectedRoleId,
  onRoleSelect,
  anomalies,
  stats,
}: MobileViewProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        color: '#F1F5F9',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <Title3 style={{ color: '#60CDFF', display: 'block' }}>
          Copilot Blast Radius
        </Title3>
        <Text style={{ fontSize: 11, color: '#475569' }}>
          M365 Data-exposuresimulator — Vlaamse Overheid
        </Text>
      </div>

      {/* Desktop notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(96,205,255,0.06)',
          border: '1px solid rgba(96,205,255,0.15)',
          borderRadius: 8,
        }}
      >
        <DesktopFilled style={{ color: '#60CDFF', fontSize: 16, flexShrink: 0 }} />
        <Text style={{ fontSize: 11, color: '#94A3B8' }}>
          Bekijk op een desktopscherm voor de volledige netwerkvisualisatie met blast-animatie.
        </Text>
      </div>

      {/* Role selector */}
      <RoleSelector
        roles={roles}
        selectedRoleId={selectedRoleId}
        onRoleSelect={onRoleSelect}
      />

      {/* Stats */}
      {selectedRoleId && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {[
            { label: 'Bestanden bereikbaar', value: stats.totalFilesAccessible, color: stats.totalFilesAccessible > 20 ? '#FFB340' : '#60CDFF' },
            { label: 'Anomalieën', value: stats.anomalyCount, color: stats.anomalyCount >= 3 ? '#F03030' : stats.anomalyCount > 0 ? '#FFB340' : '#60E0A0' },
            { label: 'Gevoelig blootgesteld', value: stats.sensitiveFilesExposed, color: stats.sensitiveFilesExposed > 0 ? '#F03030' : '#60E0A0' },
            { label: 'EEEU-sites', value: stats.eeeUSites, color: stats.eeeUSites > 0 ? '#F03030' : '#60E0A0' },
          ].map((stat) => (
            <Card key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 12px' }}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: stat.color, display: 'block' }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: '#64748B' }}>{stat.label}</Text>
            </Card>
          ))}
        </div>
      )}

      {/* Anomalies */}
      {selectedRoleId && anomalies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Subtitle2 style={{ color: '#94A3B8' }}>Permissie-anomalieën</Subtitle2>
          {[...anomalies]
            .sort((a, b) => ({ Critical: 0, High: 1, Medium: 2 }[a.severity] - ({ Critical: 0, High: 1, Medium: 2 }[b.severity])))
            .map((anomaly) => (
              <Card
                key={anomaly.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {SEVERITY_ICONS[anomaly.severity]}
                  <Badge appearance="filled" color={SEVERITY_BADGE_COLORS[anomaly.severity]} size="small">
                    {anomaly.severity}
                  </Badge>
                </div>
                <Text style={{ fontSize: 12, color: '#F1F5F9', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  {anomaly.title}
                </Text>
                <Text style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5, display: 'block', marginBottom: 6 }}>
                  {anomaly.description}
                </Text>
                <Divider style={{ margin: '6px 0', opacity: 0.2 }} />
                <Text style={{ fontSize: 10, color: '#60CDFF' }}>
                  🛡 {anomaly.microsoftTool}
                </Text>
              </Card>
            ))}
        </div>
      )}

      {selectedRoleId && anomalies.length === 0 && (
        <Card style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', padding: 16, textAlign: 'center' }}>
          <Text style={{ color: '#22C55E', fontSize: 13 }}>✓ Geen anomalieën gedetecteerd</Text>
        </Card>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: 24 }}>
        <Text style={{ fontSize: 9, color: '#334155' }}>
          Gesimuleerde tenant gebaseerd op Microsoft Graph API-schema — Vlaamse overheidscontext
        </Text>
      </div>
    </div>
  );
}
