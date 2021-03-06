import React, { Component } from "react";
import PropTypes from "prop-types";
import ComboBox from "../ComboBox";
import moment from "moment";
import Weekdays from "./Weekdays";
import Days from "./Days";
import isEmpty from "lodash/isEmpty";
import { StyledCalendar } from "./StyledCalendar";
import Box from "../Box";

class Calendar extends Component {
  constructor(props) {
    super(props);

    moment.locale(props.locale);
    this.state = this.mapPropsToState(props);
  }

  mapPropsToState = props => {
    const { minDate, maxDate, openToDate, selectedDate } = props;

    let newOpenToDate = openToDate;
    if (
      this.compareDates(openToDate, maxDate) > 0 ||
      this.compareDates(openToDate, minDate) < 0
    ) {
      newOpenToDate = minDate;
    }

    const months = moment.months();
    const arrayWeekdays = moment.weekdaysMin();
    const optionsMonth = this.getListMonth(
      minDate,
      maxDate,
      newOpenToDate,
      months
    );
    const optionsYear = this.getArrayYears(minDate, maxDate);
    const optionsDays = this.getDays(
      minDate,
      maxDate,
      newOpenToDate,
      selectedDate
    );
    const optionsWeekdays = this.getWeekDays(arrayWeekdays);

    const newState = {
      months,
      minDate,
      maxDate,
      openToDate: newOpenToDate,
      selectedDate,
      optionsMonth,
      selectedOptionMonth: this.getCurrentMonth(optionsMonth, newOpenToDate),
      optionsYear,
      selectedOptionYear: this.getCurrentYear(optionsYear, newOpenToDate),
      optionsDays,
      optionsWeekdays
    };

    //console.log("mapPropsToState ", newState);
    return newState;
  };

  onSelectYear = value => {
    const openToDate = new Date(value.key, this.state.openToDate.getMonth());

    const optionsMonth = this.getListMonth(
      this.state.minDate,
      this.state.maxDate,
      openToDate,
      this.state.months
    );

    const openToDateMonth = openToDate.getMonth();
    const openToDateYear = openToDate.getFullYear();
    let selectedMonth = optionsMonth.find(x => x.key == openToDateMonth);
    let newOpenToDate = openToDate;

    if (selectedMonth.disabled === true) {
      selectedMonth = optionsMonth.find(x => x.disabled === false);
      newOpenToDate = new Date(openToDateYear, selectedMonth.key, 1);
    }

    const newState = this.mapPropsToState({
      ...this.state,
      openToDate: newOpenToDate,
      optionsMonth
    });

    this.setState(newState);
  };

  onSelectMonth = value => {
    const newState = this.mapPropsToState({
      ...this.state,
      openToDate: new Date(this.state.openToDate.getFullYear(), value.key)
    });
    //console.log("onSelectMonth", newState);
    this.setState(newState);
  };

  onDayClick = dayItem => {
    //console.log("onDayClick", dayItem);
    const day = dayItem.value;
    const currentMonth = this.state.openToDate.getMonth();
    const currentYear = this.state.openToDate.getFullYear();
    const dateInCurrentMonth = new Date(currentYear, currentMonth, day);
    let newState;

    if (dayItem.dayState === "prev") {
      const dateInPrevMonth = new Date(currentYear, currentMonth - 1, day);
      newState = this.mapPropsToState({
        ...this.state,
        selectedDate: dateInPrevMonth,
        openToDate: dateInPrevMonth
      });
    } else if (dayItem.dayState === "next") {
      const dateInNextMonth = new Date(currentYear, currentMonth + 1, day);
      newState = this.mapPropsToState({
        ...this.state,
        selectedDate: dateInNextMonth,
        openToDate: dateInNextMonth
      });
    } else {
      newState = this.mapPropsToState({
        ...this.state,
        selectedDate: dateInCurrentMonth
      });
    }

    this.setState(newState);
    this.props.onChange && this.props.onChange(newState.selectedDate);
  };

