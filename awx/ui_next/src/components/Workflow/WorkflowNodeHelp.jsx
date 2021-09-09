import 'styled-components/macro';
import React from 'react';
import { withI18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { shape } from 'prop-types';
import { secondsToHHMMSS } from '../../util/dates';

const GridDL = styled.dl`
  column-gap: 15px;
  display: grid;
  grid-template-columns: max-content;
  row-gap: 0px;
  dt {
    grid-column-start: 1;
  }
  dd {
    grid-column-start: 2;
  }
`;

const ResourceDeleted = styled.p`
  margin-bottom: ${props => (props.job ? '10px' : '0px')};
`;

const StyledExclamationTriangleIcon = styled(ExclamationTriangleIcon)`
  color: #f0ad4d;
  height: 20px;
  margin-right: 10px;
  width: 20px;
`;

function WorkflowNodeHelp({ node, i18n }) {
  let nodeType;
  const job = node?.originalNodeObject?.summary_fields?.job;
  const unifiedJobTemplate =
    node?.fullUnifiedJobTemplate ||
    node?.originalNodeObject?.summary_fields?.unified_job_template;
  if (unifiedJobTemplate || job) {
    const type = unifiedJobTemplate
      ? unifiedJobTemplate.unified_job_type || unifiedJobTemplate.type
      : job.type;
    switch (type) {
      case 'job_template':
      case 'job':
        nodeType = i18n._(t`作业模板`);
        break;
      case 'workflow_job_template':
      case 'workflow_job':
        nodeType = i18n._(t`工作流作业模板`);
        break;
      case 'project':
      case 'project_update':
        nodeType = i18n._(t`项目更新`);
        break;
      case 'inventory_source':
      case 'inventory_update':
        nodeType = i18n._(t`清单更新`);
        break;
      case 'workflow_approval_template':
      case 'workflow_approval':
        nodeType = i18n._(t`工作流程审批`);
        break;
      default:
        nodeType = '';
    }
  }

  let jobStatus;
  if (job) {
    switch (job.status) {
      case 'new':
        jobStatus = i18n._(t`新建`);
        break;
      case 'pending':
        jobStatus = i18n._(t`待办`);
        break;
      case 'waiting':
        jobStatus = i18n._(t`等待`);
        break;
      case 'running':
        jobStatus = i18n._(t`运行中`);
        break;
      case 'successful':
        jobStatus = i18n._(t`成功`);
        break;
      case 'failed':
        jobStatus = i18n._(t`失败`);
        break;
      case 'error':
        jobStatus = i18n._(t`错误`);
        break;
      case 'canceled':
        jobStatus = i18n._(t`取消`);
        break;
      case 'never updated':
        jobStatus = i18n._(t`从未更新`);
        break;
      case 'ok':
        jobStatus = i18n._(t`OK`);
        break;
      case 'missing':
        jobStatus = i18n._(t`丢失`);
        break;
      case 'none':
        jobStatus = i18n._(t`None`);
        break;
      case 'updating':
        jobStatus = i18n._(t`更新`);
        break;
      default:
        jobStatus = '';
    }
  }

  return (
    <>
      {!unifiedJobTemplate && (!job || job.type !== 'workflow_approval') && (
        <>
          <ResourceDeleted job={job}>
            <StyledExclamationTriangleIcon />
            <Trans>
              The resource associated with this node has been deleted.
            </Trans>
          </ResourceDeleted>
        </>
      )}
      {job && (
        <GridDL>
          <dt>
            <b>{i18n._(t`名称`)}</b>
          </dt>
          <dd id="workflow-node-help-name">{job.name}</dd>
          <dt>
            <b>{i18n._(t`类型`)}</b>
          </dt>
          <dd id="workflow-node-help-type">{nodeType}</dd>
          <dt>
            <b>{i18n._(t`作业状态`)}</b>
          </dt>
          <dd id="workflow-node-help-status">{jobStatus}</dd>
          {typeof job.elapsed === 'number' && (
            <>
              <dt>
                <b>{i18n._(t`用时`)}</b>
              </dt>
              <dd id="workflow-node-help-elapsed">
                {secondsToHHMMSS(job.elapsed)}
              </dd>
            </>
          )}
        </GridDL>
      )}
      {unifiedJobTemplate && !job && (
        <GridDL>
          <dt>
            <b>{i18n._(t`名称`)}</b>
          </dt>
          <dd id="workflow-node-help-name">{unifiedJobTemplate.name}</dd>
          <dt>
            <b>{i18n._(t`类型`)}</b>
          </dt>
          <dd id="workflow-node-help-type">{nodeType}</dd>
        </GridDL>
      )}
      {job && job.type !== 'workflow_approval' && (
        <p css="margin-top: 10px">{i18n._(t`点击查看作业详情`)}</p>
      )}
    </>
  );
}

WorkflowNodeHelp.propTypes = {
  node: shape().isRequired,
};

export default withI18n()(WorkflowNodeHelp);
