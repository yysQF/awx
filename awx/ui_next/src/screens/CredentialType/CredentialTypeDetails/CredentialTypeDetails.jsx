import React, { useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Link, useHistory } from 'react-router-dom';
import { Button } from '@patternfly/react-core';

import { VariablesDetail } from '../../../components/CodeMirrorInput';
import AlertModal from '../../../components/AlertModal';
import { CardBody, CardActionsRow } from '../../../components/Card';
import DeleteButton from '../../../components/DeleteButton';
import {
  Detail,
  DetailList,
  UserDateDetail,
} from '../../../components/DetailList';
import useRequest, { useDismissableError } from '../../../util/useRequest';
import { CredentialTypesAPI } from '../../../api';
import { jsonToYaml } from '../../../util/yaml';

function CredentialTypeDetails({ credentialType, i18n }) {
  const { id, name, description, injectors, inputs } = credentialType;
  const history = useHistory();

  const {
    request: deleteCredentialType,
    isLoading,
    error: deleteError,
  } = useRequest(
    useCallback(async () => {
      await CredentialTypesAPI.destroy(id);
      history.push(`/credential_types`);
    }, [id, history])
  );

  const { error, dismissError } = useDismissableError(deleteError);

  return (
    <CardBody>
      <DetailList>
        <Detail
          label={i18n._(t`名称`)}
          value={name}
          dataCy="credential-type-detail-name"
        />
        <Detail label={i18n._(t`描述`)} value={description} />
        <VariablesDetail
          label={i18n._(t`输入配置`)}
          value={jsonToYaml(JSON.stringify(inputs))}
          rows={6}
        />
        <VariablesDetail
          label={i18n._(t`注入程序配置`)}
          value={jsonToYaml(JSON.stringify(injectors))}
          rows={6}
        />
        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={credentialType.created}
          user={credentialType.summary_fields.created_by}
        />
        <UserDateDetail
          label={i18n._(t`上次修改时间`)}
          date={credentialType.modified}
          user={credentialType.summary_fields.modified_by}
        />
      </DetailList>
      <CardActionsRow>
        {credentialType.summary_fields.user_capabilities &&
          credentialType.summary_fields.user_capabilities.edit && (
            <Button
              aria-label={i18n._(t`edit`)}
              component={Link}
              to={`/credential_types/${id}/edit`}
            >
              {i18n._(t`编辑`)}
            </Button>
          )}
        {credentialType.summary_fields.user_capabilities &&
          credentialType.summary_fields.user_capabilities.delete && (
            <DeleteButton
              name={name}
              modalTitle={i18n._(t`删除 credential type`)}
              onConfirm={deleteCredentialType}
              isDisabled={isLoading}
            >
              {i18n._(t`删除`)}
            </DeleteButton>
          )}
      </CardActionsRow>

      {error && (
        <AlertModal
          isOpen={error}
          onClose={dismissError}
          title={i18n._(t`错误`)}
          variant="error"
        />
      )}
    </CardBody>
  );
}

export default withI18n()(CredentialTypeDetails);
