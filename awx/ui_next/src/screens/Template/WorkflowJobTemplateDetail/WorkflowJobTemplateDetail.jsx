import React, { useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Chip,
  Button,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  Label,
} from '@patternfly/react-core';
import { WorkflowJobTemplatesAPI } from '../../../api';

import AlertModal from '../../../components/AlertModal';
import { CardBody, CardActionsRow } from '../../../components/Card';
import ChipGroup from '../../../components/ChipGroup';
import { VariablesDetail } from '../../../components/CodeMirrorInput';
import DeleteButton from '../../../components/DeleteButton';
import {
  DetailList,
  Detail,
  UserDateDetail,
} from '../../../components/DetailList';
import ErrorDetail from '../../../components/ErrorDetail';
import LaunchButton from '../../../components/LaunchButton';
import Sparkline from '../../../components/Sparkline';
import { toTitleCase } from '../../../util/strings';
import useRequest, { useDismissableError } from '../../../util/useRequest';

function WorkflowJobTemplateDetail({ template, i18n }) {
  const {
    id,
    ask_inventory_on_launch,
    name,
    description,
    type,
    extra_vars,
    created,
    modified,
    summary_fields,
    related,
    webhook_credential,
    webhook_key,
  } = template;

  const urlOrigin = window.location.origin;
  const history = useHistory();

  const renderOptionsField =
    template.allow_simultaneous || template.webhook_service;

  const renderOptions = (
    <TextList component={TextListVariants.ul}>
      {template.allow_simultaneous && (
        <TextListItem component={TextListItemVariants.li}>
          {i18n._(t`- 启用并发作业`)}
        </TextListItem>
      )}
      {template.webhook_service && (
        <TextListItem component={TextListItemVariants.li}>
          {i18n._(t`- 启用Webhooks`)}
        </TextListItem>
      )}
    </TextList>
  );

  const {
    request: deleteWorkflowJobTemplate,
    isLoading,
    error: deleteError,
  } = useRequest(
    useCallback(async () => {
      await WorkflowJobTemplatesAPI.destroy(id);
      history.push(`/templates`);
    }, [id, history])
  );

  const { error, dismissError } = useDismissableError(deleteError);

  const inventoryValue = (kind, inventoryId) => {
    const inventorykind = kind === 'smart' ? 'smart_inventory' : 'inventory';

    return ask_inventory_on_launch ? (
      <>
        <Link to={`/inventories/${inventorykind}/${inventoryId}/details`}>
          <Label>{summary_fields.inventory.name}</Label>
        </Link>
        <span> {i18n._(t`(Prompt on launch)`)}</span>
      </>
    ) : (
      <Link to={`/inventories/${inventorykind}/${inventoryId}/details`}>
        <Label>{summary_fields.inventory.name}</Label>
      </Link>
    );
  };

  const canLaunch = summary_fields?.user_capabilities?.start;
  const recentPlaybookJobs = summary_fields.recent_jobs.map(job => ({
    ...job,
    type: 'workflow_job',
  }));

  return (
    <CardBody>
      <DetailList gutter="sm">
        <Detail label={i18n._(t`名称`)} value={name} dataCy="jt-detail-name" />
        <Detail label={i18n._(t`描述`)} value={description} />
        {summary_fields.recent_jobs?.length > 0 && (
          <Detail
            value={<Sparkline jobs={recentPlaybookJobs} />}
            label={i18n._(t`活动`)}
          />
        )}
        {summary_fields.organization && (
          <Detail
            label={i18n._(t`组织`)}
            value={
              <Link
                to={`/organizations/${summary_fields.organization.id}/details`}
              >
                <Label>{summary_fields.organization.name}</Label>
              </Link>
            }
          />
        )}
        <Detail label={i18n._(t`作业类型`)} value={toTitleCase(type)} />
        {summary_fields.inventory && (
          <Detail
            label={i18n._(t`清单`)}
            value={inventoryValue(
              summary_fields.inventory.kind,
              summary_fields.inventory.id
            )}
          />
        )}
        <Detail
          label={i18n._(t`Webhook服务`)}
          value={toTitleCase(template.webhook_service)}
        />
        {related.webhook_receiver && (
          <Detail
            label={i18n._(t`Webhook URL`)}
            value={`${urlOrigin}${template.related.webhook_receiver}`}
          />
        )}
        <Detail label={i18n._(t`Webhook密钥`)} value={webhook_key} />
        {webhook_credential && (
          <Detail
            fullWidth
            label={i18n._(t`Webhook凭证`)}
            value={
              <Link
                to={`/credentials/${summary_fields.webhook_credential.id}/details`}
              >
                <Label>{summary_fields.webhook_credential.name}</Label>
              </Link>
            }
          />
        )}
        {renderOptionsField && (
          <Detail label={i18n._(t`选项`)} value={renderOptions} />
        )}
        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={created}
          user={summary_fields.created_by}
        />
        <UserDateDetail
          label={i18n._(t`更改`)}
          date={modified}
          user={summary_fields.modified_by}
        />
        {summary_fields.labels?.results?.length > 0 && (
          <Detail
            fullWidth
            label={i18n._(`标签`)}
            value={
              <ChipGroup
                numChips={3}
                totalChips={summary_fields.labels.results.length}
              >
                {summary_fields.labels.results.map(l => (
                  <Chip key={l.id} isReadOnly>
                    {l.name}
                  </Chip>
                ))}
              </ChipGroup>
            }
          />
        )}
        <VariablesDetail
          label={i18n._(t`变量`)}
          value={extra_vars}
          rows={4}
        />
      </DetailList>
      <CardActionsRow>
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.edit && (
            <Button
              component={Link}
              to={`/templates/workflow_job_template/${id}/edit`}
              aria-label={i18n._(t`编辑`)}
            >
              {i18n._(t`编辑`)}
            </Button>
          )}
        {canLaunch && (
          <LaunchButton resource={template} aria-label={i18n._(t`运行`)}>
            {({ handleLaunch }) => (
              <Button variant="secondary" type="submit" onClick={handleLaunch}>
                {i18n._(t`运行`)}
              </Button>
            )}
          </LaunchButton>
        )}
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.delete && (
            <DeleteButton
              name={name}
              modalTitle={i18n._(t`删除工作流作业模板`)} 
              onConfirm={deleteWorkflowJobTemplate}
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
          {i18n._(t`无法删除工作流作业模板.`)}
          <ErrorDetail error={error} />
        </AlertModal>
      )}
    </CardBody>
  );
}
export { WorkflowJobTemplateDetail as _WorkflowJobTemplateDetail };
export default withI18n()(WorkflowJobTemplateDetail);