  getListMonth = (minDate, maxDate, openToDate, months) => {
    const minDateYear = minDate.getFullYear();
    const minDateMonth = minDate.getMonth();

    const maxDateYear = maxDate.getFullYear();
    const maxDateMonth = maxDate.getMonth();

    const openToDateYear = openToDate.getFullYear();

    let disabled = false;
    const listMonths = [];

    let i = 0;
    while (i <= 11) {
      listMonths.push({
        key: `${i}`,
        label: `${months[i]}`,
        disabled: disabled
      });
      i++;
    }

    if (openToDateYear === minDateYear) {
      i = 0;
      while (i != minDateMonth) {
        listMonths[i].disabled = true;
        i++;
      }
    } else if (openToDateYear === maxDateYear) {
      i = 11;
      while (i != maxDateMonth) {
        listMonths[i].disabled = true;
        i--;
      }
    }
    return listMonths;
  };

  getCurrentMonth = (months, openToDate) => {
    const openToDateMonth = openToDate.getMonth();
    let selectedMonth = months.find(x => x.key == openToDateMonth);

    if (selectedMonth.disabled === true) {
      selectedMonth = months.find(x => x.disabled === false);
    }
    return selectedMonth;
  };

  getArrayYears = (minDate, maxDate) => {
    const minYear = minDate.getFullYear();
    const maxYear = maxDate.getFullYear();
    const yearList = [];

    let i = minYear;
    while (i <= maxYear) {
      let newDate = new Date(i, 0, 1);
      const label = moment(newDate).format("YYYY");
      const key = i;
      yearList.push({ key, label: label });
      i++;
    }
    return yearList.reverse();
  };

  getCurrentYear = (arrayYears, openToDate) => {
    const openToDateYear = openToDate.getFullYear();
    let currentYear = arrayYears.find(x => x.key == openToDateYear);
    if (!currentYear) {
      const newDate = this.props.minDate.getFullYear();
      currentYear = { key: newDate, label: `${newDate}` };
    }
    return currentYear;
  };

  getFirstDayOfMonth = openToDate => {
    const firstDay = moment(openToDate)
      .locale("en")
      .startOf("month")
      .format("d");
    let day = firstDay - 1;
    if (day < 0) {
      day = 6;
    }
    return day;
  };

  getWeekDays = weekdays => {
    let arrayWeekDays = [];
    weekdays.push(weekdays.shift());
    for (let i = 0; i < weekdays.length; i++) {
      arrayWeekDays.push({
        key: `${this.props.locale}_${i}`,
        value: weekdays[i],
        disabled: i >= 5 ? true : false
      });
    }
    return arrayWeekDays;
  };

  getDaysInPrevMonth = (
    openToDateYear,
    minDateYear,
    openToDateMonth,
    minDateMonth,
    minDateDay,
    openToDate,
    arrayDays,
    countDaysInPrevMonth
  ) => {
    //Disable preview month
    let disableClass = null;
    if (openToDateYear === minDateYear && openToDateMonth === minDateMonth) {
      disableClass = "calendar-month_disabled";
    }

    //Prev month
    let prevMonthDay = null;
    if (
      openToDateYear === minDateYear &&
      openToDateMonth - 1 === minDateMonth
    ) {
      prevMonthDay = minDateDay;
    }

    //prev month + year
    let prevYearDay = null;
    if (
      openToDateYear === minDateYear + 1 &&
      openToDateMonth === 0 &&
      minDateMonth === 11
    ) {
      prevYearDay = minDateDay;
    }

    // Show neighboring days in prev month
    const getFirstDayOfMonth = this.getFirstDayOfMonth(openToDate);
    let className = "calendar-month_neighboringMonth";
    for (let i = getFirstDayOfMonth; i != 0; i--) {
      if (countDaysInPrevMonth + 1 === prevMonthDay) {
        disableClass = "calendar-month_disabled";
      }
      if (countDaysInPrevMonth + 1 === prevYearDay) {
        disableClass = "calendar-month_disabled";
      }
      arrayDays.unshift({
        value: countDaysInPrevMonth--,
        disableClass,
        className,
        dayState: "prev"
      });
    }
    return arrayDays;
  };

