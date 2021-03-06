import React, { useCallback, useEffect } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Switch,
  Route,
  Redirect,
  Link,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { Card, PageSection } from '@patternfly/react-core';
import RoutedTabs from '../../components/RoutedTabs';
import ContentError from '../../components/ContentError';
import ContentLoading from '../../components/ContentLoading';
import JobList from '../../components/JobList';
import HostFacts from './HostFacts';
import HostDetail from './HostDetail';
import HostEdit from './HostEdit';
import HostGroups from './HostGroups';
import { HostsAPI } from '../../api';
import useRequest from '../../util/useRequest';

function Host({ i18n, setBreadcrumb }) {
  const location = useLocation();
  const match = useRouteMatch('/hosts/:id');
  const { error, isLoading, result: host, request: fetchHost } = useRequest(
    useCallback(async () => {
      const { data } = await HostsAPI.readDetail(match.params.id);
      setBreadcrumb(data);
      return data;
    }, [match.params.id, setBreadcrumb])
  );

  useEffect(() => {
    fetchHost();
  }, [fetchHost, location]);

  const tabsArray = [
    {
      name: (
        <>
          <CaretLeftIcon />
          {i18n._(t`返回主机列表`)}
        </>
      ),
      link: `/hosts`,
      id: 99,
    },
    {
      name: i18n._(t`详情`),
      link: `${match.url}/details`,
      id: 0,
    },
    {
      name: i18n._(t`基本信息`),
      link: `${match.url}/facts`,
      id: 1,
    },
    {
      name: i18n._(t`分组`),
      link: `${match.url}/groups`,
      id: 2,
    },
    {
      name: i18n._(t`已完成的作业`),
      link: `${match.url}/completed_jobs`,
      id: 3,
    },
  ];

  if (isLoading) {
    return (
      <PageSection>
        <Card>
          <ContentLoading />
        </Card>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Card>
          <ContentError error={error}>
            {error?.response?.status === 404 && (
              <span>
                {i18n._(t`主机未找到.`)}{' '}
                <Link to="/hosts">{i18n._(t`查看所有主机.`)}</Link>
              </span>
            )}
          </ContentError>
        </Card>
      </PageSection>
    );
  }

  let showCardHeader = true;

  if (location.pathname.endsWith('edit')) {
    showCardHeader = false;
  }

  return (
    <PageSection>
      <Card>
        {showCardHeader && <RoutedTabs tabsArray={tabsArray} />}
        <Switch>
          <Redirect from="/hosts/:id" to="/hosts/:id/details" exact />
          {host && [
            <Route path="/hosts/:id/details" key="details">
              <HostDetail host={host} />
            </Route>,
            <Route path="/hosts/:id/edit" key="edit">
              <HostEdit host={host} />
            </Route>,
            <Route key="facts" path="/hosts/:id/facts">
              <HostFacts host={host} />
            </Route>,
            <Route path="/hosts/:id/groups" key="groups">
              <HostGroups host={host} />
            </Route>,
            <Route path="/hosts/:id/completed_jobs" key="completed-jobs">
              <JobList defaultParams={{ job__hosts: host.id }} />
            </Route>,
          ]}
          <Route key="not-found" path="*">
            <ContentError isNotFound>
              <Link to={`${match.url}/details`}>
                {i18n._(t`查看主机详细信息`)}
              </Link>
            </ContentError>
          </Route>
        </Switch>
      </Card>
    </PageSection>
  );
}

export default withI18n()(Host);
export { Host as _Host };
