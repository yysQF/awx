import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Card, DropdownItem } from '@patternfly/react-core';
import {
  JobTemplatesAPI,
  UnifiedJobTemplatesAPI,
  WorkflowJobTemplatesAPI,
} from '../../../api';
import AlertModal from '../../../components/AlertModal';
import DatalistToolbar from '../../../components/DataListToolbar';
import ErrorDetail from '../../../components/ErrorDetail';
import PaginatedDataList, {
  ToolbarDeleteButton,
} from '../../../components/PaginatedDataList';
import useRequest, { useDeleteItems } from '../../../util/useRequest';
import { getQSConfig, parseQueryString } from '../../../util/qs';
import useWsTemplates from '../../../util/useWsTemplates';
import AddDropDownButton from '../../../components/AddDropDownButton';
import TemplateListItem from './TemplateListItem';

// The type value in const QS_CONFIG below does not have a space between job_template and
// workflow_job_template so the params sent to the API match what the api expects.
const QS_CONFIG = getQSConfig('template', {
  page: 1,
  page_size: 20,
  order_by: 'name',
  type: 'job_template,workflow_job_template',
});

function TemplateList({ i18n }) {
  const location = useLocation();
  const [selected, setSelected] = useState([]);

  const {
    result: {
      results,
      count,
      jtActions,
      wfjtActions,
      relatedSearchableKeys,
      searchableKeys,
    },
    error: contentError,
    isLoading,
    request: fetchTemplates,
  } = useRequest(
    useCallback(async () => {
      const params = parseQueryString(QS_CONFIG, location.search);
      const responses = await Promise.all([
        UnifiedJobTemplatesAPI.read(params),
        JobTemplatesAPI.readOptions(),
        WorkflowJobTemplatesAPI.readOptions(),
        UnifiedJobTemplatesAPI.readOptions(),
      ]);
      return {
        results: responses[0].data.results,
        count: responses[0].data.count,
        jtActions: responses[1].data.actions,
        wfjtActions: responses[2].data.actions,
        relatedSearchableKeys: (
          responses[3]?.data?.related_search_fields || []
        ).map(val => val.slice(0, -8)),
        searchableKeys: Object.keys(
          responses[3].data.actions?.GET || {}
        ).filter(key => responses[3].data.actions?.GET[key].filterable),
      };
    }, [location]),
    {
      results: [],
      count: 0,
      jtActions: {},
      wfjtActions: {},
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const templates = useWsTemplates(results);

  const isAllSelected =
    selected.length === templates.length && selected.length > 0;
  const {
    isLoading: isDeleteLoading,
    deleteItems: deleteTemplates,
    deletionError,
    clearDeletionError,
  } = useDeleteItems(
    useCallback(() => {
      return Promise.all(
        selected.map(({ type, id }) => {
          if (type === 'job_template') {
            return JobTemplatesAPI.destroy(id);
          }
          if (type === 'workflow_job_template') {
            return WorkflowJobTemplatesAPI.destroy(id);
          }
          return false;
        })
      );
    }, [selected]),
    {
      qsConfig: QS_CONFIG,
      allItemsSelected: isAllSelected,
      fetchItems: fetchTemplates,
    }
  );

  const handleTemplateDelete = async () => {
    await deleteTemplates();
    setSelected([]);
  };

  const handleSelectAll = isSelected => {
    setSelected(isSelected ? [...templates] : []);
  };

  const handleSelect = template => {
    if (selected.some(s => s.id === template.id)) {
      setSelected(selected.filter(s => s.id !== template.id));
    } else {
      setSelected(selected.concat(template));
    }
  };

  const canAddJT =
    jtActions && Object.prototype.hasOwnProperty.call(jtActions, 'POST');
  const canAddWFJT =
    wfjtActions && Object.prototype.hasOwnProperty.call(wfjtActions, 'POST');

  const addTemplate = i18n._(t`添加作业模板`);
  const addWFTemplate = i18n._(t`添加工作流模板`);
  const addDropDownButton = [];
  if (canAddJT) {
    addDropDownButton.push(
      <DropdownItem
        key={addTemplate}
        component={Link}
        to="/templates/job_template/add/"
        aria-label={addTemplate}
      >
        {addTemplate}
      </DropdownItem>
    );
  }
  if (canAddWFJT) {
    addDropDownButton.push(
      <DropdownItem
        component={Link}
        to="/templates/workflow_job_template/add/"
        key={addWFTemplate}
        aria-label={addWFTemplate}
      >
        {addWFTemplate}
      </DropdownItem>
    );
  }
  const addButton = (
    <AddDropDownButton key="add" dropdownItems={addDropDownButton} />
  );

  return (
    <Fragment>
      <Card>
        <PaginatedDataList
          contentError={contentError}
          hasContentLoading={isLoading || isDeleteLoading}
          items={templates}
          itemCount={count}
          pluralizedItemName={i18n._(t`模板列表`)}
          qsConfig={QS_CONFIG}
          onRowClick={handleSelect}
          toolbarSearchColumns={[
            {
              name: i18n._(t`名称`),
              key: 'name__icontains',
              isDefault: true,
            },
            {
              name: i18n._(t`描述`),
              key: 'description__icontains',
            },
            {
              name: i18n._(t`类型`),
              key: 'or__type',
              options: [
                [`job_template`, i18n._(t`作业模板`)],
                [`workflow_job_template`, i18n._(t`Workflow Template`)],
              ],
            },
            {
              name: i18n._(t`剧本名称`),
              key: 'job_template__playbook__icontains',
            },
            {
              name: i18n._(t`创建者`),
              key: 'created_by__username__icontains',
            },
            {
              name: i18n._(t`修改者`),
              key: 'modified_by__username__icontains',
            },
          ]}
          toolbarSortColumns={[
            {
              name: i18n._(t`清单`),
              key: 'job_template__inventory__id',
            },
            {
              name: i18n._(t`最后运行`),
              key: 'last_job_run',
            },
            {
              name: i18n._(t`更改`),
              key: 'modified',
            },
            {
              name: i18n._(t`名称`),
              key: 'name',
            },
            {
              name: i18n._(t`项目`),
              key: 'jobtemplate__project__id',
            },
            {
              name: i18n._(t`类型`),
              key: 'type',
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
                ...(canAddJT || canAddWFJT ? [addButton] : []),
                <ToolbarDeleteButton
                  key="delete"
                  onDelete={handleTemplateDelete}
                  itemsToDelete={selected}
                  pluralizedItemName="Templates"
                />,
              ]}
            />
          )}
          renderItem={template => (
            <TemplateListItem
              key={template.id}
              value={template.name}
              template={template}
              detailUrl={`/templates/${template.type}/${template.id}`}
              onSelect={() => handleSelect(template)}
              isSelected={selected.some(row => row.id === template.id)}
              fetchTemplates={fetchTemplates}
            />
          )}
          emptyStateControls={(canAddJT || canAddWFJT) && addButton}
        />
      </Card>
      <AlertModal
        aria-label={i18n._(t`Deletion Error`)}
        isOpen={deletionError}
        variant="error"
        title={i18n._(t`Error!`)}
        onClose={clearDeletionError}
      >
        {i18n._(t`Failed to delete one or more templates.`)}
        <ErrorDetail error={deletionError} />
      </AlertModal>
    </Fragment>
  );
}

export default withI18n()(TemplateList);
