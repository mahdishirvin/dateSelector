export const LINE_COLOR: string = "#AAAAAA";
export const BAR_COLOR: string = "#5555FF";

export const FONT_SIZE: number = 10;
export const FONT_FAMILY: string = "helvetica,arial,sans-serif";

export const HELP_PROVIDER = {
  ShortCut: "H",
  TopRowHelp: "Brief tooltips (H)",
  DetailRowHelp:
    "Click to show extended tooltips.",
  TopRowInfo: "Extended tooltips (H)",
  DetailRowInfo:
    "Click to show brief tooltips."
};

export const STEP_TOGGLE = {
  ShortCut: "D, W, P, M, Q, Y",
  TopRow: "Step Level - ",
  DetailRow: "Set up the markers on the timeline"
};

export const TOGGLE_SLIDER_BUTTON = {
  ShortCut: "S",
  TopRowOpen: "Hide",
  TopRowClosed: "Show",
  TopRowEnd: " Timeline (S)",
  DetailRowOpen:
    "Click or drag to step markers to select date range or move range (ctrl+click) using top (or bottom) timeline markers. ",
  DetailRowClosed:
    "When displayed, use the timeline steps to drag or move (ctrl+click) to select a date range."
};

export const DATEUTILS = {
  periodTip: {
    day: "Day",
    week: "Week",
    pay: "Pay",
    month: "Month",
    quarter: "Quarter",
    year: "Year"
  },
  periodThis: {
    day: "Today",
    week: "This Week",
    pay: "This ",
    month: "This Month",
    quarter: "This Quarter",
    year: "This Year",
    range: "Full range",
    more: "more",
    ytd: "YTD",
    yearPast: "Year Past",
    ytdLastMonth: "YTD Last Month",
    ytdThisMonth: "YTD This Month"
  },
  periodGranularity: {
    day: "day",
    week: "week",
    pay: "pay",
    month: "month",
    quarter: "quarter",
    year: "year",
    range: "day",
    ytd: "day",
    yearPast: "day",
    ytdLastMonth: "month",
    ytdThisMonth: "month"
  }
};

export const HELP_TEXT = {
  menuToggle: {
    seq: "1",
    id: "menuToggle",
    helpText:
      "Tap the vertical menu button to show or hide the timeline date range slider.",
    isFirst: true,
    shortCut: "T",
    next: "fromDate"
  },
  fromDate: {
    seq: "2",
    id: "fromDate",
    helpText:
      "Enter the start date. Data only updates when you tap outside the field.",
    shortCut: ""
  },
  toDate: {
    seq: "3",
    id: "toDate",
    helpText:
      "Enter the end date. Data only updates when you tap outside the field.",
    shortCut: ""
  }
};

