import React, { useState, useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Config } from '../../contexts/Config';
import ScreenHeader from '../../components/ScreenHeader';
import TeamList from './TeamList';
import TeamAdd from './TeamAdd';
import Team from './Team';

function Teams({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/teams': i18n._(t`团队`),
    '/teams/add': i18n._(t`Create New Team`),
  });

  const buildBreadcrumbConfig = useCallback(
    team => {
      if (!team) {
        return;
      }

      setBreadcrumbConfig({
        '/teams': i18n._(t`团队`),
        '/teams/add': i18n._(t`Create New Team`),
        [`/teams/${team.id}`]: `${team.name}`,
        [`/teams/${team.id}/edit`]: i18n._(t`编辑详情`),
        [`/teams/${team.id}/details`]: i18n._(t`详情`),
        [`/teams/${team.id}/users`]: i18n._(t`用户`),
        [`/teams/${team.id}/access`]: i18n._(t`使用权`),
        [`/teams/${team.id}/roles`]: i18n._(t`角色`),
      });
    },
    [i18n]
  );

  return (
    <>
      <ScreenHeader streamType="team" breadcrumbConfig={breadcrumbConfig} />
      <Switch>
        <Route path="/teams/add">
          <TeamAdd />
        </Route>
        <Route path="/teams/:id">
          <Team setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/teams">
          <Config>
            {({ me }) => <TeamList path="/teams" me={me || {}} />}
          </Config>
        </Route>
      </Switch>
    </>
  );
}

export { Teams as _Teams };
export default withI18n()(Teams);
