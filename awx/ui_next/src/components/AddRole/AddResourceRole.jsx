import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import SelectableCard from '../SelectableCard';
import Wizard from '../Wizard';
import SelectResourceStep from './SelectResourceStep';
import SelectRoleStep from './SelectRoleStep';
import { TeamsAPI, UsersAPI } from '../../api';

const readUsers = async queryParams =>
  UsersAPI.read(Object.assign(queryParams, { is_superuser: false }));

const readUsersOptions = async () => UsersAPI.readOptions();

const readTeams = async queryParams => TeamsAPI.read(queryParams);

const readTeamsOptions = async () => TeamsAPI.readOptions();

function AddResourceRole({ onSave, onClose, roles, i18n, resource }) {
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedResourceRows, setSelectedResourceRows] = useState([]);
  const [selectedRoleRows, setSelectedRoleRows] = useState([]);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [maxEnabledStep, setMaxEnabledStep] = useState(1);

  const handleResourceCheckboxClick = user => {
    const selectedIndex = selectedResourceRows.findIndex(
      selectedRow => selectedRow.id === user.id
    );
    if (selectedIndex > -1) {
      selectedResourceRows.splice(selectedIndex, 1);
      if (selectedResourceRows.length === 0) {
        setMaxEnabledStep(currentStepId);
      }
      setSelectedRoleRows(selectedResourceRows);
    } else {
      setSelectedResourceRows([...selectedResourceRows, user]);
    }
  };

  const handleRoleCheckboxClick = role => {
    const selectedIndex = selectedRoleRows.findIndex(
      selectedRow => selectedRow.id === role.id
    );

    if (selectedIndex > -1) {
      selectedRoleRows.splice(selectedIndex, 1);
      setSelectedRoleRows(selectedRoleRows);
    } else {
      setSelectedRoleRows([...selectedRoleRows, role]);
    }
  };

  const handleResourceSelect = resourceType => {
    setSelectedResource(resourceType);
    setSelectedResourceRows([]);
    setSelectedRoleRows([]);
  };

  const handleWizardNext = step => {
    setCurrentStepId(step.id);
    setMaxEnabledStep(step.id);
  };

  const handleWizardGoToStep = step => {
    setCurrentStepId(step.id);
  };

  const handleWizardSave = async () => {
    try {
      const roleRequests = [];

      for (let i = 0; i < selectedResourceRows.length; i++) {
        for (let j = 0; j < selectedRoleRows.length; j++) {
          if (selectedResource === 'users') {
            roleRequests.push(
              UsersAPI.associateRole(
                selectedResourceRows[i].id,
                selectedRoleRows[j].id
              )
            );
          } else if (selectedResource === 'teams') {
            roleRequests.push(
              TeamsAPI.associateRole(
                selectedResourceRows[i].id,
                selectedRoleRows[j].id
              )
            );
          }
        }
      }

      await Promise.all(roleRequests);
      onSave();
    } catch (err) {
      // TODO: handle this error
    }
  };

  // Object roles can be user only, so we remove them when
  // showing role choices for team access
  const selectableRoles = { ...roles };
  if (selectedResource === 'teams') {
    Object.keys(roles).forEach(key => {
      if (selectableRoles[key].user_only) {
        delete selectableRoles[key];
      }
    });
  }

  const userSearchColumns = [
    {
      name: i18n._(t`?????????`),
      key: 'username__icontains',
      isDefault: true,
    },
    {
      name: i18n._(t`??????`),
      key: 'first_name__icontains',
    },
    {
      name: i18n._(t`??????`),
      key: 'last_name__icontains',
    },
  ];
  const userSortColumns = [
    {
      name: i18n._(t`?????????`),
      key: 'username',
    },
    {
      name: i18n._(t`??????`),
      key: 'first_name',
    },
    {
      name: i18n._(t`??????`),
      key: 'last_name',
    },
  ];
  const teamSearchColumns = [
    {
      name: i18n._(t`??????`),
      key: 'name',
      isDefault: true,
    },
    {
      name: i18n._(t`?????????`),
      key: 'created_by__username',
    },
    {
      name: i18n._(t`?????????`),
      key: 'modified_by__username',
    },
  ];

  const teamSortColumns = [
    {
      name: i18n._(t`??????`),
      key: 'name',
    },
  ];

  let wizardTitle = '';

  switch (selectedResource) {
    case 'users':
      wizardTitle = i18n._(t`??????????????????`);
      break;
    case 'teams':
      wizardTitle = i18n._(t`??????????????????`);
      break;
    default:
      wizardTitle = i18n._(t`????????????`);
  }

  const steps = [
    {
      id: 1,
      name: i18n._(t`??????????????????`),
      component: (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ width: '100%', marginBottom: '10px' }}>
            {i18n._(
              t`?????????????????????????????????????????? ?????????????????????????????????????????????????????????????????????????????????????????? ????????????????????????????????????????????????`
            )}
          </div>
          <SelectableCard
            isSelected={selectedResource === 'users'}
            label={i18n._(t`??????`)}
            ariaLabel={i18n._(t`??????`)}
            dataCy="add-role-users"
            onClick={() => handleResourceSelect('users')}
          />
          {resource?.type === 'credential' && !resource?.organization ? null : (
            <SelectableCard
              isSelected={selectedResource === 'teams'}
              label={i18n._(t`??????`)}
              ariaLabel={i18n._(t`??????`)}
              dataCy="add-role-teams"
              onClick={() => handleResourceSelect('teams')}
            />
          )}
        </div>
      ),
      enableNext: selectedResource !== null,
    },
    {
      id: 2,
      name: i18n._(t`????????????????????????`),
      component: (
        <Fragment>
          {selectedResource === 'users' && (
            <SelectResourceStep
              searchColumns={userSearchColumns}
              sortColumns={userSortColumns}
              displayKey="username"
              onRowClick={handleResourceCheckboxClick}
              fetchItems={readUsers}
              fetchOptions={readUsersOptions}
              selectedLabel={i18n._(t`?????????`)}
              selectedResourceRows={selectedResourceRows}
              sortedColumnKey="username"
            />
          )}
          {selectedResource === 'teams' && (
            <SelectResourceStep
              searchColumns={teamSearchColumns}
              sortColumns={teamSortColumns}
              onRowClick={handleResourceCheckboxClick}
              fetchItems={readTeams}
              fetchOptions={readTeamsOptions}
              selectedLabel={i18n._(t`?????????`)}
              selectedResourceRows={selectedResourceRows}
            />
          )}
        </Fragment>
      ),
      enableNext: selectedResourceRows.length > 0,
      canJumpTo: maxEnabledStep >= 2,
    },
    {
      id: 3,
      name: i18n._(t`????????????????????????`),
      component: (
        <SelectRoleStep
          onRolesClick={handleRoleCheckboxClick}
          roles={selectableRoles}
          selectedListKey={selectedResource === 'users' ? 'username' : 'name'}
          selectedListLabel={i18n._(t`?????????`)}
          selectedResourceRows={selectedResourceRows}
          selectedRoleRows={selectedRoleRows}
        />
      ),
      nextButtonText: i18n._(t`??????`),
      enableNext: selectedRoleRows.length > 0,
      canJumpTo: maxEnabledStep >= 3,
    },
  ];

  const currentStep = steps.find(step => step.id === currentStepId);

  // TODO: somehow internationalize steps and currentStep.nextButtonText
  return (
    <Wizard
      style={{ overflow: 'scroll' }}
      isOpen
      onNext={handleWizardNext}
      onClose={onClose}
      onSave={handleWizardSave}
      onGoToStep={step => handleWizardGoToStep(step)}
      steps={steps}
      title={wizardTitle}
      nextButtonText={currentStep.nextButtonText || undefined}
      backButtonText={i18n._(t`??????`)}
      cancelButtonText={i18n._(t`??????`)}
    />
  );
}

AddResourceRole.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  roles: PropTypes.shape(),
  resource: PropTypes.shape(),
};

AddResourceRole.defaultProps = {
  roles: {},
  resource: {},
};

export { AddResourceRole as _AddResourceRole };
export default withI18n()(AddResourceRole);