  getDaysInCurrentMonth = (
    openToDateYear,
    maxDateYear,
    openToDateMonth,
    maxDateMonth,
    maxDateDay,
    minDateYear,
    minDateMonth,
    minDateDay,
    selectedDate,
    countDaysInMonth,
    getFirstDayOfMonth,
    openToDate,
    arrayDays
  ) => {
    //Disable max days in month
    let maxDay, minDay;
    let disableClass = null;
    if (openToDateYear === maxDateYear && openToDateMonth >= maxDateMonth) {
      if (openToDateMonth === maxDateMonth) {
        maxDay = maxDateDay;
      } else {
        maxDay = null;
      }
    }

    //Disable min days in month
    if (openToDateYear === minDateYear && openToDateMonth >= minDateMonth) {
      if (openToDateMonth === minDateMonth) {
        minDay = minDateDay;
      } else {
        minDay = null;
      }
    }

    // Show days in month and weekend days
    let seven = 7;
    const dateNow = selectedDate.getDate();
    let className = null;
    for (let i = 1; i <= countDaysInMonth; i++) {
      if (i === seven - getFirstDayOfMonth - 1) {
        className = "calendar-month_weekend";
      } else if (i === seven - getFirstDayOfMonth) {
        seven += 7;
        className = "calendar-month_weekend";
      } else {
        className = "calendar-month";
      }
      if (i === dateNow && this.compareMonths(openToDate, selectedDate) === 0) {
        className = "calendar-month_selected-day";
      }
      if (i > maxDay || i < minDay) {
        disableClass = "calendar-month_disabled";
        className = "calendar-month_disabled";
      } else {
        disableClass = null;
      }

      arrayDays.push({
        value: i,
        disableClass,
        className,
        dayState: "now"
      });
    }
    return arrayDays;
  };

  getDaysInNextMonth = (
    getFirstDayOfMonth,
    countDaysInMonth,
    openToDateYear,
    maxDateYear,
    openToDateMonth,
    maxDateMonth,
    maxDateDay,
    arrayDays
  ) => {
    //Calculating neighboring days in next month
    let maxDaysInMonthTable = 42;
    const maxDaysInMonth = 42;
    if (getFirstDayOfMonth > 5 && countDaysInMonth >= 30) {
      maxDaysInMonthTable += 7;
    } else if (getFirstDayOfMonth >= 5 && countDaysInMonth > 30) {
      maxDaysInMonthTable += 7;
    }
    if (maxDaysInMonthTable > maxDaysInMonth) {
      maxDaysInMonthTable -= 7;
    }

    //Disable next month days
    let disableClass = null;
    if (openToDateYear === maxDateYear && openToDateMonth >= maxDateMonth) {
      disableClass = "calendar-month_disabled";
    }

    //next month + year
    let nextYearDay = null;
    if (
      openToDateYear === maxDateYear - 1 &&
      openToDateMonth === 11 &&
      maxDateMonth === 0
    ) {
      nextYearDay = maxDateDay;
    }

    //next month
    let nextMonthDay = null;
    if (
      openToDateYear === maxDateYear &&
      openToDateMonth === maxDateMonth - 1
    ) {
      nextMonthDay = maxDateDay;
    }

    //Show neighboring days in next month
    let dayInNextMonth = 1;
    let className = "calendar-month_neighboringMonth";
    for (
      let i = countDaysInMonth;
      i < maxDaysInMonthTable - getFirstDayOfMonth;
      i++
    ) {
      if (i - countDaysInMonth === nextYearDay) {
        disableClass = "calendar-month_disabled";
      }
      if (i - countDaysInMonth === nextMonthDay) {
        disableClass = "calendar-month_disabled";
      }
      arrayDays.push({
        value: dayInNextMonth++,
        disableClass,
        className,
        dayState: "next"
      });
    }
    return arrayDays;
  };

  getDays = (minDate, maxDate, openToDate, selectedDate) => {
    const currentYear = openToDate.getFullYear();
    const currentMonth = openToDate.getMonth() + 1;
    const countDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let countDaysInPrevMonth = new Date(
      currentYear,
      currentMonth - 1,
      0
    ).getDate();

    let arrayDays = [];

    const openToDateMonth = openToDate.getMonth();
    const openToDateYear = openToDate.getFullYear();

    const maxDateMonth = maxDate.getMonth();
    const maxDateYear = maxDate.getFullYear();
    const maxDateDay = maxDate.getDate();

    const minDateMonth = minDate.getMonth();
    const minDateYear = minDate.getFullYear();
    const minDateDay = minDate.getDate();

    const getFirstDayOfMonth = this.getFirstDayOfMonth(openToDate);

    arrayDays = this.getDaysInPrevMonth(
      openToDateYear,
      minDateYear,
      openToDateMonth,
      minDateMonth,
      minDateDay,
      openToDate,
      arrayDays,
      countDaysInPrevMonth
    );

    arrayDays = this.getDaysInCurrentMonth(
      openToDateYear,
      maxDateYear,
      openToDateMonth,
      maxDateMonth,
      maxDateDay,
      minDateYear,
      minDateMonth,
      minDateDay,
      selectedDate,
      countDaysInMonth,
      getFirstDayOfMonth,
      openToDate,
      arrayDays
    );

    arrayDays = this.getDaysInNextMonth(
      getFirstDayOfMonth,
      countDaysInMonth,
      openToDateYear,
      maxDateYear,
      openToDateMonth,
      maxDateMonth,
      maxDateDay,
      arrayDays
    );

    //console.log("arrayDays", arrayDays);
    return arrayDays;
  };

