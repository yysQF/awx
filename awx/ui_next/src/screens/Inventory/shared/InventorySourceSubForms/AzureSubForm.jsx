import React, { useCallback } from 'react';
import { useField, useFormikContext } from 'formik';
import { withI18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import CredentialLookup from '../../../../components/Lookup/CredentialLookup';
import {
  OptionsField,
  SourceVarsField,
  VerbosityField,
  EnabledVarField,
  EnabledValueField,
  HostFilterField,
} from './SharedFields';
import { required } from '../../../../util/validators';

const AzureSubForm = ({ autoPopulateCredential, i18n }) => {
  const { setFieldValue } = useFormikContext();
  const [credentialField, credentialMeta, credentialHelpers] = useField({
    name: 'credential',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  const handleCredentialUpdate = useCallback(
    value => {
      setFieldValue('credential', value);
    },
    [setFieldValue]
  );

  const pluginLink =
    'http://docs.ansible.com/ansible-tower/latest/html/userguide/inventories.html#inventory-plugins';
  const configLink =
    'https://docs.ansible.com/ansible/latest/collections/azure/azcollection/azure_rm_inventory.html';

  return (
    <>
      <CredentialLookup
        credentialTypeNamespace="azure_rm"
        label={i18n._(t`凭证`)}
        helperTextInvalid={credentialMeta.error}
        isValid={!credentialMeta.touched || !credentialMeta.error}
        onBlur={() => credentialHelpers.setTouched()}
        onChange={handleCredentialUpdate}
        value={credentialField.value}
        required
        autoPopulate={autoPopulateCredential}
      />
      <VerbosityField />
      <HostFilterField />
      <EnabledVarField />
      <EnabledValueField />
      <OptionsField />
      <SourceVarsField
        popoverContent={
          <>
            <Trans>
              Enter variables to configure the inventory source. For a detailed
              description of how to configure this plugin, see{' '}
              <a href={pluginLink} target="_blank" rel="noopener noreferrer">
                Inventory Plugins
              </a>{' '}
              in the documentation and the{' '}
              <a href={configLink} target="_blank" rel="noopener noreferrer">
                azure_rm
              </a>{' '}
              plugin configuration guide.
            </Trans>
            <br />
            <br />
          </>
        }
      />
    </>
  );
};

export default withI18n()(AzureSubForm);
