import React, { useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Button, Label } from '@patternfly/react-core';
import AlertModal from '../../../components/AlertModal';
import { CardBody, CardActionsRow } from '../../../components/Card';
import DeleteButton from '../../../components/DeleteButton';
import { DetailList, Detail } from '../../../components/DetailList';
import ErrorDetail from '../../../components/ErrorDetail';
import { formatDateString } from '../../../util/dates';
import { UsersAPI } from '../../../api';
import useRequest, { useDismissableError } from '../../../util/useRequest';

function UserDetail({ user, i18n }) {
  const {
    id,
    username,
    email,
    first_name,
    last_name,
    last_login,
    created,
    is_superuser,
    is_system_auditor,
    summary_fields,
  } = user;
  const history = useHistory();

  const { request: deleteUser, isLoading, error: deleteError } = useRequest(
    useCallback(async () => {
      await UsersAPI.destroy(id);
      history.push(`/users`);
    }, [id, history])
  );

  const { error, dismissError } = useDismissableError(deleteError);

  let user_type;
  if (is_superuser) {
    user_type = i18n._(t`系统管理员`);
  } else if (is_system_auditor) {
    user_type = i18n._(t`系统审核员`);
  } else {
    user_type = i18n._(t`普通用户`);
  }

  let userAuthType;
  if (user.ldap_dn) {
    userAuthType = i18n._(t`LDAP`);
  } else if (user.auth.length > 0) {
    userAuthType = i18n._(t`SOCIAL`);
  }

  return (
    <CardBody>
      <DetailList>
        <Detail
          label={i18n._(t`用户名`)}
          value={username}
          dataCy="user-detail-username"
        />
        <Detail label={i18n._(t`邮箱`)} value={email} />
        <Detail label={i18n._(t`姓名`)} value={`${first_name}`} />
        <Detail label={i18n._(t`姓氏`)} value={`${last_name}`} />
        <Detail label={i18n._(t`用户类型`)} value={`${user_type}`} />
        {userAuthType && (
          <Detail
            label={i18n._(t`类型`)}
            value={
              <Label aria-label={i18n._(t`login type`)}>{userAuthType}</Label>
            }
          />
        )}
        {last_login && (
          <Detail
            label={i18n._(t`上次登录时间`)}
            value={formatDateString(last_login)}
          />
        )}
        <Detail label={i18n._(t`已创建`)} value={formatDateString(created)} />
      </DetailList>
      <CardActionsRow>
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.edit && (
            <Button
              aria-label={i18n._(t`edit`)}
              component={Link}
              to={`/users/${id}/edit`}
            >
              {i18n._(t`编辑`)}
            </Button>
          )}
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.delete && (
            <DeleteButton
              name={username}
              modalTitle={i18n._(t`删除 User`)}
              onConfirm={deleteUser}
              isDisabled={isLoading}
            >
              {i18n._(t`删除`)}
            </DeleteButton>
          )}
      </CardActionsRow>
      {error && (
        <AlertModal
          isOpen={error}
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={dismissError}
        >
          {i18n._(t`Failed to delete user.`)}
          <ErrorDetail error={error} />
        </AlertModal>
      )}
    </CardBody>
  );
}

export default withI18n()(UserDetail);
