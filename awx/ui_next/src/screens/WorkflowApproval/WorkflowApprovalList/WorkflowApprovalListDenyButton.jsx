import React, { useContext } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import PropTypes from 'prop-types';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import { KebabifiedContext } from '../../../contexts/Kebabified';
import { WorkflowApproval } from '../../../types';

function cannotDeny(item) {
  return !item.can_approve_or_deny;
}

function WorkflowApprovalListDenyButton({ onDeny, selectedItems, i18n }) {
  const { isKebabified } = useContext(KebabifiedContext);

  const renderTooltip = () => {
    if (selectedItems.length === 0) {
      return i18n._(t` 选择拒绝`);
    }

    const itemsUnableToDeny = selectedItems
      .filter(cannotDeny)
      .map(item => item.name)
      .join(', ');

    if (selectedItems.some(cannotDeny)) {
      return i18n._(
       t` 您无法对以下工作流程批准采取行动： ${itemsUnableToDeny}`
      );
    }

    return i18n._(t`否定`);
  };

  const isDisabled =
    selectedItems.length === 0 || selectedItems.some(cannotDeny);

  return (
    <>
      {isKebabified ? (
        <DropdownItem
          key="deny"
          isDisabled={isDisabled}
          component="button"
          onClick={onDeny}
        >
          {i18n._(t`否定`)}
        </DropdownItem>
      ) : (
        <Tooltip content={renderTooltip()} position="top">
          <div>
            <Button
              isDisabled={isDisabled}
              aria-label={i18n._(t`否定`)}
              variant="danger"
              onClick={onDeny}
            >
              {i18n._(t`否定`)}
            </Button>
          </div>
        </Tooltip>
      )}
    </>
  );
}

WorkflowApprovalListDenyButton.propTypes = {
  onDeny: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(WorkflowApproval),
};

WorkflowApprovalListDenyButton.defaultProps = {
  selectedItems: [],
};

export default withI18n()(WorkflowApprovalListDenyButton);
