import React, { useState, useCallback } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';

import ProjectsList from './ProjectList/ProjectList';
import ProjectAdd from './ProjectAdd/ProjectAdd';
import Project from './Project';

function Projects({ i18n }) {
  const [breadcrumbConfig, setBreadcrumbConfig] = useState({
    '/projects': i18n._(t`项目列表`),
    '/projects/add': i18n._(t`新建项目`),
  });

  const buildBreadcrumbConfig = useCallback(
    (project, nested) => {
      if (!project) {
        return;
      }
      const projectSchedulesPath = `/projects/${project.id}/schedules`;
      setBreadcrumbConfig({
        '/projects': i18n._(t`项目列表`),
        '/projects/add': i18n._(t`新建项目`),
        [`/projects/${project.id}`]: `${project.name}`,
        [`/projects/${project.id}/edit`]: i18n._(t`编辑详情`),
        [`/projects/${project.id}/details`]: i18n._(t`详情`),
        [`/projects/${project.id}/access`]: i18n._(t`使用权`),
        [`/projects/${project.id}/notifications`]: i18n._(t`通知`),
        [`/projects/${project.id}/job_templates`]: i18n._(t`作业模板列表`),

        [`${projectSchedulesPath}`]: i18n._(t`计划`),
        [`${projectSchedulesPath}/add`]: i18n._(t`新建计划`),
        [`${projectSchedulesPath}/${nested?.id}`]: `${nested?.name}`,
        [`${projectSchedulesPath}/${nested?.id}/details`]: i18n._(
          t`作业计划详情`
        ),
        [`${projectSchedulesPath}/${nested?.id}/edit`]: i18n._(t`编辑详情`),
      });
    },
    [i18n]
  );

  return (
    <>
      <ScreenHeader streamType="project" breadcrumbConfig={breadcrumbConfig} />
      <Switch>
        <Route path="/projects/add">
          <ProjectAdd />
        </Route>
        <Route path="/projects/:id">
          <Project setBreadcrumb={buildBreadcrumbConfig} />
        </Route>
        <Route path="/projects">
          <ProjectsList />
        </Route>
      </Switch>
    </>
  );
}

export { Projects as _Projects };
export default withI18n()(withRouter(Projects));
