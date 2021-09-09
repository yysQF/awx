import React, { useState } from 'react';
import { t } from '@lingui/macro';

import { Button } from '@patternfly/react-core';
import { withI18n } from '@lingui/react';
import { useHistory, useParams } from 'react-router-dom';
import { VariablesDetail } from '../../../components/CodeMirrorInput';
import { CardBody, CardActionsRow } from '../../../components/Card';
import ErrorDetail from '../../../components/ErrorDetail';
import AlertModal from '../../../components/AlertModal';
import {
  DetailList,
  Detail,
  UserDateDetail,
} from '../../../components/DetailList';
import InventoryGroupsDeleteModal from '../shared/InventoryGroupsDeleteModal';

function InventoryGroupDetail({ i18n, inventoryGroup }) {
  const {
    summary_fields: { created_by, modified_by, user_capabilities },
    created,
    modified,
    name,
    description,
    variables,
  } = inventoryGroup;
  const [error, setError] = useState(false);
  const history = useHistory();
  const params = useParams();

  return (
    <CardBody>
      <DetailList gutter="sm">
        <Detail
          label={i18n._(t`名称`)}
          value={name}
          dataCy="inventory-group-detail-name"
        />
        <Detail label={i18n._(t`描述`)} value={description} />
        <VariablesDetail
          label={i18n._(t`变量`)}
          value={variables}
          rows={4}
        />
        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={created}
          user={created_by}
        />
        <UserDateDetail
          label={i18n._(t`上次修改时间`)}
          date={modified}
          user={modified_by}
        />
      </DetailList>
      <CardActionsRow>
        {user_capabilities?.edit && (
          <Button
            variant="primary"
            aria-label={i18n._(t`编辑`)}
            onClick={() =>
              history.push(
                `/inventories/inventory/${params.id}/groups/${params.groupId}/edit`
              )
            }
          >
            {i18n._(t`编辑`)}
          </Button>
        )}
        {user_capabilities?.delete && (
          <InventoryGroupsDeleteModal
            groups={[inventoryGroup]}
            isDisabled={false}
            onAfterDelete={() =>
              history.push(`/inventories/inventory/${params.id}/groups`)
            }
          />
        )}
      </CardActionsRow>
      {error && (
        <AlertModal
          variant="error"
          title={i18n._(t`Error!`)}
          isOpen={error}
          onClose={() => setError(false)}
        >
          {i18n._(t`Failed to delete group ${inventoryGroup.name}.`)}
          <ErrorDetail error={error} />
        </AlertModal>
      )}
    </CardBody>
  );
}
export default withI18n()(InventoryGroupDetail);
