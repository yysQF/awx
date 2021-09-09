import React, { useState, useCallback, useRef } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Route, Switch } from 'react-router-dom';

import { Config } from '../../contexts/Config';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { InventoryList } from './InventoryList';
import Inventory from './Inventory';
import SmartInventory from './SmartInventory';
import InventoryAdd from './InventoryAdd';
import SmartInventoryAdd from './SmartInventoryAdd';

function Inventories({ i18n }) {
  const initScreenHeader = useRef({
    '/inventories': i18n._(t`清单列表`),
    '/inventories/inventory/add': i18n._(t`新建清单`),
    '/inventories/smart_inventory/add': i18n._(t`新建智能清单`),
  });

  const [breadcrumbConfig, setScreenHeader] = useState(
    initScreenHeader.current
  );

  const [inventory, setInventory] = useState();
  const [nestedObject, setNestedGroup] = useState();
  const [schedule, setSchedule] = useState();

  const setBreadcrumbConfig = useCallback(
    (passedInventory, passedNestedObject, passedSchedule) => {
      if (passedInventory && passedInventory.name !== inventory?.name) {
        setInventory(passedInventory);
      }
      if (
        passedNestedObject &&
        passedNestedObject.name !== nestedObject?.name
      ) {
        setNestedGroup(passedNestedObject);
      }
      if (passedSchedule && passedSchedule.name !== schedule?.name) {
        setSchedule(passedSchedule);
      }
      if (!inventory) {
        return;
      }

      const inventoryKind =
        inventory.kind === 'smart' ? 'smart_inventory' : 'inventory';

      const inventoryPath = `/inventories/${inventoryKind}/${inventory.id}`;
      const inventoryHostsPath = `${inventoryPath}/hosts`;
      const inventoryGroupsPath = `${inventoryPath}/groups`;
      const inventorySourcesPath = `${inventoryPath}/sources`;

      setScreenHeader({
        ...initScreenHeader.current,
        [inventoryPath]: `${inventory.name}`,
        [`${inventoryPath}/access`]: i18n._(t`使用权`),
        [`${inventoryPath}/completed_jobs`]: i18n._(t`已完成的作业列表`),
        [`${inventoryPath}/details`]: i18n._(t`详情`),
        [`${inventoryPath}/edit`]: i18n._(t`编辑详情`),

        [inventoryHostsPath]: i18n._(t`主机`),
        [`${inventoryHostsPath}/add`]: i18n._(t`新建主机`),
        [`${inventoryHostsPath}/${nestedObject?.id}`]: `${nestedObject?.name}`,
        [`${inventoryHostsPath}/${nestedObject?.id}/edit`]: i18n._(
          t`编辑详情`
        ),
        [`${inventoryHostsPath}/${nestedObject?.id}/details`]: i18n._(
          t`Host details`
        ),
        [`${inventoryHostsPath}/${nestedObject?.id}/completed_jobs`]: i18n._(
          t`已完成的作业列表`
        ),
        [`${inventoryHostsPath}/${nestedObject?.id}/facts`]: i18n._(t`基本信息`),
        [`${inventoryHostsPath}/${nestedObject?.id}/groups`]: i18n._(t`分组`),

        [inventoryGroupsPath]: i18n._(t`分组`),
        [`${inventoryGroupsPath}/add`]: i18n._(t`新建分组`),
        [`${inventoryGroupsPath}/${nestedObject?.id}`]: `${nestedObject?.name}`,
        [`${inventoryGroupsPath}/${nestedObject?.id}/edit`]: i18n._(
          t`编辑详情`
        ),
        [`${inventoryGroupsPath}/${nestedObject?.id}/details`]: i18n._(
          t`分组详情`
        ),
        [`${inventoryGroupsPath}/${nestedObject?.id}/nested_hosts`]: i18n._(
          t`主机`
        ),
        [`${inventoryGroupsPath}/${nestedObject?.id}/nested_hosts/add`]: i18n._(
          t`新建主机`
        ),
        [`${inventoryGroupsPath}/${nestedObject?.id}/nested_groups`]: i18n._(
          t`相关分组`
        ),
        [`${inventoryGroupsPath}/${nestedObject?.id}/nested_groups/add`]: i18n._(
          t`新建分组`
        ),

        [`${inventorySourcesPath}`]: i18n._(t`资源`),
        [`${inventorySourcesPath}/add`]: i18n._(t`Create new source`),
        [`${inventorySourcesPath}/${nestedObject?.id}`]: `${nestedObject?.name}`,
        [`${inventorySourcesPath}/${nestedObject?.id}/details`]: i18n._(
          t`Details`
        ),
        [`${inventorySourcesPath}/${nestedObject?.id}/edit`]: i18n._(
          t`编辑详情`
        ),
        [`${inventorySourcesPath}/${nestedObject?.id}/schedules`]: i18n._(
          t`Schedules`
        ),
        [`${inventorySourcesPath}/${nestedObject?.id}/schedules/${schedule?.id}`]: `${schedule?.name}`,
        [`${inventorySourcesPath}/${nestedObject?.id}/schedules/add`]: i18n._(
          t`新建计划`
        ),
        [`${inventorySourcesPath}/${nestedObject?.id}/schedules/${schedule?.id}/details`]: i18n._(
          t`Schedule details`
        ),
        [`${inventorySourcesPath}/${nestedObject?.id}/notifications`]: i18n._(
          t`Notifcations`
        ),
      });
    },
    [i18n, inventory, nestedObject, schedule]
  );

  return (
    <>
      <ScreenHeader
        streamType="inventory"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path="/inventories/inventory/add">
          <InventoryAdd />
        </Route>
        <Route path="/inventories/smart_inventory/add">
          <SmartInventoryAdd />
        </Route>
        <Route path="/inventories/inventory/:id">
          <Config>
            {({ me }) => (
              <Inventory setBreadcrumb={setBreadcrumbConfig} me={me || {}} />
            )}
          </Config>
        </Route>
        <Route path="/inventories/smart_inventory/:id">
          <SmartInventory setBreadcrumb={setBreadcrumbConfig} />
        </Route>
        <Route path="/inventories">
          <InventoryList />
        </Route>
      </Switch>
    </>
  );
}

export { Inventories as _Inventories };
export default withI18n()(Inventories);
