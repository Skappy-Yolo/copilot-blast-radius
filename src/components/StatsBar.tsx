import { Text, Tooltip } from '@fluentui/react-components';
import {
  DocumentFilled,
  ShieldErrorFilled,
  LockClosedFilled,
  PeopleFilled,
  DataBarVerticalFilled,
} from '@fluentui/react-icons';

interface StatsBarProps {
  totalFilesAccessible: number;
  anomalyCount: number;
  sensitiveFilesExposed: number;
  eeeUSites: number;
  riskScore: number;
  selectedRoleLabel: string | null;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tooltip: string;
  highlight?: 'danger' | 'warning' | 'info' | 'normal';
}

const HIGHLIGHT_COLORS = {
  danger: '#F87171',
  warning: '#FFB340',
  info: '#60CDFF',
  normal: '#F1F5F9',
};

function StatItem({ icon, value, label, tooltip, highlight = 'normal' }: StatItemProps) {
  const color = HIGHLIGHT_COLORS[highlight];
  return (
    <Tooltip content={tooltip} relationship="label">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          cursor: 'default',
          minWidth: 0,
        }}
      >
        <span style={{ color, fontSize: 16, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 700,
              color,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Text>
          <Text style={{ fontSize: 10, color: '#64748B', whiteSpace: 'nowrap' }}>{label}</Text>
        </div>
      </div>
    </Tooltip>
  );
}

function RiskScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#F03030' : score >= 40 ? '#FFB340' : '#22C55E';
  const label = score >= 70 ? 'Kritiek' : score >= 40 ? 'Hoog' : 'Laag';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 20px',
        marginLeft: 'auto',
      }}
    >
      {/* Ring gauge */}
      <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
        <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
        <circle
          cx={22}
          cy={22}
          r={18}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 113} 113`}
          transform="rotate(-90 22 22)"
        />
        <text x={22} y={26} textAnchor="middle" fill={color} fontSize={12} fontWeight={700}>
          {score}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <Text style={{ fontSize: 11, color, fontWeight: 700 }}>Risicoscore</Text>
        <Text style={{ fontSize: 10, color: '#64748B' }}>{label} risico</Text>
      </div>
    </div>
  );
}

export default function StatsBar({
  totalFilesAccessible,
  anomalyCount,
  sensitiveFilesExposed,
  eeeUSites,
  riskScore,
  selectedRoleLabel,
}: StatsBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#0F172A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: 64,
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div
        style={{
          padding: '0 20px',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, color: '#60CDFF', whiteSpace: 'nowrap' }}>
          Copilot Blast Radius
        </Text>
        <Text style={{ fontSize: 10, color: '#475569', display: 'block' }}>
          {selectedRoleLabel ? `→ ${selectedRoleLabel}` : 'Selecteer een rol'}
        </Text>
      </div>

      <StatItem
        icon={<DocumentFilled />}
        value={totalFilesAccessible.toLocaleString('nl-BE')}
        label="Bestanden bereikbaar"
        tooltip="Totaal aantal document­bibliotheken en documenten bereikbaar via Copilot voor deze rol"
        highlight={totalFilesAccessible > 20 ? 'warning' : 'normal'}
      />
      <StatItem
        icon={<ShieldErrorFilled />}
        value={anomalyCount}
        label="Anomalieën"
        tooltip="Permissie-anomalieën gedetecteerd: EEEU-toegang, geneste groeps­inheritance, afdelings­overschrijdende toegang"
        highlight={anomalyCount >= 3 ? 'danger' : anomalyCount > 0 ? 'warning' : 'normal'}
      />
      <StatItem
        icon={<LockClosedFilled />}
        value={sensitiveFilesExposed}
        label="Gevoelig blootgesteld"
        tooltip="Bestanden met Purview-label 'Vertrouwelijk' of 'Strikt Vertrouwelijk' die bereikbaar zijn voor deze rol"
        highlight={sensitiveFilesExposed > 0 ? 'danger' : 'normal'}
      />
      <StatItem
        icon={<PeopleFilled />}
        value={eeeUSites}
        label="EEEU-sites"
        tooltip='Sites en bibliotheken met "Iedereen behalve externe gebruikers"-toestemming — toegankelijk voor alle ≈10.000 Vlaamse ambtenaren'
        highlight={eeeUSites > 0 ? 'danger' : 'normal'}
      />
      <StatItem
        icon={<DataBarVerticalFilled />}
        value="2.847"
        label="Totaal tenant-bestanden"
        tooltip="Totale bestandsomvang van de gesimuleerde Vlaamse overheids­tenant (vaste waarde)"
        highlight="normal"
      />

      <RiskScoreBadge score={riskScore} />
    </div>
  );
}
