"use strict";

import powerbi from "powerbi-visuals-api";
import { dateRange, payProps, stepPeriod, themeProps } from "./interface";
import { VisualSettingsModel } from "./vsettings";
import { endOfDay, startOfDay } from "date-fns";
import { getInitRange } from "./dateutils";
import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";

const { extractFilterColumnTarget } = interactivityFilterService;

// Define a type for the object returned by the getCategory function to
// provide an explicit type annotation and prevent complex type inference errors.
type CategoryInfo = {
    displayName: string;
    filterTarget: powerbi.extensibility.ISelectionId;
};

/**
 * Extracts and returns the filter-related information from the data view.
 * @param dataView The data view column source.
 * @returns An object with the column name and filter target, or undefined.
 */
export const getCategory = (dataView: powerbi.DataView): CategoryInfo | undefined => {
    const categorySource = dataView.categorical?.categories?.[0]?.source;
    if (!categorySource) {
        return undefined;
    }
    const filterTarget = extractFilterColumnTarget(categorySource);

    return {
        displayName: categorySource.displayName,
        filterTarget: filterTarget,
    };
};


/**
 * Extracts and returns the date values from the data view category column.
 * @param category The data view category.
 * @returns The raw date values as a dateRange object.
 */
export const getDateValues = (category: powerbi.DataViewCategoryColumn): dateRange => {
    const values = category.values as Date[];
    const start = values && values.length > 0 ? new Date(values[0]) : null;
    const end = values && values.length > 0 ? new Date(values[values.length - 1]) : null;

    return {
        start: start,
        end: end,
    };
};

/**
 * Extracts and returns the pay-period related properties from the formatting settings.
 * @param settings The visual settings model.
 * @returns The pay-period properties.
 */
export const getPayProps = (settings: VisualSettingsModel): payProps => {
    const pay = settings.periodSettings.periodPay;
    return {
        desc: String(pay.payCustomLabel.value),
        ref: pay.payRefDate.value,
        len: pay.payLength.value,
    };
};

/**
 * Extracts and returns the theme-related properties from the formatting settings.
 * @param settings The visual settings model.
 * @returns The theme properties.
 */
export const getThemeProps = (settings: VisualSettingsModel): themeProps => {
    const style = settings.styleSettings;
    return {
        themeFont: style.themeFont.value,
        themeColor: style.themeColor.value.value.valueOf(),
        themeMode: style.themeMode.value,
        fontColor: style.fontColor.value.value.valueOf(),
        fontSize: style.fontSize.value.valueOf(),
        fontBold: style.font.bold.value,
        fontItalic: style.font.italic.value,
    };
};

/**
 * Extracts and returns the date range from formatting settings and data view.
 * This is the primary function for determining the initial date range.
 * @param settings The visual settings model.
 * @param options The visual update options.
 * @returns The date range.
 */
export const getDateRange = (
    settings: VisualSettingsModel,
    options: powerbi.extensibility.visual.VisualUpdateOptions
): dateRange => {
    const calendar = settings.calendarSettings;
    const week = settings.periodSettings.periodWeek;
    const year = settings.periodSettings.periodYear;

    // Get the full date range from the data model, which defines the scope
    const rangeScope = getDateValues(options.dataViews[0].categorical.categories[0]);

    const weekStartDay = typeof week.weekStartDay.value === 'number'
        ? week.weekStartDay.value
        : parseInt(week.weekStartDay.value, 10);
    const yearStartMonth = typeof year.yearStartMonth.value === 'number'
        ? year.yearStartMonth.value
        : parseInt(year.yearStartMonth.value, 10);
    const startRange = String(calendar.startRange.value);

    return getInitRange(
        startRange,
        weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        yearStartMonth,
        rangeScope
    );
};
/**
 * Extracts and returns a boolean value for single day mode.
 * @param settings The visual settings model.
 * @returns A boolean indicating if single day mode is enabled.
 */
export const getSingleDay = (settings: VisualSettingsModel): boolean => {
    return settings.calendarSettings.singleDay.value;
};

/**
 * Extracts and returns a boolean value for showing the move buttons.
 * @param settings The visual settings model.
 * @returns A boolean indicating if the move buttons are shown.
 */
export const getShowMove = (settings: VisualSettingsModel): boolean => {
    return settings.layoutSettings.layoutMove.showMove.value;
};

/**
 * Extracts and returns a boolean value for showing the "more" button.
 * @param settings The visual settings model.
 * @returns A boolean indicating if the "more" button is shown.
 */
export const getShowMore = (settings: VisualSettingsModel): boolean => {
    return settings.layoutSettings.layoutCurrent.showMore.value;
};

/**
 * Extracts and returns a boolean value for showing the slider.
 * @param settings The visual settings model.
 * @returns A boolean indicating if the slider is shown.
 */
export const getShowSlider = (settings: VisualSettingsModel): boolean => {
    return settings.layoutSettings.layoutTimeline.showSlider.value;
};

/**
 * Extracts and returns the font size.
 * @param settings The visual settings model.
 * @returns The font size.
 */
export const getFontSize = (settings: VisualSettingsModel): number => {
    return settings.styleSettings.fontSize.value;
};

/**
 * Extracts and returns the help-related properties.
 * @param settings The visual settings model.
 * @returns An object with help properties.
 */
export const getShowHelp = (settings: VisualSettingsModel) => {
    const help = settings.layoutSettings.layoutHelp;
    return {
        showHelpIcon: help.showHelpIcon.value,
        showTooltip: help.showTooltip.value,
        showExtendedTooltip: help.showExtendedTooltip.value,
    };
};

/**
 * Extracts all properties related to period steps (day, week, month, etc.).
 * @param settings The visual settings model.
 * @returns An object containing step-related properties.
 */
export const getPeriod = (settings: VisualSettingsModel): stepPeriod => {
    const {
        periodDay: day,
        periodWeek: week,
        periodPay: pay,
        periodMonth: month,
        periodQuarter: quarter,
        periodYear: year,
    } = settings.periodSettings;

    return {
        day: {
            show:  day.showDay.value,
            skip:  day.daySkip.value,
            format: String(day.fmtDay.value),
        },
        week: {
            show: week.showWeek.value,
            skip: week.weekSkip.value,
            format: String(week.fmtWeek.value),
        },
        pay: {
            show: pay.showPay.value,
            skip: pay.paySkip.value,
            format: String(pay.fmtPay.value),
        },
        month: {
            show: month.showMonth.value,
            skip: month.monthSkip.value,
            format: String(month.fmtMonth.value),
        },
        quarter: {
            show: quarter.showQuarter.value,
            skip: quarter.quarterSkip.value,
            format: String(quarter.fmtQuarter.value),
        },
        year: {
            show: year.showYear.value,
            skip: year.yearSkip.value,
            format: String(year.fmtYear.value),

        }
    };
};

/**
 * Gets a simplified date range from the data view.
 * @param dataView The Power BI DataView.
 * @returns A simple date range object.
 */
export const getRange = (dataView: powerbi.DataView): dateRange => {
    const category = dataView.categorical?.categories?.[0];
    if (!category) {
        return { start: null, end: null };
    }
    return getDateValues(category);
};
