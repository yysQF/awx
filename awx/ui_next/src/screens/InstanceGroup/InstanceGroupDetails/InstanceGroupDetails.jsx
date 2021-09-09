import React, { useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Label, Split, SplitItem } from '@patternfly/react-core';

import AlertModal from '../../../components/AlertModal';
import { CardBody, CardActionsRow } from '../../../components/Card';
import DeleteButton from '../../../components/DeleteButton';
import {
  Detail,
  DetailList,
  UserDateDetail,
  DetailBadge,
} from '../../../components/DetailList';
import useRequest, { useDismissableError } from '../../../util/useRequest';
import { InstanceGroupsAPI } from '../../../api';

const Unavailable = styled.span`
  color: var(--pf-global--danger-color--200);
`;

function InstanceGroupDetails({ instanceGroup, i18n }) {
  const { id, name } = instanceGroup;

  const history = useHistory();

  const {
    request: deleteInstanceGroup,
    isLoading,
    error: deleteError,
  } = useRequest(
    useCallback(async () => {
      await InstanceGroupsAPI.destroy(id);
      history.push(`/instance_groups`);
    }, [id, history])
  );

  const { error, dismissError } = useDismissableError(deleteError);

  const verifyInstanceGroup = item => {
    if (item.is_isolated) {
      return (
        <Split hasGutter>
          <SplitItem>{item.name}</SplitItem>
          <SplitItem>
            <Label aria-label={i18n._(t`isolated instance`)}>
              {i18n._(t`Isolated`)}
            </Label>
          </SplitItem>
        </Split>
      );
    }
    if (item.is_controller) {
      return (
        <Split hasGutter>
          <SplitItem>{item.name}</SplitItem>
          <SplitItem>
            <Label aria-label={i18n._(t`controller instance`)}>
              {i18n._(t`Controller`)}
            </Label>
          </SplitItem>
        </Split>
      );
    }
    return <>{item.name}</>;
  };

  return (
    <CardBody>
      <DetailList>
        <Detail
          label={i18n._(t`名称`)}
          value={verifyInstanceGroup(instanceGroup)}
          dataCy="instance-group-detail-name"
        />
        <Detail
          label={i18n._(t`类型`)}
          value={
            instanceGroup.is_containerized
              ? i18n._(t`容器组`)
              : i18n._(t`实例组`)
          }
          dataCy="instance-group-type"
        />
        <DetailBadge
          label={i18n._(t`策略实例最小值`)}
          dataCy="instance-group-policy-instance-minimum"
          content={instanceGroup.policy_instance_minimum}
        />
        <DetailBadge
          label={i18n._(t`策略实例百分比`)}
          dataCy="instance-group-policy-instance-percentage"
          content={`${instanceGroup.policy_instance_percentage} %`}
        />
        {instanceGroup.capacity ? (
          <DetailBadge
            label={i18n._(t`已用容量`)}
            content={`${Math.round(
              100 - instanceGroup.percent_capacity_remaining
            )} %`}
            dataCy="instance-group-used-capacity"
          />
        ) : (
          <Detail
            label={i18n._(t`已用容量`)}
            value={<Unavailable>{i18n._(t`Unavailable`)}</Unavailable>}
            dataCy="instance-group-used-capacity"
          />
        )}

        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={instanceGroup.created}
          user={instanceGroup.summary_fields.created_by}
        />
        <UserDateDetail
          label={i18n._(t`上次修改时间`)}
          date={instanceGroup.modified}
          user={instanceGroup.summary_fields.modified_by}
        />
      </DetailList>

      <CardActionsRow>
        {instanceGroup.summary_fields.user_capabilities &&
          instanceGroup.summary_fields.user_capabilities.edit && (
            <Button
              aria-label={i18n._(t`编辑`)}
              component={Link}
              to={`/instance_groups/${id}/edit`}
            >
              {i18n._(t`编辑`)}
            </Button>
          )}
        {name !== 'tower' &&
          instanceGroup.summary_fields.user_capabilities &&
          instanceGroup.summary_fields.user_capabilities.delete && (
            <DeleteButton
              name={name}
              modalTitle={i18n._(t`删除实例组`)}
              onConfirm={deleteInstanceGroup}
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

export default withI18n()(InstanceGroupDetails);
