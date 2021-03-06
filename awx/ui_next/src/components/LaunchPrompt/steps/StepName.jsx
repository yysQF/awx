import React from 'react';
import styled from 'styled-components';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon as PFExclamationCircleIcon } from '@patternfly/react-icons';

const AlertText = styled.div`
  color: var(--pf-global--danger-color--200);
  font-weight: var(--pf-global--FontWeight--bold);
`;

const ExclamationCircleIcon = styled(PFExclamationCircleIcon)`
  margin-left: 10px;
`;

function StepName({ hasErrors, children, i18n, id }) {
  if (!hasErrors) {
    return <div id={id}>{children}</div>;
  }
  return (
    <>
      <AlertText id={id}>
        {children}
        <Tooltip
          position="right"
          content={i18n._(t`此步骤包含错误`)}
          trigger="click mouseenter focus"
        >
          <ExclamationCircleIcon css="color: var(--pf-global--danger-color--100)" />
        </Tooltip>
      </AlertText>
    </>
  );
}

export default withI18n()(StepName);
