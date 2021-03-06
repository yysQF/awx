import 'styled-components/macro';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button, Chip, Label } from '@patternfly/react-core';
import styled from 'styled-components';

import AlertModal from '../../../components/AlertModal';
import {
  DetailList,
  Detail,
  UserDateDetail,
} from '../../../components/DetailList';
import { CardBody, CardActionsRow } from '../../../components/Card';
import ChipGroup from '../../../components/ChipGroup';
import CredentialChip from '../../../components/CredentialChip';
import { VariablesInput as _VariablesInput } from '../../../components/CodeMirrorInput';
import DeleteButton from '../../../components/DeleteButton';
import ErrorDetail from '../../../components/ErrorDetail';
import LaunchButton from '../../../components/LaunchButton';
import StatusIcon from '../../../components/StatusIcon';
import { toTitleCase } from '../../../util/strings';
import { formatDateString } from '../../../util/dates';
import { Job } from '../../../types';
import {
  JobsAPI,
  ProjectUpdatesAPI,
  SystemJobsAPI,
  WorkflowJobsAPI,
  InventoriesAPI,
  AdHocCommandsAPI,
} from '../../../api';

const VariablesInput = styled(_VariablesInput)`
  .pf-c-form__label {
    --pf-c-form__label--FontWeight: var(--pf-global--FontWeight--bold);
  }
`;

const StatusDetailValue = styled.div`
  align-items: center;
  display: inline-grid;
  grid-gap: 10px;
  grid-template-columns: auto auto;
`;

const VERBOSITY = {
  0: '0 (Normal)',
  1: '1 (Verbose)',
  2: '2 (More Verbose)',
  3: '3 (Debug)',
  4: '4 (Connection Debug)',
};

const getLaunchedByDetails = ({ summary_fields = {}, related = {} }) => {
  const {
    created_by: createdBy,
    job_template: jobTemplate,
    schedule,
  } = summary_fields;
  const { schedule: relatedSchedule } = related;

  if (!createdBy && !schedule) {
    return null;
  }

  let link;
  let value;

  if (createdBy) {
    link = `/users/${createdBy.id}`;
    value = createdBy.username;
  } else if (relatedSchedule && jobTemplate) {
    link = `/templates/job_template/${jobTemplate.id}/schedules/${schedule.id}`;
    value = schedule.name;
  } else {
    link = null;
    value = schedule.name;
  }

  return { link, value };
};

