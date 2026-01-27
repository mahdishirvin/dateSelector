# Date Selector Slicer Visual

## A compact rich functionality date range filter for Power BI
The [**DateSelector** visual](https://marketplace.microsoft.com/en-us/product/power-bi-visuals/tamblalimited1689730323249.date_range_selector?tab=Overview) is a user-friendly, feature-rich date range filter for Power BI that allows users to quickly and easily filter data based on specific dates or date ranges.

## Key Capabilities of the Date Selector Visual ✨

| Capability | Description |
| :--- | :--- |
| **Easy Range Selection** | Users can select a **single date** or a **range of dates** using a compact, intuitive interface. |
| **Startup Flexibility** | Supports setting a default startup date range that can be configured in three ways: **Forced** (always applied, overriding external filters), **Synced** (reflecting filters from other visuals), or **Selectable** by the user. |
| **Simple Design** | The visual is designed to be **simple and intuitive**. It can be configured down to a **single date picker** by easily hiding unnecessary buttons. |
| **Core Function** | It effectively filters underlying Power BI data based on the chosen date range, working in conjunction with **DAX** to support advanced filtering logic (e.g., non-contiguous date ranges). |

## Anatomy

![Date Range Selector Anatomy](https://github.com/o221/dateSelector/blob/certification/readme_files/Date%20Selector1.png?raw=true "Date Range Selector Anatomy")

---

### With timeline

![Date Range Selector with two level timeline](https://github.com/o221/dateSelector/blob/certification/readme_files/Date%20Selector2.png?raw=true "Date Range Selector Timeline")

---

### Advanced features

![Date Range Selector Advanced Features](https://github.com/o221/dateSelector/blob/certification/readme_files/Date%20Selector3.png?raw=true "Date Range Selector Advanced Features")

---

### Shortcut keys

![Date Range Selector Shortcut Keys](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector4.png?raw=true "Date Range Selector Shortcut Keys")

---

### Layout Options

![Layout Options](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector5.png?raw=true "Layout Options")

 ****

## Summary of Features

### 📅 Date Range Input & Interaction

* **Input Methods:** Dates can be entered via **field inputs** with calendar pickers, **quick action buttons**, or the **range timeline slider**.
    * Date entry is **not limited** to the currently filtered scope.
* **Granularity:** Supports up to **six levels of granularity** on the slider(s), which determines the step size for moving or extending date ranges or for timeline interactions.
* **Dual Timelines (Optional):**
    * The timeline may be shown, hidden (default) or made unavailable to a user.
    * The selected range is optionally shown across two granularity levels.
    * The **Top timeline** is the primary view, set to the primary granularity level.
    * A **Second timeline** shows context and is also an active control for date selection.
* **Quick Action Buttons:** Provides optional buttons for common periods like **Today, This Week, YTD (Year-to-Date),** etc.
    * These buttons are automatically hidden when their represented period falls outside the currently available date scope.
* **Range Scope:**
     * The timeline shows the **scope** of the available date range (which may be set using the Power BI filter panel).
---

### Start-up & State Management

* **Forced Startup:** The initial state can be **forced** to override the default persisted state or sync behavior.
* **Pre-set Range Access:** The range configured as the start-up range is easily accessible from the **icon separating the range** (date inputs) unless you chose a single date.
* **Opening State (Pre-set vs. Default):** The slicer opens in its configured pre-set state:
    * **Default:** Behaves like a typical Power BI visual, restoring the last known state.
    * **Pre-sets:** Can be configured to specific relative dates (e.g., Today, YTD, This Month, Last Week). Sync and bookmarks remain precedent.
    * **Forced pre-sets:** When pre-set is forced, start-up range overrides default behaviour. Bookmarks work after forced pre-set.
* **Sync Behavior:** The slicer can be synced with the last page viewed.
    * **Conflict Resolution:** When a **forced pre-set range** is active, sync behavior is **not respected** on the pages where the pre-set is applied.
    * **Bookmark Priority:** **Bookmarks are always respected** and override the forced pre-set ranges after the initial load.

### ⌨️ Usability & Help

* **Keyboard Shortcuts:** Enables fast shortcuts when the range slider is active.
* **Help Tooltip:** Includes an optional descriptive tooltip feature.

## Installation
To use the DateSelector visual, you can import it into your Power BI report by following these steps:

Download the visual from [Microsoft Marketplace](https://marketplace.microsoft.com/en-us/product/power-bi-visuals/tamblalimited1689730323249.date_range_selector?tab=Overview) and import it into Power BI.

1. Open the report in Power BI Desktop.
2. In the Visualizations pane, select the ellipsis (...).
3. Select "Import from file."
4. Select downloaded "DateSelector" file.
5. Click on the visual and select "Add."

## 🚀 Usage: Getting Started with the Date Selector

To begin, simply add the **Date Selector visual** to your report canvas and connect it to your relevant date field.

Once connected, the visual allows users to:

* **Filter Instantly:** Select a date range and immediately filter the underlying data.
* **Zero-Touch Filtering:** For common reports, often **no interaction is needed** because the desired date range is automatically applied via the configured forced **pre-set start-up state**.
* **Power User Efficiency:** Frequent users can leverage **shortcut keys** for extremely efficient and rapid date range selection.

## Example
A sample Power BI model with a detailed help page is provided [here.](https://github.com/o221/dateSelector/blob/main/dist/date%20selector%20doc.pbix) Download it and open with Power BI Desktop.

## Version
The current version of the DateSelector visual is v3.2025.11.12.

## Limitations
The DateSelector visual currently supports only English language. Translations for French, Spanish and Dutch are superficially done using copilot. To add languages:
1. Download the repo and add your language [string resources](https://github.com/o221/dateSelector/blob/main/stringResources).
2. Update [localeutils.tsx](https://github.com/o221/dateSelector/blob/main/src/localeutils.tsx) with the appropriate stings for date-fns.
3. Run pbiviz package -certification-audit to compile the visual.

## Support
If you encounter any issues while using the DateSelector visual, please visit the [support page](https://github.com/o221/dateSelector/issues) for assistance. Alternatively add any comments or feature requests on the [discussion page](https://github.com/o221/dateSelector/discussions)

## License
The DateSelector visual is released under the MIT License. Please refer to the LICENSE file for more information.

## Acknowledgments
We would like to thank the Power BI community for their support and feedback in the development of the DateSelector visual.
