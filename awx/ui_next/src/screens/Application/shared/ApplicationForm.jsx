import React, { useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Formik, useField, useFormikContext } from 'formik';
import { Form, FormGroup } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { required } from '../../../util/validators';
import FormField, { FormSubmitError } from '../../../components/FormField';
import { FormColumnLayout } from '../../../components/FormLayout';
import FormActionGroup from '../../../components/FormActionGroup/FormActionGroup';
import OrganizationLookup from '../../../components/Lookup/OrganizationLookup';
import AnsibleSelect from '../../../components/AnsibleSelect';
import Popover from '../../../components/Popover';

function ApplicationFormFields({
  i18n,
  application,
  authorizationOptions,
  clientTypeOptions,
}) {
  const match = useRouteMatch();
  const { setFieldValue } = useFormikContext();
  const [organizationField, organizationMeta, organizationHelpers] = useField({
    name: 'organization',
    validate: required(null, i18n),
  });
  const [
    authorizationTypeField,
    authorizationTypeMeta,
    authorizationTypeHelpers,
  ] = useField({
    name: 'authorization_grant_type',
    validate: required(null, i18n),
  });

  const [clientTypeField, clientTypeMeta, clientTypeHelpers] = useField({
    name: 'client_type',
    validate: required(null, i18n),
  });

  const onOrganizationChange = useCallback(
    value => {
      setFieldValue('organization', value);
    },
    [setFieldValue]
  );

  return (
    <>
      <FormField
        id="name"
        label={i18n._(t`名称`)}
        name="name"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="description"
        label={i18n._(t`描述`)}
        name="description"
        type="text"
      />
      <OrganizationLookup
        helperTextInvalid={organizationMeta.error}
        isValid={!organizationMeta.touched || !organizationMeta.error}
        onBlur={() => organizationHelpers.setTouched()}
        onChange={onOrganizationChange}
        value={organizationField.value}
        required
        autoPopulate={!application?.id}
      />
      <FormGroup
        fieldId="authType"
        helperTextInvalid={authorizationTypeMeta.error}
        validated={
          !authorizationTypeMeta.touched || !authorizationTypeMeta.error
            ? 'default'
            : 'error'
        }
        isRequired
        label={i18n._(t`实例`)}
        labelIcon={
          <Popover
            content={i18n._(
              t`用户必须用于获取此应用程序令牌的授予类型`
            )}
          />
        }
      >
        <AnsibleSelect
          {...authorizationTypeField}
          isValid={
            !authorizationTypeMeta.touched || !authorizationTypeMeta.error
          }
          isDisabled={match.url.endsWith('edit')}
          id="authType"
          data={[{ label: '', key: 1, value: '' }, ...authorizationOptions]}
          onChange={(event, value) => {
            authorizationTypeHelpers.setValue(value);
          }}
        />
      </FormGroup>
      <FormField
        id="redirect_uris"
        label={i18n._(t`重定向 URIs`)}
        name="redirect_uris"
        type="text"
        isRequired={Boolean(
          authorizationTypeField.value === 'authorization-code'
        )}
        validate={
          authorizationTypeField.value === 'authorization-code'
            ? required(null, i18n)
            : null
        }
        tooltip={i18n._(t`允许的 URI 列表，以空格分隔`)}
      />
      <FormGroup
        fieldId="clientType"
        helperTextInvalid={clientTypeMeta.error}
        validated={
          !clientTypeMeta.touched || !clientTypeMeta.error ? 'default' : 'error'
        }
        isRequired
        label={i18n._(t`客户端类型`)}
        labelIcon={
          <Popover
            content={i18n._(
              t`根据客户端设备的安全程度设置为公开或机密。`
            )}
          />
        }
      >
        <AnsibleSelect
          {...clientTypeField}
          isValid={!clientTypeMeta.touched || !clientTypeMeta.error}
          id="clientType"
          data={[{ label: '', key: 1, value: '' }, ...clientTypeOptions]}
          onChange={(event, value) => {
            clientTypeHelpers.setValue(value);
          }}
        />
      </FormGroup>
    </>
  );
}
function ApplicationForm({
  onCancel,
  onSubmit,
  i18n,
  submitError,
  application,
  authorizationOptions,
  clientTypeOptions,
}) {
  const initialValues = {
    name: application?.name || '',
    description: application?.description || '',
    organization: application?.summary_fields?.organization || null,
    authorization_grant_type: application?.authorization_grant_type || '',
    redirect_uris: application?.redirect_uris || '',
    client_type: application?.client_type || '',
  };

  return (
    <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
      {formik => (
        <Form autoComplete="off" onSubmit={formik.handleSubmit}>
          <FormColumnLayout>
            <ApplicationFormFields
              formik={formik}
              application={application}
              authorizationOptions={authorizationOptions}
              clientTypeOptions={clientTypeOptions}
              i18n={i18n}
            />
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

ApplicationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  authorizationOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  clientTypeOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withI18n()(ApplicationForm);
