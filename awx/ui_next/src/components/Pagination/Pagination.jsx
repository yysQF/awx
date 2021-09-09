import React from 'react';
import styled, { css } from 'styled-components';
import {
  Pagination as PFPagination,
  DropdownDirection,
} from '@patternfly/react-core';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';

const AWXPagination = styled(PFPagination)`
  ${props =>
    props.perPageOptions &&
    !props.perPageOptions.length &&
    css`
      .pf-c-options-menu__toggle-button {
        display: none;
      }
    `}
`;

export default props => (
  <I18n>
    {({ i18n }) => (
      <AWXPagination
        titles={{
          items: i18n._(t`项`),
          page: i18n._(t`页`),
          pages: i18n._(t`页`),
          itemsPerPage: i18n._(t`每页项`),
          perPageSuffix: i18n._(t`个每页`),
          toFirstPage: i18n._(t`首页`),
          toPreviousPage: i18n._(t`前一页`),
          toLastPage: i18n._(t`末页`),
          toNextPage: i18n._(t`下一页`),
          optionsToggle: i18n._(t`选择`),
          currPage: i18n._(t`当前页`),
          paginationTitle: i18n._(t`分页`),
        }}
        dropDirection={DropdownDirection.up}
        {...props}
      />
    )}
  </I18n>
);
