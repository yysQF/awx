import React, { useEffect, useCallback } from 'react';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useParams, useLocation } from 'react-router-dom';
import { t } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import {
  FormGroup,
  TextInput,
  InputGroup,
  Button,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import ContentError from '../../../components/ContentError';
import ContentLoading from '../../../components/ContentLoading';
import useRequest from '../../../util/useRequest';
import { FormColumnLayout } from '../../../components/FormLayout';
import { CredentialLookup } from '../../../components/Lookup';
import AnsibleSelect from '../../../components/AnsibleSelect';
import Popover from '../../../components/Popover';
import {
  JobTemplatesAPI,
  WorkflowJobTemplatesAPI,
  CredentialTypesAPI,
} from '../../../api';

function WebhookSubForm({ i18n, templateType }) {
  const { setFieldValue } = useFormikContext();
  const { id } = useParams();
  const { pathname } = useLocation();
  const { origin } = document.location;

  const [
    webhookServiceField,
    webhookServiceMeta,
    webhookServiceHelpers,
  ] = useField('webhook_service');
  const [webhookUrlField, , webhookUrlHelpers] = useField('webhook_url');
  const [webhookKeyField, webhookKeyMeta, webhookKeyHelpers] = useField(
    'webhook_key'
  );
  const [
    webhookCredentialField,
    webhookCredentialMeta,
    webhookCredentialHelpers,
  ] = useField('webhook_credential');

  const {
    request: loadCredentialType,
    error,
    isLoading,
    result: credTypeId,
  } = useRequest(
    useCallback(async () => {
      let results;
      if (webhookServiceField.value) {
        results = await CredentialTypesAPI.read({
          namespace: `${webhookServiceField.value}_token`,
        });
        // TODO: Consider how to handle the situation where the results returns
        // and empty array, or any of the other values is undefined or null (data, results, id)
      }
      return results?.data?.results[0]?.id;
    }, [webhookServiceField.value])
  );

  useEffect(() => {
    loadCredentialType();
  }, [loadCredentialType]);

  const { request: fetchWebhookKey, error: webhookKeyError } = useRequest(
    useCallback(async () => {
      const updateWebhookKey =
        templateType === 'job_template'
          ? JobTemplatesAPI.updateWebhookKey(id)
          : WorkflowJobTemplatesAPI.updateWebhookKey(id);
      const {
        data: { webhook_key: key },
      } = await updateWebhookKey;
      webhookKeyHelpers.setValue(key);
    }, [webhookKeyHelpers, id, templateType])
  );

  const changeWebhookKey = async () => {
    await fetchWebhookKey();
  };

  const onCredentialChange = useCallback(
    value => {
      setFieldValue('webhook_credential', value || null);
    },
    [setFieldValue]
  );

  const isUpdateKeyDisabled =
    pathname.endsWith('/add') ||
    webhookKeyMeta.initialValue ===
      'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.';
  const webhookServiceOptions = [
    {
      value: '',
      key: '',
      label: i18n._(t`选择一个 Webhook 服务`),
      isDisabled: true,
    },
    {
      value: 'github',
      key: 'github',
      label: i18n._(t`GitHub`),
      isDisabled: false,
    },
    {
      value: 'gitlab',
      key: 'gitlab',
      label: i18n._(t`GitLab`),
      isDisabled: false,
    },
  ];

  if (error || webhookKeyError) {
    return <ContentError error={error} />;
  }
  if (isLoading) {
    return <ContentLoading />;
  }
  return (
    <FormColumnLayout>
      <FormGroup
        name="webhook_service"
        fieldId="webhook_service"
        helperTextInvalid={webhookServiceMeta.error}
        label={i18n._(t`Webhook 服务`)}
        labelIcon={<Popover content={i18n._(t`选择一个 webhook 服务.`)} />}
      >
        <AnsibleSelect
          {...webhookServiceField}
          id="webhook_service"
          data={webhookServiceOptions}
          onChange={(event, val) => {
            webhookServiceHelpers.setValue(val);
            webhookUrlHelpers.setValue(
              pathname.endsWith('/add')
                ? i18n
                    ._(t`保存时将生成一个新的 webhook url.`)
                    .toUpperCase()
                : `${origin}/api/v2/${templateType}s/${id}/${val}/`
            );
            if (val === webhookServiceMeta.initialValue || val === '') {
              webhookKeyHelpers.setValue(webhookKeyMeta.initialValue);
              webhookCredentialHelpers.setValue(
                webhookCredentialMeta.initialValue
              );
            } else {
              webhookKeyHelpers.setValue(
                i18n
                  ._(t`保存时将生成一个新的 webhook 密钥.`)
                  .toUpperCase()
              );
              webhookCredentialHelpers.setValue(null);
            }
          }}
        />
      </FormGroup>
      <>
        <FormGroup
          type="text"
          fieldId="jt-webhookURL"
          label={i18n._(t`Webhook URL`)}
          labelIcon={
            <Popover
              content={i18n._(
                t`Webhook 服务可以通过向此 URL 发出 POST 请求来使用此工作流作业模板启动作业.`
              )}
            />
          }
          name="webhook_url"
        >
          <TextInput
            id="t-webhookURL"
            aria-label={i18n._(t`Webhook URL`)}
            value={webhookUrlField.value}
            isReadOnly
          />
        </FormGroup>
        <FormGroup
          label={i18n._(t`Webhook 密钥`)}
          labelIcon={
            <Popover
              content={i18n._(
                t`Webhook 服务可以将其用作共享密钥.`
              )}
            />
          }
          fieldId="template-webhook_key"
        >
          <InputGroup>
            <TextInput
              id="template-webhook_key"
              isReadOnly
              aria-label="wfjt-webhook-key"
              value={webhookKeyField.value}
            />
            <Button
              isDisabled={isUpdateKeyDisabled}
              variant="tertiary"
              aria-label={i18n._(t`更新 webhook 密钥`)}
              onClick={changeWebhookKey}
            >
              <SyncAltIcon />
            </Button>
          </InputGroup>
        </FormGroup>
      </>

      {credTypeId && (
        <CredentialLookup
          label={i18n._(t`Webhook 凭证`)}
          tooltip={i18n._(
            t`选择用于将状态更新发送回 Webhook 服务的凭据.`
          )}
          credentialTypeId={credTypeId}
          onChange={onCredentialChange}
          isValid={!webhookCredentialMeta.error}
          helperTextInvalid={webhookCredentialMeta.error}
          value={webhookCredentialField.value}
        />
      )}
    </FormColumnLayout>
  );
}
export default withI18n()(WebhookSubForm);
