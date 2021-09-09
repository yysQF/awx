import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { ActionGroup, Button } from '@patternfly/react-core';
import { FormFullWidthLayout } from '../FormLayout';

const FormActionGroup = ({ onCancel, onSubmit, submitDisabled, i18n }) => {
  return (
    <FormFullWidthLayout>
      <ActionGroup>
        <Button
          aria-label={i18n._(t`保存`)}
          variant="primary"
          type="button"
          onClick={onSubmit}
          isDisabled={submitDisabled}
        >
          {i18n._(t`保存`)}
        </Button>
        <Button
          aria-label={i18n._(t`取消`)}
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          {i18n._(t`取消`)}
        </Button>
      </ActionGroup>
    </FormFullWidthLayout>
  );
};

FormActionGroup.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitDisabled: PropTypes.bool,
};

FormActionGroup.defaultProps = {
  submitDisabled: false,
};

export default withI18n()(FormActionGroup);
