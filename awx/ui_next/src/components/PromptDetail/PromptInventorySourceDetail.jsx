import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Link } from 'react-router-dom';

import { Chip, List, ListItem } from '@patternfly/react-core';
import { Detail, DeletedDetail } from '../DetailList';
import { VariablesDetail } from '../CodeMirrorInput';
import CredentialChip from '../CredentialChip';
import ChipGroup from '../ChipGroup';

function PromptInventorySourceDetail({ i18n, resource }) {
  const {
    custom_virtualenv,
    group_by,
    instance_filters,
    overwrite,
    overwrite_vars,
    source,
    source_regions,
    source_vars,
    source_path,
    summary_fields,
    update_cache_timeout,
    update_on_launch,
    update_on_project_update,
    verbosity,
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
    overwrite ||
    overwrite_vars ||
    update_on_launch ||
    update_on_project_update
  ) {
    optionsList = (
      <List>
        {overwrite && <ListItem>{i18n._(t`覆盖`)}</ListItem>}
        {overwrite_vars && (
          <ListItem>{i18n._(t`覆盖变量`)}</ListItem>
        )}
        {update_on_launch && <ListItem>{i18n._(t`运行时更新`)}</ListItem>}
        {update_on_project_update && (
          <ListItem>{i18n._(t`项目更新时更新`)}</ListItem>
        )}
      </List>
    );
  }

  return (
    <>
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
      {summary_fields?.inventory && (
        <Detail
          label={i18n._(t`清单`)}
          value={
            <Link to={`/inventories/${summary_fields.inventory?.id}/details`}>
              {summary_fields?.inventory?.name}
            </Link>
          }
        />
      )}
      <Detail label={i18n._(t`源`)} value={source} />
      <Detail
        label={i18n._(t`Ansible 环境`)}
        value={custom_virtualenv}
      />
      {summary_fields?.source_project && (
        <Detail
          label={i18n._(t`项目`)}
          value={
            <Link to={`/projects/${summary_fields.source_project?.id}/details`}>
              {summary_fields.source_project?.name}
            </Link>
          }
        />
      )}
      <Detail label={i18n._(t`清单文件`)} value={source_path} />
      <Detail label={i18n._(t`详细程度`)} value={VERBOSITY[verbosity]} />
      <Detail
        label={i18n._(t`缓存超时`)}
        value={`${update_cache_timeout} ${i18n._(t`秒`)}`}
      />
      {summary_fields?.credentials?.length > 0 && (
        <Detail
          fullWidth
          label={i18n._(t`自定义节点规范`)}
          value={summary_fields.credentials.map(cred => (
            <CredentialChip key={cred?.id} credential={cred} isReadOnly />
          ))}
        />
      )}
      {source_regions && (
        <Detail
          fullWidth
          label={i18n._(t`地区`)}
          value={
            <ChipGroup
              numChips={5}
              totalChips={source_regions.split(',').length}
            >
              {source_regions.split(',').map(region => (
                <Chip key={region} isReadOnly>
                  {region}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {instance_filters && (
        <Detail
          fullWidth
          label={i18n._(t`实例过滤器`)}
          value={
            <ChipGroup
              numChips={5}
              totalChips={instance_filters.split(',').length}
            >
              {instance_filters.split(',').map(filter => (
                <Chip key={filter} isReadOnly>
                  {filter}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {group_by && (
        <Detail
          fullWidth
          label={i18n._(t`仅分组依据`)}
          value={
            <ChipGroup numChips={5} totalChips={group_by.split(',').length}>
              {group_by.split(',').map(group => (
                <Chip key={group} isReadOnly>
                  {group}
                </Chip>
              ))}
            </ChipGroup>
          }
        />
      )}
      {optionsList && <Detail label={i18n._(t`选项`)} value={optionsList} />}
      {source_vars && (
        <VariablesDetail
          label={i18n._(t`源变量`)}
          rows={4}
          value={source_vars}
        />
      )}
    </>
  );
}

export default withI18n()(PromptInventorySourceDetail);
