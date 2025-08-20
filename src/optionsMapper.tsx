import powerbi from "powerbi-visuals-api";
import { FONT_SIZE, FONT_FAMILY } from "./constants";
import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";
import {
  valueFormatter as vf,
  textMeasurementService as tms,
} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";
import { getInitRange } from "./dateutils";
import { startOfDay, endOfDay } from "date-fns";
import {
  VisualState,
  ViewportData,
  CategoryData,
  dateCardProps,
  dateRange,
} from "./interface";
import { IAdvancedFilter } from "powerbi-models";
import { VisualSettingsModel } from "./vsettings";

const { extractFilterColumnTarget } = interactivityFilterService;

/**
 * Quick structural validation of update options.
 */
export const optionsAreValid = (
  options: powerbi.extensibility.visual.VisualUpdateOptions
): boolean => {
  try {
    const dataView = options?.dataViews?.[0];
    return !!(
      dataView?.metadata?.columns?.length &&
      options.viewport &&
      dataView.categorical?.categories?.[0]?.source?.type?.dateTime
    );
  } catch {
    return false;
  }
};

/**
 * Extracts settings properties into strongly-typed dateCardProps.
 */
export const settingProps = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: VisualSettingsModel,
  initialised: boolean
): dateCardProps => {
  const {
    styleSettings: style,
    calendarSettings: calendar,
    layoutSettings: layout,
    periodSettings: period,
  } = formatSettings;

  const {
    periodDay: day,
    periodWeek: week,
    periodPay: pay,
    periodMonth: month,
    periodQuarter: quarter,
    periodYear: year,
  } = period;

  const {
    layoutCurrent: current,
    layoutMove: move,
    layoutTimeline: timeline,
    layoutHelp: help,
  } = layout;

  const stepInit = String(calendar.stepInit.value);
  const singleDay = calendar.singleDay.value;
  const limitToScope = calendar.limitToScope.value;

  const rangeScope = mapDataView(options).category.rangeValues;
  const weekStartDay = getDayNum(week.weekStartDay.value);
  const yearStartMonth = getNum(year.yearStartMonth.value);
  const startRange = String(calendar.startRange.value);

  // Default initial range (non-sync)
  const startup_Filter = getInitRange(
    startRange,
    weekStartDay,
    yearStartMonth,
    rangeScope
  );

  // Try to restore from synced filter
  const syncFilter = restoreRangeFilter(options);

  // Decide which to use for `dates`
  let selectedDates: dateRange;
  if (syncFilter) {
    // ✅ always prioritise sync’d values for current dates
    selectedDates = syncFilter;
  } else if (!initialised) {
    // first-time init fallback
    selectedDates = startup_Filter;
  } else {
    // fallback if already initialised and no sync found
    selectedDates = startup_Filter;
  }

  return {
    landingOff: optionsAreValid(options),
    dates: singleDay ? startup_Filter : selectedDates,
    rangeScope,
    startRange,
    weekStartDay,
    yearStartMonth,
    stepInit,
    singleDay,
    limitToScope,

    // 👇 persist the resolved value (not just startup_Filter)
    startupFilter: startup_Filter,

    stepSkip: {
      day: day.daySkip.value,
      week: week.weekSkip.value,
      pay: pay.paySkip.value,
      month: month.monthSkip.value,
      quarter: quarter.quarterSkip.value,
      year: 1,
    },
    stepViz: {
      day: day.showDay.value,
      week: week.showWeek.value,
      pay: pay.showPay.value,
      month: month.showMonth.value,
      quarter: quarter.showQuarter.value,
      year: year.showYear.value,
    },
    stepFmt: {
      day: String(day.fmtDay.value),
      week: String(week.fmtWeek.value),
      pay: String(pay.fmtPay.value),
      month: String(month.fmtMonth.value),
      quarter: String(quarter.fmtQuarter.value),
      year: String(year.fmtYear.value),
    },
    payProps: {
      desc: String(pay.payCustomLabel.value),
      ref: pay.payRefDate.value,
      len: pay.payLength.value,
    },
    showHelpIcon: help.showHelpIcon.value,
    showTooltip: help.showTooltip.value,
    showExtendedTooltip: help.showExtendedTooltip.value,
    showMove: move.showMove.value,
    showExpand: move.showExpand.value,
    showCurrent: current.showCurrent.value,
    showMore: current.showMore.value,
    showIconText: current.showIconText.value,
    enableSlider: timeline.enableSlider.value,
    showSlider: timeline.showSlider.value,
    show2ndSlider: timeline.show2ndSlider.value,
    themeFont: style.themeFont.value,
    themeColor: style.themeColor.value.value.valueOf(),
    themeMode: style.themeMode.value,
    fontColor: style.fontColor.value.value.valueOf(),
    fontSize: style.fontSize.value.valueOf(),
    fontBold: style.font.bold.value,
    fontItalic: style.font.italic.value,
  };
};

