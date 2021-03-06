import React, { useContext, useEffect, useState } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { arrayOf, func } from 'prop-types';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import { KebabifiedContext } from '../../contexts/Kebabified';
import AlertModal from '../AlertModal';
import { Job } from '../../types';

function cannotCancelBecausePermissions(job) {
  return (
    !job.summary_fields.user_capabilities.start &&
    ['pending', 'waiting', 'running'].includes(job.status)
  );
}

function cannotCancelBecauseNotRunning(job) {
  return !['pending', 'waiting', 'running'].includes(job.status);
}

function JobListCancelButton({ i18n, jobsToCancel, onCancel }) {
  const { isKebabified, onKebabModalChange } = useContext(KebabifiedContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const numJobsToCancel = jobsToCancel.length;
  const zeroOrOneJobSelected = numJobsToCancel < 2;

  const handleCancelJob = () => {
    onCancel();
    toggleModal();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (isKebabified) {
      onKebabModalChange(isModalOpen);
    }
  }, [isKebabified, isModalOpen, onKebabModalChange]);

  const renderTooltip = () => {
    const cannotCancelPermissions = jobsToCancel
      .filter(cannotCancelBecausePermissions)
      .map(job => job.name);
    const cannotCancelNotRunning = jobsToCancel
      .filter(cannotCancelBecauseNotRunning)
      .map(job => job.name);
    const numJobsUnableToCancel = cannotCancelPermissions.concat(
      cannotCancelNotRunning
    ).length;
    if (numJobsUnableToCancel > 0) {
      return (
        <div>
          {cannotCancelPermissions.length > 0 && (
            <div>
              {i18n._(
                '您无权取消以下作业',
                {
                  numJobsUnableToCancel: cannotCancelPermissions.length,
                }
              )}
              {' '.concat(cannotCancelPermissions.join(', '))}
            </div>
          )}
          {cannotCancelNotRunning.length > 0 && (
            <div>
              {i18n._(
                '您无法取消以下作业，因为它没有运行',
                {
                  numJobsUnableToCancel: cannotCancelNotRunning.length,
                }
              )}
              {' '.concat(cannotCancelNotRunning.join(', '))}
            </div>
          )}
        </div>
      );
    }
    if (numJobsToCancel > 0) {
      return i18n._(
        '取消选择作业',
        {
          numJobsToCancel,
        }
      );
    }
    return i18n._(t`选择取消`);
  };

  const isDisabled =
    jobsToCancel.length === 0 ||
    jobsToCancel.some(cannotCancelBecausePermissions) ||
    jobsToCancel.some(cannotCancelBecauseNotRunning);

  const cancelJobText = i18n._(
    '取消作业',
    {
      zeroOrOneJobSelected,
    }
  );

  return (
    <>
      {isKebabified ? (
        <DropdownItem
          key="cancel-job"
          isDisabled={isDisabled}
          component="button"
          onClick={toggleModal}
        >
          {cancelJobText}
        </DropdownItem>
      ) : (
        <Tooltip content={renderTooltip()} position="top">
          <div>
            <Button
              variant="secondary"
              aria-label={cancelJobText}
              onClick={toggleModal}
              isDisabled={isDisabled}
            >
              {cancelJobText}
            </Button>
          </div>
        </Tooltip>
      )}
      {isModalOpen && (
        <AlertModal
          variant="danger"
          title={cancelJobText}
          isOpen={isModalOpen}
          onClose={toggleModal}
          actions={[
            <Button
              id="cancel-job-confirm-button"
              key="delete"
              variant="danger"
              aria-label={cancelJobText}
              onClick={handleCancelJob}
            >
              {cancelJobText}
            </Button>,
            <Button
              id="cancel-job-return-button"
              key="cancel"
              variant="secondary"
              aria-label={i18n._(t`返回`)}
              onClick={toggleModal}
            >
              {i18n._(t`返回`)}
            </Button>,
          ]}
        >
          <div>
            {i18n._(
              '此操作将取消以下作业',
              {
                numJobsToCancel,
              }
            )}
          </div>
          {jobsToCancel.map(job => (
            <span key={job.id}>
              <strong>{job.name}</strong>
              <br />
            </span>
          ))}
        </AlertModal>
      )}
    </>
  );
}

JobListCancelButton.propTypes = {
  jobsToCancel: arrayOf(Job),
  onCancel: func,
};

JobListCancelButton.defaultProps = {
  jobsToCancel: [],
  onCancel: () => {},
};

export default withI18n()(JobListCancelButton);
