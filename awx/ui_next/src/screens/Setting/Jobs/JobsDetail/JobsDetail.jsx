import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { CardBody, CardActionsRow } from '../../../../components/Card';
import ContentError from '../../../../components/ContentError';
import ContentLoading from '../../../../components/ContentLoading';
import { DetailList } from '../../../../components/DetailList';
import RoutedTabs from '../../../../components/RoutedTabs';
import useRequest from '../../../../util/useRequest';
import { useConfig } from '../../../../contexts/Config';
import { useSettings } from '../../../../contexts/Settings';
import { SettingsAPI } from '../../../../api';
import { sortNestedDetails } from '../../shared/settingUtils';
import { SettingDetail } from '../../shared';

function JobsDetail({ i18n }) {
  const { me } = useConfig();
  const { GET: options } = useSettings();

  const { isLoading, error, request, result: jobs } = useRequest(
    useCallback(async () => {
      const { data } = await SettingsAPI.readCategory('jobs');

      const {
        ALLOW_JINJA_IN_EXTRA_VARS,
        AWX_ISOLATED_KEY_GENERATION,
        AWX_ISOLATED_PRIVATE_KEY,
        AWX_ISOLATED_PUBLIC_KEY,
        STDOUT_MAX_BYTES_DISPLAY,
        EVENT_STDOUT_MAX_BYTES_DISPLAY,
        ...jobsData
      } = data;

      const mergedData = {};
      Object.keys(jobsData).forEach(key => {
        mergedData[key] = options[key];
        mergedData[key].value = jobsData[key];
      });

      return sortNestedDetails(mergedData);
    }, [options]),
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
      link: `/settings/jobs/details`,
      id: 0,
    },
  ];

  return (
    <>
      <RoutedTabs tabsArray={tabsArray} />
      <CardBody>
        {isLoading && <ContentLoading />}
        {!isLoading && error && <ContentError error={error} />}
        {!isLoading && jobs && (
          <DetailList>
            {jobs.map(([key, detail]) => {
              return (
                <SettingDetail
                  key={key}
                  id={key}
                  helpText={detail?.help_text}
                  label={detail?.label}
                  type={detail?.type}
                  unit={detail?.unit}
                  value={detail?.value}
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
              to="/settings/jobs/edit"
            >
              {i18n._(t`编辑`)}
            </Button>
          </CardActionsRow>
        )}
      </CardBody>
    </>
  );
}

export default withI18n()(JobsDetail);
