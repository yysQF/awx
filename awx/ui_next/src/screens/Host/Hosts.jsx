import React, { useState, useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Config } from '../../contexts/Config';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';

import HostList from './HostList';
import HostAdd from './HostAdd';
import Host from './Host';

function Hosts({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/hosts': i18n._(t`主机`),
    '/hosts/add': i18n._(`新建主机`),
  });

  const buildBreadcrumbConfig = useCallback(
    host => {
      if (!host) {
        return;
      }
      setBreadcrumbConfig({
        '/hosts': i18n._(t`主机`),
        '/hosts/add': i18n._(`新建主机`),
        [`/hosts/${host.id}`]: `${host.name}`,
        [`/hosts/${host.id}/edit`]: i18n._(t`编辑详情`),
        [`/hosts/${host.id}/details`]: i18n._(t`详情`),
        [`/hosts/${host.id}/facts`]: i18n._(t`基本信息`),
        [`/hosts/${host.id}/groups`]: i18n._(t`分组`),
        [`/hosts/${host.id}/completed_jobs`]: i18n._(t`已完成的作业`),
      });
    },
    [i18n]
  );

  return (
    <>
      <ScreenHeader streamType="host" breadcrumbConfig={breadcrumbConfig} />
      <Switch>
        <Route path="/hosts/add">
          <HostAdd />
        </Route>
        <Route path="/hosts/:id">
          <Config>
            {({ me }) => (
              <Host setBreadcrumb={buildBreadcrumbConfig} me={me || {}} />
            )}
          </Config>
        </Route>
        <Route path="/hosts">
          <HostList />
        </Route>
      </Switch>
    </>
  );
}

export { Hosts as _Hosts };
export default withI18n()(Hosts);
