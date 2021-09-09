import 'styled-components/macro';
import React, { useCallback, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { RRule, rrulestr } from 'rrule';
import styled from 'styled-components';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Chip, Title, Button } from '@patternfly/react-core';
import { Schedule } from '../../../types';
import AlertModal from '../../AlertModal';
import { CardBody, CardActionsRow } from '../../Card';
import ContentError from '../../ContentError';
import ContentLoading from '../../ContentLoading';
import CredentialChip from '../../CredentialChip';
import { DetailList, Detail, UserDateDetail } from '../../DetailList';
import ScheduleOccurrences from '../ScheduleOccurrences';
import ScheduleToggle from '../ScheduleToggle';
import { formatDateString } from '../../../util/dates';
import useRequest, { useDismissableError } from '../../../util/useRequest';
import {
  JobTemplatesAPI,
  SchedulesAPI,
  WorkflowJobTemplatesAPI,
} from '../../../api';
import DeleteButton from '../../DeleteButton';
import ErrorDetail from '../../ErrorDetail';
import ChipGroup from '../../ChipGroup';
import { VariablesDetail } from '../../CodeMirrorInput';

const PromptTitle = styled(Title)`
  --pf-c-title--m-md--FontWeight: 700;
  grid-column: 1 / -1;
`;

