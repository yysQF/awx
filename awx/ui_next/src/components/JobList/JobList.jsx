import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Card } from '@patternfly/react-core';
import AlertModal from '../AlertModal';
import DatalistToolbar from '../DataListToolbar';
import ErrorDetail from '../ErrorDetail';
import PaginatedDataList, { ToolbarDeleteButton } from '../PaginatedDataList';
import useRequest, {
  useDeleteItems,
  useDismissableError,
} from '../../util/useRequest';
import { getQSConfig, parseQueryString } from '../../util/qs';
import JobListItem from './JobListItem';
import JobListCancelButton from './JobListCancelButton';
import useWsJobs from './useWsJobs';
import {
  AdHocCommandsAPI,
  InventoryUpdatesAPI,
  JobsAPI,
  ProjectUpdatesAPI,
  SystemJobsAPI,
  UnifiedJobsAPI,
  WorkflowJobsAPI,
} from '../../api';

function JobList({ i18n, defaultParams, showTypeColumn = false }) {
  const QS_CONFIG = getQSConfig(
    'job',
    {
      page: 1,
      page_size: 20,
      order_by: '-finished',
      not__launch_type: 'sync',
      ...defaultParams,
    },
    ['id', 'page', 'page_size']
  );

  const [selected, setSelected] = useState([]);
  const location = useLocation();
  const {
    result: { results, count, relatedSearchableKeys, searchableKeys },
    error: contentError,
    isLoading,
    request: fetchJobs,
  } = useRequest(
    useCallback(
      async () => {
        const params = parseQueryString(QS_CONFIG, location.search);
        const [response, actionsResponse] = await Promise.all([
          UnifiedJobsAPI.read({ ...params }),
          UnifiedJobsAPI.readOptions(),
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
    fetchJobs();
  }, [fetchJobs]);

  // TODO: update QS_CONFIG to be safe for deps array
  const fetchJobsById = useCallback(
    async ids => {
      const params = parseQueryString(QS_CONFIG, location.search);
      params.id__in = ids.join(',');
      const { data } = await UnifiedJobsAPI.read(params);
      return data.results;
    },
    [location.search] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const jobs = useWsJobs(results, fetchJobsById, QS_CONFIG);

  const isAllSelected = selected.length === jobs.length && selected.length > 0;

  const {
    error: cancelJobsError,
    isLoading: isCancelLoading,
    request: cancelJobs,
  } = useRequest(
    useCallback(async () => {
      return Promise.all(
        selected.map(job => {
          if (['new', 'pending', 'waiting', 'running'].includes(job.status)) {
            return JobsAPI.cancel(job.id, job.type);
          }
          return Promise.resolve();
        })
      );
    }, [selected]),
    {}
  );

  const {
    error: cancelError,
    dismissError: dismissCancelError,
  } = useDismissableError(cancelJobsError);

  const {
    isLoading: isDeleteLoading,
    deleteItems: deleteJobs,
    deletionError,
    clearDeletionError,
  } = useDeleteItems(
    useCallback(() => {
      return Promise.all(
        selected.map(({ type, id }) => {
          switch (type) {
            case 'job':
              return JobsAPI.destroy(id);
            case 'ad_hoc_command':
              return AdHocCommandsAPI.destroy(id);
            case 'system_job':
              return SystemJobsAPI.destroy(id);
            case 'project_update':
              return ProjectUpdatesAPI.destroy(id);
            case 'inventory_update':
              return InventoryUpdatesAPI.destroy(id);
            case 'workflow_job':
              return WorkflowJobsAPI.destroy(id);
            default:
              return null;
          }
        })
      );
    }, [selected]),
    {
      qsConfig: QS_CONFIG,
      allItemsSelected: isAllSelected,
      fetchItems: fetchJobs,
    }
  );

  const handleJobCancel = async () => {
    await cancelJobs();
    setSelected([]);
  };

  const handleJobDelete = async () => {
    await deleteJobs();
    setSelected([]);
  };

  const handleSelectAll = isSelected => {
    setSelected(isSelected ? [...jobs] : []);
  };

  const handleSelect = item => {
    if (selected.some(s => s.id === item.id)) {
      setSelected(selected.filter(s => s.id !== item.id));
    } else {
      setSelected(selected.concat(item));
    }
  };

  return (
    <>
      <Card>
        <PaginatedDataList
          contentError={contentError}
          hasContentLoading={isLoading || isDeleteLoading || isCancelLoading}
          items={jobs}
          itemCount={count}
          pluralizedItemName={i18n._(t`作业`)}
          qsConfig={QS_CONFIG}
          onRowClick={handleSelect}
          toolbarSearchColumns={[
            {
              name: i18n._(t`名称`),
              key: 'name__icontains',
              isDefault: true,
            },
            {
              name: i18n._(t`ID`),
              key: 'id',
            },
            {
              name: i18n._(t`标签名称`),
              key: 'labels__name__icontains',
            },
            {
              name: i18n._(t`作业类型`),
              key: `or__type`,
              options: [
                [`project_update`, i18n._(t`源代码管理更新`)],
                [`inventory_update`, i18n._(t`清单同步`)],
                [`job`, i18n._(t`剧本运行`)],
                [`ad_hoc_command`, i18n._(t`命令行`)],
                [`system_job`, i18n._(t`管理作业`)],
                [`workflow_job`, i18n._(t`工作流作业`)],
              ],
            },
            {
              name: i18n._(t`发起者`),
              key: 'created_by__username__icontains',
            },
            {
              name: i18n._(t`状态`),
              key: 'status',
              options: [
                [`new`, i18n._(t`新建`)],
                [`pending`, i18n._(t`待办`)],
                [`waiting`, i18n._(t`等待`)],
                [`running`, i18n._(t`运行中`)],
                [`successful`, i18n._(t`成功`)],
                [`failed`, i18n._(t`失败`)],
                [`error`, i18n._(t`错误`)],
                [`canceled`, i18n._(t`取消`)],
              ],
            },
            {
              name: i18n._(t`范围`),
              key: 'job__limit',
            },
          ]}
          toolbarSortColumns={[
            {
              name: i18n._(t`结束时间`),
              key: 'finished',
            },
            {
              name: i18n._(t`ID`),
              key: 'id',
            },
            {
              name: i18n._(t`发起者`),
              key: 'created_by__id',
            },
            {
              name: i18n._(t`名称`),
              key: 'name',
            },
            {
              name: i18n._(t`项目`),
              key: 'unified_job_template__project__id',
            },
            {
              name: i18n._(t`开始时间`),
              key: 'started',
            },
          ]}
          toolbarSearchableKeys={searchableKeys}
          toolbarRelatedSearchableKeys={relatedSearchableKeys}
          renderToolbar={props => (
            <DatalistToolbar
              {...props}
              showSelectAll
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              qsConfig={QS_CONFIG}
              additionalControls={[
                <ToolbarDeleteButton
                  key="delete"
                  onDelete={handleJobDelete}
                  itemsToDelete={selected}
                  pluralizedItemName="Jobs"
                />,
                <JobListCancelButton
                  key="cancel"
                  onCancel={handleJobCancel}
                  jobsToCancel={selected}
                />,
              ]}
            />
          )}
          renderItem={job => (
            <JobListItem
              key={job.id}
              job={job}
              showTypeColumn={showTypeColumn}
              onSelect={() => handleSelect(job)}
              isSelected={selected.some(row => row.id === job.id)}
            />
          )}
        />
      </Card>
      {deletionError && (
        <AlertModal
          isOpen
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={clearDeletionError}
        >
          {i18n._(t`删除作业失败`)}
          <ErrorDetail error={deletionError} />
        </AlertModal>
      )}
      {cancelError && (
        <AlertModal
          isOpen
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={dismissCancelError}
        >
          {i18n._(t`取消作业失败`)}
          <ErrorDetail error={cancelError} />
        </AlertModal>
      )}
    </>
  );
}

export default withI18n()(JobList);
