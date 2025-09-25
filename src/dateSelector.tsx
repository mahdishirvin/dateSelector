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
  private currentFilter: dateRange | null = null;
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
// ... (imports and class definition)

// ... (imports and class definition)

public update(options: VisualUpdateOptions) {
    try {
        this.events.renderingStarted(options);

        // prevent infinite loops when the visual itself applies a filter
        if (this.isUpdatingFromVisual) {
            this.isUpdatingFromVisual = false;
            this.events.renderingFinished(options);
            return;
        }

        // if no valid dataview, initialise blank state
        if (!this.isValidDataView(options)) {
            this.initialiseVisualState();
            this.updateReactContainers({ landingOff: false });
            this.events.renderingFinished(options);
            return;
        }

        // update settings if dataview changed
        const shouldGetSettings = !isEqual(options.dataViews[0], this.dataView);
        this.dataView = options.dataViews[0];
        if (shouldGetSettings) this.loadVisualSettings(options);

        const hostFilter = restoreRangeFilter(options);
        let resolvedFilter: dateRange | null = null;
        let shouldApplyFilter = false;

        // ---------------------------------------------------------
        // Rule hierarchy
        // ---------------------------------------------------------

        // 1. Forced startup date range (first load or when settings changed)
        if ((!this.initialLoadComplete || shouldGetSettings) && this.state.settings.forceStartRange) {
            resolvedFilter = this.state.settings.startupFilter;
            shouldApplyFilter = true; // push forced filter into host
        }
        // 2. Bookmark or persisted host filter always overrides forced startup
        else if (hostFilter) {
            resolvedFilter = hostFilter;
        }
        // 3. Synced slicer behaviour
        else if (this.state.settings.startRange === "sync") {
            resolvedFilter =
                this.currentFilter ?? this.state.settings.startupFilter;
        }
        // 4. Startup default (if defined)
        else if (this.state.settings.startupFilter) {
            resolvedFilter = this.state.settings.startupFilter;
            // apply if first load OR settings just changed
            shouldApplyFilter = !this.initialLoadComplete || shouldGetSettings;
        }
        // 5. Standard Power BI behaviour
        else {
            resolvedFilter = this.currentFilter;
        }

        // ---------------------------------------------------------
        // Apply filter if needed
        // ---------------------------------------------------------
        if (shouldApplyFilter && resolvedFilter) {
            this.applyDateFilter(resolvedFilter);
            this.currentFilter = resolvedFilter;
            this.initialLoadComplete = true;
            this.events.renderingFinished(options);
            return;
        }

        // ---------------------------------------------------------
        // Echo suppression (prevent loops when applying filters)
        // ---------------------------------------------------------
        if (this.isApplyingFilter) {
            if (equalRanges(hostFilter, this.pendingFilter)) {
                this.currentFilter = hostFilter;
                this.pendingFilter = null;
                this.isApplyingFilter = false;
            } else {
                this.currentFilter = hostFilter;
                this.isApplyingFilter = false;
            }
        } else {
            this.currentFilter = resolvedFilter;
        }

        // ---------------------------------------------------------
        // Update React UI
        // ---------------------------------------------------------
        if (this.currentFilter) {
            this.updateReactContainers({
                ...this.state.settings,
                dates: this.currentFilter,
            });
        }

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