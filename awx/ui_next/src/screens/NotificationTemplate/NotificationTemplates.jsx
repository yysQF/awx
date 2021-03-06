import React, { useState, useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import NotificationTemplateList from './NotificationTemplateList';
import NotificationTemplateAdd from './NotificationTemplateAdd';
import NotificationTemplate from './NotificationTemplate';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';

function NotificationTemplates({ i18n }) {
  const match = useRouteMatch();
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/notification_templates': i18n._(t`通知模板`),
    '/notification_templates/add': i18n._(t`新建通知模板`),
  });

  const updateBreadcrumbConfig = useCallback(
    notification => {
      const { id } = notification;
      setBreadcrumbConfig({
        '/notification_templates': i18n._(t`通知模板`),
        '/notification_templates/add': i18n._(
          t`Create New Notification Template`
        ),
        [`/notification_templates/${id}`]: notification.name,
        [`/notification_templates/${id}/edit`]: i18n._(t`编辑详情`),
        [`/notification_templates/${id}/details`]: i18n._(t`详情`),
      });
    },
    [i18n]
  );

  return (
    <>
      <ScreenHeader
        streamType="notification_template"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path={`${match.url}/add`}>
          <NotificationTemplateAdd />
        </Route>
        <Route path={`${match.url}/:id`}>
          <NotificationTemplate setBreadcrumb={updateBreadcrumbConfig} />
        </Route>
        <Route path={`${match.url}`}>
          <NotificationTemplateList />
        </Route>
      </Switch>
    </>
  );
}

export default withI18n()(NotificationTemplates);
