/*
 * Power BI Visuals
 *
 * Copyright (c) Microsoft Corporation
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the ""Software""), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use strict";

import powerbi from "powerbi-visuals-api";

import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

// Formatting Options Panel
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";

import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { IFilterColumnTarget, AdvancedFilter } from "powerbi-models";

import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewPropertyValue = powerbi.DataViewPropertyValue;

import { VisualState, dateRange, dateCardProps } from "./interface";

import { ReactVisual } from "./reactUtils";
import { mapOptionsToState, optionsAreValid } from "./optionsMapper";

import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
import isEqual from "lodash.isequal";
import "../assets/visual.less";
import { LocalizationContext, DateFnsLocaleProvider } from "./localeutils";

export class DateSelector extends ReactVisual implements IVisual {
  private visualHost: IVisualHost;
  private events: IVisualEventService;

  // Added selectionManager and bookmark properties
  private selectionManager: powerbi.extensibility.ISelectionManager;
  private static readonly BOOKMARK_OBJECT = "general";
  private static readonly BOOKMARK_PROPERTY = "filter";

  // formatiing panel
  private localizationManager: ILocalizationManager;
  private formattingSettings: VisualSettingsModel;
  private formattingSettingsService: FormattingSettingsService;

  private dataView: DataView;

  private colorPalette: IColorPalette;
  private colorHelper: ColorHelper;

  private state: VisualState;
  private locale: string;

  private isFirstEverLoad: boolean = true;
  private filterAppliedOnce: boolean = false;

  private static filterObjectProperty: {
    objectName: string;
    propertyName: string;
  } = { objectName: "general", propertyName: "filter" };

  // selected filter range determined from visual
  public filter: dateRange;
  public lastFilter: dateRange;
  public initialised: boolean;
  public lastSettings: dateCardProps;

  constructor(options: VisualConstructorOptions) {
    super(options);
    this.initializeVisualProperties(options);
    this.initializeReact();
    this.localizationManager = options.host.createLocalizationManager();
    this.formattingSettingsService = new FormattingSettingsService(
      this.localizationManager
    );
    // Initialize this.filter to a valid object to prevent null/undefined issues
    this.filter = { start: null, end: null };
  }

  protected initializeVisualProperties(options: VisualConstructorOptions) {
    this.visualHost = options.host;
    this.locale = options.host.locale;
    this.selectionManager = options.host.createSelectionManager();
    this.events = options.host.eventService;
    this.colorPalette = this.visualHost.colorPalette;
    this.colorHelper = new ColorHelper(this.colorPalette);
  }

  protected initializeReact() {
    // A simple wrapper component is created here to provide the context and locale.
    const VisualComponent = (props: any) => (
      <LocalizationContext.Provider value={this.localizationManager}>
        <DateFnsLocaleProvider languageCode={this.locale}>
          <DateRangeCard {...props} />
        </DateFnsLocaleProvider>
      </LocalizationContext.Provider>
    );
    // The simplified ReactVisual.initializeReact is called here.
    super.initializeReact(VisualComponent, this.applyDateFilter);
  }

  public update(options: VisualUpdateOptions) {
    try {
      this.events.renderingStarted(options);

      // Default props for when there is no data view or state isn't initialized
      const defaultLandingProps: dateCardProps = {
        landingOff: false,
      };

      // Handle the case where the data field is removed or not fully populated
      if (
        !options ||
        !options.dataViews ||
        options.dataViews.length === 0 ||
        !options.dataViews[0].metadata ||
        !options.dataViews[0].metadata.columns ||
        options.dataViews[0].metadata.columns.length === 0
      ) {
        this.initialised = false;
        this.dataView = null;
        this.lastSettings = null;
        this.lastFilter = null;
        this.updateReactContainers(defaultLandingProps);
        this.events.renderingFinished(options);
        return;
      }

      // If a data view is present and fully populated, proceed with full initialization/update logic.
      const existingDataView = this.dataView;
      this.dataView = options.dataViews[0];

      const shouldGetSettings: boolean = !(
        isEqual(existingDataView, this.dataView) && this.initialised
      );

      if (shouldGetSettings) {
        this.formattingSettings =
          this.formattingSettingsService.populateFormattingSettingsModel(
            VisualSettingsModel,
            options.dataViews[0]
          );

        this.state = mapOptionsToState(
          options,
          this.formattingSettings,
          this.initialised
        );

        if (this.colorHelper.isHighContrast) {
          const foregroundColor =
            this.colorHelper.getHighContrastColor("foreground");
          const backgroundColor =
            this.colorHelper.getHighContrastColor("background");
          const themeMode = tinycolor(backgroundColor).isDark()
            ? "dark"
            : "light";
          Object.assign(this.state.settings, {
            fontColor: foregroundColor,
            themeColor: foregroundColor,
            themeMode,
          });
        }
      }

      // Use a defensive check for this.state before accessing its properties
      const currentSettings =
        this.state && this.state.settings
          ? this.state.settings
          : defaultLandingProps;

      let persistedFilter: dateRange = null;
      const objects =
        options.dataViews &&
        options.dataViews[0] &&
        options.dataViews[0].metadata &&
        options.dataViews[0].metadata.objects;
      const persistedFilterValue =
        objects &&
        objects[DateSelector.BOOKMARK_OBJECT] &&
        (objects[DateSelector.BOOKMARK_OBJECT][
          DateSelector.BOOKMARK_PROPERTY
        ] as DataViewPropertyValue);

      let hasPersistedState = false;

      if (typeof persistedFilterValue === "string") {
        try {
          const persistedState = JSON.parse(persistedFilterValue as string);
          hasPersistedState = true; // we found saved data

          if (typeof persistedState.filterAppliedOnce === "boolean") {
            this.filterAppliedOnce = persistedState.filterAppliedOnce;
          }

          if (
            persistedState.filter &&
            persistedState.filter.start &&
            persistedState.filter.end
          ) {
            persistedFilter = {
              start: new Date(persistedState.filter.start),
              end: new Date(persistedState.filter.end),
            };
          }
        } catch (e) {
          console.error("Failed to parse persisted bookmark state:", e);
        }
      }

      // If no persisted state found, this is first-ever load
      this.isFirstEverLoad = !hasPersistedState;

      let datesToApply: dateRange;
      if (persistedFilter) {
        datesToApply = persistedFilter;
        currentSettings.dates = persistedFilter;
      } else {
        datesToApply = currentSettings.dates;
      }

      // Only call applyDateFilter if we haven't applied yet OR dates actually changed
      const isFilterChanged =
        !this.lastFilter ||
        String(this.lastFilter.start) !== String(datesToApply?.start) ||
        String(this.lastFilter.end) !== String(datesToApply?.end);

      if (
        this.isFirstEverLoad ||
        (!this.filterAppliedOnce && datesToApply?.start && datesToApply?.end) ||
        isFilterChanged
      ) {
        this.applyDateFilter(datesToApply);
      }

      // Now that the filter is applied, we can set our internal state flags.
      this.initialised = true;
      this.lastSettings = currentSettings;

      // Finally, render the React component with the determined settings.
      this.updateReactContainers(currentSettings);
      this.events.renderingFinished(options);
    } catch (e) {
      console.error(e);
      this.events.renderingFailed(options);
    }
  }

  // --- START BOOKMARK PERSISTENCE ---
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstanceEnumeration {
    let objectEnumeration: VisualObjectInstance[] = [];

    if (options.objectName === DateSelector.BOOKMARK_OBJECT) {
      // Defensive check before stringifying to ensure the object is valid
      const bookmarkState = {
        filter:
          this.filter && this.filter.start && this.filter.end
            ? this.filter
            : { start: null, end: null },
        filterAppliedOnce: this.filterAppliedOnce || false,
      };

      const instance: VisualObjectInstance = {
        objectName: DateSelector.BOOKMARK_OBJECT,
        displayName: "Bookmark Filter",
        selector: null,
        properties: {
          [DateSelector.BOOKMARK_PROPERTY]: JSON.stringify(bookmarkState),
        },
      };
      objectEnumeration.push(instance);
    }

    return objectEnumeration;
  }
  // --- END BOOKMARK PERSISTENCE ---

  // Apply the filter
  public applyDateFilter = (dates: dateRange): void => {
    if (this.state && this.state.category) {
      this.visualHost.applyJsonFilter(
        this.createFilter(
          dates.start,
          dates.end,
          this.state.category.filterTarget
        ),
        DateSelector.filterObjectProperty.objectName,
        DateSelector.filterObjectProperty.propertyName,
        dates.start && dates.end
          ? powerbi.FilterAction.merge
          : powerbi.FilterAction.remove
      );

      this.lastFilter = dates;
      this.state.settings.dates = dates;
      this.lastSettings = this.state.settings;
      this.filterAppliedOnce = true; // persist this in bookmark
      this.isFirstEverLoad = false;

    } else {
      console.error("State is undefined, cannot apply filter.");
    }
  };

  // Create the filter
  public createFilter(
    startDate: Date,
    endDate: Date,
    filterTarget: IFilterColumnTarget
  ): AdvancedFilter {
    return new AdvancedFilter(
      filterTarget,
      "And",
      {
        operator: "GreaterThanOrEqual",
        value: startDate ? startDate.toJSON() : null,
      },
      {
        operator: "LessThanOrEqual",
        value: endDate ? endDate.toJSON() : null,
      }
    );
  }

  /**
   * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Than populate properties pane.
   * This method is called once every time we open properties pane or when the user edit any format property.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}