function ScheduleDetail({ schedule, i18n }) {
  const {
    id,
    created,
    description,
    diff_mode,
    dtend,
    dtstart,
    extra_data,
    job_tags,
    job_type,
    limit,
    modified,
    name,
    next_run,
    rrule,
    scm_branch,
    skip_tags,
    summary_fields,
    timezone,
  } = schedule;

  const history = useHistory();
  const { pathname } = useLocation();
  const pathRoot = pathname.substr(0, pathname.indexOf('schedules'));

  const {
    request: deleteSchedule,
    isLoading: isDeleteLoading,
    error: deleteError,
  } = useRequest(
    useCallback(async () => {
      await SchedulesAPI.destroy(id);
      history.push(`${pathRoot}schedules`);
    }, [id, history, pathRoot])
  );

  const { error, dismissError } = useDismissableError(deleteError);

  const {
    result: [credentials, preview, launchData],
    isLoading,
    error: readContentError,
    request: fetchCredentialsAndPreview,
  } = useRequest(
    useCallback(async () => {
      const promises = [
        SchedulesAPI.readCredentials(id),
        SchedulesAPI.createPreview({
          rrule,
        }),
      ];

      if (
        schedule?.summary_fields?.unified_job_template?.unified_job_type ===
        'job'
      ) {
        promises.push(
          JobTemplatesAPI.readLaunch(
            schedule.summary_fields.unified_job_template.id
          )
        );
      } else if (
        schedule?.summary_fields?.unified_job_template?.unified_job_type ===
        'workflow_job'
      ) {
        promises.push(
          WorkflowJobTemplatesAPI.readLaunch(
            schedule.summary_fields.unified_job_template.id
          )
        );
      } else {
        promises.push(Promise.resolve());
      }

      const [{ data }, { data: schedulePreview }, launch] = await Promise.all(
        promises
      );

      return [data.results, schedulePreview, launch?.data];
    }, [id, schedule, rrule]),
    []
  );

  useEffect(() => {
    fetchCredentialsAndPreview();
  }, [fetchCredentialsAndPreview]);

  const rule = rrulestr(rrule);
  const repeatFrequency =
    rule.options.freq === RRule.MINUTELY && dtstart === dtend
      ? i18n._(t`None (Run Once)`)
      : rule.toText().replace(/^\w/, c => c.toUpperCase());

  const {
    ask_credential_on_launch,
    ask_diff_mode_on_launch,
    ask_inventory_on_launch,
    ask_job_type_on_launch,
    ask_limit_on_launch,
    ask_scm_branch_on_launch,
    ask_skip_tags_on_launch,
    ask_tags_on_launch,
    ask_variables_on_launch,
    ask_verbosity_on_launch,
    survey_enabled,
  } = launchData || {};

  const showPromptedFields =
    ask_credential_on_launch ||
    ask_diff_mode_on_launch ||
    ask_inventory_on_launch ||
    ask_job_type_on_launch ||
    ask_limit_on_launch ||
    ask_scm_branch_on_launch ||
    ask_skip_tags_on_launch ||
    ask_tags_on_launch ||
    ask_variables_on_launch ||
    ask_verbosity_on_launch ||
    survey_enabled;

  if (isLoading) {
    return <ContentLoading />;
  }

  if (readContentError) {
    return <ContentError error={readContentError} />;
  }

  return (
    <CardBody>
      <ScheduleToggle schedule={schedule} css="padding-bottom: 40px" />
      <DetailList gutter="sm">
        <Detail label={i18n._(t`名称`)} value={name} />
        <Detail label={i18n._(t`描述`)} value={description} />
        <Detail
          label={i18n._(t`第一次运行`)}
          value={formatDateString(dtstart)}
        />
        <Detail
          label={i18n._(t`下一次运行`)}
          value={formatDateString(next_run)}
        />
        <Detail label={i18n._(t`最后一次运行`)} value={formatDateString(dtend)} />
        <Detail label={i18n._(t`本地时区`)} value={timezone} />
        <Detail label={i18n._(t`重复频率`)} value={repeatFrequency} />
        <ScheduleOccurrences preview={preview} />
        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={created}
          user={summary_fields.created_by}
        />
        <UserDateDetail
          label={i18n._(t`上次修改时间`)}
          date={modified}
          user={summary_fields.modified_by}
        />
        {showPromptedFields && (
          <>
            <PromptTitle headingLevel="h2">
              {i18n._(t`提示字段`)}
            </PromptTitle>
            {ask_job_type_on_launch && (
              <Detail label={i18n._(t`作业类型`)} value={job_type} />
            )}
            {ask_inventory_on_launch && (
              <Detail
                label={i18n._(t`清单`)}
                value={
                  summary_fields?.inventory ? (
                    <Link
                      to={`/inventories/${
                        summary_fields?.inventory?.kind === 'smart'
                          ? 'smart_inventory'
                          : 'inventory'
                      }/${summary_fields?.inventory?.id}/details`}
                    >
                      {summary_fields?.inventory?.name}
                    </Link>
                  ) : (
                    ' '
                  )
                }
              />
            )}
            {ask_scm_branch_on_launch && (
              <Detail
                label={i18n._(t`源代码控制分支`)}
                value={scm_branch}
              />
            )}
            {ask_limit_on_launch && (
              <Detail label={i18n._(t`范围`)} value={limit} />
            )}
            {ask_diff_mode_on_launch && typeof diff_mode === 'boolean' && (
              <Detail
                label={i18n._(t`显示更改`)}
                value={diff_mode ? i18n._(t`On`) : i18n._(t`Off`)}
              />
            )}
            {ask_credential_on_launch && (
              <Detail
                fullWidth
                label={i18n._(t`凭证列表`)}
                value={
                  <ChipGroup numChips={5} totalChips={credentials.length}>
                    {credentials.map(c => (
                      <CredentialChip key={c.id} credential={c} isReadOnly />
                    ))}
                  </ChipGroup>
                }
              />
            )}
            {ask_tags_on_launch && job_tags && job_tags.length > 0 && (
              <Detail
                fullWidth
                label={i18n._(t`作业标签`)}
                value={
                  <ChipGroup
                    numChips={5}
                    totalChips={job_tags.split(',').length}
                  >
                    {job_tags.split(',').map(jobTag => (
                      <Chip key={jobTag} isReadOnly>
                        {jobTag}
                      </Chip>
                    ))}
                  </ChipGroup>
                }
              />
            )}
            {ask_skip_tags_on_launch && skip_tags && skip_tags.length > 0 && (
              <Detail
                fullWidth
                label={i18n._(t`跳过标签`)}
                value={
                  <ChipGroup
                    numChips={5}
                    totalChips={skip_tags.split(',').length}
                  >
                    {skip_tags.split(',').map(skipTag => (
                      <Chip key={skipTag} isReadOnly>
                        {skipTag}
                      </Chip>
                    ))}
                  </ChipGroup>
                }
              />
            )}
            {(ask_variables_on_launch || survey_enabled) && (
              <VariablesDetail
                value={extra_data}
                rows={4}
                label={i18n._(t`变量`)}
              />
            )}
          </>
        )}
      </DetailList>
      <CardActionsRow>
        {summary_fields?.user_capabilities?.edit && (
          <Button
            aria-label={i18n._(t`编辑`)}
            component={Link}
            to={pathname.replace('details', 'edit')}
          >
            {i18n._(t`编辑`)}
          </Button>
        )}
        {summary_fields?.user_capabilities?.delete && (
          <DeleteButton
            name={name}
            modalTitle={i18n._(t`删除计划`)}
            onConfirm={deleteSchedule}
            isDisabled={isDeleteLoading}
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
          {i18n._(t`无法删除计划`)}
          <ErrorDetail error={error} />
        </AlertModal>
      )}
    </CardBody>
  );
}

ScheduleDetail.propTypes = {
  schedule: Schedule.isRequired,
};

export default withI18n()(ScheduleDetail);
