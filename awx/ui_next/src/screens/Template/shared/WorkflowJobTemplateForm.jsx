import React, { useCallback, useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import PropTypes, { shape } from 'prop-types';

import { withI18n } from '@lingui/react';
import { useField, useFormikContext, withFormik } from 'formik';
import {
  Form,
  FormGroup,
  Checkbox,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { required } from '../../../util/validators';

import FieldWithPrompt from '../../../components/FieldWithPrompt';
import FormField, { FormSubmitError } from '../../../components/FormField';
import {
  FormColumnLayout,
  FormFullWidthLayout,
  FormCheckboxLayout,
  SubFormLayout,
} from '../../../components/FormLayout';
import OrganizationLookup from '../../../components/Lookup/OrganizationLookup';
import { InventoryLookup } from '../../../components/Lookup';
import { VariablesField } from '../../../components/CodeMirrorInput';
import FormActionGroup from '../../../components/FormActionGroup';
import ContentError from '../../../components/ContentError';
import CheckboxField from '../../../components/FormField/CheckboxField';
import Popover from '../../../components/Popover';
import LabelSelect from './LabelSelect';
import WebhookSubForm from './WebhookSubForm';
import { WorkFlowJobTemplate } from '../../../types';

const urlOrigin = window.location.origin;

function WorkflowJobTemplateForm({
  template,
  handleSubmit,
  handleCancel,
  i18n,
  submitError,
}) {
  const { setFieldValue } = useFormikContext();
  const [enableWebhooks, setEnableWebhooks] = useState(
    Boolean(template.webhook_service)
  );
  const [hasContentError, setContentError] = useState(null);
  const [askInventoryOnLaunchField] = useField('ask_inventory_on_launch');
  const [inventoryField, inventoryMeta, inventoryHelpers] = useField(
    'inventory'
  );
  const [labelsField, , labelsHelpers] = useField('labels');
  const [limitField, limitMeta, limitHelpers] = useField('limit');
  const [organizationField, organizationMeta] = useField('organization');
  const [scmField, , scmHelpers] = useField('scm_branch');
  const [, webhookServiceMeta, webhookServiceHelpers] = useField(
    'webhook_service'
  );
  const [, webhookUrlMeta, webhookUrlHelpers] = useField('webhook_url');
  const [, webhookKeyMeta, webhookKeyHelpers] = useField('webhook_key');
  const [, webhookCredentialMeta, webhookCredentialHelpers] = useField(
    'webhook_credential'
  );

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

  const onOrganizationChange = useCallback(
    value => {
      setFieldValue('organization', value);
    },
    [setFieldValue]
  );

  if (hasContentError) {
    return <ContentError error={hasContentError} />;
  }

  return (
    <Form autoComplete="off" onSubmit={handleSubmit}>
      <FormColumnLayout>
        <FormField
          id="wfjt-name"
          name="name"
          type="text"
          label={i18n._(t`名称`)}
          validate={required(null, i18n)}
          isRequired
        />
        <FormField
          id="wfjt-description"
          name="description"
          type="text"
          label={i18n._(t`描述`)}
        />
        <OrganizationLookup
          helperTextInvalid={organizationMeta.error}
          onChange={onOrganizationChange}
          value={organizationField.value}
          isValid={!organizationMeta.error}
        />
        <>
          <InventoryLookup
            promptId="wfjt-ask-inventory-on-launch"
            promptName="ask_inventory_on_launch"
            tooltip={i18n._(
              t`为工作流程选择一个清单，此清单适用于提示输入清单的所有作业模板节点`
            )}
            fieldId="wfjt-inventory"
            isPromptableField
            value={inventoryField.value}
            onBlur={() => inventoryHelpers.setTouched()}
            onChange={value => {
              inventoryHelpers.setValue(value);
            }}
            touched={inventoryMeta.touched}
            error={inventoryMeta.error}
          />
          {(inventoryMeta.touched || askInventoryOnLaunchField.value) &&
            inventoryMeta.error && (
              <div
                className="pf-c-form__helper-text pf-m-error"
                aria-live="polite"
              >
                {inventoryMeta.error}
              </div>
            )}
        </>
        <FieldWithPrompt
          fieldId="wjft-limit"
          label={i18n._(t`范围`)}
          promptId="template-ask-limit-on-launch"
          promptName="ask_limit_on_launch"
          tooltip={i18n._(t`提供主机模式以进一步约束
          将受管理或影响的主机列表
          剧本，允许多个模式`)}
        >
          <TextInput
            id="text-wfjt-limit"
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
          fieldId="wfjt-scm-branch"
          label={i18n._(t`源代码控制分支`)}
          promptId="wfjt-ask-scm-branch-on-launch"
          promptName="ask_scm_branch_on_launch"
          tooltip={i18n._(
            t`为工作流选择一个分支，此分支应用于提示分支的所有作业模板节点`
          )}
        >
          <TextInput
            id="text-wfjt-scm-branch"
            {...scmField}
            onChange={value => {
              scmHelpers.setValue(value);
            }}
          />
        </FieldWithPrompt>
      </FormColumnLayout>
      <FormFullWidthLayout>
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
      </FormFullWidthLayout>
      <FormFullWidthLayout>
        <VariablesField
          id="wfjt-variables"
          name="extra_vars"
          label={i18n._(t`变量`)}
          promptId="template-ask-variables-on-launch"
          tooltip={i18n._(
            t`将额外的命令行变量传递给剧本。 这是 ansible-playbook 的 -e 或 --extra-vars 命令行参数，使用 YAML 或 JSON 提供键/值对`
          )}
        />
      </FormFullWidthLayout>
      <FormGroup fieldId="options" label={i18n._(t`选项`)}>
        <FormCheckboxLayout isInline>
          <Checkbox
            aria-label={i18n._(t`启用 Webhook`)}
            label={
              <span>
                {i18n._(t`启用 Webhook`)}
                &nbsp;
                <Popover
                  content={i18n._(
                    t`为此工作流作业模板启用 Webhook.`
                  )}
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
            name="allow_simultaneous"
            id="allow_simultaneous"
            tooltip={i18n._(
              t`如果启用，将允许同时运行此工作流作业模板.`
            )}
            label={i18n._(t`启用并发作业`)}
          />
        </FormCheckboxLayout>
      </FormGroup>

      {enableWebhooks && (
        <SubFormLayout>
          <Title size="md" headingLevel="h4">
            {i18n._(t`Webhook 详情`)}
          </Title>
          <WebhookSubForm templateType={template.type} />
        </SubFormLayout>
      )}

      {submitError && <FormSubmitError error={submitError} />}
      <FormActionGroup onCancel={handleCancel} onSubmit={handleSubmit} />
    </Form>
  );
}

WorkflowJobTemplateForm.propTypes = {
  template: WorkFlowJobTemplate,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  submitError: shape({}),
};

WorkflowJobTemplateForm.defaultProps = {
  submitError: null,
  template: {
    name: '',
    description: '',
    inventory: undefined,
    project: undefined,
  },
};

const FormikApp = withFormik({
  mapPropsToValues({ template = {} }) {
    return {
      name: template.name || '',
      description: template.description || '',
      inventory: template?.summary_fields?.inventory || null,
      organization: template?.summary_fields?.organization || null,
      labels: template.summary_fields?.labels?.results || [],
      extra_vars: template.extra_vars || '---',
      limit: template.limit || '',
      scm_branch: template.scm_branch || '',
      allow_simultaneous: template.allow_simultaneous || false,
      webhook_credential: template?.summary_fields?.webhook_credential || null,
      webhook_service: template.webhook_service || '',
      ask_limit_on_launch: template.ask_limit_on_launch || false,
      ask_inventory_on_launch: template.ask_inventory_on_launch || false,
      ask_variables_on_launch: template.ask_variables_on_launch || false,
      ask_scm_branch_on_launch: template.ask_scm_branch_on_launch || false,
      webhook_url: template?.related?.webhook_receiver
        ? `${urlOrigin}${template.related.webhook_receiver}`
        : '',
      webhook_key: template.webhook_key || '',
    };
  },
  handleSubmit: async (values, { props, setErrors }) => {
    try {
      await props.handleSubmit(values);
    } catch (errors) {
      setErrors(errors);
    }
  },
})(WorkflowJobTemplateForm);

export { WorkflowJobTemplateForm as _WorkflowJobTemplateForm };
export default withI18n()(FormikApp);
