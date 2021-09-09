import React, { useCallback, useEffect } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Formik } from 'formik';
import styled from 'styled-components';
import {
  LoginMainFooterLinksItem,
  LoginForm,
  LoginPage as PFLoginPage,
  Tooltip,
} from '@patternfly/react-core';
import {
  AzureIcon,
  GoogleIcon,
  GithubIcon,
  UserCircleIcon,
} from '@patternfly/react-icons';
import useRequest, { useDismissableError } from '../../util/useRequest';
import { AuthAPI, RootAPI } from '../../api';
import AlertModal from '../../components/AlertModal';
import ErrorDetail from '../../components/ErrorDetail';

const loginLogoSrc = '/static/media/logo-login.svg';

const LoginPage = styled(PFLoginPage)`
  & .pf-c-brand {
    max-height: 285px;
  }
`;

function AWXLogin({ alt, i18n, isAuthenticated }) {
  const {
    isLoading: isCustomLoginInfoLoading,
    error: customLoginInfoError,
    request: fetchCustomLoginInfo,
    result: { brandName, logo, loginInfo, socialAuthOptions },
  } = useRequest(
    useCallback(async () => {
      const [
        {
          data: { custom_logo, custom_login_info },
        },
        {
          data: { BRAND_NAME },
        },
        { data: authData },
      ] = await Promise.all([
        RootAPI.read(),
        RootAPI.readAssetVariables(),
        AuthAPI.read(),
      ]);
      const logoSrc = custom_logo
        ? `data:image/jpeg;${custom_logo}`
        : loginLogoSrc;
      return {
        brandName: BRAND_NAME,
        logo: logoSrc,
        loginInfo: custom_login_info,
        socialAuthOptions: authData,
      };
    }, []),
    {
      brandName: null,
      logo: loginLogoSrc,
      loginInfo: null,
      socialAuthOptions: {},
    }
  );

  const {
    error: loginInfoError,
    dismissError: dismissLoginInfoError,
  } = useDismissableError(customLoginInfoError);

  useEffect(() => {
    fetchCustomLoginInfo();
  }, [fetchCustomLoginInfo]);

  const {
    isLoading: isAuthenticating,
    error: authenticationError,
    request: authenticate,
  } = useRequest(
    useCallback(async ({ username, password }) => {
      await RootAPI.login(username, password);
    }, [])
  );

  const {
    error: authError,
    dismissError: dismissAuthError,
  } = useDismissableError(authenticationError);

  const handleSubmit = async values => {
    dismissAuthError();
    await authenticate(values);
  };

  if (isCustomLoginInfoLoading) {
    return null;
  }

  if (isAuthenticated(document.cookie)) {
    return <Redirect to="/" />;
  }

  let helperText;
  if (authError?.response?.status === 401) {
    helperText = i18n._(t`无效的用户名或密码，请再试一次`);
  } else {
    helperText = i18n._(t`登录时出现问题，请重试`);
  }

  return (
    <LoginPage
      brandImgSrc={logo}
      brandImgAlt={alt || brandName}
      loginTitle={
        brandName
          ? i18n._(t`欢迎登录！`)
          : ''
      }
      textContent={loginInfo}
      socialMediaLoginContent={
        <>
          {socialAuthOptions &&
            Object.keys(socialAuthOptions).map(authKey => {
              const loginUrl = socialAuthOptions[authKey].login_url;
              if (authKey === 'azuread-oauth2') {
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip content={i18n._(t`使用 Azure AD 登录`)}>
                      <AzureIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }
              if (authKey === 'github') {
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip content={i18n._(t`使用 GitHub 登录`)}>
                      <GithubIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }
              if (authKey === 'github-org') {
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip
                      content={i18n._(t`使用 GitHub 组织登录`)}
                    >
                      <GithubIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }
              if (authKey === 'github-team') {
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip content={i18n._(t`使用 GitHub 团队登录`)}>
                      <GithubIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }
              if (authKey === 'google-oauth2') {
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip content={i18n._(t`使用 Google 登录`)}>
                      <GoogleIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }
              if (authKey.startsWith('saml')) {
                const samlIDP = authKey.split(':')[1] || null;
                return (
                  <LoginMainFooterLinksItem href={loginUrl} key={authKey}>
                    <Tooltip
                      content={
                        samlIDP
                          ? i18n._(t`使用 SAML 登录 ${samlIDP}`)
                          : i18n._(t`使用 SAML 登录`)
                      }
                    >
                      <UserCircleIcon />
                    </Tooltip>
                  </LoginMainFooterLinksItem>
                );
              }

              return null;
            })}
        </>
      }
    >
      <Formik
        initialValues={{
          password: '',
          username: '',
        }}
        onSubmit={handleSubmit}
      >
        {formik => (
          <LoginForm
            className={authError ? 'pf-m-error' : ''}
            helperText={helperText}
            isLoginButtonDisabled={isAuthenticating}
            isValidPassword={!authError}
            isValidUsername={!authError}
            loginButtonLabel={i18n._(t`登录`)}
            onChangePassword={val => {
              formik.setFieldValue('password', val);
              dismissAuthError();
            }}
            onChangeUsername={val => {
              formik.setFieldValue('username', val);
              dismissAuthError();
            }}
            onLoginButtonClick={formik.handleSubmit}
            passwordLabel={i18n._(t`密码`)}
            passwordValue={formik.values.password}
            showHelperText={authError}
            usernameLabel={i18n._(t`用户名`)}
            usernameValue={formik.values.username}
          />
        )}
      </Formik>
      {loginInfoError && (
        <AlertModal
          isOpen={loginInfoError}
          variant="error"
          title={i18n._(t`Error!`)}
          onClose={dismissLoginInfoError}
        >
          {i18n._(
            t`无法获取自定义登录配置设置。 将改为显示系统默认值。`
          )}
          <ErrorDetail error={loginInfoError} />
        </AlertModal>
      )}
    </LoginPage>
  );
}

export default withI18n()(withRouter(AWXLogin));
export { AWXLogin as _AWXLogin };
