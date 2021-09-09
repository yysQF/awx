import React, { useState, useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Route, Switch } from 'react-router-dom';

import CredentialTypeAdd from './CredentialTypeAdd';
import CredentialTypeList from './CredentialTypeList';
import CredentialType from './CredentialType';
import ScreenHeader from '../../components/ScreenHeader';

function CredentialTypes({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/credential_types': i18n._(t`凭证类型`),
    '/credential_types/add': i18n._(t`新建凭证类型`),
  });

  const buildBreadcrumbConfig = useCallback(
    credentialTypes => {
      if (!credentialTypes) {
        return;
      }
      setBreadcrumbConfig({
        '/credential_types': i18n._(t`凭证类型`),
        '/credential_types/add': i18n._(t`Create new credential Type`),
        [`/credential_types/${credentialTypes.id}`]: `${credentialTypes.name}`,
        [`/credential_types/${credentialTypes.id}/edit`]: i18n._(
          t`编辑详情`
        ),
        [`/credential_types/${credentialTypes.id}/details`]: i18n._(t`详情`),
      });
    },
    [i18n]
  );
  return (
    <>
      <ScreenHeader
        streamType="credential_type"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path="/credential_types/add">
          <CredentialTypeAdd />
        </Route>
        <Route path="/credential_types/:id">
          <CredentialType setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/credential_types">
          <CredentialTypeList />
        </Route>
      </Switch>
    </>
  );
}

export default withI18n()(CredentialTypes);
