"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import IColorPalette = powerbi.extensibility.IColorPalette;
import DataView = powerbi.DataView;
import DataViewPropertyValue = powerbi.DataViewPropertyValue;
import { IFilterColumnTarget, AdvancedFilter } from "powerbi-models";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { VisualState, dateRange, dateCardProps } from "./interface";
import { mapOptionsToState } from "./optionsMapper";
import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
import isEqual from "lodash.isequal";
import { LocalizationContext, DateFnsLocaleProvider } from "./localeutils";
import { ReactVisual } from "./reactUtils";
import { HotkeysProvider } from "react-hotkeys-hook";

/**
 * The DateSelector class is the main entry point for the visual. It manages the
 * lifecycle of the visual and handles communication between Power BI and the React component.
 * It now inherits from ReactVisual to abstract away the React rendering logic.
 */
export class DateSelector extends ReactVisual implements IVisual {
  private visualHost: IVisualHost;
  private events: IVisualEventService;
  private selectionManager: powerbi.extensibility.ISelectionManager;
  private localizationManager: ILocalizationManager;
  private formattingSettings: VisualSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private dataView: DataView;
  private colorPalette: IColorPalette;
  private colorHelper: ColorHelper;
  private state: VisualState;
  private locale: string;
  // We now use a single state variable to track the applied filter, simplifying the logic.
  private currentFilter: dateRange;
  // We keep track of the filter being applied to prevent update loops.
  private isApplyingFilter: boolean = false;
  // A flag to ensure we only apply the initial state once.
  private initialLoadComplete: boolean = false;

  private static readonly BOOKMARK_OBJECT = "general";
  private static readonly BOOKMARK_PROPERTY = "filter";
  private static readonly filterObjectProperty = {
    objectName: "general",
    propertyName: "filter",
  };

  /**
   * The constructor initializes visual properties and the React root.
   * @param options The visual constructor options from Power BI.
   */
  constructor(options: VisualConstructorOptions) {
    // Call the parent constructor from ReactVisual to initialize the React component and root
    super(options);
    this.initializeVisualProperties(options);
    this.initializeReact();
    this.localizationManager = options.host.createLocalizationManager();
    this.formattingSettingsService = new FormattingSettingsService(
      this.localizationManager
    );
  }

  /**
   * Initializes visual-specific properties and services.
   * @param options The visual constructor options.
   */
  protected initializeVisualProperties(
    options: VisualConstructorOptions
  ): void {
    this.visualHost = options.host;
    this.locale = options.host.locale;
    this.selectionManager = options.host.createSelectionManager();
    this.events = options.host.eventService;
    this.colorPalette = this.visualHost.colorPalette;
    this.colorHelper = new ColorHelper(this.colorPalette);
  }

  /**
   * Initializes the React component by passing the main component and the data handler to the base class.
   */
  protected initializeReact(): void {
    const VisualComponent = (props: any) => (
      <LocalizationContext.Provider value={this.localizationManager}>
        <DateFnsLocaleProvider languageCode={this.locale}>
          <HotkeysProvider>
            <DateRangeCard {...props} />
          </HotkeysProvider>
        </DateFnsLocaleProvider>
      </LocalizationContext.Provider>
    );
    super.initializeReact(VisualComponent, this.applyDateFilter);
  }

  /**
   * The update method is called whenever the visual's data or settings change.
   * It handles the core logic of the visual.
   * @param options The visual update options from Power BI.
   */
  public update(options: VisualUpdateOptions) {
    try {
      this.events.renderingStarted(options);

      // Prevent a filter-apply loop. If a filter is being applied,
      // we should ignore subsequent update calls until it's done.
      if (this.isApplyingFilter) {
        this.events.renderingFinished(options);
        return;
      }

      const defaultLandingProps: dateCardProps = { landingOff: false };

      if (!this.isValidDataView(options)) {
        this.initialiseVisualState();
        this.updateReactContainers(defaultLandingProps);
        this.events.renderingFinished(options);
        return;
      }

      // Fix for the `isEqual` typo. We now correctly compare the incoming
      // dataView with the stored dataView to determine if settings need to be reloaded.
      const shouldGetSettings = !isEqual(options.dataViews[0], this.dataView);
      this.dataView = options.dataViews[0];

      if (shouldGetSettings) {
        this.loadVisualSettings(options);
      }

      const persistedFilter = this.getPersistedFilter(options);
      let datesToApply: dateRange;

      if (persistedFilter) {
        // If a bookmark has a filter, we use that.
        datesToApply = persistedFilter;
        // console.log("Restoring filter from bookmark:", datesToApply);
      } else if (!this.initialLoadComplete) {
        // If there's no bookmark, we apply the initial settings from the properties pane.
        datesToApply = this.state?.settings?.dates;
        // console.log("Applying initial filter from settings:", datesToApply);
      } else if (this.state.settings.dates !== this.currentFilter) {
        // If the user has changed the dates in the properties pane,
        // we apply those changes.
        datesToApply = this.state.settings.dates;
        // console.log("Applying updated filter from settings:", datesToApply);
      } else {
        // If the visual has already loaded and there's no bookmark,
        // we'll keep the currently applied filter.
        datesToApply = this.currentFilter;
        // console.log("Keeping existing filter:", datesToApply);
      }

      // This condition is now simpler: apply a filter if it's the first time loading,
      // or if the dates to apply are different from the ones currently applied.
      // Using `isEqual` on the date objects is the most reliable way to check for a change.
      const isFilterChanged = !isEqual(this.currentFilter, datesToApply);

      if (isFilterChanged && datesToApply?.start && datesToApply?.end) {
        this.applyDateFilter(datesToApply);
      }

      // Always update the React component with the correct settings and dates.
      const currentSettings = this.state?.settings || defaultLandingProps;
      this.updateReactContainers({ ...currentSettings, dates: datesToApply });

      this.initialLoadComplete = true;
      this.events.renderingFinished(options);
    } catch (e) {
      console.error(e);
      this.events.renderingFailed(options);
    }
  }

