import React, { Fragment } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { bool, instanceOf } from 'prop-types';
import { t } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { RootAPI } from '../../api';
import ErrorDetail from '../ErrorDetail';

async function logout() {
  await RootAPI.logout();
  window.location.replace('/#/login');
}

function ContentError({ error, children, isNotFound, i18n }) {
  if (error && error.response && error.response.status === 401) {
    if (!error.response.headers['session-timeout']) {
      logout();
      return null;
    }
  }
  const is404 =
    isNotFound || (error && error.response && error.response.status === 404);
  const is401 = error && error.response && error.response.status === 401;
  return (
    <Fragment>
      {is401 ? (
        <Redirect to="/login" />
      ) : (
        <EmptyState variant="full">
          <EmptyStateIcon icon={ExclamationTriangleIcon} />
          <Title size="lg" headingLevel="h3">
            {is404 ? i18n._(t`未找到`) : i18n._(t`出了些问题...`)}
          </Title>
          <EmptyStateBody>
            {is404
              ? i18n._(t`您请求的页面无法找到.`)
              : i18n._(
                  t`加载此内容时出错，请重新加载页面.`
                )}{' '}
            {children || (
              <Link to="/home">{i18n._(t`返回仪表盘.`)}</Link>
            )}
          </EmptyStateBody>
          {error && <ErrorDetail error={error} />}
        </EmptyState>
      )}
    </Fragment>
  );
}
ContentError.propTypes = {
  error: instanceOf(Error),
  isNotFound: bool,
};
ContentError.defaultProps = {
  error: null,
  isNotFound: false,
};

export { ContentError as _ContentError };
export default withI18n()(ContentError);
