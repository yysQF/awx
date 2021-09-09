import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useRouteMatch, Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Card, PageSection, DropdownItem } from '@patternfly/react-core';
import { InventoriesAPI } from '../../../api';
import useRequest, { useDeleteItems } from '../../../util/useRequest';
import AlertModal from '../../../components/AlertModal';
import DatalistToolbar from '../../../components/DataListToolbar';
import ErrorDetail from '../../../components/ErrorDetail';
import { ToolbarDeleteButton } from '../../../components/PaginatedDataList';
import PaginatedTable, {
  HeaderRow,
  HeaderCell,
} from '../../../components/PaginatedTable';
import { getQSConfig, parseQueryString } from '../../../util/qs';
import useWsInventories from './useWsInventories';
import AddDropDownButton from '../../../components/AddDropDownButton';
import InventoryListItem from './InventoryListItem';

const QS_CONFIG = getQSConfig('inventory', {
  page: 1,
  page_size: 20,
  order_by: 'name',
});

function InventoryList({ i18n }) {
  const location = useLocation();
  const match = useRouteMatch();
  const [selected, setSelected] = useState([]);

  const {
    result: {
      results,
      itemCount,
      actions,
      relatedSearchableKeys,
      searchableKeys,
    },
    error: contentError,
    isLoading,
    request: fetchInventories,
  } = useRequest(
    useCallback(async () => {
      const params = parseQueryString(QS_CONFIG, location.search);
      const [response, actionsResponse] = await Promise.all([
        InventoriesAPI.read(params),
        InventoriesAPI.readOptions(),
      ]);
      return {
        results: response.data.results,
        itemCount: response.data.count,
        actions: actionsResponse.data.actions,
        relatedSearchableKeys: (
          actionsResponse?.data?.related_search_fields || []
        ).map(val => val.slice(0, -8)),
        searchableKeys: Object.keys(
          actionsResponse.data.actions?.GET || {}
        ).filter(key => actionsResponse.data.actions?.GET[key].filterable),
      };
    }, [location]),
    {
      results: [],
      itemCount: 0,
      actions: {},
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const fetchInventoriesById = useCallback(
    async ids => {
      const params = { ...parseQueryString(QS_CONFIG, location.search) };
      params.id__in = ids.join(',');
      const { data } = await InventoriesAPI.read(params);
      return data.results;
    },
    [location.search] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const inventories = useWsInventories(
    results,
    fetchInventories,
    fetchInventoriesById,
    QS_CONFIG
  );

  const isAllSelected =
    selected.length === inventories.length && selected.length > 0;
  const {
    isLoading: isDeleteLoading,
    deleteItems: deleteInventories,
    deletionError,
    clearDeletionError,
  } = useDeleteItems(
    useCallback(() => {
      return Promise.all(selected.map(team => InventoriesAPI.destroy(team.id)));
    }, [selected]),
    {
      allItemsSelected: isAllSelected,
    }
  );

  const handleInventoryDelete = async () => {
    await deleteInventories();
    setSelected([]);
  };

  const hasContentLoading = isDeleteLoading || isLoading;
  const canAdd = actions && actions.POST;

  const handleSelectAll = isSelected => {
    setSelected(isSelected ? [...inventories] : []);
  };

  const handleSelect = row => {
    if (!row.pending_deletion) {
      if (selected.some(s => s.id === row.id)) {
        setSelected(selected.filter(s => s.id !== row.id));
      } else {
        setSelected(selected.concat(row));
      }
    }
  };
  const addInventory = i18n._(t`添加清单`);
  const addSmartInventory = i18n._(t`添加智能清单`);
  const addButton = (
    <AddDropDownButton
      key="add"
      dropdownItems={[
        <DropdownItem
          to={`${match.url}/inventory/add/`}
          component={Link}
          key={addInventory}
          aria-label={addInventory}
        >
          {addInventory}
        </DropdownItem>,
        <DropdownItem
          to={`${match.url}/smart_inventory/add/`}
          component={Link}
          key={addSmartInventory}
          aria-label={addSmartInventory}
        >
          {addSmartInventory}
        </DropdownItem>,
      ]}
    />
  );

  return (
    <PageSection>
      <Card>
        <PaginatedTable
          contentError={contentError}
          hasContentLoading={hasContentLoading}
          items={inventories}
          itemCount={itemCount}
          pluralizedItemName={i18n._(t`清单列表`)}
          qsConfig={QS_CONFIG}
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
              name: i18n._(t`名称`),
              key: 'name',
            },
          ]}
          toolbarSearchableKeys={searchableKeys}
          toolbarRelatedSearchableKeys={relatedSearchableKeys}
          headerRow={
            <HeaderRow qsConfig={QS_CONFIG}>
              <HeaderCell sortKey="name">{i18n._(t`名称`)}</HeaderCell>
              <HeaderCell>{i18n._(t`状态`)}</HeaderCell>
              <HeaderCell>{i18n._(t`类型`)}</HeaderCell>
              <HeaderCell>{i18n._(t`组织`)}</HeaderCell>
              <HeaderCell>{i18n._(t`分组`)}</HeaderCell>
              <HeaderCell>{i18n._(t`主机`)}</HeaderCell>
              <HeaderCell>{i18n._(t`资源`)}</HeaderCell>
              <HeaderCell>{i18n._(t`操作`)}</HeaderCell>
            </HeaderRow>
          }
          renderToolbar={props => (
            <DatalistToolbar
              {...props}
              showSelectAll
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              qsConfig={QS_CONFIG}
              additionalControls={[
                ...(canAdd ? [addButton] : []),
                <ToolbarDeleteButton
                  key="delete"
                  onDelete={handleInventoryDelete}
                  itemsToDelete={selected}
                  pluralizedItemName={i18n._(t`清单列表`)}
                  warningMessage={i18n._(
                    '在处理最终删除之前，库存将处于待处理状态',
                    { numItemsToDelete: selected.length }
                  )}
                />,
              ]}
            />
          )}
          renderRow={(inventory, index) => (
            <InventoryListItem
              key={inventory.id}
              value={inventory.name}
              inventory={inventory}
              rowIndex={index}
              fetchInventories={fetchInventories}
              detailUrl={
                inventory.kind === 'smart'
                  ? `${match.url}/smart_inventory/${inventory.id}/details`
                  : `${match.url}/inventory/${inventory.id}/details`
              }
              onSelect={() => handleSelect(inventory)}
              isSelected={selected.some(row => row.id === inventory.id)}
            />
          )}
          emptyStateControls={canAdd && addButton}
        />
      </Card>
      <AlertModal
        isOpen={deletionError}
        variant="error"
        aria-label={i18n._(t`Deletion Error`)}
        title={i18n._(t`Error!`)}
        onClose={clearDeletionError}
      >
        {i18n._(t`Failed to delete one or more inventories.`)}
        <ErrorDetail error={deletionError} />
      </AlertModal>
    </PageSection>
  );
}

export default withI18n()(InventoryList);
