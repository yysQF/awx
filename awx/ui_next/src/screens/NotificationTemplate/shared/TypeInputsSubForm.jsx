import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { useField } from 'formik';
import { FormGroup, Title } from '@patternfly/react-core';
import {
  FormColumnLayout,
  FormFullWidthLayout,
  SubFormLayout,
} from '../../../components/FormLayout';
import FormField, {
  PasswordField,
  CheckboxField,
  ArrayTextField,
} from '../../../components/FormField';
import AnsibleSelect from '../../../components/AnsibleSelect';
import { CodeMirrorField } from '../../../components/CodeMirrorInput';
import {
  combine,
  required,
  requiredEmail,
  url,
  minMaxValue,
} from '../../../util/validators';
import { NotificationType } from '../../../types';

const TypeFields = {
  email: EmailFields,
  grafana: GrafanaFields,
  irc: IRCFields,
  mattermost: MattermostFields,
  pagerduty: PagerdutyFields,
  rocketchat: RocketChatFields,
  slack: SlackFields,
  twilio: TwilioFields,
  webhook: WebhookFields,
};

function TypeInputsSubForm({ type, i18n }) {
  const Fields = TypeFields[type];
  return (
    <SubFormLayout>
      <Title size="md" headingLevel="h4">
        {i18n._(t`类型详细信息`)}
      </Title>
      <FormColumnLayout>
        <Fields i18n={i18n} />
      </FormColumnLayout>
    </SubFormLayout>
  );
}
TypeInputsSubForm.propTypes = {
  type: NotificationType.isRequired,
};

export default withI18n()(TypeInputsSubForm);

