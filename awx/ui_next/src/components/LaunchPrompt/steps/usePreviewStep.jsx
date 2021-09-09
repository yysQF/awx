import React from 'react';
import { t } from '@lingui/macro';
import PreviewStep from './PreviewStep';
import StepName from './StepName';

const STEP_ID = 'preview';

export default function usePreviewStep(
  launchConfig,
  i18n,
  resource,
  surveyConfig,
  hasErrors,
  showStep
) {
  return {
    step: showStep
      ? {
          id: STEP_ID,
          name: (
            <StepName hasErrors={false} id="preview-step">
              {i18n._(t`预览`)}
            </StepName>
          ),
          component: (
            <PreviewStep
              launchConfig={launchConfig}
              resource={resource}
              surveyConfig={surveyConfig}
              formErrors={hasErrors}
            />
          ),
          enableNext: !hasErrors,
          nextButtonText: i18n._(t`运行`),
        }
      : null,
    initialValues: {},
    isReady: true,
    error: null,
    setTouched: () => {},
    validate: () => {},
  };
}
