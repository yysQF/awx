import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { withFormik, useField } from 'formik';
import {
  Form,
  FormGroup,
  Switch,
  Checkbox,
  TextInput,
  Title,
} from '@patternfly/react-core';
import ContentError from '../../../components/ContentError';
import ContentLoading from '../../../components/ContentLoading';
import AnsibleSelect from '../../../components/AnsibleSelect';
import { TagMultiSelect } from '../../../components/MultiSelect';
import useRequest from '../../../util/useRequest';

import FormActionGroup from '../../../components/FormActionGroup';
import FormField, {
  CheckboxField,
  FormSubmitError,
} from '../../../components/FormField';
import FieldWithPrompt from '../../../components/FieldWithPrompt';
import {
  FormColumnLayout,
  FormFullWidthLayout,
  FormCheckboxLayout,
  SubFormLayout,
} from '../../../components/FormLayout';
import { VariablesField } from '../../../components/CodeMirrorInput';
import { required } from '../../../util/validators';
import { JobTemplate } from '../../../types';
import {
  InventoryLookup,
  InstanceGroupsLookup,
  ProjectLookup,
  MultiCredentialsLookup,
} from '../../../components/Lookup';
import Popover from '../../../components/Popover';
import { JobTemplatesAPI } from '../../../api';
import LabelSelect from './LabelSelect';
import PlaybookSelect from './PlaybookSelect';
import WebhookSubForm from './WebhookSubForm';

const { origin } = document.location;

