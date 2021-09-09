import React from 'react';
import { withI18n } from '@lingui/react';
import { useField } from 'formik';
import { t } from '@lingui/macro';
import styled from 'styled-components';
import { Title } from '@patternfly/react-core';
import SelectableCard from '../../../../../components/SelectableCard';

const Grid = styled.div`
  display: grid;
  grid-auto-rows: 100px;
  grid-gap: 20px;
  grid-template-columns: 33% 33% 33%;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin: 20px 0px;
  width: 100%;
`;

function RunStep({ i18n }) {
  const [field, , helpers] = useField('linkType');
  return (
    <>
      <Title headingLevel="h1" size="xl">
        {i18n._(t`运行`)}
      </Title>
      <p>
        {i18n._(
          t`指定执行此节点的条件`
        )}
      </p>
      <Grid>
        <SelectableCard
          id="link-type-success"
          isSelected={field.value === 'success'}
          label={i18n._(t`成功时`)}
          description={i18n._(
            t`当父节点结果为成功状态时执行.`
          )}
          onClick={() => helpers.setValue('success')}
        />
        <SelectableCard
          id="link-type-failure"
          isSelected={field.value === 'failure'}
          label={i18n._(t`失败时`)}
          description={i18n._(
            t`在父节点导致失败状态时执行.`
          )}
          onClick={() => helpers.setValue('failure')}
        />
        <SelectableCard
          id="link-type-always"
          isSelected={field.value === 'always'}
          label={i18n._(t`始终`)}
          description={i18n._(
            t`无论父节点的最终状态如何，都执行.`
          )}
          onClick={() => helpers.setValue('always')}
        />
      </Grid>
    </>
  );
}
export default withI18n()(RunStep);
