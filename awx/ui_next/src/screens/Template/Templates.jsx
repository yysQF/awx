import React, { useState, useCallback, useRef } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Route, withRouter, Switch } from 'react-router-dom';
import { PageSection } from '@patternfly/react-core';

import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { TemplateList } from './TemplateList';
import Template from './Template';
import WorkflowJobTemplate from './WorkflowJobTemplate';
import JobTemplateAdd from './JobTemplateAdd';
import WorkflowJobTemplateAdd from './WorkflowJobTemplateAdd';

function Templates({ i18n }) {
  const initScreenHeader = useRef({
    '/templates': i18n._(t`模板列表`),
    '/templates/job_template/add': i18n._(t`新建作业模板`),
    '/templates/workflow_job_template/add': i18n._(
      t`新建工作流模板`
    ),
  });
  const [breadcrumbConfig, setScreenHeader] = useState(
    initScreenHeader.current
  );

  const [schedule, setSchedule] = useState();
  const [template, setTemplate] = useState();

  const setBreadcrumbConfig = useCallback(
    (passedTemplate, passedSchedule) => {
      if (passedTemplate && passedTemplate.name !== template?.name) {
        setTemplate(passedTemplate);
      }
      if (passedSchedule && passedSchedule.name !== schedule?.name) {
        setSchedule(passedSchedule);
      }
      if (!template) return;
      const templatePath = `/templates/${template.type}/${template.id}`;
      const schedulesPath = `${templatePath}/schedules`;
      const surveyPath = `${templatePath}/survey`;
      setScreenHeader({
        ...initScreenHeader.current,
        [templatePath]: `${template.name}`,
        [`${templatePath}/details`]: i18n._(t`详情`),
        [`${templatePath}/edit`]: i18n._(t`编辑详情`),
        [`${templatePath}/access`]: i18n._(t`使用权`),
        [`${templatePath}/notifications`]: i18n._(t`通知`),
        [`${templatePath}/completed_jobs`]: i18n._(t`已完成的作业`),
        [surveyPath]: i18n._(t`问卷调查`),
        [`${surveyPath}/add`]: i18n._(t`Add Question`),
        [`${surveyPath}/edit`]: i18n._(t`Edit Question`),
        [schedulesPath]: i18n._(t`计划`),
        [`${schedulesPath}/add`]: i18n._(t`新建计划`),
        [`${schedulesPath}/${schedule?.id}`]: `${schedule?.name}`,
        [`${schedulesPath}/${schedule?.id}/details`]: i18n._(
          t`作业计划详情`
        ),
        [`${schedulesPath}/${schedule?.id}/edit`]: i18n._(t`编辑计划`),
      });
    },
    [i18n, template, schedule]
  );

  return (
    <>
      <ScreenHeader
        streamType="job_template,workflow_job_template,workflow_job_template_node"
        breadcrumbConfig={breadcrumbConfig}
      />
      <Switch>
        <Route path="/templates/job_template/add">
          <JobTemplateAdd />
        </Route>
        <Route path="/templates/workflow_job_template/add">
          <WorkflowJobTemplateAdd />
        </Route>
        <Route path="/templates/job_template/:id">
          <Template setBreadcrumb={setBreadcrumbConfig} />
        </Route>
        <Route path="/templates/workflow_job_template/:id">
          <WorkflowJobTemplate setBreadcrumb={setBreadcrumbConfig} />
        </Route>
        <Route path="/templates">
          <PageSection>
            <TemplateList />
          </PageSection>
        </Route>
      </Switch>
    </>
  );
}

export { Templates as _Templates };
export default withI18n()(withRouter(Templates));
