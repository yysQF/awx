import React, { useCallback, useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { FormGroup } from '@patternfly/react-core';
import { ProjectsAPI } from '../../../../api';
import useRequest from '../../../../util/useRequest';
import { required } from '../../../../util/validators';

import AnsibleSelect from '../../../../components/AnsibleSelect';
import CredentialLookup from '../../../../components/Lookup/CredentialLookup';
import ProjectLookup from '../../../../components/Lookup/ProjectLookup';
import Popover from '../../../../components/Popover';
import {
  OptionsField,
  SourceVarsField,
  VerbosityField,
  EnabledVarField,
  EnabledValueField,
  HostFilterField,
} from './SharedFields';

const SCMSubForm = ({ autoPopulateProject, i18n }) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [credentialField] = useField('credential');
  const [projectField, projectMeta, projectHelpers] = useField({
    name: 'source_project',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [sourcePathField, sourcePathMeta, sourcePathHelpers] = useField({
    name: 'source_path',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  const {
    error: sourcePathError,
    request: fetchSourcePath,
    result: sourcePath,
  } = useRequest(
    useCallback(async projectId => {
      const { data } = await ProjectsAPI.readInventories(projectId);
      return [...data, '/ (project root)'];
    }, []),
    []
  );

  useEffect(() => {
    if (projectMeta.initialValue) {
      fetchSourcePath(projectMeta.initialValue.id);
      if (sourcePathField.value === '') {
        sourcePathHelpers.setValue('/ (project root)');
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSourcePath, projectMeta.initialValue]);

  const handleProjectUpdate = useCallback(
    value => {
      setFieldValue('source_project', value);
      setFieldValue('source_path', '');
      setFieldTouched('source_path', false);
      fetchSourcePath(value.id);
    },
    [fetchSourcePath, setFieldValue, setFieldTouched]
  );

  const handleCredentialUpdate = useCallback(
    value => {
      setFieldValue('credential', value);
    },
    [setFieldValue]
  );

  return (
    <>
      <CredentialLookup
        credentialTypeKind="cloud"
        label={i18n._(t`凭证`)}
        value={credentialField.value}
        onChange={handleCredentialUpdate}
      />
      <ProjectLookup
        value={projectField.value}
        isValid={!projectMeta.touched || !projectMeta.error}
        helperTextInvalid={projectMeta.error}
        onBlur={() => projectHelpers.setTouched()}
        onChange={handleProjectUpdate}
        required
        autoPopulate={autoPopulateProject}
      />
      <FormGroup
        fieldId="source_path"
        helperTextInvalid={sourcePathError?.message || sourcePathMeta.error}
        validated={
          (!sourcePathMeta.error || !sourcePathMeta.touched) &&
          !sourcePathError?.message
            ? 'default'
            : 'error'
        }
        isRequired
        label={i18n._(t`清单文件`)}
        labelIcon={
          <Popover
            content={i18n._(t`选择库存文件
            由该来源同步。 您可以从中选择
            下拉菜单或在输入中输入文件。`)}
          />
        }
      >
        <AnsibleSelect
          {...sourcePathField}
          id="source_path"
          isValid={
            (!sourcePathMeta.error || !sourcePathMeta.touched) &&
            !sourcePathError?.message
          }
          data={[
            {
              value: '',
              key: '',
              label: i18n._(t`选择清单文件`),
              isDisabled: true,
            },
            ...sourcePath.map(value => ({ value, label: value, key: value })),
          ]}
          onChange={(event, value) => {
            sourcePathHelpers.setValue(value);
          }}
        />
      </FormGroup>
      <VerbosityField />
      <HostFilterField />
      <EnabledVarField />
      <EnabledValueField />
      <OptionsField showProjectUpdate />
      <SourceVarsField />
    </>
  );
};

export default withI18n()(SCMSubForm);
