import React, { Fragment } from 'react';
import { func, string } from 'prop-types';
import { Button } from '@patternfly/react-core';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import AlertModal from '../AlertModal';
import { Role } from '../../types';

function DeleteRoleConfirmationModal({
  role,
  username,
  onCancel,
  onConfirm,
  i18n,
}) {
  const isTeamRole = () => {
    return typeof role.team_id !== 'undefined';
  };

  const title = i18n._(
    t`Remove ${isTeamRole() ? i18n._(t`Team`) : i18n._(t`用户`)} Access`
  );
  return (
    <AlertModal
      variant="danger"
      title={title}
      isOpen
      onClose={onCancel}
      actions={[
        <Button
          key="delete"
          variant="danger"
          aria-label={i18n._(t`Confirm delete`)}
          onClick={onConfirm}
        >
          {i18n._(t`删除`)}
        </Button>,
        <Button key="cancel" variant="secondary" onClick={onCancel}>
          {i18n._(t`取消`)}
        </Button>,
      ]}
    >
      {isTeamRole() ? (
        <Fragment>
          {i18n._(
            t`Are you sure you want to remove ${role.name} access from ${role.team_name}?  Doing so affects all members of the team.`
          )}
          <br />
          <br />
          {i18n._(
            t`If you only want to remove access for this particular user, please remove them from the team.`
          )}
        </Fragment>
      ) : (
        <Fragment>
          {i18n._(
            t`Are you sure you want to remove ${role.name} access from ${username}?`
          )}
        </Fragment>
      )}
    </AlertModal>
  );
}

DeleteRoleConfirmationModal.propTypes = {
  role: Role.isRequired,
  username: string,
  onCancel: func.isRequired,
  onConfirm: func.isRequired,
};

DeleteRoleConfirmationModal.defaultProps = {
  username: '',
};

export default withI18n()(DeleteRoleConfirmationModal);
