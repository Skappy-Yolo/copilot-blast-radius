import { Switch, Text, Badge } from '@fluentui/react-components';
import { ShieldCheckmarkFilled, ShieldErrorFilled } from '@fluentui/react-icons';

interface BeforeAfterToggleProps {
  isRemediated: boolean;
  onChange: (remediated: boolean) => void;
  disabled?: boolean;
}

export default function BeforeAfterToggle({
  isRemediated,
  onChange,
  disabled,
}: BeforeAfterToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
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
        Weergave
      </Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Before */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldErrorFilled style={{ color: isRemediated ? '#475569' : '#F03030', fontSize: 14 }} />
          <Text style={{ fontSize: 11, color: isRemediated ? '#475569' : '#F1F5F9', fontWeight: isRemediated ? 400 : 600 }}>
            Huidige situatie
          </Text>
        </div>

        <Switch
          checked={isRemediated}
          onChange={(_ev, data) => onChange(data.checked)}
          disabled={disabled}
          aria-label="Wissel tussen huidige en verholpen situatie"
        />

        {/* After */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheckmarkFilled style={{ color: isRemediated ? '#22C55E' : '#475569', fontSize: 14 }} />
          <Text style={{ fontSize: 11, color: isRemediated ? '#22C55E' : '#475569', fontWeight: isRemediated ? 600 : 400 }}>
            Na remediatie
          </Text>
        </div>
      </div>

      {isRemediated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <Badge appearance="filled" color="success" size="small" style={{ width: 'fit-content' }}>
            Fixes toegepast
          </Badge>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
            {[
              'EEEU verwijderd van salarisbibliotheek',
              'Geneste stagiair-groepslink verbroken',
              'Externe consultant permissies ingetrokken',
              'Burgerzaken beperkt tot Lokale Besturen',
              'Purview-labels toegepast + SAM RAC actief',
            ].map((fix, i) => (
              <Text key={i} style={{ fontSize: 9, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>✓</span> {fix}
              </Text>
            ))}
          </div>
        </div>
      )}

      {!isRemediated && (
        <Text style={{ fontSize: 9, color: '#64748B', lineHeight: 1.4 }}>
          Schakel naar "Na remediatie" om te zien hoe de blast radius krimpt na het toepassen van Purview + SharePoint Advanced Management.
        </Text>
      )}
    </div>
  );
}
