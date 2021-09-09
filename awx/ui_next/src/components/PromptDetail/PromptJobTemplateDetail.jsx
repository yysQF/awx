import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Link } from 'react-router-dom';

import { Chip, List, ListItem } from '@patternfly/react-core';
import CredentialChip from '../CredentialChip';
import ChipGroup from '../ChipGroup';
import Sparkline from '../Sparkline';
import { Detail, DeletedDetail } from '../DetailList';
import { VariablesDetail } from '../CodeMirrorInput';
import { toTitleCase } from '../../util/strings';

function PromptJobTemplateDetail({ i18n, resource }) {
  const {
    allow_simultaneous,
    ask_inventory_on_launch,
    become_enabled,
    diff_mode,
    extra_vars,
    forks,
    host_config_key,
    instance_groups,
    job_slice_count,
    job_tags,
    job_type,
    limit,
    playbook,
    related,
    scm_branch,
    skip_tags,
    summary_fields,
    use_fact_cache,
    verbosity,
    webhook_key,
    webhook_service,
  } = resource;

  const VERBOSITY = {
    0: i18n._(t`0 (Normal)`),
    1: i18n._(t`1 (Verbose)`),
    2: i18n._(t`2 (More Verbose)`),
    3: i18n._(t`3 (Debug)`),
    4: i18n._(t`4 (Connection Debug)`),
  };

  let optionsList = '';
  if (
    become_enabled ||
    host_config_key ||
    allow_simultaneous ||
    use_fact_cache
  ) {
    optionsList = (
      <List>
        {become_enabled && (
          <ListItem>{i18n._(t`启用权限提升`)}</ListItem>
        )}
        {host_config_key && (
          <ListItem>{i18n._(t`允许配置回调`)}</ListItem>
        )}
        {allow_simultaneous && (
          <ListItem>{i18n._(t`启用并发作业`)}</ListItem>
        )}
        {use_fact_cache && <ListItem>{i18n._(t`使用事实存储`)}</ListItem>}
      </List>
    );
  }

  const inventoryKind =
    summary_fields?.inventory?.kind === 'smart'
      ? 'smart_inventory'
      : 'inventory';

  const recentJobs = summary_fields?.recent_jobs?.map(job => ({
    ...job,
    type: 'job',
  }));

  return (
    <>
      {summary_fields.recent_jobs?.length > 0 && (
        <Detail
          value={<Sparkline jobs={recentJobs} />}
          label={i18n._(t`活动`)}
        />
      )}
      <Detail label={i18n._(t`作业类型`)} value={toTitleCase(job_type)} />
      {summary_fields?.organization ? (
        <Detail
          label={i18n._(t`组织`)}
          value={
            <Link
              to={`/organizations/${summary_fields.organization.id}/details`}
            >
              {summary_fields?.organization.name}
            </Link>
          }
        />
      ) : (
        <DeletedDetail label={i18n._(t`组织`)} />
      )}
      {summary_fields?.inventory ? (
        <Detail
          label={i18n._(t`清单`)}
          value={
            <Link
              to={`/${inventoryKind}/${summary_fields.inventory?.id}/details`}
            >
              {summary_fields.inventory?.name}
            </Link>
          }
        />
      ) : (
        !ask_inventory_on_launch && (
          <DeletedDetail label={i18n._(t`清单`)} />
        )
      )}
      {summary_fields?.project ? (
        <Detail
          label={i18n._(t`项目`)}
          value={
            <Link to={`/projects/${summary_fields.project?.id}/details`}>
              {summary_fields.project?.name}
            </Link>
          }
        />
      ) : (
        <DeletedDetail label={i18n._(t`项目`)} />
      )}
      <Detail label={i18n._(t`源代码控制分支`)} value={scm_branch} />
      <Detail label={i18n._(t`剧本`)} value={playbook} />
      <Detail label={i18n._(t`并发数`)} value={forks || '0'} />
      <Detail label={i18n._(t`范围`)} value={limit} />
      <Detail label={i18n._(t`详细程度`)} value={VERBOSITY[verbosity]} />
      {typeof diff_mode === 'boolean' && (
        <Detail
          label={i18n._(t`显示更改`)}
          value={diff_mode ? i18n._(t`On`) : i18n._(t`Off`)}
        />
      )}
      <Detail label={i18n._(t` 作业切片`)} value={job_slice_count} />
      <Detail label={i18n._(t`Host Config Key`)} value={host_config_key} />
      {related?.callback && (
        <Detail
          label={i18n._(t`Provisioning Callback URL`)}
          value={`${window.location.origin}${related.callback}`}
        />
      )}
      <Detail
        label={i18n._(t`Webhook Service`)}
        value={toTitleCase(webhook_service)}
      />
      {related?.webhook_receiver && (
        <Detail
          label={i18n._(t`Webhook URL`)}
          value={`${window.location.origin}${related.webhook_receiver}`}
        />
      )}
      <Detail label={i18n._(t`Webhook Key`)} value={webhook_key} />
      {summary_fields?.webhook_credential && (
        <Detail
          fullWidth
          label={i18n._(t`Webhook Credential`)}
          value={
            <CredentialChip
              key={summary_fields.webhook_credential?.id}
              credential={summary_fields.webhook_credential}
              isReadOnly
            />
          }
        />
      )}
      {optionsList && <Detail label={i18n._(t`选项`)} value={optionsList} />}
      {summary_fields?.credentials?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`凭证列表`)}
          value={
            <ChipGroup
              numChips={5}
              totalChips={summary_fields.credentials.length}
            >
              {summary_fields.credentials.map(cred => (
                <CredentialChip key={cred.id} credential={cred} isReadOnly />
              ))}
            </ChipGroup>
          }
        />
      )}
      {summary_fields?.labels?.results?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`标签`)}
          value={
            <ChipGroup
              numChips={5}
              totalChips={summary_fields.labels.results.length}
            >
              {summary_fields.labels.results.map(label => (
                <Chip key={label.id} isReadOnly>
                  {label.name}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {instance_groups?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`实例组`)}
          value={
            <ChipGroup numChips={5} totalChips={instance_groups.length}>
              {instance_groups.map(ig => (
                <Chip key={ig.id} isReadOnly>
                  {ig.name}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {job_tags?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`作业标签`)}
          value={
            <ChipGroup numChips={5} totalChips={job_tags.split(',').length}>
              {job_tags.split(',').map(jobTag => (
                <Chip key={jobTag} isReadOnly>
                  {jobTag}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {skip_tags?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`跳过标签`)}
          value={
            <ChipGroup numChips={5} totalChips={skip_tags.split(',').length}>
              {skip_tags.split(',').map(skipTag => (
                <Chip key={skipTag} isReadOnly>
                  {skipTag}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {extra_vars && (
        <VariablesDetail
          label={i18n._(t`变量`)}
          rows={4}
          value={extra_vars}
        />
      )}
    </>
  );
}

export default withI18n()(PromptJobTemplateDetail);
