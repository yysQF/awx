import React, { useEffect, useCallback } from 'react';
import { shape, func } from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Formik, useField } from 'formik';
import { RRule } from 'rrule';
import { Form, FormGroup, Title } from '@patternfly/react-core';
import { Config } from '../../../contexts/Config';
import { SchedulesAPI } from '../../../api';
import AnsibleSelect from '../../AnsibleSelect';
import ContentError from '../../ContentError';
import ContentLoading from '../../ContentLoading';
import FormActionGroup from '../../FormActionGroup/FormActionGroup';
import FormField, { FormSubmitError } from '../../FormField';
import { FormColumnLayout, SubFormLayout } from '../../FormLayout';
import { dateToInputDateTime, formatDateStringUTC } from '../../../util/dates';
import useRequest from '../../../util/useRequest';
import { required } from '../../../util/validators';
import FrequencyDetailSubform from './FrequencyDetailSubform';

const generateRunOnTheDay = (days = []) => {
  if (
    [
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR,
      RRule.SA,
      RRule.SU,
    ].every(element => days.indexOf(element) > -1)
  ) {
    return 'day';
  }
  if (
    [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR].every(
      element => days.indexOf(element) > -1
    )
  ) {
    return 'weekday';
  }
  if ([RRule.SA, RRule.SU].every(element => days.indexOf(element) > -1)) {
    return 'weekendDay';
  }
  if (days.indexOf(RRule.MO) > -1) {
    return 'monday';
  }
  if (days.indexOf(RRule.TU) > -1) {
    return 'tuesday';
  }
  if (days.indexOf(RRule.WE) > -1) {
    return 'wednesday';
  }
  if (days.indexOf(RRule.TH) > -1) {
    return 'thursday';
  }
  if (days.indexOf(RRule.FR) > -1) {
    return 'friday';
  }
  if (days.indexOf(RRule.SA) > -1) {
    return 'saturday';
  }
  if (days.indexOf(RRule.SU) > -1) {
    return 'sunday';
  }

  return null;
};

