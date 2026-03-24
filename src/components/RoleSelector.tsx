import {
  Dropdown,
  Option,
  Label,
  Text,
} from '@fluentui/react-components';
import type { Role } from '../types';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string | null) => void;
  disabled?: boolean;
}

const ROLE_ICONS: Record<string, string> = {
  'role-junior-beleid': '📋',
  'role-it-helpdesk': '🖥',
  'role-dept-hoofd': '🏛',
  'role-externe-consultant': '🔗',
  'role-stagiair': '🎓',
};

export default function RoleSelector({
  roles,
  selectedRoleId,
  onRoleSelect,
  disabled,
}: RoleSelectorProps) {
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label
        htmlFor="role-dropdown"
        style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Simuleer als rol
      </Label>
      <Dropdown
        id="role-dropdown"
        placeholder="Kies een medewerkerrol…"
        value={selectedRole ? `${ROLE_ICONS[selectedRole.id] ?? '👤'} ${selectedRole.label}` : ''}
        onOptionSelect={(_ev, data) => {
          onRoleSelect(data.optionValue ?? null);
        }}
        disabled={disabled}
        style={{ minWidth: 240 }}
      >
        {roles.map((role) => (
          <Option key={role.id} value={role.id} text={role.label}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span>
                {ROLE_ICONS[role.id] ?? '👤'} {role.label}
              </span>
              <Text
                style={{ fontSize: 10, color: '#64748B' }}
              >
                {role.labelEn}
              </Text>
            </div>
          </Option>
        ))}
      </Dropdown>

      {selectedRole && (
        <Text
          style={{
            fontSize: 10,
            color: '#475569',
            marginTop: 2,
          }}
        >
          Simulatie gebaseerd op Microsoft Graph-permissies van deze rol in de tenant.
        </Text>
      )}
    </div>
  );
}
