import React, { Fragment } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';

import ScreenHeader from '../../components/ScreenHeader';

function ManagementJobs({ i18n }) {
  return (
    <Fragment>
      <ScreenHeader
        streamType="none"
        breadcrumbConfig={{ '/management_jobs': i18n._(t`管理作业`) }}
      />
    </Fragment>
  );
}

export default withI18n()(ManagementJobs);