const getDayNum = (n: number | string): 0 | 1 | 2 | 3 | 4 | 5 | 6 =>
  (getNum(n) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

const getNum = (n: number | string): number =>
  typeof n === "number" ? n : parseInt(n, 10);

const parseDate = (value: any): Date | null => {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? null
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Extract categorical data from the DataView and measure labels.
 */
export const mapDataView = (
  options: powerbi.extensibility.visual.VisualUpdateOptions
): Partial<VisualState> => {
  const dataView = options.dataViews[0];
  const category = dataView.categorical?.categories?.[0];
  const categorySource = category?.source;

  if (!category || !categorySource) {
    return {};
  }

  const filterTarget = extractFilterColumnTarget(categorySource);
  const categoriesFormatter = vf.create({
    format: vf.getFormatStringByColumn(categorySource),
  });

  const values = category.values;
  const formattedValues = values.map((v) => categoriesFormatter.format(v));

  const rangeScopeVals: dateRange = {
    start: parseDate(values[0]),
    end: parseDate(values[values.length - 1]),
  };

  const maxCategoryNameWidth = formattedValues.reduce(
    (acc, val) =>
      Math.max(
        acc,
        tms.measureSvgTextWidth({
          text: val,
          fontFamily: FONT_FAMILY,
          fontSize: PixelConverter.toString(FONT_SIZE),
        })
      ),
    0
  );

  return {
    category: {
      displayName: categorySource.displayName,
      count: values.length,
      rangeValues: rangeScopeVals,
      formatter: categoriesFormatter,
      maxWidth: maxCategoryNameWidth,
      filterTarget,
    } as CategoryData,
  };
};

/**
 * Restore filter state from jsonFilters if present.
 */
export const restoreRangeFilter = (
  options: powerbi.extensibility.visual.VisualUpdateOptions
): dateRange | undefined => {
  const { jsonFilters, dataViews } = options;
  const dataView = dataViews[0];
  const column = dataView?.metadata?.columns?.[0];
  if (!jsonFilters || !column) return;

  const filter = jsonFilters.find(
    (f): f is IAdvancedFilter =>
      !!(f as IAdvancedFilter).target &&
      !!(f as IAdvancedFilter).logicalOperator &&
      !!(f as IAdvancedFilter).conditions
  );
  if (!filter) return;

  const [table, col] = String(column.queryName).split(".");
  const target = filter.target as { table: string; column: string };
  if (
    filter.logicalOperator === "And" &&
    target.table === table &&
    target.column === col
  ) {
    const greaterThan = filter.conditions.find(
      (c) => c.operator === "GreaterThanOrEqual"
    );
    const lessThan = filter.conditions.find(
      (c) => c.operator === "LessThanOrEqual"
    );

    if (greaterThan && lessThan) {
      return {
        start: startOfDay(parseDate(greaterThan.value)),
        end: endOfDay(parseDate(lessThan.value)),
      };
    }
  }
};

export const mapViewport = (viewport: powerbi.IViewport): ViewportData => ({
  width: viewport.width,
  height: viewport.height,
});

export const mapOptionsToState = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: VisualSettingsModel,
  initialised: boolean
): VisualState => ({
  category: mapDataView(options).category,
  viewport: mapViewport(options.viewport),
  settings: settingProps(options, formatSettings, initialised),
});

export default mapOptionsToState;