function JobDetail({ job, i18n }) {
  const {
    created_by,
    credential,
    credentials,
    instance_group: instanceGroup,
    inventory,
    job_template: jobTemplate,
    workflow_job_template: workflowJobTemplate,
    labels,
    project,
  } = job.summary_fields;
  const [errorMsg, setErrorMsg] = useState();
  const history = useHistory();

  const jobTypes = {
    project_update: i18n._(t`?????????????????????`),
    inventory_update: i18n._(t`????????????`),
    job: i18n._(t`????????????`),
    ad_hoc_command: i18n._(t`?????????`),
    management_job: i18n._(t`????????????`),
    workflow_job: i18n._(t`???????????????`),
  };

  const { value: launchedByValue, link: launchedByLink } =
    getLaunchedByDetails(job) || {};

  const deleteJob = async () => {
    try {
      switch (job.type) {
        case 'project_update':
          await ProjectUpdatesAPI.destroy(job.id);
          break;
        case 'system_job':
          await SystemJobsAPI.destroy(job.id);
          break;
        case 'workflow_job':
          await WorkflowJobsAPI.destroy(job.id);
          break;
        case 'ad_hoc_command':
          await AdHocCommandsAPI.destroy(job.id);
          break;
        case 'inventory_update':
          await InventoriesAPI.destroy(job.id);
          break;
        default:
          await JobsAPI.destroy(job.id);
      }
      history.push('/jobs');
    } catch (err) {
      setErrorMsg(err);
    }
  };

  const isIsolatedInstanceGroup = item => {
    if (item.is_isolated) {
      return (
        <>
          <Link to={`/instance_groups/${item.id}`}>{item.name}</Link>
          <span css="margin-left: 12px">
            <Label aria-label={i18n._(t`??????`)}>
              {i18n._(t`??????`)}
            </Label>
          </span>
        </>
      );
    }
    return <Link to={`/instance_groups/${item.id}`}>{item.name}</Link>;
  };

  return (
    <CardBody>
      <DetailList>
        {/* TODO: hookup status to websockets */}
        <Detail
          label={i18n._(t`??????`)}
          value={
            <StatusDetailValue>
              {job.status && <StatusIcon status={job.status} />}
              {toTitleCase(job.status)}
            </StatusDetailValue>
          }
        />
        <Detail
          label={i18n._(t`????????????`)}
          value={formatDateString(job.started)}
        />
        <Detail
          label={i18n._(t`????????????`)}
          value={formatDateString(job.finished)}
        />
        {jobTemplate && (
          <Detail
            label={i18n._(t`????????????`)}
            value={
              <Link to={`/templates/job_template/${jobTemplate.id}`}>
                {jobTemplate.name}
              </Link>
            }
          />
        )}
        {workflowJobTemplate && (
          <Detail
            label={i18n._(t`?????????????????????`)}
            value={
              <Link
                to={`/templates/workflow_job_template/${workflowJobTemplate.id}`}
              >
                {workflowJobTemplate.name}
              </Link>
            }
          />
        )}
        <Detail label={i18n._(t`????????????`)} value={jobTypes[job.type]} />
        <Detail
          label={i18n._(t`?????????`)}
          value={
            launchedByLink ? (
              <Link to={`${launchedByLink}`}>{launchedByValue}</Link>
            ) : (
              launchedByValue
            )
          }
        />
        {inventory && (
          <Detail
            label={i18n._(t`??????`)}
            value={
              <Link
                to={
                  inventory.kind === 'smart'
                    ? `/inventories/smart_inventory/${inventory.id}`
                    : `/inventories/inventory/${inventory.id}`
                }
              >
                {inventory.name}
              </Link>
            }
          />
        )}
        {project && (
          <Detail
            label={i18n._(t`??????`)}
            value={
              <StatusDetailValue>
                {project.status && <StatusIcon status={project.status} />}
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
              </StatusDetailValue>
            }
          />
        )}
        <Detail label={i18n._(t`??????`)} value={job.scm_revision} />
        <Detail label={i18n._(t`??????`)} value={job.playbook} />
        <Detail label={i18n._(t`??????`)} value={job.limit} />
        <Detail label={i18n._(t`????????????`)} value={VERBOSITY[job.verbosity]} />
        <Detail label={i18n._(t`????????????`)} value={job.custom_virtualenv} />
        <Detail label={i18n._(t`????????????`)} value={job.execution_node} />
        {instanceGroup && (
          <Detail
            label={i18n._(t`?????????`)}
            value={isIsolatedInstanceGroup(instanceGroup)}
          />
        )}
        {typeof job.job_slice_number === 'number' &&
          typeof job.job_slice_count === 'number' && (
            <Detail
              label={i18n._(t`????????????`)}
              value={`${job.job_slice_number}/${job.job_slice_count}`}
            />
          )}
        {credential && (
          <Detail
            label={i18n._(t`????????????`)}
            value={
              <ChipGroup numChips={5} totalChips={1}>
                <CredentialChip
                  key={credential.id}
                  credential={credential}
                  isReadOnly
                />
              </ChipGroup>
            }
          />
        )}
        {credentials && credentials.length > 0 && (
          <Detail
            fullWidth
            label={i18n._(t`????????????`)}
            value={
              <ChipGroup numChips={5} totalChips={credentials.length}>
                {credentials.map(c => (
                  <CredentialChip key={c.id} credential={c} isReadOnly />
                ))}
              </ChipGroup>
            }
          />
        )}
        {labels && labels.count > 0 && (
          <Detail
            fullWidth
            label={i18n._(t`????????????`)}
            value={
              <ChipGroup numChips={5} totalChips={labels.results.length}>
                {labels.results.map(l => (
                  <Chip key={l.id} isReadOnly>
                    {l.name}
                  </Chip>
                ))}
              </ChipGroup>
            }
          />
        )}
        <UserDateDetail
          label={i18n._(t`?????????`)}
          date={job.created}
          user={created_by}
        />
        <UserDateDetail label={i18n._(t`??????????????????`)} date={job.modified} />
      </DetailList>
      {job.extra_vars && (
        <VariablesInput
          css="margin: 20px 0"
          id="job-variables"
          readOnly
          value={job.extra_vars}
          rows={4}
          label={i18n._(t`??????`)}
        />
      )}
      {job.artifacts && (
        <VariablesInput
          css="margin: 20px 0"
          id="job-artifacts"
          readOnly
          value={JSON.stringify(job.artifacts)}
          rows={4}
          label={i18n._(t`??????`)}
        />
      )}
      <CardActionsRow>
        {job.type !== 'system_job' &&
          job.summary_fields.user_capabilities.start && (
            <LaunchButton resource={job} aria-label={i18n._(t`?????????`)}>
              {({ handleRelaunch }) => (
                <Button type="submit" onClick={handleRelaunch}>
                  {i18n._(t`?????????`)}
                </Button>
              )}
            </LaunchButton>
          )}
        {job.summary_fields.user_capabilities.delete && (
          <DeleteButton
            name={job.name}
            modalTitle={i18n._(t`????????????`)}
            onConfirm={deleteJob}
          >
            {i18n._(t`??????`)}
          </DeleteButton>
        )}
      </CardActionsRow>
      {errorMsg && (
        <AlertModal
          isOpen={errorMsg}
          variant="error"
          onClose={() => setErrorMsg()}
          title={i18n._(t`??????????????????`)}
        >
          <ErrorDetail error={errorMsg} />
        </AlertModal>
      )}
    </CardBody>
  );
}
JobDetail.propTypes = {
  job: Job.isRequired,
};

export default withI18n()(JobDetail);
