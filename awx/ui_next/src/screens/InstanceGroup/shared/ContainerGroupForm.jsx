import React, { useCallback } from 'react';
import { func, shape } from 'prop-types';
import { Formik, useField, useFormikContext } from 'formik';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Form, FormGroup } from '@patternfly/react-core';
import { jsonToYaml } from '../../../util/yaml';

import FormField, {
  FormSubmitError,
  CheckboxField,
} from '../../../components/FormField';
import FormActionGroup from '../../../components/FormActionGroup';
import { required } from '../../../util/validators';
import {
  FormColumnLayout,
  FormFullWidthLayout,
  FormCheckboxLayout,
  SubFormLayout,
} from '../../../components/FormLayout';
import CredentialLookup from '../../../components/Lookup/CredentialLookup';
import { VariablesField } from '../../../components/CodeMirrorInput';

function ContainerGroupFormFields({ i18n, instanceGroup }) {
  const { setFieldValue } = useFormikContext();
  const [credentialField, credentialMeta, credentialHelpers] = useField({
    name: 'credential',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  const [overrideField] = useField('override');

  const onCredentialChange = useCallback(
    value => {
      setFieldValue('credential', value);
    },
    [setFieldValue]
  );

  return (
    <>
      <FormField
        name="name"
        id="container-group-name"
        label={i18n._(t`名称`)}
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <CredentialLookup
        label={i18n._(t`凭证`)}
        credentialTypeKind="kubernetes"
        helperTextInvalid={credentialMeta.error}
        isValid={!credentialMeta.touched || !credentialMeta.error}
        onBlur={() => credentialHelpers.setTouched()}
        onChange={onCredentialChange}
        value={credentialField.value}
        required
        tooltip={i18n._(
          t`使用 Kubernetes 或 OpenShift 进行身份验证的凭据。 必须是 Kubernetes/OpenShift API Bearer Token 类型。`
        )}
        autoPopulate={!instanceGroup?.id}
      />

      <FormGroup
        fieldId="container-groups-option-checkbox"
        label={i18n._(t`选项`)}
      >
        <FormCheckboxLayout>
          <CheckboxField
            name="override"
            aria-label={i18n._(t`自定义节点规范`)}
            label={i18n._(t`自定义节点规范`)}
            id="container-groups-override-pod-specification"
          />
        </FormCheckboxLayout>
      </FormGroup>

      {overrideField.value && (
        <SubFormLayout>
          <FormFullWidthLayout>
            <VariablesField
              tooltip={i18n._(
                t`Field for passing a custom Kubernetes or OpenShift Pod specification.`
              )}
              id="custom-pod-spec"
              name="pod_spec_override"
              label={i18n._(t`自定义节点规范`)}
            />
          </FormFullWidthLayout>
        </SubFormLayout>
      )}
    </>
  );
}

function ContainerGroupForm({
  initialPodSpec,
  instanceGroup,
  onSubmit,
  onCancel,
  submitError,
  ...rest
}) {
  const isCheckboxChecked = Boolean(instanceGroup?.pod_spec_override) || false;

  const initialValues = {
    name: instanceGroup?.name || '',
    credential: instanceGroup?.summary_fields?.credential,
    pod_spec_override: isCheckboxChecked
      ? instanceGroup?.pod_spec_override
      : jsonToYaml(JSON.stringify(initialPodSpec)),
    override: isCheckboxChecked,
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        onSubmit(values);
      }}
    >
      {formik => (
        <Form autoComplete="off" onSubmit={formik.handleSubmit}>
          <FormColumnLayout>
            <ContainerGroupFormFields instanceGroup={instanceGroup} {...rest} />
            {submitError && <FormSubmitError error={submitError} />}
            <FormActionGroup
              onCancel={onCancel}
              onSubmit={formik.handleSubmit}
            />
          </FormColumnLayout>
        </Form>
      )}
    </Formik>
  );
}

ContainerGroupForm.propTypes = {
  instanceGroup: shape({}),
  onCancel: func.isRequired,
  onSubmit: func.isRequired,
  submitError: shape({}),
  initialPodSpec: shape({}),
};

ContainerGroupForm.defaultProps = {
  instanceGroup: {},
  submitError: null,
  initialPodSpec: {},
};

export default withI18n()(ContainerGroupForm);
