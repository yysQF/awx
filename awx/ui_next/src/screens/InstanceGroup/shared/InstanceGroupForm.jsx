import React from 'react';
import { func, shape } from 'prop-types';
import { Formik, useField } from 'formik';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Form } from '@patternfly/react-core';

import FormField, { FormSubmitError } from '../../../components/FormField';
import FormActionGroup from '../../../components/FormActionGroup';
import { required, minMaxValue } from '../../../util/validators';
import { FormColumnLayout } from '../../../components/FormLayout';

function InstanceGroupFormFields({ i18n }) {
  const [instanceGroupNameField, ,] = useField('name');
  return (
    <>
      <FormField
        name="name"
        id="instance-group-name"
        label={i18n._(t`名称`)}
        type="text"
        validate={required(null, i18n)}
        isRequired
        isDisabled={instanceGroupNameField.value === 'tower'}
      />
      <FormField
        id="instance-group-policy-instance-minimum"
        label={i18n._(t`策略实例最小值`)}
        name="policy_instance_minimum"
        type="number"
        min="0"
        validate={minMaxValue(0, 2147483647, i18n)}
        tooltip={i18n._(
          t`当新实例上线时，将自动分配给该组的最小实例数。`
        )}
      />
      <FormField
        id="instance-group-policy-instance-percentage"
        label={i18n._(t`策略实例百分比`)}
        name="policy_instance_percentage"
        type="number"
        min="0"
        max="100"
        tooltip={i18n._(
          t`当新实例上线时，将自动分配给该组的所有实例的最小百分比。`
        )}
        validate={minMaxValue(0, 100, i18n)}
      />
    </>
  );
}

function InstanceGroupForm({
  instanceGroup = {},
  onSubmit,
  onCancel,
  submitError,
  ...rest
}) {
  const initialValues = {
    name: instanceGroup.name || '',
    policy_instance_minimum: instanceGroup.policy_instance_minimum || 0,
    policy_instance_percentage: instanceGroup.policy_instance_percentage || 0,
  };
  return (
    <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
      {formik => (
        <Form autoComplete="off" onSubmit={formik.handleSubmit}>
          <FormColumnLayout>
            <InstanceGroupFormFields {...rest} />
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

InstanceGroupForm.propTypes = {
  instanceGroup: shape({}),
  onCancel: func.isRequired,
  onSubmit: func.isRequired,
  submitError: shape({}),
};

InstanceGroupForm.defaultProps = {
  instanceGroup: {},
  submitError: null,
};

export default withI18n()(InstanceGroupForm);
