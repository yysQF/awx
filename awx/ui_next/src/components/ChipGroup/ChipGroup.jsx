import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { ChipGroup as PFChipGroup } from '@patternfly/react-core';
import { number, shape } from 'prop-types';

function ChipGroup({ i18n, numChips, totalChips, i18nHash, ...props }) {
  return (
    <PFChipGroup
      {...props}
      numChips={numChips}
      expandedText={i18n._(t`显示较少`)}
      collapsedText={i18n._(t`${totalChips - numChips} 更多`)}
    />
  );
}

ChipGroup.propTypes = {
  numChips: number.isRequired,
  totalChips: number.isRequired,
  i18n: shape({}).isRequired,
};

export default withI18n()(ChipGroup);
