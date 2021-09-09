import React from 'react';
import { func } from 'prop-types';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { useKebabifiedMenu } from '../../../contexts/Kebabified';

function SmartInventoryButton({ onClick, i18n, isDisabled }) {
  const { isKebabified } = useKebabifiedMenu();

  if (isKebabified) {
    return (
      <DropdownItem
        key="add"
        isDisabled={isDisabled}
        component="button"
        onClick={onClick}
      >
        {i18n._(t`智能清单`)}
      </DropdownItem>
    );
  }

  return (
    <Tooltip
      key="smartInventory"
      content={
        !isDisabled
          ? i18n._(t`使用应用的过滤器创建新的智能清单`)
          : i18n._(
              t`输入至少一个搜索过滤器以创建新的智能库存`
            )
      }
      position="top"
    >
      <div>
        <Button
          onClick={onClick}
          aria-label={i18n._(t`智能清单`)}
          variant="secondary"
          isDisabled={isDisabled}
        >
          {i18n._(t`智能清单`)}
        </Button>
      </div>
    </Tooltip>
  );
}
SmartInventoryButton.propTypes = {
  onClick: func.isRequired,
};

export default withI18n()(SmartInventoryButton);
