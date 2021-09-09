import React, { useState, useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Config } from '../../contexts/Config';
import ScreenHeader from '../../components/ScreenHeader';
import Credential from './Credential';
import CredentialAdd from './CredentialAdd';
import { CredentialList } from './CredentialList';

function Credentials({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/credentials': i18n._(t`凭证列表`),
    '/credentials/add': i18n._(t`新建凭证`),
  });

  const buildBreadcrumbConfig = useCallback(
    credential => {
      if (!credential) {
        return;
      }

      setBreadcrumbConfig({
        '/credentials': i18n._(t`凭证列表`),
        '/credentials/add': i18n._(t`新建凭证`),
        [`/credentials/${credential.id}`]: `${credential.name}`,
        [`/credentials/${credential.id}/edit`]: i18n._(t`编辑详情`),
        [`/credentials/${credential.id}/details`]: i18n._(t`详情`),
        [`/credentials/${credential.id}/access`]: i18n._(t`使用权`),
      });
    },
    [i18n]
  );

  return (
    <>
      <ScreenHeader
        streamType="credential"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path="/credentials/add">
          <Config>{({ me }) => <CredentialAdd me={me || {}} />}</Config>
        </Route>
        <Route path="/credentials/:id">
          <Credential setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/credentials">
          <CredentialList />
        </Route>
      </Switch>
    </>
  );
}

export default withI18n()(Credentials);
