import 'styled-components/macro';
import React from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { useField } from 'formik';
import { FormGroup, Alert } from '@patternfly/react-core';
import { required } from '../../../../util/validators';
import AnsibleSelect from '../../../../components/AnsibleSelect';
import FormField from '../../../../components/FormField';
import Popover from '../../../../components/Popover';
import { BrandName } from '../../../../variables';

// Setting BrandName to a variable here is necessary to get the jest tests
// passing.  Attempting to use BrandName in the template literal results
// in failing tests.
const brandName = BrandName;

const ManualSubForm = ({
  i18n,
  localPath,
  project_base_dir,
  project_local_paths,
}) => {
  const localPaths = [...new Set([...project_local_paths, localPath])];
  const options = [
    {
      value: '',
      key: '',
      label: i18n._(t`选择剧本目录`),
    },
    ...localPaths
      .filter(path => path)
      .map(path => ({
        value: path,
        key: path,
        label: path,
      })),
  ];
  const [pathField, pathMeta, pathHelpers] = useField({
    name: 'local_path',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  return (
    <>
      {options.length === 1 && (
        <Alert
          title={i18n._(t`警告: `)}
          css="grid-column: 1/-1"
          variant="warning"
          isInline
        >
          {i18n._(t`
            跟目录中没有可用的剧本目录。
            该目录是空的，或者所有内容都已经
            分配给其他项目。在那里创建一个新目录并制作
            确保“awx”系统用户可以读取剧本文件。
            `)}
        </Alert>
      )}
      <FormField
        id="project-base-dir"
        label={i18n._(t`项目根目录`)}
        name="base_dir"
        type="text"
        isReadOnly
        tooltip={
          <span>
            {i18n._(t`用于定位剧本的基本路径。目录
               在此路径中找到的内容将列在 playbook 目录下拉列表中。
               基本路径和选定的剧本目录一起提供了完整的
               用于定位剧本的路径。`)}
            <br />
            <br />
            {i18n._(t`部署时更改 PROJECTS_ROOT
               ${brandName} 更改此位置。`)}
          </span>
        }
      />
      <FormGroup
        fieldId="project-local-path"
        helperTextInvalid={pathMeta.error}
        isRequired
        validated={!pathMeta.touched || !pathMeta.error ? 'default' : 'error'}
        label={i18n._(t`剧本目录`)}
        labelIcon={
          <Popover
            content={i18n._(t`从目录列表中选择
            项目基本路径,将基本路径和剧本放在一起
            目录提供用于定位剧本的完整路径。`)}
          />
        }
      >
        <AnsibleSelect
          {...pathField}
          id="local_path"
          data={options}
          onChange={(event, value) => {
            pathHelpers.setValue(value);
          }}
        />
      </FormGroup>
    </>
  );
};

export default withI18n()(ManualSubForm);
