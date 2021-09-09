import React, { useState } from 'react';
import { bool, func, shape } from 'prop-types';
import { Formik, useField } from 'formik';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import { Form, FormGroup } from '@patternfly/react-core';
import FormField, { FormSubmitError } from '../FormField';
import FormActionGroup from '../FormActionGroup/FormActionGroup';
import { VariablesField } from '../CodeMirrorInput';
import { InventoryLookup } from '../Lookup';
import { FormColumnLayout, FormFullWidthLayout } from '../FormLayout';
import Popover from '../Popover';
import { required } from '../../util/validators';

const InventoryLookupField = withI18n()(({ i18n, host }) => {
  const [inventory, setInventory] = useState(
    host ? host.summary_fields.inventory : ''
  );

  const [, inventoryMeta, inventoryHelpers] = useField({
    name: 'inventory',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  return (
    <FormGroup
      label={i18n._(t`清单`)}
      labelIcon={
        <Popover
          content={i18n._(
            t`选择此主机所属的清单。`
          )}
        />
      }
      isRequired
      fieldId="inventory-lookup"
      validated={
        !inventoryMeta.touched || !inventoryMeta.error ? 'default' : 'error'
      }
      helperTextInvalid={inventoryMeta.error}
    >
      <InventoryLookup
        fieldId="inventory-lookup"
        value={inventory}
        onBlur={() => inventoryHelpers.setTouched()}
        tooltip={i18n._(t`选择此主机所属的清单。`)}
        isValid={!inventoryMeta.touched || !inventoryMeta.error}
        helperTextInvalid={inventoryMeta.error}
        onChange={value => {
          inventoryHelpers.setValue(value.id);
          setInventory(value);
        }}
        required
        touched={inventoryMeta.touched}
        error={inventoryMeta.error}
      />
    </FormGroup>
  );
});

const HostForm = ({
  handleCancel,
  handleSubmit,
  host,
  isInventoryVisible,
  i18n,
  submitError,
}) => {
  return (
    <Formik
      initialValues={{
        name: host.name,
        description: host.description,
        inventory: host.inventory || '',
        variables: host.variables,
      }}
      onSubmit={handleSubmit}
    >
      {formik => (
        <Form autoComplete="off" onSubmit={formik.handleSubmit}>
          <FormColumnLayout>
            <FormField
              id="host-name"
              name="name"
              type="text"
              label={i18n._(t`名称`)}
              validate={required(null, i18n)}
              isRequired
            />
            <FormField
              id="host-description"
              name="description"
              type="text"
              label={i18n._(t`描述`)}
            />
            {isInventoryVisible && <InventoryLookupField host={host} />}
            <FormFullWidthLayout>
              <VariablesField
                id="host-variables"
                name="variables"
                label={i18n._(t`变量`)}
              />
            </FormFullWidthLayout>
            {submitError && <FormSubmitError error={submitError} />}
            <FormActionGroup
              onCancel={handleCancel}
              onSubmit={formik.handleSubmit}
            />
          </FormColumnLayout>
        </Form>
      )}
    </Formik>
  );
};

HostForm.propTypes = {
  handleCancel: func.isRequired,
  handleSubmit: func.isRequired,
  host: shape({}),
  isInventoryVisible: bool,
  submitError: shape({}),
};

HostForm.defaultProps = {
  host: {
    name: '',
    description: '',
    inventory: undefined,
    variables: '---\n',
    summary_fields: {
      inventory: null,
    },
  },
  isInventoryVisible: true,
  submitError: null,
};

export { HostForm as _HostForm };
export default withI18n()(HostForm);
