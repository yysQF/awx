/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import { Form, FormGroup, Switch, Checkbox } from '@patternfly/react-core';
import styled from 'styled-components';

import { BrandName } from '../../variables';
import AnsibleSelect from '../AnsibleSelect';
import FormField from '../FormField';
import { VariablesField } from '../CodeMirrorInput';
import {
  FormColumnLayout,
  FormFullWidthLayout,
  FormCheckboxLayout,
} from '../FormLayout';
import Popover from '../Popover';
import { required } from '../../util/validators';

const TooltipWrapper = styled.div`
  text-align: left;
`;

// Setting BrandName to a variable here is necessary to get the jest tests
// passing.  Attempting to use BrandName in the template literal results
// in failing tests.
const brandName = BrandName;

function AdHocDetailsStep({ i18n, verbosityOptions, moduleOptions }) {
  const [moduleNameField, moduleNameMeta, moduleNameHelpers] = useField({
    name: 'module_name',
    validate: required(null, i18n),
  });

  const [variablesField] = useField('extra_vars');
  const [diffModeField, , diffModeHelpers] = useField('diff_mode');
  const [becomeEnabledField, , becomeEnabledHelpers] = useField(
    'become_enabled'
  );
  const [verbosityField, verbosityMeta, verbosityHelpers] = useField({
    name: 'verbosity',
    validate: required(null, i18n),
  });

  const argumentsRequired =
    moduleNameField.value === 'command' || moduleNameField.value === 'shell';
  const [, argumentsMeta, argumentsHelpers] = useField({
    name: 'module_args',
    validate: argumentsRequired && required(null, i18n),
  });

  const isValid = !argumentsMeta.error || !argumentsMeta.touched;

  return (
    <Form>
      <FormColumnLayout>
        <FormFullWidthLayout>
          <FormGroup
            fieldId="module_name"
            aria-label={i18n._(t`选择模块`)}
            label={i18n._(t`模块`)}
            isRequired
            helperTextInvalid={moduleNameMeta.error}
            validated={
              !moduleNameMeta.touched || !moduleNameMeta.error
                ? 'default'
                : 'error'
            }
            labelIcon={
              <Popover
                content={i18n._(
                  t`这些是 ${brandName} 支持运行命令的模块.`
                )}
              />
            }
          >
            <AnsibleSelect
              {...moduleNameField}
              placeHolder={i18n._(t`选择模块`)}
              isValid={!moduleNameMeta.touched || !moduleNameMeta.error}
              id="module_name"
              data={[
                {
                  value: '',
                  key: '',
                  label: i18n._(t`选择模块`),
                  isDisabled: true,
                },
                ...moduleOptions.map(value => ({
                  value: value[0],
                  label: value[0],
                  key: value[0],
                })),
              ]}
              onChange={(event, value) => {
                if (value !== 'command' && value !== 'shell') {
                  argumentsHelpers.setTouched(false);
                }
                moduleNameHelpers.setValue(value);
              }}
            />
          </FormGroup>
          <FormField
            id="module_args"
            name="module_args"
            aria-label={i18n._(t`参数`)}
            type="text"
            label={i18n._(t`参数`)}
            validated={isValid ? 'default' : 'error'}
            onBlur={() => argumentsHelpers.setTouched(true)}
            isRequired={
              moduleNameField.value === 'command' ||
              moduleNameField.value === 'shell'
            }
            tooltip={
              moduleNameField.value ? (
                <>
                  {i18n._(
                    t`这些参数与指定的模块一起使用。点击你可以找到有关 ${moduleNameField.value}的信息 `
                  )}
                  <a
                    href={`https://docs.ansible.com/ansible/latest/modules/${moduleNameField.value}_module.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {' '}
                    {i18n._(t`here.`)}
                  </a>
                </>
              ) : (
                i18n._(t`这些参数与指定的模块一起使用.`)
              )
            }
          />
          <FormGroup
            fieldId="verbosity"
            aria-label={i18n._(t`选择详细程度`)}
            label={i18n._(t`详细程度`)}
            isRequired
            validated={
              !verbosityMeta.touched || !verbosityMeta.error
                ? 'default'
                : 'error'
            }
            helperTextInvalid={verbosityMeta.error}
            labelIcon={
              <Popover
                content={i18n._(
                  t`这些是支持的标准命令运行的详细级别.`
                )}
              />
            }
          >
            <AnsibleSelect
              {...verbosityField}
              isValid={!verbosityMeta.touched || !verbosityMeta.error}
              id="verbosity"
              data={verbosityOptions || []}
              onChange={(event, value) => {
                verbosityHelpers.setValue(parseInt(value, 10));
              }}
            />
          </FormGroup>
          <FormField
            id="limit"
            name="limit"
            type="text"
            label={i18n._(t`范围`)}
            aria-label={i18n._(t`范围`)}
            tooltip={
              <span>
                {i18n._(
                  t`用于在清单中定位主机的模式。 将该字段留空，所有和 * 都将针对清单中的所有主机，您可以找到有关 Ansible 主机模式的更多信息`
                )}{' '}
                <a
                  href="https://docs.ansible.com/ansible/latest/user_guide/intro_patterns.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n._(t`here`)}
                </a>
              </span>
            }
          />
          <FormField
            id="template-forks"
            name="forks"
            type="number"
            min="0"
            label={i18n._(t`并发数`)}
            aria-label={i18n._(t`并发数`)}
            tooltip={
              <span>
                {i18n._(
                  t`执行剧本时要使用的并行或同时进程的数量，不输入任何值将使用 ansible 配置文件中的默认值，您可以找到更多信息`
                )}{' '}
                <a
                  href="https://docs.ansible.com/ansible/latest/installation_guide/intro_configuration.html#the-ansible-configuration-file"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n._(t`here.`)}
                </a>
              </span>
            }
          />
          <FormColumnLayout>
            <FormGroup
              label={i18n._(t`显示更改`)}
              aria-label={i18n._(t`显示更改`)}
              labelIcon={
                <Popover
                  content={i18n._(
                    t`如果启用，显示 Ansible 任务所做的更改（如果支持），这相当于 Ansible 的 --diff 模式.`
                  )}
                />
              }
            >
              <Switch
                css="display: inline-flex;"
                id="diff_mode"
                label={i18n._(t`On`)}
                labelOff={i18n._(t`Off`)}
                isChecked={diffModeField.value}
                onChange={() => {
                  diffModeHelpers.setValue(!diffModeField.value);
                }}
                aria-label={i18n._(t`切换更改`)}
              />
            </FormGroup>
            <FormGroup name="become_enabled" fieldId="become_enabled">
              <FormCheckboxLayout>
                <Checkbox
                  aria-label={i18n._(t`启用权限提升`)}
                  label={
                    <span>
                      {i18n._(t`启用权限提升`)}
                      &nbsp;
                      <Popover
                        content={
                          <p>
                            {i18n._(t`启用配置的创建
                               回调网址。 使用主机可以联系 ${brandName} 的 URL
                               并使用此作业请求配置更新
                               模板`)}
                            &nbsp;
                            <code>--become </code>
                            {i18n._(t`选项`)} &nbsp;
                            <code>ansible </code>
                            {i18n._(t`命令行`)}
                          </p>
                        }
                      />
                    </span>
                  }
                  id="become_enabled"
                  isChecked={becomeEnabledField.value}
                  onChange={checked => {
                    becomeEnabledHelpers.setValue(checked);
                  }}
                />
              </FormCheckboxLayout>
            </FormGroup>
          </FormColumnLayout>

          <VariablesField
            css="margin: 20px 0"
            id="extra_vars"
            name="extra_vars"
            value={JSON.stringify(variablesField.value)}
            rows={4}
            labelIcon
            tooltip={
              <TooltipWrapper>
                <p>
                  {i18n._(
                    t`传递额外的命令行更改，有两个ansible命令行参数： `
                  )}
                  <br />
                  <code>-e</code>, <code>--extra-vars </code>
                  <br />
                  {i18n._(t`使用任一方法提供键/值对
                   YAML 或 JSON.`)}
                </p>
                JSON:
                <br />
                <code>
                  <pre>
                    {'{'}
                    {'\n  '}"somevar": "somevalue",
                    {'\n  '}"password": "magic"
                    {'\n'}
                    {'}'}
                  </pre>
                </code>
                YAML:
                <br />
                <code>
                  <pre>
                    ---
                    {'\n'}somevar: somevalue
                    {'\n'}password: magic
                  </pre>
                </code>
              </TooltipWrapper>
            }
            label={i18n._(t`额外变量`)}
            aria-label={i18n._(t`额外变量`)}
          />
        </FormFullWidthLayout>
      </FormColumnLayout>
    </Form>
  );
}

AdHocDetailsStep.propTypes = {
  moduleOptions: PropTypes.arrayOf(PropTypes.array).isRequired,
  verbosityOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withI18n()(AdHocDetailsStep);