  /**
   * A helper method to validate the data view.
   * @param options The visual update options.
   * @returns True if the data view is valid, false otherwise.
   */
  private isValidDataView(options: VisualUpdateOptions): boolean {
    return (
      options &&
      options.dataViews &&
      options.dataViews.length > 0 &&
      options.dataViews[0].metadata &&
      options.dataViews[0].metadata.columns &&
      options.dataViews[0].metadata.columns.length > 0
    );
  }

  /**
   * A helper method to initialize the visual state.
   */
  private initialiseVisualState(): void {
    this.dataView = null;
    this.currentFilter = null;
    this.initialLoadComplete = false;
  }

  /**
   * Loads the visual settings from the data view.
   * @param options The visual update options.
   */
  private loadVisualSettings(options: VisualUpdateOptions): void {
    this.formattingSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualSettingsModel,
        options.dataViews[0]
      );

    // 1. Get the new visual state from the mapper.
    // The mapper ensures that the bookmark data is prioritized.
    const newVisualState = mapOptionsToState(
      options,
      this.formattingSettings,
      this.initialLoadComplete
    );

    // 2. IMPORTANT: Create a new state object to force a re-render.
    // We are not just modifying properties on the existing object.
    this.state = {
      ...this.state, // Copy existing state
      ...newVisualState, // Overwrite with new values from the bookmark
    };

    // // We now pass `this.initialLoadComplete` to `mapOptionsToState`
    // // so it can handle the initial state.
    // this.state = mapOptionsToState(
    //     options,
    //     this.formattingSettings,
    //     this.initialLoadComplete
    // );
    if (this.colorHelper.isHighContrast) {
      const foregroundColor =
        this.colorHelper.getHighContrastColor("foreground");
      const backgroundColor =
        this.colorHelper.getHighContrastColor("background");
      const themeMode = tinycolor(backgroundColor).isDark() ? "dark" : "light";
      Object.assign(this.state.settings, {
        fontColor: foregroundColor,
        themeColor: foregroundColor,
        themeMode,
      });
    }
  }

  /**
   * A helper method to get the persisted filter from bookmarks.
   * @param options The visual update options.
   * @returns The persisted date range or null if not found.
   */
  private getPersistedFilter(options: VisualUpdateOptions): dateRange | null {
    const objects = options.dataViews?.[0]?.metadata?.objects;
    const persistedFilterValue = objects?.[DateSelector.BOOKMARK_OBJECT]?.[
      DateSelector.BOOKMARK_PROPERTY
    ] as DataViewPropertyValue;

    if (typeof persistedFilterValue === "string") {
      try {
        const persistedState = JSON.parse(persistedFilterValue);
        if (persistedState?.filter?.start && persistedState.filter?.end) {
          console.log("Restoring persisted filter:", persistedState.filter);
          return {
            start: new Date(persistedState.filter.start),
            end: new Date(persistedState.filter.end),
          };
        }
      } catch (e) {
        console.error("Failed to parse persisted bookmark state:", e);
      }
    }
    return null;
  }

  /**
   * Returns the visual's properties for the formatting pane.
   * @param options The enumeration options.
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstanceEnumeration {
    let objectEnumeration: VisualObjectInstance[] = [];

    if (options.objectName === DateSelector.BOOKMARK_OBJECT) {
      // We now use the single `currentFilter` variable to persist the state.
      const bookmarkState = {
        filter: this.currentFilter || { start: null, end: null },
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

  /**
   * Applies a new filter to the date column.
   * This method is a public arrow function to ensure `this` context is preserved.
   * @param dates The date range to filter by.
   */
  public applyDateFilter = (dates: dateRange): void => {
    if (this.state?.category) {
      this.isApplyingFilter = true;
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
      // This `setTimeout` is a common anti-pattern in Power BI custom visuals,
      // but we'll leave it as-is since it's part of the original code's design.
      // The `isApplyingFilter` flag check in the `update` method is what truly prevents the loop.
      setTimeout(() => {
        this.isApplyingFilter = false;
      }, 0);

      // The single source of truth for the applied filter is now `currentFilter`.
      this.currentFilter = dates;

      // We also update the settings to reflect the new dates.
      if (this.state.settings) {
        this.state.settings.dates = dates;
      }
    } else {
      console.error("State is undefined, cannot apply filter.");
    }
  };

  /**
   * Creates an advanced filter object for Power BI.
   * @param startDate The start date for the filter.
   * @param endDate The end date for the filter.
   * @param filterTarget The filter target object.
   * @returns An `AdvancedFilter` instance.
   */
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
   * Returns the formatting model for the properties pane.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}
