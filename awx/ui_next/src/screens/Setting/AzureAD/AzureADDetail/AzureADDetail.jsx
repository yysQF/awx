import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { CardBody, CardActionsRow } from '../../../../components/Card';
import ContentLoading from '../../../../components/ContentLoading';
import ContentError from '../../../../components/ContentError';
import { DetailList } from '../../../../components/DetailList';
import RoutedTabs from '../../../../components/RoutedTabs';
import { useConfig } from '../../../../contexts/Config';
import { useSettings } from '../../../../contexts/Settings';
import useRequest from '../../../../util/useRequest';
import { SettingsAPI } from '../../../../api';
import { SettingDetail } from '../../shared';

function AzureADDetail({ i18n }) {
  const { me } = useConfig();
  const { GET: options } = useSettings();

  const { isLoading, error, request, result: azure } = useRequest(
    useCallback(async () => {
      const { data } = await SettingsAPI.readCategory('azuread-oauth2');
      return data;
    }, []),
    null
  );

  useEffect(() => {
    request();
  }, [request]);

  const tabsArray = [
    {
      name: (
        <>
          <CaretLeftIcon />
          {i18n._(t`返回设置`)}
        </>
      ),
      link: `/settings`,
      id: 99,
    },
    {
      name: i18n._(t`详情`),
      link: `/settings/azure/details`,
      id: 0,
    },
  ];

  return (
    <>
      <RoutedTabs tabsArray={tabsArray} />
      <CardBody>
        {isLoading && <ContentLoading />}
        {!isLoading && error && <ContentError error={error} />}
        {!isLoading && azure && (
          <DetailList>
            {Object.keys(azure).map(key => {
              const record = options?.[key];
              return (
                <SettingDetail
                  key={key}
                  id={key}
                  helpText={record?.help_text}
                  label={record?.label}
                  type={record?.type}
                  unit={record?.unit}
                  value={azure?.[key]}
                />
              );
            })}
          </DetailList>
        )}
        {me?.is_superuser && (
          <CardActionsRow>
            <Button
              aria-label={i18n._(t`编辑`)}
              component={Link}
              ouiaId="edit-button"
              to="/settings/azure/edit"
            >
              {i18n._(t`编辑`)}
            </Button>
          </CardActionsRow>
        )}
      </CardBody>
    </>
  );
}

export default withI18n()(AzureADDetail);
