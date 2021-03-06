import 'styled-components/macro';
import React from 'react';
import styled from 'styled-components';
import { useField } from 'formik';
import { withI18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { RRule } from 'rrule';
import {
  Checkbox as _Checkbox,
  FormGroup,
  Radio,
  TextInput,
} from '@patternfly/react-core';
import AnsibleSelect from '../../AnsibleSelect';
import FormField from '../../FormField';
import { required } from '../../../util/validators';

const RunOnRadio = styled(Radio)`
  label {
    display: block;
    width: 100%;
  }

  :not(:last-of-type) {
    margin-bottom: 10px;
  }

  select:not(:first-of-type) {
    margin-left: 10px;
  }
`;

const RunEveryLabel = styled.p`
  display: flex;
  align-items: center;
`;

const Checkbox = styled(_Checkbox)`
  :not(:last-of-type) {
    margin-right: 10px;
  }
`;

export function requiredPositiveInteger(i18n) {
  return value => {
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        return i18n._(t`此字段必须是整数`);
      }
      if (value < 1) {
        return i18n._(t`此字段必须大于 0`);
      }
    }
    if (!value) {
      return i18n._(t`为该字段选择一个值`);
    }
    return undefined;
  };
}

const FrequencyDetailSubform = ({ i18n }) => {
  const [runOnDayMonth] = useField({
    name: 'runOnDayMonth',
  });
  const [runOnDayNumber] = useField({
    name: 'runOnDayNumber',
  });
  const [runOnTheOccurrence] = useField({
    name: 'runOnTheOccurrence',
  });
  const [runOnTheDay] = useField({
    name: 'runOnTheDay',
  });
  const [runOnTheMonth] = useField({
    name: 'runOnTheMonth',
  });
  const [startDateTime] = useField({
    name: 'startDateTime',
  });
  const [daysOfWeek, daysOfWeekMeta, daysOfWeekHelpers] = useField({
    name: 'daysOfWeek',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [end, endMeta] = useField({
    name: 'end',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [interval, intervalMeta] = useField({
    name: 'interval',
    validate: requiredPositiveInteger(i18n),
  });
  const [runOn, runOnMeta] = useField({
    name: 'runOn',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [endDateTime, endDateTimeMeta] = useField({
    name: 'endDateTime',
    validate: required(i18n._(t`为该字段选择一个值`), i18n),
  });
  const [frequency] = useField({
    name: 'frequency',
  });
  useField({
    name: 'occurrences',
    validate: requiredPositiveInteger(i18n),
  });

  const monthOptions = [
    {
      key: 'january',
      value: 1,
      label: i18n._(t`一月`),
    },
    {
      key: 'february',
      value: 2,
      label: i18n._(t`二月`),
    },
    {
      key: 'march',
      value: 3,
      label: i18n._(t`三月`),
    },
    {
      key: 'april',
      value: 4,
      label: i18n._(t`四月`),
    },
    {
      key: 'may',
      value: 5,
      label: i18n._(t`五月`),
    },
    {
      key: 'june',
      value: 6,
      label: i18n._(t`六月`),
    },
    {
      key: 'july',
      value: 7,
      label: i18n._(t`七月`),
    },
    {
      key: 'august',
      value: 8,
      label: i18n._(t`八月`),
    },
    {
      key: 'september',
      value: 9,
      label: i18n._(t`九月`),
    },
    {
      key: 'october',
      value: 10,
      label: i18n._(t`十月`),
    },
    {
      key: 'november',
      value: 11,
      label: i18n._(t`十一月`),
    },
    {
      key: 'december',
      value: 12,
      label: i18n._(t`十二月`),
    },
  ];

  const updateDaysOfWeek = (day, checked) => {
    const newDaysOfWeek = [...daysOfWeek.value];
    if (checked) {
      newDaysOfWeek.push(day);
      daysOfWeekHelpers.setValue(newDaysOfWeek);
    } else {
      daysOfWeekHelpers.setValue(
        newDaysOfWeek.filter(selectedDay => selectedDay !== day)
      );
    }
  };

  const getRunEveryLabel = () => {
    const intervalValue = interval.value;

    switch (frequency.value) {
      case 'minute':
        return i18n._('{intervalValue, plural, one {minute} other {minutes}}', {
          intervalValue,
        });
      case 'hour':
        return i18n._('{intervalValue, plural, one {hour} other {hours}}', {
          intervalValue,
        });
      case 'day':
        return i18n._('{intervalValue, plural, one {day} other {days}}', {
          intervalValue,
        });
      case 'week':
        return i18n._('{intervalValue, plural, one {week} other {weeks}}', {
          intervalValue,
        });
      case 'month':
        return i18n._('{intervalValue, plural, one {month} other {months}}', {
          intervalValue,
        });
      case 'year':
        return i18n._('{intervalValue, plural, one {year} other {years}}', {
          intervalValue,
        });
      default:
        throw new Error(i18n._(t`Frequency did not match an expected value`));
    }
  };

  /* eslint-disable no-restricted-globals */
  return (
    <>
      <FormGroup
        name="interval"
        fieldId="schedule-run-every"
        helperTextInvalid={intervalMeta.error}
        isRequired
        validated={
          !intervalMeta.touched || !intervalMeta.error ? 'default' : 'error'
        }
        label={i18n._(t`运行次数/每`)}
      >
        <div css="display: flex">
          <TextInput
            css="margin-right: 10px;"
            id="schedule-run-every"
            type="number"
            min="1"
            step="1"
            {...interval}
            onChange={(value, event) => {
              interval.onChange(event);
            }}
          />
          <RunEveryLabel>{getRunEveryLabel()}</RunEveryLabel>
        </div>
      </FormGroup>
      {frequency?.value === 'week' && (
        <FormGroup
          name="daysOfWeek"
          fieldId="schedule-days-of-week"
          helperTextInvalid={daysOfWeekMeta.error}
          isRequired
          validated={
            !daysOfWeekMeta.touched || !daysOfWeekMeta.error
              ? 'default'
              : 'error'
          }
          label={i18n._(t`指定天数`)}
        >
          <div css="display: flex">
            <Checkbox
              label={i18n._(t`周日`)}
              isChecked={daysOfWeek.value.includes(RRule.SU)}
              onChange={checked => {
                updateDaysOfWeek(RRule.SU, checked);
              }}
              aria-label={i18n._(t`周日`)}
              id="schedule-days-of-week-sun"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周一`)}
              isChecked={daysOfWeek.value.includes(RRule.MO)}
              onChange={checked => {
                updateDaysOfWeek(RRule.MO, checked);
              }}
              aria-label={i18n._(t`周一`)}
              id="schedule-days-of-week-mon"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周二`)}
              isChecked={daysOfWeek.value.includes(RRule.TU)}
              onChange={checked => {
                updateDaysOfWeek(RRule.TU, checked);
              }}
              aria-label={i18n._(t`周二`)}
              id="schedule-days-of-week-tue"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周三`)}
              isChecked={daysOfWeek.value.includes(RRule.WE)}
              onChange={checked => {
                updateDaysOfWeek(RRule.WE, checked);
              }}
              aria-label={i18n._(t`周三`)}
              id="schedule-days-of-week-wed"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周四`)}
              isChecked={daysOfWeek.value.includes(RRule.TH)}
              onChange={checked => {
                updateDaysOfWeek(RRule.TH, checked);
              }}
              aria-label={i18n._(t`周四`)}
              id="schedule-days-of-week-thu"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周五`)}
              isChecked={daysOfWeek.value.includes(RRule.FR)}
              onChange={checked => {
                updateDaysOfWeek(RRule.FR, checked);
              }}
              aria-label={i18n._(t`周五`)}
              id="schedule-days-of-week-fri"
              name="daysOfWeek"
            />
            <Checkbox
              label={i18n._(t`周六`)}
              isChecked={daysOfWeek.value.includes(RRule.SA)}
              onChange={checked => {
                updateDaysOfWeek(RRule.SA, checked);
              }}
              aria-label={i18n._(t`周六`)}
              id="schedule-days-of-week-sat"
              name="daysOfWeek"
            />
          </div>
        </FormGroup>
      )}
      {(frequency?.value === 'month' || frequency?.value === 'year') &&
        !isNaN(new Date(startDateTime.value)) && (
          <FormGroup
            name="runOn"
            fieldId="schedule-run-on"
            helperTextInvalid={runOnMeta.error}
            isRequired
            validated={
              !runOnMeta.touched || !runOnMeta.error ? 'default' : 'error'
            }
            label={i18n._(t`运行`)}
          >
            <RunOnRadio
              id="schedule-run-on-day"
              name="runOn"
              label={
                <div css="display: flex;align-items: center;">
                  {frequency?.value === 'month' && (
                    <span
                      id="radio-schedule-run-on-day"
                      css="margin-right: 10px;"
                    >
                      <Trans>Day</Trans>
                    </span>
                  )}
                  {frequency?.value === 'year' && (
                    <AnsibleSelect
                      id="schedule-run-on-day-month"
                      css="margin-right: 10px"
                      isDisabled={runOn.value !== 'day'}
                      data={monthOptions}
                      {...runOnDayMonth}
                    />
                  )}
                  <TextInput
                    id="schedule-run-on-day-number"
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    isDisabled={runOn.value !== 'day'}
                    {...runOnDayNumber}
                    onChange={(value, event) => {
                      runOnDayNumber.onChange(event);
                    }}
                  />
                </div>
              }
              value="day"
              isChecked={runOn.value === 'day'}
              onChange={(value, event) => {
                event.target.value = 'day';
                runOn.onChange(event);
              }}
            />
            <RunOnRadio
              id="schedule-run-on-the"
              name="runOn"
              label={
                <div css="display: flex;align-items: center;">
                  <span
                    id="radio-schedule-run-on-the"
                    css="margin-right: 10px;"
                  >
                    <Trans>The</Trans>
                  </span>
                  <AnsibleSelect
                    id="schedule-run-on-the-occurrence"
                    isDisabled={runOn.value !== 'the'}
                    data={[
                      { value: 1, key: 'first', label: i18n._(t`第一个`) },
                      {
                        value: 2,
                        key: 'second',
                        label: i18n._(t`第二个`),
                      },
                      { value: 3, key: 'third', label: i18n._(t`第三个`) },
                      {
                        value: 4,
                        key: 'fourth',
                        label: i18n._(t`第四个`),
                      },
                      { value: 5, key: 'fifth', label: i18n._(t`第五个`) },
                      { value: -1, key: 'last', label: i18n._(t`最后一个`) },
                    ]}
                    {...runOnTheOccurrence}
                  />
                  <AnsibleSelect
                    id="schedule-run-on-the-day"
                    isDisabled={runOn.value !== 'the'}
                    data={[
                      {
                        value: 'sunday',
                        key: 'sunday',
                        label: i18n._(t`周日`),
                      },
                      {
                        value: 'monday',
                        key: 'monday',
                        label: i18n._(t`周一`),
                      },
                      {
                        value: 'tuesday',
                        key: 'tuesday',
                        label: i18n._(t`周二`),
                      },
                      {
                        value: 'wednesday',
                        key: 'wednesday',
                        label: i18n._(t`周三`),
                      },
                      {
                        value: 'thursday',
                        key: 'thursday',
                        label: i18n._(t`周四`),
                      },
                      {
                        value: 'friday',
                        key: 'friday',
                        label: i18n._(t`周五`),
                      },
                      {
                        value: 'saturday',
                        key: 'saturday',
                        label: i18n._(t`周六`),
                      },
                      { value: 'day', key: 'day', label: i18n._(t`天`) },
                      {
                        value: 'weekday',
                        key: 'weekday',
                        label: i18n._(t`工作日`),
                      },
                      {
                        value: 'weekendDay',
                        key: 'weekendDay',
                        label: i18n._(t`周末`),
                      },
                    ]}
                    {...runOnTheDay}
                  />
                  {frequency?.value === 'year' && (
                    <>
                      <span
                        id="of-schedule-run-on-the-month"
                        css="margin-left: 10px;"
                      >
                        <Trans>of</Trans>
                      </span>
                      <AnsibleSelect
                        id="schedule-run-on-the-month"
                        isDisabled={runOn.value !== 'the'}
                        data={monthOptions}
                        {...runOnTheMonth}
                      />
                    </>
                  )}
                </div>
              }
              value="the"
              isChecked={runOn.value === 'the'}
              onChange={(value, event) => {
                event.target.value = 'the';
                runOn.onChange(event);
              }}
            />
          </FormGroup>
        )}
      <FormGroup
        name="end"
        fieldId="schedule-end"
        helperTextInvalid={endMeta.error}
        isRequired
        validated={!endMeta.touched || !endMeta.error ? 'default' : 'error'}
        label={i18n._(t`结束`)}
      >
        <Radio
          id="end-never"
          name="end"
          label={i18n._(t`从不`)}
          value="never"
          isChecked={end.value === 'never'}
          onChange={(value, event) => {
            event.target.value = 'never';
            end.onChange(event);
          }}
        />
        <Radio
          id="end-after"
          name="end"
          label={i18n._(t`出现次数后`)}
          value="after"
          isChecked={end.value === 'after'}
          onChange={(value, event) => {
            event.target.value = 'after';
            end.onChange(event);
          }}
        />
        <Radio
          id="end-on-date"
          name="end"
          label={i18n._(t`到指定日期`)}
          value="onDate"
          isChecked={end.value === 'onDate'}
          onChange={(value, event) => {
            event.target.value = 'onDate';
            end.onChange(event);
          }}
        />
      </FormGroup>
      {end?.value === 'after' && (
        <FormField
          id="schedule-occurrences"
          label={i18n._(t`发生次数`)}
          name="occurrences"
          type="number"
          min="1"
          step="1"
          validate={required(null, i18n)}
          isRequired
        />
      )}
      {end?.value === 'onDate' && (
        <FormGroup
          fieldId="schedule-end-datetime"
          helperTextInvalid={endDateTimeMeta.error}
          isRequired
          validated={
            !endDateTimeMeta.touched || !endDateTimeMeta.error
              ? 'default'
              : 'error'
          }
          label={i18n._(t`结束日期/时间`)}
        >
          <input
            className="pf-c-form-control"
            type="datetime-local"
            id="schedule-end-datetime"
            step="1"
            {...endDateTime}
          />
        </FormGroup>
      )}
    </>
  );
  /* eslint-enable no-restricted-globals */
};

export default withI18n()(FrequencyDetailSubform);
