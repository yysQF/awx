import React from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Card as _Card,
  CardHeader as _CardHeader,
  CardTitle,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
  PageSection,
} from '@patternfly/react-core';
import styled from 'styled-components';
import { BrandName } from '../../variables';
import { useConfig } from '../../contexts/Config';
import ContentLoading from '../../components/ContentLoading/ContentLoading';

// Setting BrandName to a variable here is necessary to get the jest tests
// passing.  Attempting to use BrandName in the template literal results
// in failing tests.
const brandName = BrandName;

const SplitLayout = styled(PageSection)`
  column-count: 1;
  column-gap: 24px;
  @media (min-width: 576px) {
    column-count: 2;
  }
`;
const Card = styled(_Card)`
  display: inline-block;
  margin-bottom: 24px;
  width: 100%;
`;
const CardHeader = styled(_CardHeader)`
  align-items: flex-start;
  display: flex;
  flex-flow: column nowrap;
  && > * {
    padding: 0;
  }
`;
const CardDescription = styled.div`
  color: var(--pf-global--palette--black-600);
  font-size: var(--pf-global--FontSize--xs);
`;

function SettingList({ i18n }) {
  const config = useConfig();
  const settingRoutes = [
    {
      header: i18n._(t`作业设置`),
      description: i18n._(
        t`为您的 ${brandName} 应用程序启用简化登录`),
      id: 'authentication',
      routes: [
        {
          title: i18n._(t`Azure AD 设置`),
          path: '/settings/azure',
        },
        {
          title: i18n._(t`GitHub 设置`),
          path: '/settings/github',
        },
        {
          title: i18n._(t`Google OAuth 2 设置`),
          path: '/settings/google_oauth2',
        },
        {
          title: i18n._(t`LDAP 设置`),
          path: '/settings/ldap',
        },
        {
          title: i18n._(t`RADIUS 设置`),
          path: '/settings/radius',
        },
        {
          title: i18n._(t`SAML 设置`),
          path: '/settings/saml',
        },
        {
          title: i18n._(t`TACACS+ 设置`),
          path: '/settings/tacacs',
        },
      ],
    },
    {
      header: i18n._(t`作业`),
      description: i18n._(
        t`更新与 ${brandName} 中的作业有关的设置`
      ),
      id: 'jobs',
      routes: [
        {
          title: i18n._(t`作业设置`),
          path: '/settings/jobs',
        },
      ],
    },
    {
      header: i18n._(t`系统`),
      description: i18n._(t`定义系统级特性和功能`),
      id: 'system',
      routes: [
        {
          title: i18n._(t`其他系统设置`),
          path: '/settings/miscellaneous_system',
        },
        {
          title: i18n._(t`活动流设置`),
          path: '/settings/activity_stream',
        },
        {
          title: i18n._(t`日志设置`),
          path: '/settings/logging',
        },
      ],
    },
    {
      header: i18n._(t`用户界面`),
      description: i18n._(t`设置数据收集、徽标和登录的首选项`),
      id: 'ui',
      routes: [
        {
          title: i18n._(t`用户界面设置`),
          path: '/settings/ui',
        },
      ],
    },
    {
      header: i18n._(t`许可`),
      description: i18n._(t`查看和编辑您的许可证信息`),
      id: 'license',
      routes: [
        {
          title: i18n._(t`许可设置`),
          path: '/settings/license',
        },
      ],
    },
  ];

  if (Object.keys(config).length === 0) {
    return (
      <PageSection>
        <Card>
          <ContentLoading />
        </Card>
      </PageSection>
    );
  }

  return (
    <SplitLayout>
      {settingRoutes.map(({ description, header, id, routes }) => {
        if (id === 'license' && config?.license_info?.license_type === 'open') {
          return null;
        }
        return (
          <Card isCompact key={header}>
            <CardHeader>
              <CardTitle>{header}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <DataList aria-label={`${id}-settings`} isCompact>
              {routes.map(({ title, path }) => (
                <DataListItem key={title}>
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={title}>
                          <Link to={path}>{title}</Link>
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              ))}
            </DataList>
          </Card>
        );
      })}
    </SplitLayout>
  );
}

export default withI18n()(SettingList);
