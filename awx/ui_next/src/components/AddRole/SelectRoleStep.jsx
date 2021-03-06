import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import CheckboxCard from './CheckboxCard';
import SelectedList from '../SelectedList';

function RolesStep({
  onRolesClick,
  roles,
  selectedListKey,
  selectedListLabel,
  selectedResourceRows,
  selectedRoleRows,
  i18n,
}) {
  return (
    <Fragment>
      <div>
        {i18n._(
          t`选择要应用于所选资源的角色。 请注意，所有选定的角色将应用于所有选定的资源.`
        )}
      </div>
      <div>
        {selectedResourceRows.length > 0 && (
          <SelectedList
            displayKey={selectedListKey}
            isReadOnly
            label={selectedListLabel || i18n._(t`已选择`)}
            selected={selectedResourceRows}
          />
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px 20px',
          marginTop: '20px',
        }}
      >
        {Object.keys(roles).map(role => (
          <CheckboxCard
            description={roles[role].description}
            itemId={roles[role].id}
            isSelected={selectedRoleRows.some(
              item => item.id === roles[role].id
            )}
            key={roles[role].id}
            name={roles[role].name}
            onSelect={() => onRolesClick(roles[role])}
          />
        ))}
      </div>
    </Fragment>
  );
}

RolesStep.propTypes = {
  onRolesClick: PropTypes.func,
  roles: PropTypes.objectOf(PropTypes.object).isRequired,
  selectedListKey: PropTypes.string,
  selectedListLabel: PropTypes.string,
  selectedResourceRows: PropTypes.arrayOf(PropTypes.object),
  selectedRoleRows: PropTypes.arrayOf(PropTypes.object),
};

RolesStep.defaultProps = {
  onRolesClick: () => {},
  selectedListKey: 'name',
  selectedListLabel: null,
  selectedResourceRows: [],
  selectedRoleRows: [],
};

export default withI18n()(RolesStep);
