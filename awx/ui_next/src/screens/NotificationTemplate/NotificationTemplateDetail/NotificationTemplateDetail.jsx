import React, { useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { Button } from '@patternfly/react-core';
import { t } from '@lingui/macro';
import AlertModal from '../../../components/AlertModal';
import { CardBody, CardActionsRow } from '../../../components/Card';
import {
  Detail,
  ArrayDetail,
  DetailList,
  DeletedDetail,
  UserDateDetail,
} from '../../../components/DetailList';
import CodeDetail from '../../../components/DetailList/CodeDetail';
import DeleteButton from '../../../components/DeleteButton';
import ErrorDetail from '../../../components/ErrorDetail';
import { NotificationTemplatesAPI } from '../../../api';
import useRequest, { useDismissableError } from '../../../util/useRequest';
import hasCustomMessages from '../shared/hasCustomMessages';
import { NOTIFICATION_TYPES } from '../constants';

function NotificationTemplateDetail({ i18n, template, defaultMessages }) {
  const history = useHistory();

  const {
    created,
    modified,
    notification_configuration: configuration,
    summary_fields,
    messages,
  } = template;

  const { request: deleteTemplate, isLoading, error: deleteError } = useRequest(
    useCallback(async () => {
      await NotificationTemplatesAPI.destroy(template.id);
      history.push(`/notification_templates`);
    }, [template.id, history])
  );

  const { error, dismissError } = useDismissableError(deleteError);
  const typeMessageDefaults = defaultMessages[template.notification_type];

  return (
    <CardBody>
      <DetailList gutter="sm">
        <Detail
          label={i18n._(t`名称`)}
          value={template.name}
          dataCy="nt-detail-name"
        />
        <Detail
          label={i18n._(t`描述`)}
          value={template.description}
          dataCy="nt-detail-description"
        />
        {summary_fields.organization ? (
          <Detail
            label={i18n._(t`组织`)}
            value={
              <Link
                to={`/organizations/${summary_fields.organization.id}/details`}
              >
                {summary_fields.organization.name}
              </Link>
            }
          />
        ) : (
          <DeletedDetail label={i18n._(t`组织`)} />
        )}
        <Detail
          label={i18n._(t`Notification Type`)}
          value={
            NOTIFICATION_TYPES[template.notification_type] ||
            template.notification_type
          }
          dataCy="nt-detail-type"
        />
        {template.notification_type === 'email' && (
          <>
            <Detail
              label={i18n._(t`用户名`)}
              value={configuration.username}
              dataCy="nt-detail-username"
            />
            <Detail
              label={i18n._(t`主机`)}
              value={configuration.host}
              dataCy="nt-detail-host"
            />
            <ArrayDetail
              label={i18n._(t`收件人列表`)}
              value={configuration.recipients}
              dataCy="nt-detail-recipients"
            />
            <Detail
              label={i18n._(t`发送邮件`)}
              value={configuration.sender}
              dataCy="nt-detail-sender"
            />
            <Detail
              label={i18n._(t`端口`)}
              value={configuration.port}
              dataCy="nt-detail-port"
            />
            <Detail
              label={i18n._(t`超时`)}
              value={configuration.timeout}
              dataCy="nt-detail-timeout"
            />
            <Detail
              label={i18n._(t`邮箱选项`)}
              value={
                configuration.use_ssl ? i18n._(t`Use SSL`) : i18n._(t`Use TLS`)
              }
              dataCy="nt-detail-email-options"
            />
          </>
        )}
        {template.notification_type === 'grafana' && (
          <>
            <Detail
              label={i18n._(t`Grafana URL`)}
              value={configuration.grafana_url}
              dataCy="nt-detail-grafana-url"
            />
            <Detail
              label={i18n._(t`仪表盘标识`)}
              value={configuration.dashboardId}
              dataCy="nt-detail-dashboard-id"
            />
            <Detail
              label={i18n._(t`面板标识`)}
              value={configuration.panelId}
              dataCy="nt-detail-panel-id"
            />
            <ArrayDetail
              label={i18n._(t`注释的标签`)}
              value={configuration.annotation_tags}
              dataCy="nt-detail-"
            />
            <Detail
              label={i18n._(t`禁用 SSL 验证`)}
              value={
                configuration.grafana_no_verify_ssl
                  ? i18n._(t`True`)
                  : i18n._(t`False`)
              }
              dataCy="nt-detail-disable-ssl"
            />
          </>
        )}
        {template.notification_type === 'irc' && (
          <>
            <Detail
              label={i18n._(t`IRC 服务器端口`)}
              value={configuration.port}
              dataCy="nt-detail-irc-port"
            />
            <Detail
              label={i18n._(t`IRC 服务器地址`)}
              value={configuration.server}
              dataCy="nt-detail-irc-server"
            />
            <Detail
              label={i18n._(t`IRC Nick`)}
              value={configuration.nickname}
              dataCy="nt-detail-irc-nickname"
            />
            <ArrayDetail
              label={i18n._(t`目标频道或用户`)}
              value={configuration.targets}
              dataCy="nt-detail-channels"
            />
            <Detail
              label={i18n._(t`SSL 连接`)}
              value={configuration.use_ssl ? i18n._(t`True`) : i18n._(t`False`)}
              dataCy="nt-detail-irc-ssl"
            />
          </>
        )}
        {template.notification_type === 'mattermost' && (
          <>
            <Detail
              label={i18n._(t`目标 URL`)}
              value={configuration.mattermost_url}
              dataCy="nt-detail-mattermost-url"
            />
            <Detail
              label={i18n._(t`用户名`)}
              value={configuration.mattermost_username}
              dataCy="nt-detail-mattermost-username"
            />
            <Detail
              label={i18n._(t`取消`)}
              value={configuration.mattermost_channel}
              dataCy="nt-detail-mattermost_channel"
            />
            <Detail
              label={i18n._(t`图标 URL`)}
              value={configuration.mattermost_icon_url}
              dataCy="nt-detail-mattermost-icon-url"
            />
            <Detail
              label={i18n._(t`禁用 SSL 验证`)}
              value={
                configuration.mattermost_no_verify_ssl
                  ? i18n._(t`True`)
                  : i18n._(t`False`)
              }
              dataCy="nt-detail-disable-ssl"
            />
          </>
        )}
        {template.notification_type === 'pagerduty' && (
          <>
            <Detail
              label={i18n._(t`Pagerduty 子域`)}
              value={configuration.subdomain}
              dataCy="nt-detail-pagerduty-subdomain"
            />
            <Detail
              label={i18n._(t`API 服务/集成密钥`)}
              value={configuration.service_key}
              dataCy="nt-detail-pagerduty-service-key"
            />
            <Detail
              label={i18n._(t`客户识别`)}
              value={configuration.client_name}
              dataCy="nt-detail-pagerduty-client-name"
            />
          </>
        )}
        {template.notification_type === 'rocketchat' && (
          <>
            <Detail
              label={i18n._(t`目标 URL`)}
              value={configuration.rocketchat_url}
              dataCy="nt-detail-rocketchat-url"
            />
            <Detail
              label={i18n._(t`用户名`)}
              value={configuration.rocketchat_username}
              dataCy="nt-detail-rocketchat-username"
            />
            <Detail
              label={i18n._(t`Icon URL`)}
              value={configuration.rocketchat_icon_url}
              dataCy="nt-detail-rocketchat-icon-url"
            />
            <Detail
              label={i18n._(t`禁用 SSL 验证`)}
              value={
                configuration.rocketchat_no_verify_ssl
                  ? i18n._(t`True`)
                  : i18n._(t`False`)
              }
              dataCy="nt-detail-disable-ssl"
            />
          </>
        )}
        {template.notification_type === 'slack' && (
          <>
            <ArrayDetail
              label={i18n._(t`目标频道`)}
              value={configuration.channels}
              dataCy="nt-detail-slack-channels"
            />
            <Detail
              label={i18n._(t`通知颜色`)}
              value={configuration.hex_color}
              dataCy="nt-detail-slack-color"
            />
          </>
        )}
        {template.notification_type === 'twilio' && (
          <>
            <Detail
              label={i18n._(t`来源电话号码`)}
              value={configuration.from_number}
              dataCy="nt-detail-twilio-source-phone"
            />
            <ArrayDetail
              label={i18n._(t`目的地短信号码`)}
              value={configuration.to_numbers}
              dataCy="nt-detail-twilio-destination-numbers"
            />
            <Detail
              label={i18n._(t`帐户 SID`)}
              value={configuration.account_sid}
              dataCy="nt-detail-twilio-account-sid"
            />
          </>
        )}
        {template.notification_type === 'webhook' && (
          <>
            <Detail
              label={i18n._(t`用户名`)}
              value={configuration.username}
              dataCy="nt-detail-webhook-password"
            />
            <Detail
              label={i18n._(t`目标 URL`)}
              value={configuration.url}
              dataCy="nt-detail-webhook-url"
            />
            <Detail
              label={i18n._(t`禁用SSL验证`)}
              value={
                configuration.disable_ssl_verification
                  ? i18n._(t`True`)
                  : i18n._(t`False`)
              }
              dataCy="nt-detail-disable-ssl"
            />
            <Detail
              label={i18n._(t`HTTP 方法`)}
              value={configuration.http_method}
              dataCy="nt-detail-webhook-http-method"
            />
            <CodeDetail
              label={i18n._(t`HTTP 头`)}
              value={JSON.stringify(configuration.headers)}
              mode="json"
              rows="6"
              dataCy="nt-detail-webhook-headers"
            />
          </>
        )}
        <UserDateDetail
          label={i18n._(t`已创建`)}
          date={created}
          user={summary_fields?.created_by}
        />
        <UserDateDetail
          label={i18n._(t`上次修改时间`)}
          date={modified}
          user={summary_fields?.modified_by}
        />
        {hasCustomMessages(messages, typeMessageDefaults) && (
          <CustomMessageDetails
            messages={messages}
            defaults={typeMessageDefaults}
            type={template.notification_type}
            i18n={i18n}
          />
        )}
      </DetailList>
      <CardActionsRow>
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.edit && (
            <Button
              component={Link}
              to={`/notification_templates/${template.id}/edit`}
              aria-label={i18n._(t`编辑`)}
            >
              {i18n._(t`编辑`)}
            </Button>
          )}
        {summary_fields.user_capabilities &&
          summary_fields.user_capabilities.delete && (
            <DeleteButton
              name={template.name}
              modalTitle={i18n._(t`删除通知`)}
              onConfirm={deleteTemplate}
              isDisabled={isLoading}
            >
              {i18n._(t`删除`)}
            </DeleteButton>
          )}
      </CardActionsRow>
      {error && (
        <AlertModal
          isOpen={error}
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={dismissError}
        >
          {i18n._(t`未能删除通知`)}
          <ErrorDetail error={error} />
        </AlertModal>
      )}
    </CardBody>
  );
}

