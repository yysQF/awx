import 'styled-components/macro';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import { Host } from '../../../types';
import { CardBody, CardActionsRow } from '../../../components/Card';
import AlertModal from '../../../components/AlertModal';
import ErrorDetail from '../../../components/ErrorDetail';
import {
  DetailList,
  Detail,
  UserDateDetail,
} from '../../../components/DetailList';
import { VariablesDetail } from '../../../components/CodeMirrorInput';
import Sparkline from '../../../components/Sparkline';
import DeleteButton from '../../../components/DeleteButton';
import { HostsAPI } from '../../../api';
import HostToggle from '../../../components/HostToggle';

function HostDetail({ i18n, host }) {
  const {
    created,
    description,
    id,
    modified,
    name,
    variables,
    summary_fields: {
      inventory,
      recent_jobs,
      created_by,
      modified_by,
      user_capabilities,
    },
  } = host;

  const [isLoading, setIsloading] = useState(false);
  const [deletionError, setDeletionError] = useState(false);
  const history = useHistory();

  const handleHostDelete = async () => {
    setIsloading(true);
    try {
      await HostsAPI.destroy(id);
      history.push('/hosts');
    } catch (err) {
      setDeletionError(err);
    } finally {
      setIsloading(false);
    }
  };

  if (!isLoading && deletionError) {
    return (
      <AlertModal
        isOpen={deletionError}
        variant="error"
        title={i18n._(t`Error!`)}
        onClose={() => setDeletionError(false)}
      >
        {i18n._(t`Failed to delete ${name}.`)}
        <ErrorDetail error={deletionError} />
      </AlertModal>
    );
  }

  const recentPlaybookJobs = recent_jobs.map(job => ({ ...job, type: 'job' }));
  return (
    <CardBody>
      <HostToggle host={host} css="padding-bottom: 40px" />
      <DetailList gutter="sm">
        <Detail label={i18n._(t`名称`)} value={name} dataCy="host-name" />
        {recentPlaybookJobs?.length > 0 && (
          <Detail
            label={i18n._(t`活动`)}
            value={<Sparkline jobs={recentPlaybookJobs} />}
          />
        )}
        <Detail label={i18n._(t`描述`)} value={description} />
        <Detail
          label={i18n._(t`清单`)}
          dataCy="host-inventory"
          value={
            <Link to={`/inventories/inventory/${inventory.id}/details`}>
              {inventory.name}
            </Link>
          }
        />
        <UserDateDetail
          date={created}
          label={i18n._(t`已创建`)}
          user={created_by}
          dataCy="host-created-by"
        />
        <UserDateDetail
          date={modified}
          label={i18n._(t`上次修改时间`)}
          user={modified_by}
          dataCy="host-last-modified-by"
        />
        <VariablesDetail
          label={i18n._(t`变量`)}
          rows={4}
          value={variables}
        />
      </DetailList>
      <CardActionsRow>
        {user_capabilities?.edit && (
          <Button
            aria-label={i18n._(t`edit`)}
            component={Link}
            to={`/hosts/${id}/edit`}
          >
            {i18n._(t`编辑`)}
          </Button>
        )}
        {user_capabilities?.delete && (
          <DeleteButton
            onConfirm={() => handleHostDelete()}
            modalTitle={i18n._(t`删除 Host`)}
            name={name}
          />
        )}
      </CardActionsRow>
      {deletionError && (
        <AlertModal
          isOpen={deletionError}
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={() => setDeletionError(null)}
        >
          {i18n._(t`Failed to delete host.`)}
          <ErrorDetail error={deletionError} />
        </AlertModal>
      )}
    </CardBody>
  );
}

HostDetail.propTypes = {
  host: Host.isRequired,
};

export default withI18n()(HostDetail);
