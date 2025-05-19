import powerbi from "powerbi-visuals-api";
import { FONT_SIZE, FONT_FAMILY } from "./constants";
import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";
import { valueFormatter as vf, textMeasurementService as tms } from "powerbi-visuals-utils-formattingutils";
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

const { extractFilterColumnTarget } = interactivityFilterService;

export const optionsAreValid = (options: powerbi.extensibility.visual.VisualUpdateOptions): boolean => {
  try {
    return !(
      !options ||
      !options.dataViews ||
      !options.dataViews[0] ||
      !options.viewport ||
      !options.dataViews[0]?.metadata?.columns?.length ||
      !options.dataViews[0].categorical.categories[0].source.type.dateTime
    );
  } catch {
    return false;
  }
};

export const settingProps = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: any,
  initialised: boolean
): dateCardProps => {
  const { styleSettings: style, calendarSettings: calendar, layoutSettings: layout, periodSettings: period } = formatSettings;
  const { periodDay: day, periodWeek: week, periodPay: pay, periodMonth: month, periodQuarter: quarter, periodYear: year } = period;
  const { layoutCurrent: current, layoutMove: move, layoutTimeline: timeline, layoutHelp: help } = layout;

  const stepInit: string = calendar.stepInit.value.toString();
  const singleDay: boolean = calendar.singleDay.value;
  const limitToScope: boolean = calendar.limitToScope.value;
  const rangeScope: dateRange = mapDataView(options).category.rangeValues;
  const weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = getDayNum(week.weekStartDay.value.valueOf());
  const yearStartMonth: number = getNum(year.yearStartMonth.value.valueOf());
  const startRange: string = calendar.startRange.value.toString();

  const startupFilter = getInitRange(startRange, weekStartDay, yearStartMonth, rangeScope);
  const selectedDates = startRange !== "sync" && !initialised ? startupFilter : restoreRangeFilter(options) || startupFilter;

  return {
    landingOff: optionsAreValid(options),
    dates: selectedDates,
    rangeScope: rangeScope,
    startRange: startRange,
    weekStartDay: weekStartDay,
    yearStartMonth: yearStartMonth,
    stepInit: stepInit,
    singleDay: singleDay,
    limitToScope: limitToScope,
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
      day: day.fmtDay.value.toString(),
      week: week.fmtWeek.value.toString(),
      pay: pay.fmtPay.value.toString(),
      month: month.fmtMonth.value.toString(),
      quarter: quarter.fmtQuarter.value.toString(),
      year: year.fmtYear.value.toString(),
    },
    payProps: {
      desc: "Pay-Period",
      ref: new Date(pay.payRefYear.value, getNum(pay.payRefMonth.value.valueOf()), pay.payRefDay.value),
      len: pay.payLength.value,
    },
    showHelpIcon: help.showHelpIcon.value,
    showTooltip: help.showTooltip.value,
    showMove: move.showMove.value,
    showExpand: move.showExpand.value,
    showCurrent: current.showCurrent.value,
    showMore: current.showMore.value,
    showIconText: current.showIconText.value,
    enableSlider: timeline.enableSlider.value,
    showSlider: timeline.showSlider.value,
    show2ndSlider: timeline.show2ndSlider.value,
    themeColor: style.themeColor.value.value.valueOf(),
    themeFont: style.themeFont.value,
    themeMode: style.themeMode.value,
    fontSize: style.fontSize.value.toString(),
  };
};

const getDayNum = (n: number | string): 0 | 1 | 2 | 3 | 4 | 5 | 6 => {
  const num = typeof n === "number" ? n : parseInt(n, 10);
  return (num % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const getNum = (n: number | string) => (typeof n === "number" ? n : parseInt(n, 10));

const parseDate = (value: any): Date | null => {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime()) ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
};

export const mapDataView = (options: powerbi.extensibility.visual.VisualUpdateOptions): Partial<VisualState> => {
  const dataView = options.dataViews[0];
  const categorical = dataView.categorical;
  const category = categorical?.categories?.[0];
  const categorySource = category?.source;
  const filterTarget = extractFilterColumnTarget(categorySource);
  const categoriesFormatter = vf.create({ format: vf.getFormatStringByColumn(categorySource) });
  const rangeScopeValues = category?.values.map((value) => categoriesFormatter.format(value));
  const rangeScopeVals: dateRange = {
    start: parseDate(category.values[0]),
    end: parseDate(category.values[category.values.length - 1]),
  };
  const maxCategoryNameWidth = rangeScopeValues?.reduce(
    (acc, value) => Math.max(acc, tms.measureSvgTextWidth({ text: value, fontFamily: FONT_FAMILY, fontSize: PixelConverter.toString(FONT_SIZE) })),
    0
  );

  return {
    category: {
      displayName: categorySource.displayName,
      count: category?.values.length,
      rangeValues: rangeScopeVals,
      formatter: categoriesFormatter,
      maxWidth: maxCategoryNameWidth,
      filterTarget: filterTarget,
    } as CategoryData,
  };
};

export const restoreRangeFilter = (options: powerbi.extensibility.visual.VisualUpdateOptions) => {
  const { jsonFilters, dataViews } = options;
  const dataView = dataViews[0];

  if (jsonFilters && dataView.metadata && dataView.metadata.columns && dataView.metadata.columns[0]) {
    const filter = jsonFilters.find((filter): filter is IAdvancedFilter => {
      return (
        (filter as IAdvancedFilter).target !== undefined &&
        (filter as IAdvancedFilter).logicalOperator !== undefined &&
        (filter as IAdvancedFilter).conditions !== undefined
      );
    });

    if (filter) {
      const target = filter.target as { table: string; column: string };
      const source = String(dataView.metadata.columns[0].queryName).split(".");
      if (
        source &&
        source[0] &&
        source[1] &&
        filter.logicalOperator === "And" &&
        target.table === source[0] &&
        target.column === source[1]
      ) {
        const greaterThan = filter.conditions.find((cond) => cond.operator === "GreaterThanOrEqual");
        const lessThan = filter.conditions.find((cond) => cond.operator === "LessThanOrEqual");
        if (greaterThan && lessThan) {
          return {
            start: startOfDay(parseDate(greaterThan.value)),
            end: endOfDay(parseDate(lessThan.value)),
          };
        }
      }
    }
  }
};

export const mapViewport = (viewport: powerbi.IViewport): ViewportData => ({
  width: viewport.width,
  height: viewport.height,
});

export const mapOptionsToState = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: any,
  initialised: boolean
): VisualState => {
  const dataViewPartial = mapDataView(options);
  const props: dateCardProps = settingProps(options, formatSettings, initialised);
  return {
    category: dataViewPartial.category,
    viewport: mapViewport(options.viewport),
    settings: props,
  };
};

export default mapOptionsToState;
