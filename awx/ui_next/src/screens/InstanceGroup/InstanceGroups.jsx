import React, { useState, useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Route, Switch } from 'react-router-dom';

import InstanceGroupAdd from './InstanceGroupAdd';
import InstanceGroupList from './InstanceGroupList';
import InstanceGroup from './InstanceGroup';

import ContainerGroupAdd from './ContainerGroupAdd';
import ContainerGroup from './ContainerGroup';
import ScreenHeader from '../../components/ScreenHeader';

function InstanceGroups({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/instance_groups': i18n._(t`实例组`),
    '/instance_groups/add': i18n._(t`创建实例组`),
    '/instance_groups/container_group/add': i18n._(t`创建容器组`),
  });

  const buildBreadcrumbConfig = useCallback(
    instanceGroups => {
      if (!instanceGroups) {
        return;
      }
      setBreadcrumbConfig({
        '/instance_groups': i18n._(t`实例组`),
        '/instance_groups/add': i18n._(t`创建实例组`),
        '/instance_groups/container_group/add': i18n._(
          t`Create container group`
        ),

        [`/instance_groups/${instanceGroups.id}/details`]: i18n._(t`详情`),
        [`/instance_groups/${instanceGroups.id}/instances`]: i18n._(
          t`实例`
        ),
        [`/instance_groups/${instanceGroups.id}/jobs`]: i18n._(t`作业`),
        [`/instance_groups/${instanceGroups.id}/edit`]: i18n._(t`编辑详情`),
        [`/instance_groups/${instanceGroups.id}`]: `${instanceGroups.name}`,

        [`/instance_groups/container_group/${instanceGroups.id}/details`]: i18n._(
          t`Details`
        ),
        [`/instance_groups/container_group/${instanceGroups.id}/jobs`]: i18n._(
          t`Jobs`
        ),
        [`/instance_groups/container_group/${instanceGroups.id}/edit`]: i18n._(
          t`编辑详情`
        ),
        [`/instance_groups/container_group/${instanceGroups.id}`]: `${instanceGroups.name}`,
      });
    },
    [i18n]
  );
  return (
    <>
      <ScreenHeader
        streamType="instance_group"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path="/instance_groups/container_group/add">
          <ContainerGroupAdd />
        </Route>
        <Route path="/instance_groups/container_group/:id">
          <ContainerGroup setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/instance_groups/add">
          <InstanceGroupAdd />
        </Route>
        <Route path="/instance_groups/:id">
          <InstanceGroup setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/instance_groups">
          <InstanceGroupList />
        </Route>
      </Switch>
    </>
  );
}

export default withI18n()(InstanceGroups);
