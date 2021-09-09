import React, { useState } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import AlertModal from '../AlertModal';

function DeleteButton({
  onConfirm,
  modalTitle,
  name,
  i18n,
  variant,
  children,
  isDisabled,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant || 'secondary'}
        aria-label={i18n._(t`删除`)}
        isDisabled={isDisabled}
        onClick={() => setIsOpen(true)}
      >
        {children || i18n._(t`删除`)}
      </Button>
      <AlertModal
        isOpen={isOpen}
        title={modalTitle}
        variant="danger"
        onClose={() => setIsOpen(false)}
        actions={[
          <Button
            key="delete"
            variant="danger"
            aria-label={i18n._(t`删除`)}
            isDisabled={isDisabled}
            onClick={onConfirm}
          >
            {i18n._(t`删除`)}
          </Button>,
          <Button
            key="cancel"
            variant="secondary"
            aria-label={i18n._(t`取消`)}
            onClick={() => setIsOpen(false)}
          >
            {i18n._(t`取消`)}
          </Button>,
        ]}
      >
        {i18n._(t`确认删除`)}
        <br />
        <strong>{name}</strong>
      </AlertModal>
    </>
  );
}

export default withI18n()(DeleteButton);
