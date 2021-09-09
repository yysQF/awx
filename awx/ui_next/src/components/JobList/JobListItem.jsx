import React from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Button,
  DataListAction as _DataListAction,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  Tooltip,
} from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';
import styled from 'styled-components';
import DataListCell from '../DataListCell';
import LaunchButton from '../LaunchButton';
import StatusIcon from '../StatusIcon';
import { formatDateString } from '../../util/dates';
import { JOB_TYPE_URL_SEGMENTS } from '../../constants';

const DataListAction = styled(_DataListAction)`
  align-items: center;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 40px;
`;

function JobListItem({
  i18n,
  job,
  isSelected,
  onSelect,
  showTypeColumn = false,
}) {
  const labelId = `check-action-${job.id}`;

  const jobTypes = {
    project_update: i18n._(t`源代码管理更新`),
    inventory_update: i18n._(t`清单同步`),
    job: i18n._(t`剧本运行`),
    ad_hoc_command: i18n._(t`命令行`),
    management_job: i18n._(t`管理作业`),
    workflow_job: i18n._(t`工作流作业`),
  };

  return (
    <DataListItem aria-labelledby={labelId} id={`${job.id}`}>
      <DataListItemRow>
        <DataListCheck
          id={`select-job-${job.id}`}
          checked={isSelected}
          onChange={onSelect}
          aria-labelledby={labelId}
        />
        <DataListItemCells
          dataListCells={[
            <DataListCell key="status" isFilled={false}>
              {job.status && <StatusIcon status={job.status} />}
            </DataListCell>,
            <DataListCell key="name">
              <span>
                <Link to={`/jobs/${JOB_TYPE_URL_SEGMENTS[job.type]}/${job.id}`}>
                  <b>
                    {job.id} &mdash; {job.name}
                  </b>
                </Link>
              </span>
            </DataListCell>,
            ...(showTypeColumn
              ? [
                  <DataListCell key="type" aria-label="type">
                    {jobTypes[job.type]}
                  </DataListCell>,
                ]
              : []),
            <DataListCell key="finished">
              {job.finished ? formatDateString(job.finished) : ''}
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-label="actions"
          aria-labelledby={labelId}
          id={labelId}
        >
          {job.type !== 'system_job' &&
          job.summary_fields?.user_capabilities?.start ? (
            <Tooltip content={i18n._(t`重新运行`)} position="top">
              <LaunchButton resource={job}>
                {({ handleRelaunch }) => (
                  <Button
                    variant="plain"
                    onClick={handleRelaunch}
                    aria-label={i18n._(t`重运行`)}
                  >
                    <RocketIcon />
                  </Button>
                )}
              </LaunchButton>
            </Tooltip>
          ) : (
            ''
          )}
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
}

export { JobListItem as _JobListItem };
export default withI18n()(JobListItem);
