import React from 'react';
import { Link } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Host } from '../../../types';
import { CardBody } from '../../../components/Card';
import {
  Detail,
  DetailList,
  UserDateDetail,
} from '../../../components/DetailList';
import Sparkline from '../../../components/Sparkline';
import { VariablesDetail } from '../../../components/CodeMirrorInput';

function SmartInventoryHostDetail({ host, i18n }) {
  const {
    created,
    description,
    enabled,
    modified,
    name,
    variables,
    summary_fields: { inventory, recent_jobs, created_by, modified_by },
  } = host;

  const recentPlaybookJobs = recent_jobs?.map(job => ({ ...job, type: 'job' }));

  return (
    <CardBody>
      <DetailList gutter="sm">
        <Detail label={i18n._(t`名称`)} value={name} />
        {recentPlaybookJobs?.length > 0 && (
          <Detail
            label={i18n._(t`活动`)}
            value={<Sparkline jobs={recentPlaybookJobs} />}
          />
        )}
        <Detail label={i18n._(t`描述`)} value={description} />
        <Detail
          label={i18n._(t`清单`)}
          value={
            <Link to={`/inventories/inventory/${inventory?.id}/details`}>
              {inventory?.name}
            </Link>
          }
        />
        <Detail
          label={i18n._(t`Enabled`)}
          value={enabled ? i18n._(t`On`) : i18n._(t`Off`)}
        />
        <UserDateDetail
          date={created}
          label={i18n._(t`已创建`)}
          user={created_by}
        />
        <UserDateDetail
          date={modified}
          label={i18n._(t`Last modified`)}
          user={modified_by}
        />
        <VariablesDetail
          label={i18n._(t`变量`)}
          rows={4}
          value={variables}
        />
      </DetailList>
    </CardBody>
  );
}

SmartInventoryHostDetail.propTypes = {
  host: Host.isRequired,
};

export default withI18n()(SmartInventoryHostDetail);