function EmailFields({ i18n }) {
  const [optionsField, optionsMeta] = useField({
    name: 'emailOptions',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  return (
    <>
      <FormField
        id="email-username"
        label={i18n._(t`用户名`)}
        name="notification_configuration.username"
        type="text"
      />
      <PasswordField
        id="email-password"
        label={i18n._(t`密码`)}
        name="notification_configuration.password"
      />
      <FormField
        id="email-host"
        label={i18n._(t`主机`)}
        name="notification_configuration.host"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <ArrayTextField
        id="email-recipients"
        label={i18n._(t`收件人列表`)}
        name="notification_configuration.recipients"
        type="textarea"
        validate={required(null, i18n)}
        isRequired
        rows={3}
        tooltip={i18n._(t`每行输入一个电子邮件地址以创建收件人
        此类通知的列表`)}
      />
      <FormField
        id="email-sender"
        label={i18n._(t`发送 e-mail`)}
        name="notification_configuration.sender"
        type="text"
        validate={requiredEmail(i18n)}
        isRequired
      />
      <FormField
        id="email-port"
        label={i18n._(t`端口`)}
        name="notification_configuration.port"
        type="number"
        validate={combine([required(null, i18n), minMaxValue(1, 65535, i18n)])}
        isRequired
        min="0"
        max="65535"
      />
      <FormField
        id="email-timeout"
        label={i18n._(t`超时`)}
        name="notification_configuration.timeout"
        type="number"
        validate={combine([required(null, i18n), minMaxValue(1, 120, i18n)])}
        isRequired
        min="1"
        max="120"
        tooltip={i18n._(t`电子邮件之前的时间量（以秒为单位）
        通知停止尝试到达主机并超时。 范围
        从 1 到 120 秒`)}
      />
      <FormGroup
        fieldId="email-options"
        helperTextInvalid={optionsMeta.error}
        isRequired
        validated={
          !optionsMeta.touched || !optionsMeta.error ? 'default' : 'error'
        }
        label={i18n._(t`E-mail 选项`)}
      >
        <AnsibleSelect
          {...optionsField}
          id="email-options"
          data={[
            {
              value: '',
              key: '',
              label: i18n._(t`选择一个电子邮件选项`),
              isDisabled: true,
            },
            { value: 'tls', key: 'tls', label: i18n._(t`Use TLS`) },
            { value: 'ssl', key: 'ssl', label: i18n._(t`Use SSL`) },
          ]}
        />
      </FormGroup>
    </>
  );
}

function GrafanaFields({ i18n }) {
  return (
    <>
      <FormField
        id="grafana-url"
        label={i18n._(t`Grafana URL`)}
        name="notification_configuration.grafana_url"
        type="text"
        validate={required(null, i18n)}
        isRequired
        tooltip={i18n._(t`Grafana 服务器的基本 URL -
        /api/annotations 端点将自动添加到基础
        Grafana 网址.`)}
      />
      <PasswordField
        id="grafana-key"
        label={i18n._(t`Grafana API 密钥`)}
        name="notification_configuration.grafana_key"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="grafana-dashboard-id"
        label={i18n._(t`仪表板 ID（可选）`)}
        name="notification_configuration.dashboardId"
        type="text"
      />
      <FormField
        id="grafana-panel-id"
        label={i18n._(t`面板 ID（可选）`)}
        name="notification_configuration.panelId"
        type="text"
      />
      <ArrayTextField
        id="grafana-tags"
        label={i18n._(t`注释的标签（可选）`)}
        name="notification_configuration.annotation_tags"
        type="textarea"
        rows={3}
        tooltip={i18n._(t`每行输入一个注释标签，不带逗号.`)}
      />
      <CheckboxField
        id="grafana-ssl"
        label={i18n._(t`禁用 SSL 验证`)}
        name="notification_configuration.grafana_no_verify_ssl"
      />
    </>
  );
}

function IRCFields({ i18n }) {
  return (
    <>
      <PasswordField
        id="irc-password"
        label={i18n._(t`IRC 服务器密码`)}
        name="notification_configuration.password"
      />
      <FormField
        id="irc-port"
        label={i18n._(t`IRC 服务器端口`)}
        name="notification_configuration.port"
        type="number"
        validate={required(null, i18n)}
        isRequired
        min="0"
      />
      <FormField
        id="irc-server"
        label={i18n._(t`IRC 服务器地址`)}
        name="notification_configuration.server"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="irc-nickname"
        label={i18n._(t`IRC 昵称`)}
        name="notification_configuration.nickname"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <ArrayTextField
        id="irc-targets"
        label={i18n._(t`目标频道或用户`)}
        name="notification_configuration.targets"
        type="textarea"
        validate={required(null, i18n)}
        isRequired
        tooltip={i18n._(t`每行输入一个 IRC 频道或用户名。 英镑
        用于频道的符号 (#) 和用于用户的 at (@) 符号不是
        必需的.`)}
      />
      <CheckboxField
        id="grafana-ssl"
        label={i18n._(t`禁用 SSL 验证`)}
        name="notification_configuration.use_ssl"
      />
    </>
  );
}

function MattermostFields({ i18n }) {
  return (
    <>
      <FormField
        id="mattermost-url"
        label={i18n._(t`目标网址`)}
        name="notification_configuration.mattermost_url"
        type="text"
        validate={combine([required(null, i18n), url(i18n)])}
        isRequired
      />
      <FormField
        id="mattermost-username"
        label={i18n._(t`用户名`)}
        name="notification_configuration.mattermost_username"
        type="text"
      />
      <FormField
        id="mattermost-channel"
        label={i18n._(t`向导`)}
        name="notification_configuration.mattermost_channel"
        type="text"
      />
      <FormField
        id="mattermost-icon"
        label={i18n._(t`Icon URL`)}
        name="notification_configuration.mattermost_icon_url"
        type="text"
        validate={url(i18n)}
      />
      <CheckboxField
        id="mattermost-ssl"
        label={i18n._(t`禁用 SSL 验证`)}
        name="notification_configuration.mattermost_no_verify_ssl"
      />
    </>
  );
}

function PagerdutyFields({ i18n }) {
  return (
    <>
      <PasswordField
        id="pagerduty-token"
        label={i18n._(t`API Token`)}
        name="notification_configuration.token"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="pagerduty-subdomain"
        label={i18n._(t`Pagerduty 子域`)}
        name="notification_configuration.subdomain"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="pagerduty-service-key"
        label={i18n._(t`API 服务/集成密钥`)}
        name="notification_configuration.service_key"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="pagerduty-identifier"
        label={i18n._(t`客户身份`)}
        name="notification_configuration.client_name"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
    </>
  );
}

function RocketChatFields({ i18n }) {
  return (
    <>
      <FormField
        id="rocketchat-url"
        label={i18n._(t`目标网址`)}
        name="notification_configuration.rocketchat_url"
        type="text"
        validate={combine([required(null, i18n), url(i18n)])}
        isRequired
      />
      <FormField
        id="rocketchat-username"
        label={i18n._(t`用户名`)}
        name="notification_configuration.rocketchat_username"
        type="text"
      />
      <FormField
        id="rocketchat-icon-url"
        label={i18n._(t`Icon URL`)}
        name="notification_configuration.rocketchat_icon_url"
        type="text"
        validate={url(i18n)}
      />
      <CheckboxField
        id="rocketchat-ssl"
        label={i18n._(t`禁用 SSL 验证`)}
        name="notification_configuration.rocketchat_no_verify_ssl"
      />
    </>
  );
}

function SlackFields({ i18n }) {
  return (
    <>
      <ArrayTextField
        id="slack-channels"
        label={i18n._(t`目的频道`)}
        name="notification_configuration.channels"
        type="textarea"
        validate={required(null, i18n)}
        isRequired
        tooltip={i18n._(t`每行输入一个 Slack 通道。 英镑符号 (#)
        频道需要.`)}
      />
      <PasswordField
        id="slack-token"
        label={i18n._(t`Token`)}
        name="notification_configuration.token"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="slack-color"
        label={i18n._(t`通知颜色`)}
        name="notification_configuration.hex_color"
        type="text"
        tooltip={i18n._(t`指定通知颜色。 可接受的颜色是十六进制
        颜色代码（例如：#3af 或 #789abc）.`)}
      />
    </>
  );
}

function TwilioFields({ i18n }) {
  return (
    <>
      <PasswordField
        id="twilio-token"
        label={i18n._(t`账户令牌`)}
        name="notification_configuration.account_token"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="twilio-from-phone"
        label={i18n._(t`来源电话号码`)}
        name="notification_configuration.from_number"
        type="text"
        validate={required(null, i18n)}
        isRequired
        tooltip={i18n._(t`输入与“Messaging
        服务”在 Twilio 中，格式为 +18005550199。`)}
      />
      <ArrayTextField
        id="twilio-destination-numbers"
        label={i18n._(t`目的地短信号码`)}
        name="notification_configuration.to_numbers"
        type="textarea"
        validate={required(null, i18n)}
        isRequired
        tooltip={i18n._(t`每条线路输入一个电话号码以指定在哪里
        路由短信.`)}
      />
      <FormField
        id="twilio-account-sid"
        label={i18n._(t`帐户 SID`)}
        name="notification_configuration.account_sid"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
    </>
  );
}

function WebhookFields({ i18n }) {
  const [methodField, methodMeta] = useField({
    name: 'notification_configuration.http_method',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  return (
    <>
      <FormField
        id="webhook-username"
        label={i18n._(t`用户名`)}
        name="notification_configuration.username"
        type="text"
      />
      <PasswordField
        id="webhook-password"
        label={i18n._(t`基本认证密码`)}
        name="notification_configuration.password"
      />
      <FormField
        id="webhook-url"
        label={i18n._(t`目标网址`)}
        name="notification_configuration.url"
        type="text"
        validate={combine([required(null, i18n), url(i18n)])}
        isRequired
      />
      <CheckboxField
        id="webhook-ssl"
        label={i18n._(t`禁用 SSL 验证`)}
        name="notification_configuration.disable_ssl_verification"
      />
      <FormFullWidthLayout>
        <CodeMirrorField
          id="webhook-headers"
          name="notification_configuration.headers"
          label={i18n._(t`HTTP 消息头`)}
          mode="javascript"
          tooltip={i18n._(t`以 JSON 格式指定 HTTP 标头`)}
          rows={5}
        />
      </FormFullWidthLayout>
      <FormGroup
        fieldId="webhook-http-method"
        helperTextInvalid={methodMeta.error}
        isRequired
        validated={
          !methodMeta.touched || !methodMeta.error ? 'default' : 'error'
        }
        label={i18n._(t`HTTP 方法`)}
      >
        <AnsibleSelect
          {...methodField}
          id="webhook-http-method"
          data={[
            {
              value: '',
              key: '',
              label: i18n._(t`选择 HTTP 方法`),
              isDisabled: true,
            },
            { value: 'POST', key: 'post', label: i18n._(t`POST`) },
            { value: 'PUT', key: 'put', label: i18n._(t`PUT`) },
          ]}
        />
      </FormGroup>
    </>
  );
}
