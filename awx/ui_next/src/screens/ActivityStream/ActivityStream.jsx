import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Card,
  PageSection,
  PageSectionVariants,
  SelectGroup,
  Select,
  SelectVariant,
  SelectOption,
  Title,
} from '@patternfly/react-core';

import DatalistToolbar from '../../components/DataListToolbar';
import PaginatedTable, {
  HeaderRow,
  HeaderCell,
} from '../../components/PaginatedTable';
import useRequest from '../../util/useRequest';
import {
  getQSConfig,
  parseQueryString,
  replaceParams,
  encodeNonDefaultQueryString,
} from '../../util/qs';
import { ActivityStreamAPI } from '../../api';

import ActivityStreamListItem from './ActivityStreamListItem';

function ActivityStream({ i18n }) {
  const { light } = PageSectionVariants;

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const urlParams = new URLSearchParams(location.search);

  const activityStreamType = urlParams.get('type') || 'all';

  let typeParams = {};

  if (activityStreamType !== 'all') {
    typeParams = {
      or__object1__in: activityStreamType,
      or__object2__in: activityStreamType,
    };
  }

  const QS_CONFIG = getQSConfig(
    'activity_stream',
    {
      page: 1,
      page_size: 20,
      order_by: '-timestamp',
    },
    ['id', 'page', 'page_size']
  );

  const {
    result: { results, count, relatedSearchableKeys, searchableKeys },
    error: contentError,
    isLoading,
    request: fetchActivityStream,
  } = useRequest(
    useCallback(
      async () => {
        const params = parseQueryString(QS_CONFIG, location.search);
        const [response, actionsResponse] = await Promise.all([
          ActivityStreamAPI.read({ ...params, ...typeParams }),
          ActivityStreamAPI.readOptions(),
        ]);
        return {
          results: response.data.results,
          count: response.data.count,
          relatedSearchableKeys: (
            actionsResponse?.data?.related_search_fields || []
          ).map(val => val.slice(0, -8)),
          searchableKeys: Object.keys(
            actionsResponse.data.actions?.GET || {}
          ).filter(key => actionsResponse.data.actions?.GET[key].filterable),
        };
      },
      [location] // eslint-disable-line react-hooks/exhaustive-deps
    ),
    {
      results: [],
      count: 0,
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );
  useEffect(() => {
    fetchActivityStream();
  }, [fetchActivityStream]);

  const pushHistoryState = urlParamsToAdd => {
    let searchParams = parseQueryString(QS_CONFIG, location.search);
    searchParams = replaceParams(searchParams, { page: 1 });
    const encodedParams = encodeNonDefaultQueryString(QS_CONFIG, searchParams, {
      type: urlParamsToAdd.get('type'),
    });
    history.push(
      encodedParams
        ? `${location.pathname}?${encodedParams}`
        : location.pathname
    );
  };

  return (
    <Fragment>
      <PageSection
        variant={light}
        className="pf-m-condensed"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <Title size="2xl" headingLevel="h2">
          {i18n._(t`活动流`)}
        </Title>
        <span id="grouped-type-select-id" hidden>
          {i18n._(t`活动流类型选择器`)}
        </span>
        <Select
          width="250px"
          maxHeight="480px"
          variant={SelectVariant.single}
          aria-labelledby="grouped-type-select-id"
          className="activityTypeSelect"
          onToggle={setIsTypeDropdownOpen}
          onSelect={(event, selection) => {
            if (selection) {
              urlParams.set('type', selection);
            }
            setIsTypeDropdownOpen(false);
            pushHistoryState(urlParams);
          }}
          selections={activityStreamType}
          isOpen={isTypeDropdownOpen}
          isGrouped
        >
          <SelectGroup label={i18n._(t`视图`)} key="views">
            <SelectOption key="all_activity" value="all">
              {i18n._(t`仪表盘(全部)`)}
            </SelectOption>
            <SelectOption key="jobs" value="job">
              {i18n._(t`作业`)}
            </SelectOption>
            <SelectOption key="schedules" value="schedule">
              {i18n._(t`计划`)}
            </SelectOption>
            <SelectOption key="workflow_approvals" value="workflow_approval">
              {i18n._(t`工作流审批`)}
            </SelectOption>
          </SelectGroup>
          <SelectGroup label={i18n._(t`资源`)} key="resources">
            <SelectOption
              key="templates"
              value="job_template,workflow_job_template,workflow_job_template_node"
            >
              {i18n._(t`模板`)}
            </SelectOption>
            <SelectOption key="credentials" value="credential">
              {i18n._(t`凭证`)}
            </SelectOption>
            <SelectOption key="projects" value="project">
              {i18n._(t`项目`)}
            </SelectOption>
            <SelectOption key="inventories" value="inventory">
              {i18n._(t`清单`)}
            </SelectOption>
            <SelectOption key="hosts" value="host">
              {i18n._(t`主机`)}
            </SelectOption>
          </SelectGroup>
          <SelectGroup label={i18n._(t`使用权`)} key="access">
            <SelectOption key="organizations" value="organization">
              {i18n._(t`组织`)}
            </SelectOption>
            <SelectOption key="users" value="user">
              {i18n._(t`用户`)}
            </SelectOption>
            <SelectOption key="teams" value="team">
              {i18n._(t`团队`)}
            </SelectOption>
          </SelectGroup>
          <SelectGroup label={i18n._(t`管理员`)} key="administration">
            <SelectOption key="credential_types" value="credential_type">
              {i18n._(t`凭证类型`)}
            </SelectOption>
            <SelectOption
              key="notification_templates"
              value="notification_template"
            >
              {i18n._(t`通知模板`)}
            </SelectOption>
            <SelectOption key="instance_groups" value="instance_group">
              {i18n._(t`实例组`)}
            </SelectOption>
            <SelectOption
              key="applications"
              value="o_auth2_application,o_auth2_access_token"
            >
              {i18n._(t`应用 & 令牌`)}
            </SelectOption>
          </SelectGroup>
          <SelectGroup label={i18n._(t`设置`)} key="settings">
            <SelectOption key="settings" value="setting">
              {i18n._(t`设置`)}
            </SelectOption>
          </SelectGroup>
        </Select>
      </PageSection>
      <PageSection>
        <Card>
          <PaginatedTable
            contentError={contentError}
            hasContentLoading={isLoading}
            items={results}
            itemCount={count}
            pluralizedItemName={i18n._(t`事件`)}
            qsConfig={QS_CONFIG}
            toolbarSearchColumns={[
              {
                name: i18n._(t`关键词`),
                key: 'search',
                isDefault: true,
              },
              {
                name: i18n._(t`发起者`),
                key: 'actor__username__icontains',
              },
            ]}
            toolbarSortColumns={[
              {
                name: i18n._(t`时期`),
                key: 'timestamp',
              },
              {
                name: i18n._(t`发起者`),
                key: 'actor__username',
              },
            ]}
            toolbarSearchableKeys={searchableKeys}
            toolbarRelatedSearchableKeys={relatedSearchableKeys}
            headerRow={
              <HeaderRow qsConfig={QS_CONFIG}>
                <HeaderCell sortKey="timestamp">{i18n._(t`时期`)}</HeaderCell>
                <HeaderCell sortKey="actor__username">
                  {i18n._(t`发起者`)}
                </HeaderCell>
                <HeaderCell>{i18n._(t`事件`)}</HeaderCell>
                <HeaderCell>{i18n._(t`操作`)}</HeaderCell>
              </HeaderRow>
            }
            renderToolbar={props => (
              <DatalistToolbar {...props} qsConfig={QS_CONFIG} />
            )}
            renderRow={streamItem => (
              <ActivityStreamListItem streamItem={streamItem} />
            )}
          />
        </Card>
      </PageSection>
    </Fragment>
  );
}

export default withI18n()(ActivityStream);
