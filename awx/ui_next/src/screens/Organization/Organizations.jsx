import React, { useCallback, useState, Fragment } from 'react';
import { Route, withRouter, Switch, useRouteMatch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Config } from '../../contexts/Config';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';

import OrganizationsList from './OrganizationList/OrganizationList';
import OrganizationAdd from './OrganizationAdd/OrganizationAdd';
import Organization from './Organization';

function Organizations({ i18n }) {
  const match = useRouteMatch();
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/organizations': i18n._(t`组织`),
    '/organizations/add': i18n._(t`Create New Organization`),
  });

  const setBreadcrumb = useCallback(
    organization => {
      if (!organization) {
        return;
      }

      const breadcrumb = {
        '/organizations': i18n._(t`组织`),
        '/organizations/add': i18n._(t`Create New Organization`),
        [`/organizations/${organization.id}`]: `${organization.name}`,
        [`/organizations/${organization.id}/edit`]: i18n._(t`编辑详情`),
        [`/organizations/${organization.id}/details`]: i18n._(t`详情`),
        [`/organizations/${organization.id}/access`]: i18n._(t`使用权`),
        [`/organizations/${organization.id}/teams`]: i18n._(t`团队`),
        [`/organizations/${organization.id}/notifications`]: i18n._(
          t`通知`
        ),
      };
      setBreadcrumbConfig(breadcrumb);
    },
    [i18n]
  );

  return (
    <Fragment>
      <ScreenHeader
        streamType="organization"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path={`${match.path}/add`}>
          <OrganizationAdd />
        </Route>
        <Route path={`${match.path}/:id`}>
          <Config>
            {({ me }) => (
              <Organization setBreadcrumb={setBreadcrumb} me={me || {}} />
            )}
          </Config>
        </Route>
        <Route path={`${match.path}`}>
          <OrganizationsList />
        </Route>
      </Switch>
    </Fragment>
  );
}

export { Organizations as _Organizations };
export default withI18n()(withRouter(Organizations));
