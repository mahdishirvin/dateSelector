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
import { IFilterColumnTarget, AdvancedFilter } from "powerbi-models";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { VisualState, dateRange, dateCardProps } from "./interface";
import { mapOptionsToState, restoreRangeFilter } from "./optionsMapper";
import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
import isEqual from "lodash.isequal";
import { LocalizationContext, DateFnsLocaleProvider } from "./localeutils";
import { ReactVisual } from "./reactUtils";
import { HotkeysProvider } from "react-hotkeys-hook";
import { equalRanges, toDateRange } from "./dateutils";
import "../assets/visual.less";
/**
 * The DateSelector class is the main entry point for the visual. It manages the
 * lifecycle of the visual and handles communication between Power BI and the React component.
 * It now inherits from ReactVisual to abstract away the React rendering debugic.
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
  // We now use a single state variable to track the applied filter, simplifying the debugic.
  private currentFilter: dateRange | null = null;
  // private persistedFilter: dateRange | null = null;
  // private bookmarkFilter: dateRange | null = null;
  private isApplyingFilter = false;
  private pendingFilter: dateRange | null = null;
  // A flag to prevent a redundant UI update when the visual applies its own filter.
  private isUpdatingFromVisual: boolean = false;
  // A flag to ensure we only apply the initial state once.
  private initialLoadComplete: boolean = false;

  private static readonly BOOKMARK_OBJECT = "general";
  private static readonly BOOKMARK_PROPERTY = "filter";
  private static readonly filterObjectProperty = {
    objectName: "general",
    propertyName: "filter",
  };
  private lastKnownFilterSignature: string | null = null;
  private bookmarkDetectionWindow = 1000; // 1 second grace period after load
  private lastUpdateTime = 0;
  private maybeBookmarkActive = false;

  // simplified signature generator
  private getFilterSignature(options: VisualUpdateOptions): string {
    const filters =
      options.jsonFilters?.map((f) => JSON.stringify(f)).join("|") ?? "";
    return filters;
  }

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
   * It handles the core debugic of the visual.
   * @param options The visual update options from Power BI.
   */

  // In the following update function, bookmark always wins is nto happening on a page with forced start up value set..
  public update(options: VisualUpdateOptions) {
    try {
      this.events.renderingStarted(options);
      // prevent infinite loops when the visual itself applies a filter
      if (this.isUpdatingFromVisual) {
        this.isUpdatingFromVisual = false;
        this.events.renderingFinished(options);
        return;
      }

      // 2. DATA VIEW AND SETTINGS LOAD (CRITICAL REORDERING)
      // Check for data view change
      const shouldGetSettings = !isEqual(options.dataViews[0], this.dataView);
      this.dataView = options.dataViews[0];

      // Load settings FIRST if data view changed or if it's the very first time.
      // This ensures this.state is always fresh.
      if (shouldGetSettings || !this.dataView) {
        this.loadVisualSettings(options);
      }

      // 3. VALIDATION (Now that this.state exists)
      if (!this.isValidDataView(options)) {
        // Use this.initialiseVisualState() to set a default landingOff state
        this.initialiseVisualState();
        this.updateReactContainers({ landingOff: false }); // Show landing page
        this.events.renderingFinished(options);
        return;
      }

      // 4. LANDING PAGE OFF (Now that this.state is guaranteed to exist and have data)
      // If we reach here, we have a valid data view. Turn the landing page off.
      if (!this.state.landingOff) {
        this.state.landingOff = true;
        // Immediate UI update to dismiss landing page (before long filter debugic)
        this.updateReactContainers({ landingOff: true });
      }

      const now = Date.now();
      const filterSignature = this.getFilterSignature(options);
      const isFilterChange = filterSignature !== this.lastKnownFilterSignature;
      const elapsed = now - this.lastUpdateTime;
      this.lastUpdateTime = now;

      console.debug("Update called. isFilterChange:", isFilterChange);

      // 👇 detect bookmark-like condition
      if (
        isFilterChange &&
        elapsed < this.bookmarkDetectionWindow &&
        this.initialLoadComplete
      ) {
        this.maybeBookmarkActive = true;
      } else {
        this.maybeBookmarkActive = false;
      }
      console.debug("maybeBookmarkActive:", this.maybeBookmarkActive);
      // store signature for next pass
      this.lastKnownFilterSignature = filterSignature;

      // normalise host filter from options (may be null)
      const hostFilter = restoreRangeFilter(options);

      let resolvedFilter: dateRange | null = null;
      let shouldApplyFilter = false;

      if (this.maybeBookmarkActive && hostFilter) {
        // ✅ inferred bookmark: always wins
        resolvedFilter = hostFilter;

        console.debug("Rule chosen: HOST (bookmark)");
      } else if (
        this.state.settings.forceStartRange &&
        !this.initialLoadComplete
      ) {
        // ✅ forced startup range overrides persisted
        resolvedFilter = this.state.settings.startupFilter;
        shouldApplyFilter = true;

        console.debug("Rule chosen: FORCE (startup)");
      } else if (hostFilter) {
        // ✅ persisted filter (normal restore)
        resolvedFilter = hostFilter;
      } else if (this.state.settings.startupFilter) {
        resolvedFilter = this.state.settings.startupFilter;
        shouldApplyFilter = !this.initialLoadComplete;

        console.debug("Rule chosen: STARTUP (no host)");
      }

      // ---------------------------------------------------------
      // Apply filter if this debugic decided we should push one to host
      // (e.g. forced startup or startup default on first load/settings-changed)
      // ---------------------------------------------------------
      if (shouldApplyFilter && resolvedFilter) {
        this.applyDateFilter(resolvedFilter);
        // treat it as pending until host echoes back
        this.currentFilter = resolvedFilter;

        // 🔥 Update the UI with the *new* filter state BEFORE returning
        this.updateReactContainers({
          ...this.state.settings,
          dates: this.currentFilter,
          landingOff: this.state.landingOff, // Pass the correct landing state
        });

        this.initialLoadComplete = true;
        this.events.renderingFinished(options);
        console.debug("Applied filter:", resolvedFilter);
        return;
      }

      // update React UI
      this.currentFilter = resolvedFilter ?? this.currentFilter;
      this.updateReactContainers({
        ...this.state.settings,
        dates: this.currentFilter,
        landingOff: this.state.landingOff,
      });

      this.initialLoadComplete = true;
      this.events.renderingFinished(options);
    } catch (e) {
      console.error("Update failed:", e);
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

    // Correcting the mapOptionsToState call to match the provided signature.
    const newVisualState = mapOptionsToState(
      options,
      this.formattingSettings,
      this.initialLoadComplete
    );

    this.state = {
      ...this.state,
      ...newVisualState,
    };

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
   * Returns the visual's properties for the formatting pane.
   * @param options The enumeration options.
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstanceEnumeration {
    let objectEnumeration: VisualObjectInstance[] = [];

    if (options.objectName === DateSelector.BOOKMARK_OBJECT) {
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
    if (!this.state?.category) return;

    const dtes = toDateRange(dates);

    // Mark pending; do NOT push to React here — DateRangeCard already updated UI locally.
    this.isApplyingFilter = true;
    this.pendingFilter = {
      start: new Date(dtes.start),
      end: new Date(dtes.end),
    };

    this.visualHost.applyJsonFilter(
      this.createFilter(dtes.start, dtes.end, this.state.category.filterTarget),
      DateSelector.filterObjectProperty.objectName,
      DateSelector.filterObjectProperty.propertyName,
      dates.start && dates.end
        ? powerbi.FilterAction.merge
        : powerbi.FilterAction.remove
    );
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
    // The dates are already Date objects, so we can directly use toJSON().
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
