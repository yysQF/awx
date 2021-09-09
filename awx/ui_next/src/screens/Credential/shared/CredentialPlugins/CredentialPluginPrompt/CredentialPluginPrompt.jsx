import React, { useCallback } from 'react';
import { func, shape } from 'prop-types';
import { Formik, useField } from 'formik';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Button,
  Tooltip,
  Wizard,
  WizardContextConsumer,
  WizardFooter,
} from '@patternfly/react-core';
import CredentialsStep from './CredentialsStep';
import MetadataStep from './MetadataStep';
import { CredentialsAPI } from '../../../../../api';
import useRequest from '../../../../../util/useRequest';
import { CredentialPluginTestAlert } from '..';

function CredentialPluginWizard({ i18n, handleSubmit, onClose }) {
  const [selectedCredential] = useField('credential');
  const [inputValues] = useField('inputs');

  const {
    result: testPluginSuccess,
    error: testPluginError,
    request: testPluginMetadata,
  } = useRequest(
    useCallback(
      async () =>
        CredentialsAPI.test(selectedCredential.value.id, {
          metadata: inputValues.value,
        }),
      [selectedCredential, inputValues]
    ),
    null
  );

  const steps = [
    {
      id: 1,
      name: i18n._(t`凭证`),
      key: 'credential',
      component: <CredentialsStep />,
      enableNext: !!selectedCredential.value,
    },
    {
      id: 2,
      name: i18n._(t`元数据`),
      key: 'metadata',
      component: <MetadataStep />,
      canJumpTo: !!selectedCredential.value,
    },
  ];

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, onNext, onBack }) => (
          <>
            <Button
              id="credential-plugin-prompt-next"
              variant="primary"
              onClick={onNext}
              isDisabled={!selectedCredential.value}
            >
              {activeStep.key === 'metadata' ? i18n._(t`OK`) : i18n._(t`下一步`)}
            </Button>
            {activeStep && activeStep.key === 'metadata' && (
              <>
                <Tooltip
                  content={i18n._(
                    t`单击此按钮可使用选定的凭据和指定的输入验证与机密管理系统的连接.`
                  )}
                  position="right"
                >
                  <Button
                    id="credential-plugin-prompt-test"
                    variant="secondary"
                    onClick={() => testPluginMetadata()}
                  >
                    {i18n._(t`Test`)}
                  </Button>
                </Tooltip>

                <Button
                  id="credential-plugin-prompt-back"
                  variant="secondary"
                  onClick={onBack}
                >
                  {i18n._(t`返回`)}
                </Button>
              </>
            )}
            <Button
              id="credential-plugin-prompt-cancel"
              variant="link"
              onClick={onClose}
            >
              {i18n._(t`取消`)}
            </Button>
          </>
        )}
      </WizardContextConsumer>
    </WizardFooter>
  );

  return (
    <>
      <Wizard
        isOpen
        onClose={onClose}
        title={i18n._(t`外部保密管理系统`)}
        steps={steps}
        onSave={handleSubmit}
        footer={CustomFooter}
      />
      {selectedCredential.value && (
        <CredentialPluginTestAlert
          credentialName={selectedCredential.value.name}
          successResponse={testPluginSuccess}
          errorResponse={testPluginError}
        />
      )}
    </>
  );
}

function CredentialPluginPrompt({ i18n, onClose, onSubmit, initialValues }) {
  return (
    <Formik
      initialValues={{
        credential: initialValues?.credential || null,
        inputs: initialValues?.inputs || {},
      }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <CredentialPluginWizard
          handleSubmit={handleSubmit}
          i18n={i18n}
          onClose={onClose}
        />
      )}
    </Formik>
  );
}

CredentialPluginPrompt.propTypes = {
  onClose: func.isRequired,
  onSubmit: func.isRequired,
  initialValues: shape({}),
};

CredentialPluginPrompt.defaultProps = {
  initialValues: {},
};

export default withI18n()(CredentialPluginPrompt);