function JobTemplateForm({
  template,
  handleCancel,
  handleSubmit,
  setFieldValue,
  submitError,
  i18n,
  isOverrideDisabledLookup,
}) {
  const [contentError, setContentError] = useState(false);
  const [inventory, setInventory] = useState(
    template?.summary_fields?.inventory
  );
  const [allowCallbacks, setAllowCallbacks] = useState(
    Boolean(template?.host_config_key)
  );
  const [enableWebhooks, setEnableWebhooks] = useState(
    Boolean(template.webhook_service)
  );

  const [askInventoryOnLaunchField] = useField('ask_inventory_on_launch');
  const [jobTypeField, jobTypeMeta, jobTypeHelpers] = useField({
    name: 'job_type',
    validate: required(null, i18n),
  });
  const [, inventoryMeta, inventoryHelpers] = useField('inventory');
  const [projectField, projectMeta, projectHelpers] = useField({
    name: 'project',
    validate: project => handleProjectValidation(project),
  });
  const [scmField, , scmHelpers] = useField('scm_branch');
  const [playbookField, playbookMeta, playbookHelpers] = useField({
    name: 'playbook',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [credentialField, , credentialHelpers] = useField('credentials');
  const [labelsField, , labelsHelpers] = useField('labels');
  const [limitField, limitMeta, limitHelpers] = useField('limit');
  const [verbosityField] = useField('verbosity');
  const [diffModeField, , diffModeHelpers] = useField('diff_mode');
  const [instanceGroupsField, , instanceGroupsHelpers] = useField(
    'instanceGroups'
  );
  const [jobTagsField, , jobTagsHelpers] = useField('job_tags');
  const [skipTagsField, , skipTagsHelpers] = useField('skip_tags');

  const [, webhookServiceMeta, webhookServiceHelpers] = useField(
    'webhook_service'
  );
  const [, webhookUrlMeta, webhookUrlHelpers] = useField('webhook_url');
  const [, webhookKeyMeta, webhookKeyHelpers] = useField('webhook_key');
  const [, webhookCredentialMeta, webhookCredentialHelpers] = useField(
    'webhook_credential'
  );

  const {
    request: loadRelatedInstanceGroups,
    error: instanceGroupError,
    contentLoading: instanceGroupLoading,
  } = useRequest(
    useCallback(async () => {
      if (!template?.id) {
        return;
      }
      const { data } = await JobTemplatesAPI.readInstanceGroups(template.id);
      setFieldValue('initialInstanceGroups', data.results);
      setFieldValue('instanceGroups', [...data.results]);
    }, [setFieldValue, template])
  );

  useEffect(() => {
    loadRelatedInstanceGroups();
  }, [loadRelatedInstanceGroups]);

  useEffect(() => {
    if (enableWebhooks) {
      webhookServiceHelpers.setValue(webhookServiceMeta.initialValue);
      webhookUrlHelpers.setValue(webhookUrlMeta.initialValue);
      webhookKeyHelpers.setValue(webhookKeyMeta.initialValue);
      webhookCredentialHelpers.setValue(webhookCredentialMeta.initialValue);
    } else {
      webhookServiceHelpers.setValue('');
      webhookUrlHelpers.setValue('');
      webhookKeyHelpers.setValue('');
      webhookCredentialHelpers.setValue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableWebhooks]);

  const handleProjectValidation = project => {
    if (!project && projectMeta.touched) {
      return i18n._(t`为该字段选择一个值`);
    }
    if (project?.value?.status === 'never updated') {
      return i18n._(t`这个项目需要更新`);
    }
    return undefined;
  };

  const handleProjectUpdate = useCallback(
    value => {
      setFieldValue('playbook', 0);
      setFieldValue('scm_branch', '');
      setFieldValue('project', value);
    },
    [setFieldValue]
  );

  const jobTypeOptions = [
    {
      value: '',
      key: '',
      label: i18n._(t`选择工作类型`),
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
  const verbosityOptions = [
    { value: '0', key: '0', label: i18n._(t`0 (Normal)`) },
    { value: '1', key: '1', label: i18n._(t`1 (Verbose)`) },
    { value: '2', key: '2', label: i18n._(t`2 (More Verbose)`) },
    { value: '3', key: '3', label: i18n._(t`3 (Debug)`) },
    { value: '4', key: '4', label: i18n._(t`4 (Connection Debug)`) },
  ];
  let callbackUrl;
  if (template?.related) {
    const path = template.related.callback || `${template.url}callback`;
    callbackUrl = `${origin}${path}`;
  }

  if (instanceGroupLoading) {
    return <ContentLoading />;
  }

  if (contentError || instanceGroupError) {
    return <ContentError error={contentError || instanceGroupError} />;
  }

  return (
    <Form autoComplete="off" onSubmit={handleSubmit}>
      <FormColumnLayout>
        <FormField
          id="template-name"
          name="name"
          type="text"
          label={i18n._(t`名称`)}
          validate={required(null, i18n)}
          isRequired
        />
        <FormField
          id="template-description"
          name="description"
          type="text"
          label={i18n._(t`描述`)}
        />
        <FieldWithPrompt
          fieldId="template-job-type"
          isRequired
          label={i18n._(t`作业类型`)}
          promptId="template-ask-job-type-on-launch"
          promptName="ask_job_type_on_launch"
          tooltip={i18n._(t`对于作业模板，选择运行以执行
          剧本。 选择检查仅检查剧本语法，
          测试环境搭建，不报告问题
          执行剧本`)}
        >
          <AnsibleSelect
            {...jobTypeField}
            isValid={!jobTypeMeta.touched || !jobTypeMeta.error}
            id="template-job-type"
            data={jobTypeOptions}
            onChange={(event, value) => {
              jobTypeHelpers.setValue(value);
            }}
          />
        </FieldWithPrompt>
        <FormGroup
          fieldId="inventory-lookup"
          validated={
            !(inventoryMeta.touched || askInventoryOnLaunchField.value) ||
            !inventoryMeta.error
              ? 'default'
              : 'error'
          }
          helperTextInvalid={inventoryMeta.error}
          isRequired={!askInventoryOnLaunchField.value}
        >
          <InventoryLookup
            fieldId="template-inventory"
            value={inventory}
            promptId="template-ask-inventory-on-launch"
            promptName="ask_inventory_on_launch"
            isPromptableField
            tooltip={i18n._(t`选择包含主机的清单
            你想要这个工作来管理`)}
            onBlur={() => inventoryHelpers.setTouched()}
            onChange={value => {
              inventoryHelpers.setValue(value ? value.id : null);
              setInventory(value);
            }}
            required={!askInventoryOnLaunchField.value}
            touched={inventoryMeta.touched}
            error={inventoryMeta.error}
            isOverrideDisabled={isOverrideDisabledLookup}
          />
        </FormGroup>
        <ProjectLookup
          value={projectField.value}
          onBlur={() => projectHelpers.setTouched()}
          tooltip={i18n._(t`选择包含剧本的项目
          您希望执行此作业。`)}
          isValid={!projectMeta.touched || !projectMeta.error}
          helperTextInvalid={projectMeta.error}
          onChange={handleProjectUpdate}
          required
          autoPopulate={!template?.id}
          isOverrideDisabled={isOverrideDisabledLookup}
        />
        {projectField.value?.allow_override && (
          <FieldWithPrompt
            fieldId="template-scm-branch"
            label={i18n._(t`源代码控制分支`)}
            promptId="template-ask-scm-branch-on-launch"
            promptName="ask_scm_branch_on_launch"
            tooltip={i18n._(
              t`选择作业模板的分支，该分支适用于
              提示分支的所有作业模板节点。`
            )}
          >
            <TextInput
              id="template-scm-branch"
              {...scmField}
              onChange={value => {
                scmHelpers.setValue(value);
              }}
            />
          </FieldWithPrompt>
        )}
        <FormGroup
          fieldId="template-playbook"
          helperTextInvalid={playbookMeta.error}
          validated={
            !playbookMeta.touched || !playbookMeta.error ? 'default' : 'error'
          }
          isRequired
          label={i18n._(t`剧本`)}
          labelIcon={
            <Popover
              content={i18n._(
                t`选择此作业要执行的剧本。`
              )}
            />
          }
        >
          <PlaybookSelect
            projectId={projectField.value?.id}
            isValid={!playbookMeta.touched || !playbookMeta.error}
            field={playbookField}
            onBlur={() => playbookHelpers.setTouched()}
            onError={setContentError}
          />
        </FormGroup>
        <FormFullWidthLayout>
          <FieldWithPrompt
            fieldId="template-credentials"
            label={i18n._(t`凭证列表`)}
            promptId="template-ask-credential-on-launch"
            promptName="ask_credential_on_launch"
            tooltip={i18n._(t`选择允许 Tower 访问将运行此作业的节点的凭据
            反对。 您只能选择一种类型的凭证。对于机器凭据 (SSH)，
            检查“启动时提示”而不选择凭据将要求您选择一台机器
            运行时的凭据。如果您选择凭据并选中“启动时提示”，则所选的
            凭证成为可以在运行时更新的默认值。`)}
          >
            <MultiCredentialsLookup
              value={credentialField.value}
              onChange={newCredentials =>
                credentialHelpers.setValue(newCredentials)
              }
              onError={setContentError}
            />
          </FieldWithPrompt>
          <FormGroup
            label={i18n._(t`标签`)}
            labelIcon={
              <Popover
                content={i18n._(t`描述此作业模板的可选标签，
                例如“开发”或“测试”，标签可用于分组和过滤
                作业模板和已完成的作业`)}
              />
            }
            fieldId="template-labels"
          >
            <LabelSelect
              value={labelsField.value}
              onChange={labels => labelsHelpers.setValue(labels)}
              onError={setContentError}
              createText={i18n._(t`创建`)}
            />
          </FormGroup>
          <VariablesField
            id="template-variables"
            name="extra_vars"
            label={i18n._(t`变量`)}
            promptId="template-ask-variables-on-launch"
            tooltip={i18n._(
              t`将额外的命令行变量传递给剧本。 这是
              ansible-playbook 的 -e 或 --extra-vars 命令行参数。
              使用 YAML 或 JSON 提供键/值对`
            )}
          />
          <FormColumnLayout>
            <FormField
              id="template-forks"
              name="forks"
              type="number"
              min="0"
              label={i18n._(t`并发数`)}
              tooltip={
                <span>
                  {i18n._(t`并行或同时的数量
                     执行剧本时要使用的进程，当填入一个空值或者小于 1 的值时将使用 Ansible 默认值，默认是5。`)}
                </span>
              }
            />
            <FieldWithPrompt
              fieldId="template-limit"
              label={i18n._(t`范围`)}
              promptId="template-ask-limit-on-launch"
              promptName="ask_limit_on_launch"
              tooltip={i18n._(t`提供主机模式以进一步约束
              将受管理或影响的主机列表
              剧本，允许多个模式`)}
            >
              <TextInput
                id="template-limit"
                {...limitField}
                validated={
                  !limitMeta.touched || !limitMeta.error ? 'default' : 'error'
                }
                onChange={value => {
                  limitHelpers.setValue(value);
                }}
              />
            </FieldWithPrompt>
            <FieldWithPrompt
              fieldId="template-verbosity"
              label={i18n._(t`详细程度`)}
              promptId="template-ask-verbosity-on-launch"
              promptName="ask_verbosity_on_launch"
              tooltip={i18n._(t`控制输出水平 ansible 将
              在剧本执行时产生。`)}
            > 
              <AnsibleSelect
                id="template-verbosity"
                data={verbosityOptions}
                {...verbosityField}
              />
            </FieldWithPrompt>
            <FormField
              id="template-job-slicing"
              name="job_slice_count"
              type="number"
              min="1"
              label={i18n._(t`作业切片`)}
              tooltip={i18n._(t`划分此作业模板完成的工作
              进入指定数量的作业切片，每个切片运行
              对一部分清单执行相同的任务。`)}
            />
            <FormField
              id="template-timeout"
              name="timeout"
              type="number"
              min="0"
              label={i18n._(t`超时`)}
              tooltip={i18n._(t`运行的时间（以秒为单位）
              在取消作业之前，没有作业时默认为 0
              暂停。`)}
            />
            <FieldWithPrompt
              fieldId="template-diff-mode"
              label={i18n._(t`显示更改`)}
              promptId="template-ask-diff-mode-on-launch"
              promptName="ask_diff_mode_on_launch"
              tooltip={i18n._(t`如果启用，显示所做的更改
              支持的 Ansible 任务。这是等价的
              到 Ansible 的 --diff 模式。`)}
            >
              <Switch
                id="template-show-changes"
                label={diffModeField.value ? i18n._(t`On`) : i18n._(t`Off`)}
                isChecked={diffModeField.value}
                onChange={checked => diffModeHelpers.setValue(checked)}
              />
            </FieldWithPrompt>
            <FormFullWidthLayout>
              <InstanceGroupsLookup
                value={instanceGroupsField.value}
                onChange={value => instanceGroupsHelpers.setValue(value)}
                tooltip={i18n._(t`选择此组织的实例组
                继续运行`)}
              />
              <FieldWithPrompt
                fieldId="template-tags"
                label={i18n._(t`作业标签`)}
                promptId="template-ask-tags-on-launch"
                promptName="ask_tags_on_launch"
                tooltip={i18n._(t`当你有一个标签时，标签很适用
                于剧本，使用逗号分隔多个标签。
                有关详细信息`)}
              >
                <TagMultiSelect
                  value={jobTagsField.value}
                  onChange={value => jobTagsHelpers.setValue(value)}
                />
              </FieldWithPrompt>
              <FieldWithPrompt
                fieldId="template-skip-tags"
                label={i18n._(t`跳过标签`)}
                promptId="template-ask-skip-tags-on-launch"
                promptName="ask_skip_tags_on_launch"
                tooltip={i18n._(t`当你有一个跳过标签时，跳过标签很适用
                于大型剧本，使用逗号分隔多个标签`)}
              >
                <TagMultiSelect
                  value={skipTagsField.value}
                  onChange={value => skipTagsHelpers.setValue(value)}
                />
              </FieldWithPrompt>
              <FormGroup
                fieldId="template-option-checkboxes"
                label={i18n._(t`选项`)}
              >
                <FormCheckboxLayout>
                  <CheckboxField
                    id="option-privilege-escalation"
                    name="become_enabled"
                    label={i18n._(t`权限提升`)}
                    tooltip={i18n._(t`如果启用，请将此剧本作为
                    行政人员。`)}
                  />
                  <Checkbox
                    aria-label={i18n._(t`配置回调`)}
                    label={
                      <span>
                        {i18n._(t`配置回调`)}
                        &nbsp;
                        <Popover
                          content={i18n._(t`启用配置的创建
                          回调网址。 使用主机可以联系 BRAND_NAME 的 URL
                          并使用此作业请求配置更新
                          模板。`)}
                        />
                      </span>
                    }
                    id="option-callbacks"
                    isChecked={allowCallbacks}
                    onChange={checked => {
                      setAllowCallbacks(checked);
                    }}
                  />
                  <Checkbox
                    aria-label={i18n._(t`启用Webhook`)}
                    label={
                      <span>
                        {i18n._(t`启用Webhook`)}
                        &nbsp;
                        <Popover
                          content={i18n._(t`为此模板启用 webhook`)}
                        />
                      </span>
                    }
                    id="wfjt-enabled-webhooks"
                    isChecked={enableWebhooks}
                    onChange={checked => {
                      setEnableWebhooks(checked);
                    }}
                  />
                  <CheckboxField
                    id="option-concurrent"
                    name="allow_simultaneous"
                    label={i18n._(t`并发作业`)}
                    tooltip={i18n._(t`如果启用，此作业的同时运行
                    模板将被允许`)}
                  />
                  <CheckboxField
                    id="option-fact-cache"
                    name="use_fact_cache"
                    label={i18n._(t`启用事实存储`)}
                    tooltip={i18n._(
                      t`如果启用，这将存储收集的事实，以便他们可以
                      在主机级别查看。 事实是坚持和
                      在运行时注入到事实缓存中`
                    )}
                  />
                </FormCheckboxLayout>
              </FormGroup>
            </FormFullWidthLayout>

            {(allowCallbacks || enableWebhooks) && (
              <>
                <SubFormLayout>
                  {allowCallbacks && (
                    <>
                      <Title size="md" headingLevel="h4">
                        {i18n._(t`配置回调详细信息`)}
                      </Title>
                      <FormColumnLayout>
                        {callbackUrl && (
                          <FormGroup
                            label={i18n._(t`配置回调 URL`)}
                            fieldId="template-callback-url"
                          >
                            <TextInput
                              id="template-callback-url"
                              isDisabled
                              value={callbackUrl}
                            />
                          </FormGroup>
                        )}
                        <FormField
                          id="template-host-config-key"
                          name="host_config_key"
                          label={i18n._(t`主机配置密钥`)}
                          validate={
                            allowCallbacks ? required(null, i18n) : null
                          }
                          isRequired={allowCallbacks}
                        />
                      </FormColumnLayout>
                    </>
                  )}

                  {allowCallbacks && enableWebhooks && <br />}

                  {enableWebhooks && (
                    <>
                      <Title size="md" headingLevel="h4">
                        {i18n._(t`WebHook 详情`)}
                      </Title>
                      <FormColumnLayout>
                        <WebhookSubForm templateType={template.type} />
                      </FormColumnLayout>
                    </>
                  )}
                </SubFormLayout>
              </>
            )}
          </FormColumnLayout>
        </FormFullWidthLayout>
        <FormSubmitError error={submitError} />
        <FormActionGroup onCancel={handleCancel} onSubmit={handleSubmit} />
      </FormColumnLayout>
    </Form>
  );
}
JobTemplateForm.propTypes = {
  template: JobTemplate,
  handleCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitError: PropTypes.shape({}),
  isOverrideDisabledLookup: PropTypes.bool,
};

JobTemplateForm.defaultProps = {
  template: {
    name: '',
    description: '',
    job_type: 'run',
    inventory: undefined,
    project: undefined,
    playbook: '',
    summary_fields: {
      inventory: null,
      labels: { results: [] },
      project: null,
      credentials: [],
    },
    isNew: true,
  },
  submitError: null,
  isOverrideDisabledLookup: false,
};

const FormikApp = withFormik({
  mapPropsToValues({ template = {}, i18n }) {
    const {
      summary_fields = {
        labels: { results: [] },
        inventory: { organization: null },
      },
    } = template;

    return {
      allow_callbacks: template.allow_callbacks || false,
      allow_simultaneous: template.allow_simultaneous || false,
      ask_credential_on_launch: template.ask_credential_on_launch || false,
      ask_diff_mode_on_launch: template.ask_diff_mode_on_launch || false,
      ask_inventory_on_launch: template.ask_inventory_on_launch || false,
      ask_job_type_on_launch: template.ask_job_type_on_launch || false,
      ask_limit_on_launch: template.ask_limit_on_launch || false,
      ask_scm_branch_on_launch: template.ask_scm_branch_on_launch || false,
      ask_skip_tags_on_launch: template.ask_skip_tags_on_launch || false,
      ask_tags_on_launch: template.ask_tags_on_launch || false,
      ask_variables_on_launch: template.ask_variables_on_launch || false,
      ask_verbosity_on_launch: template.ask_verbosity_on_launch || false,
      become_enabled: template.become_enabled || false,
      credentials: summary_fields.credentials || [],
      description: template.description || '',
      diff_mode: template.diff_mode || false,
      extra_vars: template.extra_vars || '---\n',
      forks: template.forks || 0,
      host_config_key: template.host_config_key || '',
      initialInstanceGroups: [],
      instanceGroups: [],
      inventory: template.inventory || null,
      job_slice_count: template.job_slice_count || 1,
      job_tags: template.job_tags || '',
      job_type: template.job_type || 'run',
      labels: summary_fields.labels.results || [],
      limit: template.limit || '',
      name: template.name || '',
      playbook: template.playbook || '',
      project: summary_fields?.project || null,
      scm_branch: template.scm_branch || '',
      skip_tags: template.skip_tags || '',
      timeout: template.timeout || 0,
      use_fact_cache: template.use_fact_cache || false,
      verbosity: template.verbosity || '0',
      webhook_service: template.webhook_service || '',
      webhook_url: template?.related?.webhook_receiver
        ? `${origin}${template.related.webhook_receiver}`
        : i18n._(t`保存时将生成一个新的 webhook url.`).toUpperCase(),
      webhook_key:
        template.webhook_key ||
        i18n._(t`保存时将生成一个新的 webhook 密钥.`).toUpperCase(),
      webhook_credential: template?.summary_fields?.webhook_credential || null,
    };
  },
  handleSubmit: async (values, { props, setErrors }) => {
    try {
      await props.handleSubmit(values);
    } catch (errors) {
      setErrors(errors);
    }
  },
  validate: (values, { i18n }) => {
    const errors = {};

    if (
      (!values.inventory || values.inventory === '') &&
      !values.ask_inventory_on_launch
    ) {
      errors.inventory = i18n._(
        t`请选择一个库存或检查启动时提示选项.`
      );
    }

    return errors;
  },
})(JobTemplateForm);

export { JobTemplateForm as _JobTemplateForm };
export default withI18n()(FormikApp);
