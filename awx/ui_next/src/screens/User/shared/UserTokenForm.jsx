import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Formik, useField } from 'formik';
import { Form, FormGroup } from '@patternfly/react-core';
import AnsibleSelect from '../../../components/AnsibleSelect';
import FormActionGroup from '../../../components/FormActionGroup/FormActionGroup';
import FormField, { FormSubmitError } from '../../../components/FormField';
import ApplicationLookup from '../../../components/Lookup/ApplicationLookup';
import Popover from '../../../components/Popover';
import { required } from '../../../util/validators';

import { FormColumnLayout } from '../../../components/FormLayout';

function UserTokenFormFields({ i18n }) {
  const [applicationField, applicationMeta, applicationHelpers] = useField(
    'application'
  );

  const [scopeField, scopeMeta, scopeHelpers] = useField({
    name: 'scope',
    validate: required(i18n._(t`Please enter a value.`), i18n),
  });

  return (
    <>
      <FormGroup
        fieldId="application-lookup"
        name="application"
        validated={
          !applicationMeta.touched || !applicationMeta.error
            ? 'default'
            : 'error'
        }
        helperTextInvalid={applicationMeta.error}
      >
        <ApplicationLookup
          value={applicationField.value}
          onChange={value => {
            applicationHelpers.setValue(value);
          }}
          label={
            <span>
              {i18n._(t`应用`)}
              <Popover
                content={i18n._(
                  t`选择此令牌所属的应用程序`
                )}
              />
            </span>
          }
          touched={applicationMeta.touched}
        />
      </FormGroup>
      <FormField
        id="token-description"
        name="description"
        type="text"
        label={i18n._(t`描述`)}
      />

      <FormGroup
        name="scope"
        fieldId="token-scope"
        helperTextInvalid={scopeMeta.error}
        isRequired
        validated={!scopeMeta.touched || !scopeMeta.error ? 'default' : 'error'}
        label={i18n._(t`范围`)}
        labelIcon={
          <Popover
            content={i18n._(t`指定令牌访问的范围`)}
          />
        }
      >
        <AnsibleSelect
          {...scopeField}
          id="token-scope"
          data={[
            { key: 'default', label: '', value: '' },
            { key: 'read', value: 'read', label: i18n._(t`Read`) },
            { key: 'write', value: 'write', label: i18n._(t`Write`) },
          ]}
          onChange={(event, value) => {
            scopeHelpers.setValue(value);
          }}
        />
      </FormGroup>
    </>
  );
}

function UserTokenForm({
  handleCancel,
  handleSubmit,
  submitError,
  i18n,
  token = {},
}) {
  return (
    <Formik
      initialValues={{
        description: token.description || '',
        application: token.application || null,
        scope: token.scope || '',
      }}
      onSubmit={handleSubmit}
    >
      {formik => (
        <Form autoComplete="off" onSubmit={formik.handleSubmit}>
          <FormColumnLayout>
            <UserTokenFormFields i18n={i18n} />
            {submitError && <FormSubmitError error={submitError} />}
            <FormActionGroup
              onCancel={handleCancel}
              onSubmit={() => {
                formik.handleSubmit();
              }}
            />
          </FormColumnLayout>
        </Form>
      )}
    </Formik>
  );
}
export default withI18n()(UserTokenForm);