function CustomMessageDetails({ messages, defaults, type, i18n }) {
  const showMessages = type !== 'webhook';
  const showBodies = ['email', 'pagerduty', 'webhook'].includes(type);

  return (
    <>
      {showMessages && (
        <CodeDetail
          label={i18n._(t`开始信息`)}
          value={messages.started.message || defaults.started.message}
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`开始消息正文`)}
          value={messages.started.body || defaults.started.body}
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`成功信息`)}
          value={messages.success.message || defaults.success.message}
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`成功消息正文`)}
          value={messages.success.body || defaults.success.body}
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`错误信息`)}
          value={messages.error.message || defaults.error.message}
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`错误消息正文`)}
          value={messages.error.body || defaults.error.body}
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`工作流程批准信息`)}
          value={
            messages.workflow_approval?.approved?.message ||
            defaults.workflow_approval.approved.message
          }
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`工作流批准的消息正文`)}
          value={
            messages.workflow_approval?.approved?.body ||
            defaults.workflow_approval.approved.body
          }
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`工作流程拒绝信息`)}
          value={
            messages.workflow_approval?.denied?.message ||
            defaults.workflow_approval.denied.message
          }
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`工作流拒绝消息正文`)}
          value={
            messages.workflow_approval?.denied?.body ||
            defaults.workflow_approval.denied.body
          }
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`工作流待处理信息`)}
          value={
            messages.workflow_approval?.running?.message ||
            defaults.workflow_approval.running.message
          }
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`工作流待处理消息正文`)}
          value={
            messages.workflow_approval?.running?.body ||
            defaults.workflow_approval.running.body
          }
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
      {showMessages && (
        <CodeDetail
          label={i18n._(t`工作流超时信息`)}
          value={
            messages.workflow_approval?.timed_out?.message ||
            defaults.workflow_approval.timed_out.message
          }
          mode="jinja2"
          rows="2"
          fullWidth
        />
      )}
      {showBodies && (
        <CodeDetail
          label={i18n._(t`工作流超时消息正文`)}
          value={
            messages.workflow_approval?.timed_out?.body ||
            defaults.workflow_approval.timed_out.body
          }
          mode="jinja2"
          rows="6"
          fullWidth
        />
      )}
    </>
  );
}

export default withI18n()(NotificationTemplateDetail);