export const enAU = {
  // General
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  TOMORROW: "Tomorrow",
  THIS_WEEK: "This Week",
  LAST_WEEK: "Last Week",
  NEXT_WEEK: "Next Week",
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
  NEXT_MONTH: "Next Month",
  THIS_QUARTER: "This Quarter",
  LAST_QUARTER: "Last Quarter",
  THIS_YEAR: "This Year",
  LAST_YEAR: "Last Year",
  NEXT_YEAR: "Next Year",
  YTD_TODAY: "Year to Date (Today)",
  YTD_LAST_MONTH: "Year to Date (Last Month)",
  YTD_THIS_MONTH: "Year to Date (This Month)",
  YTD_CAL_TODAY: "Calendar Year to Date (Today)",
  YTD_CAL_LAST_MONTH: "Calendar Year to Date (Last Month)",
  YTD_CAL_THIS_MONTH: "Calendar Year to Date (This Month)",
  YEAR_TO_TODAY: "Year to Today",
  YEAR_TO_LAST_MONTH: "Year to Last Month",
  YEAR_TO_THIS_MONTH: "Year to This Month",
  FIRST_WEEK_OF_SCOPE: "First Week of Scope",
  LAST_WEEK_OF_SCOPE: "Last Week of Scope",
  FIRST_MONTH_OF_SCOPE: "First Month of Scope",
  LAST_MONTH_OF_SCOPE: "Last Month of Scope",
  MONTH_FROM_SCOPE_END: "Month from Scope End",
  DAYS_30_FROM_SCOPE_END: "30 Days from Scope End",

  // Date Movement
  MOVE_BACK: "Move Back",
  MOVE_FORWARD: "Move Forward",
  EXTEND_BACK: "Extend Back",
  EXTEND_FORWARD: "Extend Forward",
  REDUCE_BACK: "Reduce Back",
  REDUCE_FORWARD: "Reduce Forward",

  // Tooltip
  MOVE_SELECTED_RANGE: "Move the selected range",
  EXTEND_SELECTED_RANGE: "Extend the selected range",
  REDUCE_SELECTED_RANGE: "Reduce the selected range",

  // Periods
  PERIOD_DAY: "Day",
  PERIOD_WEEK: "Week",
  PERIOD_PAY: "Pay Period",
  PERIOD_MONTH: "Month",
  PERIOD_QUARTER: "Quarter",
  PERIOD_YEAR: "Year",
  PERIOD_MORE: "More",
  PERIOD_RANGE: "Range",
  PERIOD_YTD: "Year to Date",
  PERIOD_YEAR_PAST: "Year Past",
  PERIOD_YTD_LAST_MONTH: "Year to Date (Last Month)",
  PERIOD_YTD_THIS_MONTH: "Year to Date (This Month)",

  // Slider
  SLIDER_TOP: "Top Slider",
  SLIDER_BOTTOM: "Bottom Slider",
  SLIDER_VALUE_LABEL: "Value Label",
  SLIDER_MARK_LABEL: "Mark Label",
  SLIDER_MARK: "Mark",
  SLIDER_MARK_ACTIVE: "Active Mark",
  SLIDER_TRACK: "Track",
  SLIDER_RAIL: "Rail",
  SLIDER_THUMB: "Thumb",

  // Formatting
  FORMAT_DAY: "Day Format",
  FORMAT_WEEK: "Week Format",
  FORMAT_PAY: "Pay Period Format",
  FORMAT_MONTH: "Month Format",
  FORMAT_QUARTER: "Quarter Format",
  FORMAT_YEAR: "Year Format",

  // Settings
  SETTINGS_STYLE: "Style Settings",
  SETTINGS_CALENDAR: "Calendar Settings",
  SETTINGS_LAYOUT: "Layout Settings",
  SETTINGS_PERIOD: "Period Settings",
  SETTINGS_THEME_FONT: "Theme Font",
  SETTINGS_FONT_SIZE: "Font Size",
  SETTINGS_THEME_MODE: "Theme Mode",
  SETTINGS_THEME_COLOR: "Theme Color",
  SETTINGS_START_RANGE: "Start Range",
  SETTINGS_STEP_INIT: "Step Initialization",
  SETTINGS_SINGLE_DAY: "Single Day Only",
  SETTINGS_LIMIT_TO_SCOPE: "Limit to Scope",
  SETTINGS_ENABLE_SLIDER: "Enable Slider",
  SETTINGS_SHOW_SLIDER: "Show Slider",
  SETTINGS_SHOW_2ND_SLIDER: "Show 2nd Slider",
  SETTINGS_SHOW_CURRENT: "Show Current Periods",
  SETTINGS_SHOW_ICON_TEXT: "Show Icon Text",
  SETTINGS_SHOW_MORE: "Show More Periods",
  SETTINGS_SHOW_MOVE: "Show Move Arrows",
  SETTINGS_SHOW_EXPAND: "Show Expand Arrows",
  SETTINGS_SHOW_HELP_ICON: "Show Help Icon",
  SETTINGS_SHOW_TOOLTIP: "Show Tooltip",

  // Miscellaneous
  DATE_RANGE_SLICER: "Date Range Slicer",
  ADD_DATE_FIELD: "Add a Date field to activate.",
  FEATURES_STARTUP_RANGE: "Features startup range, presets, an interactive timeline or a minimized date picker (range or single day).",
  DATE_ENTRY_INVALID: "Date entry is invalid",
  DATE_RANGE: "Date Range",
  DATE_RANGE_FROM: "from",
  DATE_RANGE_TO: "to",
  DATE_RANGE_EXCEEDS_SCOPE: "exceeds scope",
  DATE_RANGE_DURATION: "Duration",
  DATE_RANGE_START: "Start Date",
  DATE_RANGE_END: "End Date",
  DATE_RANGE_START_DAY: "Start Day",
  DATE_RANGE_END_DAY: "End Day",
  DATE_RANGE_VALID: "Valid",
  DATE_RANGE_INVALID: "Invalid",
};

export default enAU;