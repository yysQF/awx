import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { useField } from 'formik';
import { Form, FormGroup, Switch } from '@patternfly/react-core';
import styled from 'styled-components';
import FormField from '../../FormField';
import { TagMultiSelect } from '../../MultiSelect';
import AnsibleSelect from '../../AnsibleSelect';
import { VariablesField } from '../../CodeMirrorInput';
import Popover from '../../Popover';

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--pf-c-form__label--PaddingBottom);

  label {
    --pf-c-form__label--PaddingBottom: 0px;
  }
`;

function OtherPromptsStep({ launchConfig, i18n }) {
  return (
    <Form>
      {launchConfig.ask_job_type_on_launch && <JobTypeField i18n={i18n} />}
      {launchConfig.ask_limit_on_launch && (
        <FormField
          id="prompt-limit"
          name="limit"
          label={i18n._(t`范围`)}
          tooltip={i18n._(t`提供主机模式以进一步限制列表
          将受 playbook 管理或影响的主机。 多种的
          模式是允许的`)}
        />
      )}
      {launchConfig.ask_scm_branch_on_launch && (
        <FormField
          id="prompt-scm-branch"
          name="scm_branch"
          label={i18n._(t`Source Control Branch`)}
          tooltip={i18n._(
            t`选择工作流的一个分支，此分支应用于所有提示输入分支的作业模板节点`
          )}
        />
      )}
      {launchConfig.ask_verbosity_on_launch && <VerbosityField i18n={i18n} />}
      {launchConfig.ask_diff_mode_on_launch && (
        <ShowChangesToggle i18n={i18n} />
      )}
      {launchConfig.ask_tags_on_launch && (
        <TagField
          id="prompt-job-tags"
          name="job_tags"
          label={i18n._(t`作业标签`)}
          aria-label={i18n._(t`作业标签`)}
          tooltip={i18n._(t`当你有一个标签时，标签很适用于
          剧本，并且您想要运行剧本或任务的特定部分。
          使用逗号分隔多个标签`)}
        />
      )}
      {launchConfig.ask_skip_tags_on_launch && (
        <TagField
          id="prompt-skip-tags"
          name="skip_tags"
          label={i18n._(t`跳过标签`)}
          aria-label={i18n._(t`跳过标签`)}
          tooltip={i18n._(t`当你有一个剧本时，跳过标签很适用于
          剧本，并且您想跳过剧本或任务的特定部分。
          使用逗号分隔多个标签`)}
        />
      )}
      {launchConfig.ask_variables_on_launch && (
        <VariablesField
          id="prompt-variables"
          name="extra_vars"
          label={i18n._(t`变量`)}
        />
      )}
    </Form>
  );
}

function JobTypeField({ i18n }) {
  const [field, meta, helpers] = useField('job_type');
  const options = [
    {
      value: '',
      key: '',
      label: i18n._(t`选择一个作业类型`),
      isDisabled: true,
    },
    { value: 'run', key: 'run', label: i18n._(t`运行`), isDisabled: false },
    {
      value: 'check',
      key: 'check',
      label: i18n._(t`检查` ),
      isDisabled: false,
    },
  ];
  const isValid = !(meta.touched && meta.error);
  return (
    <FormGroup
      fieldId="propmt-job-type"
      label={i18n._(t`作业类型`)}
      labelIcon={
        <Popover
          content={i18n._(t`对于作业模板，选择运行以执行剧本。 选择 check 只检查剧本语法、测试环境设置和报告问题而不执行剧本`)}
        />
      }
      isRequired
      validated={isValid ? 'default' : 'error'}
    >
      <AnsibleSelect
        id="prompt-job-type"
        data={options}
        {...field}
        onChange={(event, value) => helpers.setValue(value)}
      />
    </FormGroup>
  );
}

function VerbosityField({ i18n }) {
  const [field, meta, helpers] = useField('verbosity');
  const options = [
    { value: '0', key: '0', label: i18n._(t`0 (Normal)`) },
    { value: '1', key: '1', label: i18n._(t`1 (Verbose)`) },
    { value: '2', key: '2', label: i18n._(t`2 (More Verbose)`) },
    { value: '3', key: '3', label: i18n._(t`3 (Debug)`) },
    { value: '4', key: '4', label: i18n._(t`4 (Connection Debug)`) },
  ];

  const isValid = !(meta.touched && meta.error);

  return (
    <FormGroup
      fieldId="prompt-verbosity"
      validated={isValid ? 'default' : 'error'}
      label={i18n._(t`详细程度`)}
      labelIcon={
        <Popover
          content={i18n._(t`控制输出的水平ansible
          将在剧本执行时产生。`)}
        />
      }
    >
      <AnsibleSelect
        id="prompt-verbosity"
        data={options}
        {...field}
        onChange={(event, value) => helpers.setValue(value)}
      />
    </FormGroup>
  );
}

function ShowChangesToggle({ i18n }) {
  const [field, , helpers] = useField('diff_mode');
  return (
    <FormGroup fieldId="prompt-show-changes">
      <FieldHeader>
        {' '}
        <label className="pf-c-form__label" htmlFor="prompt-show-changes">
          <span className="pf-c-form__label-text">
            {i18n._(t`显示更改`)}
            <Popover
              content={i18n._(t`如果启用，显示所做的更改
              通过 Ansible 任务，在支持的情况下。 这相当于 Ansible 的
              --diff模式。`)}
            />
          </span>
        </label>
      </FieldHeader>
      <Switch
        aria-label={field.value ? i18n._(t`On`) : i18n._(t`Off`)}
        id="prompt-show-changes"
        label={i18n._(t`On`)}
        labelOff={i18n._(t`Off`)}
        isChecked={field.value}
        onChange={helpers.setValue}
      />
    </FormGroup>
  );
}

function TagField({ id, name, label, tooltip }) {
  const [field, , helpers] = useField(name);
  return (
    <FormGroup
      fieldId={id}
      label={label}
      labelIcon={<Popover content={tooltip} />}
    >
      <TagMultiSelect value={field.value} onChange={helpers.setValue} />
    </FormGroup>
  );
}

export default withI18n()(OtherPromptsStep);