  compareDates = (date1, date2) => {
    return moment(date1)
      .startOf("day")
      .diff(moment(date2).startOf("day"), "days");
  };

  compareMonths = (date1, date2) => {
    return moment(date1)
      .startOf("months")
      .diff(moment(date2).startOf("months"), "months");
  };

  componentDidUpdate(prevProps) {
    const { selectedDate, openToDate, minDate, maxDate, locale } = this.props;

    let newState = {};

    if (this.compareDates(selectedDate, prevProps.selectedDate) !== 0) {
      newState = { selectedDate };
    }

    if (this.compareDates(openToDate, prevProps.openToDate) !== 0) {
      newState = Object.assign({}, newState, {
        openToDate
      });
    }

    if (this.compareDates(minDate, prevProps.minDate) !== 0) {
      newState = Object.assign({}, newState, {
        minDate
      });
    }

    if (this.compareDates(maxDate, prevProps.maxDate) !== 0) {
      newState = Object.assign({}, newState, {
        maxDate
      });
    }

    if (!isEmpty(newState) || locale !== prevProps.locale) {
      moment.locale(locale);
      newState = this.mapPropsToState({
        ...this.state,
        ...newState
      });

      //console.log("componentDidUpdate newState", newState);
      this.setState(newState);
    }
  }

  render() {
    //console.log("Calendar render");

    const {
      size,
      selectedDate,
      onChange,
      openToDate,
      minDate,
      maxDate,
      locale,
      theme,
      ...rest
    } = this.props;
    const {
      optionsMonth,
      selectedOptionMonth,
      selectedOptionYear,
      optionsYear,
      optionsDays,
      optionsWeekdays
    } = this.state;

    const dropDownSizeMonth = 184;
    const dropDownSizeYear = optionsYear.length > 4 ? 184 : undefined;
    const newTheme = this.props.theme ? { theme: { ...this.props.theme } } : {};

    return (
      <StyledCalendar size={size} {...rest} {...newTheme}>
        <Box className="calendar-combo-box_container">
          <ComboBox
            className="calendar-combo-box-month_container"
            scaled
            scaledOptions
            dropDownMaxHeight={dropDownSizeMonth}
            onSelect={this.onSelectMonth}
            selectedOption={selectedOptionMonth}
            options={optionsMonth}
          />
          <ComboBox
            className="calendar-combo-box-year-container"
            scaled
            scaledOptions
            dropDownMaxHeight={dropDownSizeYear}
            onSelect={this.onSelectYear}
            selectedOption={selectedOptionYear}
            options={optionsYear}
          />
        </Box>

        <Box className="calendar-month-container">
          <Weekdays
            optionsWeekdays={optionsWeekdays}
            size={size}
            {...newTheme}
          />
          <Days
            optionsDays={optionsDays}
            size={size}
            onDayClick={this.onDayClick}
            {...newTheme}
          />
        </Box>
      </StyledCalendar>
    );
  }
}

Calendar.propTypes = {
  onChange: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  openToDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  locale: PropTypes.string,
  theme: PropTypes.object,
  size: PropTypes.oneOf(["base", "big"])
};

Calendar.defaultProps = {
  selectedDate: new Date(),
  openToDate: new Date(),
  minDate: new Date("1970/01/01"),
  maxDate: new Date(new Date().getFullYear() + 1 + "/01/01"),
  locale: moment.locale(),
  size: "base"
};

export default Calendar;
