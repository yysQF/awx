import React from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import { CardBody, CardActionsRow } from '../../../../components/Card';

function JobsEdit({ i18n }) {
  return (
    <CardBody>
      {i18n._(t`编辑表单即将推出：)`)}
      <CardActionsRow>
        <Button
          aria-label={i18n._(t`取消`)}
          component={Link}
          to="/settings/jobs/details"
        >
          {i18n._(t`取消`)}
        </Button>
      </CardActionsRow>
    </CardBody>
  );
}

export default withI18n()(JobsEdit);
