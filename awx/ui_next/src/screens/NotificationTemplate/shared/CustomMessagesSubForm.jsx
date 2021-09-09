import 'styled-components/macro';
import React, { useEffect, useRef } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { useField, useFormikContext } from 'formik';
import { Switch, Text } from '@patternfly/react-core';
import {
  FormFullWidthLayout,
  SubFormLayout,
} from '../../../components/FormLayout';
import CodeMirrorField from '../../../components/CodeMirrorInput/CodeMirrorField';

function CustomMessagesSubForm({ defaultMessages, type, i18n }) {
  const [useCustomField, , useCustomHelpers] = useField('useCustomMessages');
  const showMessages = type !== 'webhook';
  const showBodies = ['email', 'pagerduty', 'webhook'].includes(type);

  const { setFieldValue } = useFormikContext();
  const mountedRef = useRef(null);
  useEffect(
    function resetToDefaultMessages() {
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }
      const defs = defaultMessages[type];

      const resetFields = (name, defaults) => {
        setFieldValue(`${name}.message`, defaults.message || '');
        setFieldValue(`${name}.body`, defaults.body || '');
      };

      resetFields('messages.started', defs.started);
      resetFields('messages.success', defs.success);
      resetFields('messages.error', defs.error);
      resetFields(
        'messages.workflow_approval.approved',
        defs.workflow_approval.approved
      );
      resetFields(
        'messages.workflow_approval.denied',
        defs.workflow_approval.denied
      );
      resetFields(
        'messages.workflow_approval.running',
        defs.workflow_approval.running
      );
      resetFields(
        'messages.workflow_approval.timed_out',
        defs.workflow_approval.timed_out
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, setFieldValue]
  );

  return (
    <>
      <Switch
        id="toggle-custom-messages"
        label={i18n._(t`自定义消息`)}
        isChecked={!!useCustomField.value}
        onChange={() => useCustomHelpers.setValue(!useCustomField.value)}
      />
      {useCustomField.value && (
        <SubFormLayout>
          <Text
            className="pf-c-content"
            css="margin-bottom: var(--pf-c-content--MarginBottom)"
          >
            <small>
              Use custom messages to change the content of notifications sent
              when a job starts, succeeds, or fails. Use curly braces to access
              information about the job:{' '}
              <code>
                {'{{'} job_friendly_name {'}}'}
              </code>
              ,{' '}
              <code>
                {'{{'} url {'}}'}
              </code>
              , or attributes of the job such as{' '}
              <code>
                {'{{'} job.status {'}}'}
              </code>
              . You may apply a number of possible variables in the message.
              Refer to the{' '}
              <a
                href="https://docs.ansible.com/ansible-tower/latest/html/userguide/notifications.html#create-custom-notifications"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ansible Tower documentation
              </a>{' '}
              for more details.
            </small>
          </Text>
          <FormFullWidthLayout>
            {showMessages && (
              <CodeMirrorField
                id="start-message"
                name="messages.started.message"
                label={i18n._(t`开始信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="start-body"
                name="messages.started.body"
                label={i18n._(t`开始消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="success-message"
                name="messages.success.message"
                label={i18n._(t`成功信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="success-body"
                name="messages.success.body"
                label={i18n._(t`成功消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="error-message"
                name="messages.error.message"
                label={i18n._(t`错误信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="error-body"
                name="messages.error.body"
                label={i18n._(t`错误消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="wf-approved-message"
                name="messages.workflow_approval.approved.message"
                label={i18n._(t`工作流程批准信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="wf-approved-body"
                name="messages.workflow_approval.approved.body"
                label={i18n._(t`工作流批准的消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="wf-denied-message"
                name="messages.workflow_approval.denied.message"
                label={i18n._(t`工作流程拒绝信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="wf-denied-body"
                name="messages.workflow_approval.denied.body"
                label={i18n._(t`工作流拒绝消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="wf-running-message"
                name="messages.workflow_approval.running.message"
                label={i18n._(t`工作流待处理信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="wf-running-body"
                name="messages.workflow_approval.running.body"
                label={i18n._(t`工作流待处理消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
            {showMessages && (
              <CodeMirrorField
                id="wf-timed-out-message"
                name="messages.workflow_approval.timed_out.message"
                label={i18n._(t`工作流超时信息`)}
                mode="jinja2"
                rows={2}
              />
            )}
            {showBodies && (
              <CodeMirrorField
                id="wf-timed-out-body"
                name="messages.workflow_approval.timed_out.body"
                label={i18n._(t`工作流超时消息正文`)}
                mode="jinja2"
                rows={6}
              />
            )}
          </FormFullWidthLayout>
        </SubFormLayout>
      )}
    </>
  );
}

export default withI18n()(CustomMessagesSubForm);
