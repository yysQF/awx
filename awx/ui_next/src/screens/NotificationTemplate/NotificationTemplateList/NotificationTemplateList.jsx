import React, { useCallback, useEffect } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Card, PageSection } from '@patternfly/react-core';
import { NotificationTemplatesAPI } from '../../../api';
import PaginatedDataList, {
  ToolbarAddButton,
  ToolbarDeleteButton,
} from '../../../components/PaginatedDataList';
import AlertModal from '../../../components/AlertModal';
import ErrorDetail from '../../../components/ErrorDetail';
import DataListToolbar from '../../../components/DataListToolbar';
import NotificationTemplateListItem from './NotificationTemplateListItem';
import useRequest, { useDeleteItems } from '../../../util/useRequest';
import useSelected from '../../../util/useSelected';
import { getQSConfig, parseQueryString } from '../../../util/qs';

const QS_CONFIG = getQSConfig('notification-templates', {
  page: 1,
  page_size: 20,
  order_by: 'name',
});

function NotificationTemplatesList({ i18n }) {
  const location = useLocation();
  const match = useRouteMatch();

  const addUrl = `${match.url}/add`;

  const {
    result: {
      templates,
      count,
      actions,
      relatedSearchableKeys,
      searchableKeys,
    },
    error: contentError,
    isLoading: isTemplatesLoading,
    request: fetchTemplates,
  } = useRequest(
    useCallback(async () => {
      const params = parseQueryString(QS_CONFIG, location.search);
      const [response, actionsResponse] = await Promise.all([
        NotificationTemplatesAPI.read(params),
        NotificationTemplatesAPI.readOptions(),
      ]);
      return {
        templates: response.data.results,
        count: response.data.count,
        actions: actionsResponse.data.actions,
        relatedSearchableKeys: (
          actionsResponse.data?.related_search_fields || []
        ).map(val => val.slice(0, -8)),
        searchableKeys: Object.keys(
          actionsResponse.data.actions?.GET || {}
        ).filter(key => actionsResponse.data.actions?.GET[key].filterable),
      };
    }, [location]),
    {
      templates: [],
      count: 0,
      actions: {},
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const { selected, isAllSelected, handleSelect, setSelected } = useSelected(
    templates
  );

  const {
    isLoading: isDeleteLoading,
    deleteItems: deleteTemplates,
    deletionError,
    clearDeletionError,
  } = useDeleteItems(
    useCallback(() => {
      return Promise.all(
        selected.map(({ id }) => NotificationTemplatesAPI.destroy(id))
      );
    }, [selected]),
    {
      qsConfig: QS_CONFIG,
      allItemsSelected: isAllSelected,
      fetchItems: fetchTemplates,
    }
  );

  const handleDelete = async () => {
    await deleteTemplates();
    setSelected([]);
  };

  const canAdd = actions && actions.POST;

  return (
    <>
      <PageSection>
        <Card>
          <PaginatedDataList
            contentError={contentError}
            hasContentLoading={isTemplatesLoading || isDeleteLoading}
            items={templates}
            itemCount={count}
            pluralizedItemName={i18n._(t`通知模板`)}
            qsConfig={QS_CONFIG}
            onRowClick={handleSelect}
            toolbarSearchColumns={[
              {
                name: i18n._(t`名称`),
                key: 'name',
                isDefault: true,
              },
              {
                name: i18n._(t`描述`),
                key: 'description__icontains',
              },
              {
                name: i18n._(t`通知类型`),
                key: 'or__notification_type',
                options: [
                  ['email', i18n._(t`邮箱`)],
                  ['grafana', i18n._(t`Grafana`)],
                  ['hipchat', i18n._(t`Hipchat`)],
                  ['irc', i18n._(t`IRC`)],
                  ['mattermost', i18n._(t`Mattermost`)],
                  ['pagerduty', i18n._(t`Pagerduty`)],
                  ['rocketchat', i18n._(t`Rocket.Chat`)],
                  ['slack', i18n._(t`Slack`)],
                  ['twilio', i18n._(t`Twilio`)],
                  ['webhook', i18n._(t`Webhook`)],
                ],
              },
              {
                name: i18n._(t`创建者(用户名)`),
                key: 'created_by__username__icontains',
              },
              {
                name: i18n._(t`修改者(用户名)`),
                key: 'modified_by__username__icontains',
              },
            ]}
            toolbarSearchableKeys={searchableKeys}
            toolbarRelatedSearchableKeys={relatedSearchableKeys}
            toolbarSortColumns={[
              {
                name: i18n._(t`名称`),
                key: 'name',
              },
              {
                name: i18n._(t`类型`),
                key: 'notification_type',
              },
            ]}
            renderToolbar={props => (
              <DataListToolbar
                {...props}
                showSelectAll
                isAllSelected={isAllSelected}
                onSelectAll={set => setSelected(set ? [...templates] : [])}
                qsConfig={QS_CONFIG}
                additionalControls={[
                  ...(canAdd
                    ? [<ToolbarAddButton key="add" linkTo={addUrl} />]
                    : []),
                  <ToolbarDeleteButton
                    key="delete"
                    onDelete={handleDelete}
                    itemsToDelete={selected}
                    pluralizedItemName={i18n._(t`通知模板`)}
                  />,
                ]}
              />
            )}
            renderItem={template => (
              <NotificationTemplateListItem
                key={template.id}
                fetchTemplates={fetchTemplates}
                template={template}
                detailUrl={`${match.url}/${template.id}`}
                isSelected={selected.some(row => row.id === template.id)}
                onSelect={() => handleSelect(template)}
              />
            )}
            emptyStateControls={
              canAdd ? <ToolbarAddButton key="add" linkTo={addUrl} /> : null
            }
          />
        </Card>
      </PageSection>
      <AlertModal
        isOpen={deletionError}
        variant="error"
        title={i18n._(t`Error!`)}
        onClose={clearDeletionError}
      >
        {i18n._(t`删除一个或多个通知模板失败`)}
        <ErrorDetail error={deletionError} />
      </AlertModal>
    </>
  );
}

export default withI18n()(NotificationTemplatesList);
