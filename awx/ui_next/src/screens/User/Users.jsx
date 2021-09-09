import React, { Fragment, useState, useCallback } from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { Config } from '../../contexts/Config';

import UsersList from './UserList/UserList';
import UserAdd from './UserAdd/UserAdd';
import User from './User';

function Users({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/users': i18n._(t`用户`),
    '/users/add': i18n._(t`Create New User`),
  });
  const match = useRouteMatch();

  const addUserBreadcrumb = useCallback(
    (user, token) => {
      if (!user) {
        return;
      }

      setBreadcrumbConfig({
        '/users': i18n._(t`用户`),
        '/users/add': i18n._(t`Create New User`),
        [`/users/${user.id}`]: `${user.username}`,
        [`/users/${user.id}/edit`]: i18n._(t`编辑详情`),
        [`/users/${user.id}/details`]: i18n._(t`详情`),
        [`/users/${user.id}/roles`]: i18n._(t`角色`),
        [`/users/${user.id}/teams`]: i18n._(t`团队`),
        [`/users/${user.id}/organizations`]: i18n._(t`组织`),
        [`/users/${user.id}/tokens`]: i18n._(t`令牌`),
        [`/users/${user.id}/tokens/add`]: i18n._(t`创建用户令牌`),
        [`/users/${user.id}/tokens/${token && token.id}`]: i18n._(
          t`Application Name`
        ),
        [`/users/${user.id}/tokens/${token && token.id}/details`]: i18n._(
          t`Details`
        ),
      });
    },
    [i18n]
  );
  return (
    <Fragment>
      <ScreenHeader streamType="user" breadcrumbConfig={breadcrumbConfig} />
      <Switch>
        <Route path={`${match.path}/add`}>
          <UserAdd />
        </Route>
        <Route path={`${match.path}/:id`}>
          <Config>
            {({ me }) => (
              <User setBreadcrumb={addUserBreadcrumb} me={me || {}} />
            )}
          </Config>
        </Route>
        <Route path={`${match.path}`}>
          <UsersList />
        </Route>
      </Switch>
    </Fragment>
  );
}

export { Users as _Users };
export default withI18n()(Users);
