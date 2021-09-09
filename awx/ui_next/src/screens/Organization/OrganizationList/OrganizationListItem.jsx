import React from 'react';
import { string, bool, func } from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import { Tr, Td } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { PencilAltIcon } from '@patternfly/react-icons';
import { ActionsTd, ActionItem } from '../../../components/PaginatedTable';

import { Organization } from '../../../types';

function OrganizationListItem({
  organization,
  isSelected,
  onSelect,
  rowIndex,
  detailUrl,
  i18n,
}) {
  const labelId = `check-action-${organization.id}`;
  return (
    <Tr id={`org-row-${organization.id}`}>
      <Td
        select={{
          rowIndex,
          isSelected,
          onSelect,
          disable: false,
        }}
        dataLabel={i18n._(t`已选择`)}
      />
      <Td id={labelId} dataLabel={i18n._(t`名称`)}>
        <Link to={`${detailUrl}`}>
          <b>{organization.name}</b>
        </Link>
      </Td>
      <Td dataLabel={i18n._(t`成员`)}>
        {organization.summary_fields.related_field_counts.users}
      </Td>
      <Td dataLabel={i18n._(t`团队`)}>
        {organization.summary_fields.related_field_counts.teams}
      </Td>
      <ActionsTd dataLabel={i18n._(t`操作`)}>
        <ActionItem
          visible={organization.summary_fields.user_capabilities.edit}
          tooltip={i18n._(t`编辑组织`)}
        >
          <Button
            aria-label={i18n._(t`编辑组织`)}
            variant="plain"
            component={Link}
            to={`/organizations/${organization.id}/edit`}
          >
            <PencilAltIcon />
          </Button>
        </ActionItem>
      </ActionsTd>
    </Tr>
  );
}

OrganizationListItem.propTypes = {
  organization: Organization.isRequired,
  detailUrl: string.isRequired,
  isSelected: bool.isRequired,
  onSelect: func.isRequired,
};

export default withI18n()(OrganizationListItem);
