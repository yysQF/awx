import { t } from '@lingui/macro';

import ActivityStream from './screens/ActivityStream';
import Applications from './screens/Application';
import Credentials from './screens/Credential';
import CredentialTypes from './screens/CredentialType';
import Dashboard from './screens/Dashboard';
import Hosts from './screens/Host';
import InstanceGroups from './screens/InstanceGroup';
import Inventory from './screens/Inventory';
import { Jobs } from './screens/Job';
import ManagementJobs from './screens/ManagementJob';
import NotificationTemplates from './screens/NotificationTemplate';
import Organizations from './screens/Organization';
import Projects from './screens/Project';
import Schedules from './screens/Schedule';
import Settings from './screens/Setting';
import Teams from './screens/Team';
import Templates from './screens/Template';
import Users from './screens/User';
import WorkflowApprovals from './screens/WorkflowApproval';

// Ideally, this should just be a regular object that we export, but we
// need the i18n. When lingui3 arrives, we will be able to import i18n
// directly and we can replace this function with a simple export.

function getRouteConfig(i18n) {
  return [
    {
      groupTitle: i18n._(t`视图`),
      groupId: 'views_group',
      routes: [
        {
          title: i18n._(t`仪表盘`),
          path: '/home',
          screen: Dashboard,
        },
        {
          title: i18n._(t`作业`),
          path: '/jobs',
          screen: Jobs,
        },
        {
          title: i18n._(t`计划`),
          path: '/schedules',
          screen: Schedules,
        },
        {
          title: i18n._(t`活动流`),
          path: '/activity_stream',
          screen: ActivityStream,
        },
        {
          title: i18n._(t`工作流`),
          path: '/workflow_approvals',
          screen: WorkflowApprovals,
        },
      ],
    },
    {
      groupTitle: i18n._(t`资源`),
      groupId: 'resources_group',
      routes: [
        {
          title: i18n._(t`模板`),
          path: '/templates',
          screen: Templates,
        },
        {
          title: i18n._(t`凭证`),
          path: '/credentials',
          screen: Credentials,
        },
        {
          title: i18n._(t`项目`),
          path: '/projects',
          screen: Projects,
        },
        {
          title: i18n._(t`清单`),
          path: '/inventories',
          screen: Inventory,
        },
        {
          title: i18n._(t`主机`),
          path: '/hosts',
          screen: Hosts,
        },
      ],
    },
    {
      groupTitle: i18n._(t`权限`),
      groupId: 'access_group',
      routes: [
        {
          title: i18n._(t`组织`),
          path: '/organizations',
          screen: Organizations,
        },
        {
          title: i18n._(t`用户`),
          path: '/users',
          screen: Users,
        },
        {
          title: i18n._(t`团队`),
          path: '/teams',
          screen: Teams,
        },
      ],
    },
    {
      groupTitle: i18n._(t`管理`),
      groupId: 'administration_group',
      routes: [
        {
          title: i18n._(t`凭证类型`),
          path: '/credential_types',
          screen: CredentialTypes,
        },
        {
          title: i18n._(t`通知`),
          path: '/notification_templates',
          screen: NotificationTemplates,
        },
        {
          title: i18n._(t`管理作业`),
          path: '/management_jobs',
          screen: ManagementJobs,
        },
        {
          title: i18n._(t`实例组`),
          path: '/instance_groups',
          screen: InstanceGroups,
        },
        {
          title: i18n._(t`应用`),
          path: '/applications',
          screen: Applications,
        },
      ],
    },
    {
      groupTitle: i18n._(t`设置`),
      groupId: 'settings',
      routes: [
        {
          title: i18n._(t`设置`),
          path: '/settings',
          screen: Settings,
        },
      ],
    },
  ];
}

export default getRouteConfig;
