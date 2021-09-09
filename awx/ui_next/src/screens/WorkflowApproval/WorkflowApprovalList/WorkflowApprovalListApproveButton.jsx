import React, { useContext } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import PropTypes from 'prop-types';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import { KebabifiedContext } from '../../../contexts/Kebabified';
import { WorkflowApproval } from '../../../types';

function cannotApprove(item) {
  return !item.can_approve_or_deny;
}

function WorkflowApprovalListApproveButton({ onApprove, selectedItems, i18n }) {
  const { isKebabified } = useContext(KebabifiedContext);

  const renderTooltip = () => {
    if (selectedItems.length === 0) {
      return i18n._(t` 选择批准`);
    }

    const itemsUnableToApprove = selectedItems
      .filter(cannotApprove)
      .map(item => item.name)
      .join(', ');

    if (selectedItems.some(cannotApprove)) {
      return i18n._(
       t` 您无法对以下工作流程批准采取行动： ${itemsUnableToApprove}`
      );
    }

    return i18n._(t`批准`);
  };

  const isDisabled =
    selectedItems.length === 0 || selectedItems.some(cannotApprove);

  return (
    <>
      {isKebabified ? (
        <DropdownItem
          key="approve"
          isDisabled={isDisabled}
          component="button"
          onClick={onApprove}
        >
          {i18n._(t`批准`)}
        </DropdownItem>
      ) : (
        <Tooltip content={renderTooltip()} position="top">
          <div>
            <Button
              isDisabled={isDisabled}
              aria-label={i18n._(t`批准`)}
              variant="primary"
              onClick={onApprove}
            >
              {i18n._(t`批准`)}
            </Button>
          </div>
        </Tooltip>
      )}
    </>
  );
}

WorkflowApprovalListApproveButton.propTypes = {
  onApprove: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(WorkflowApproval),
};

WorkflowApprovalListApproveButton.defaultProps = {
  selectedItems: [],
};

export default withI18n()(WorkflowApprovalListApproveButton);