function ScheduleFormFields({ i18n, zoneOptions }) {
  const [startDateTime, startDateTimeMeta] = useField({
    name: 'startDateTime',
    validate: required(
      i18n._(t`为此字段选择有效的日期和时间`),
      i18n
    ),
  });
  const [timezone, timezoneMeta] = useField({
    name: 'timezone',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [frequency, frequencyMeta] = useField({
    name: 'frequency',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });

  return (
    <>
      <FormField
        id="schedule-name"
        label={i18n._(t`名称`)}
        name="name"
        type="text"
        validate={required(null, i18n)}
        isRequired
      />
      <FormField
        id="schedule-description"
        label={i18n._(t`描述`)}
        name="description"
        type="text"
      />
      <FormGroup
        fieldId="schedule-start-datetime"
        helperTextInvalid={startDateTimeMeta.error}
        isRequired
        validated={
          !startDateTimeMeta.touched || !startDateTimeMeta.error
            ? 'default'
            : 'error'
        }
        label={i18n._(t`开始时间/日期`)}
      >
        <input
          className="pf-c-form-control"
          type="datetime-local"
          id="schedule-start-datetime"
          step="1"
          {...startDateTime}
        />
      </FormGroup>
      <FormGroup
        name="timezone"
        fieldId="schedule-timezone"
        helperTextInvalid={timezoneMeta.error}
        isRequired
        validated={
          !timezoneMeta.touched || !timezoneMeta.error ? 'default' : 'error'
        }
        label={i18n._(t`当地时区`)}
      >
        <AnsibleSelect
          id="schedule-timezone"
          data={zoneOptions}
          {...timezone}
        />
      </FormGroup>
      <FormGroup
        name="frequency"
        fieldId="schedule-requency"
        helperTextInvalid={frequencyMeta.error}
        isRequired
        validated={
          !frequencyMeta.touched || !frequencyMeta.error ? 'default' : 'error'
        }
        label={i18n._(t`运行频率`)}
      >
        <AnsibleSelect
          id="schedule-frequency"
          data={[
            { value: 'none', key: 'none', label: i18n._(t`None (run once)`) },
            { value: 'minute', key: 'minute', label: i18n._(t`Minute`) },
            { value: 'hour', key: 'hour', label: i18n._(t`Hour`) },
            { value: 'day', key: 'day', label: i18n._(t`Day`) },
            { value: 'week', key: 'week', label: i18n._(t`Week`) },
            { value: 'month', key: 'month', label: i18n._(t`Month`) },
            { value: 'year', key: 'year', label: i18n._(t`Year`) },
          ]}
          {...frequency}
        />
      </FormGroup>
      {frequency.value !== 'none' && (
        <SubFormLayout>
          <Title size="md" headingLevel="h4">
            {i18n._(t`频率详情`)}
          </Title>
          <FormColumnLayout>
            <FrequencyDetailSubform />
          </FormColumnLayout>
        </SubFormLayout>
      )}
    </>
  );
}

function ScheduleForm({
  handleCancel,
  handleSubmit,
  i18n,
  schedule,
  submitError,
  ...rest
}) {
  let rruleError;
  const now = new Date();
  const closestQuarterHour = new Date(
    Math.ceil(now.getTime() / 900000) * 900000
  );
  const tomorrow = new Date(closestQuarterHour);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const initialValues = {
    daysOfWeek: [],
    description: schedule.description || '',
    end: 'never',
    endDateTime: dateToInputDateTime(tomorrow),
    frequency: 'none',
    interval: 1,
    name: schedule.name || '',
    occurrences: 1,
    runOn: 'day',
    runOnDayMonth: 1,
    runOnDayNumber: 1,
    runOnTheDay: 'sunday',
    runOnTheMonth: 1,
    runOnTheOccurrence: 1,
    startDateTime: dateToInputDateTime(closestQuarterHour),
    timezone: schedule.timezone || 'America/New_York',
  };

  const overriddenValues = {};

  if (Object.keys(schedule).length > 0) {
    if (schedule.rrule) {
      try {
        const {
          origOptions: {
            bymonth,
            bymonthday,
            bysetpos,
            byweekday,
            count,
            dtstart,
            freq,
            interval,
          },
        } = RRule.fromString(schedule.rrule.replace(' ', '\n'));

        if (dtstart) {
          overriddenValues.startDateTime = dateToInputDateTime(
            new Date(formatDateStringUTC(dtstart))
          );
        }

        if (schedule.until) {
          overriddenValues.end = 'onDate';
          overriddenValues.endDateTime = schedule.until;
        } else if (count) {
          overriddenValues.end = 'after';
          overriddenValues.occurrences = count;
        }

        if (interval) {
          overriddenValues.interval = interval;
        }

        if (typeof freq === 'number') {
          switch (freq) {
            case RRule.MINUTELY:
              if (schedule.dtstart !== schedule.dtend) {
                overriddenValues.frequency = 'minute';
              }
              break;
            case RRule.HOURLY:
              overriddenValues.frequency = 'hour';
              break;
            case RRule.DAILY:
              overriddenValues.frequency = 'day';
              break;
            case RRule.WEEKLY:
              overriddenValues.frequency = 'week';
              if (byweekday) {
                overriddenValues.daysOfWeek = byweekday;
              }
              break;
            case RRule.MONTHLY:
              overriddenValues.frequency = 'month';
              if (bymonthday) {
                overriddenValues.runOnDayNumber = bymonthday;
              } else if (bysetpos) {
                overriddenValues.runOn = 'the';
                overriddenValues.runOnTheOccurrence = bysetpos;
                overriddenValues.runOnTheDay = generateRunOnTheDay(byweekday);
              }
              break;
            case RRule.YEARLY:
              overriddenValues.frequency = 'year';
              if (bymonthday) {
                overriddenValues.runOnDayNumber = bymonthday;
                overriddenValues.runOnDayMonth = bymonth;
              } else if (bysetpos) {
                overriddenValues.runOn = 'the';
                overriddenValues.runOnTheOccurrence = bysetpos;
                overriddenValues.runOnTheDay = generateRunOnTheDay(byweekday);
                overriddenValues.runOnTheMonth = bymonth;
              }
              break;
            default:
              break;
          }
        }
      } catch (error) {
        rruleError = error;
      }
    } else {
      rruleError = new Error(i18n._(t`计划缺少规则`));
    }
  }

  const {
    request: loadZoneInfo,
    error: contentError,
    contentLoading,
    result: zoneOptions,
  } = useRequest(
    useCallback(async () => {
      const { data } = await SchedulesAPI.readZoneInfo();
      return data.map(zone => {
        return {
          value: zone.name,
          key: zone.name,
          label: zone.name,
        };
      });
    }, [])
  );

  useEffect(() => {
    loadZoneInfo();
  }, [loadZoneInfo]);

  if (contentError || rruleError) {
    return <ContentError error={contentError || rruleError} />;
  }

  if (contentLoading) {
    return <ContentLoading />;
  }

  return (
    <Config>
      {() => {
        return (
          <Formik
            initialValues={Object.assign(initialValues, overriddenValues)}
            onSubmit={handleSubmit}
            validate={values => {
              const errors = {};
              const {
                end,
                endDateTime,
                frequency,
                runOn,
                runOnDayNumber,
                startDateTime,
              } = values;

              if (
                end === 'onDate' &&
                new Date(startDateTime) > new Date(endDateTime)
              ) {
                errors.endDateTime = i18n._(
                  t`请选择开始日期/时间之后的结束日期/时间.`
                );
              }

              if (
                (frequency === 'month' || frequency === 'year') &&
                runOn === 'day' &&
                (runOnDayNumber < 1 || runOnDayNumber > 31)
              ) {
                errors.runOn = i18n._(
                  t`请选择一个介于 1 到 31 之间的天数.`
                );
              }

              return errors;
            }}
          >
            {formik => (
              <Form autoComplete="off" onSubmit={formik.handleSubmit}>
                <FormColumnLayout>
                  <ScheduleFormFields
                    i18n={i18n}
                    zoneOptions={zoneOptions}
                    {...rest}
                  />
                  <FormSubmitError error={submitError} />
                  <FormActionGroup
                    onCancel={handleCancel}
                    onSubmit={formik.handleSubmit}
                  />
                </FormColumnLayout>
              </Form>
            )}
          </Formik>
        );
      }}
    </Config>
  );
}

ScheduleForm.propTypes = {
  handleCancel: func.isRequired,
  handleSubmit: func.isRequired,
  schedule: shape({}),
  submitError: shape(),
};

ScheduleForm.defaultProps = {
  schedule: {},
  submitError: null,
};

export default withI18n()(ScheduleForm);
