# Date Selector Slicer Visual

## A compact rich functionality date range filter for Power BI
The [**DateSelector** visual](https://github.com/o221/dateSelector/blob/main/dist/dateSel4A1A0033E6F54D1B809B6E51058D54E3.3.2025.11.03.pbiviz) is a user-friendly, feature-rich date range filter for Power BI that allows users to quickly and easily filter data based on specific dates or date ranges.

## Key Capabilities of the Date Selector Visual ✨

| Capability | Description |
| :--- | :--- |
| **Easy Range Selection** | Users can select a **single date** or a **range of dates** using a compact, intuitive interface. |
| **Startup Flexibility** | Supports setting a default startup date range that can be configured in three ways: **Forced** (always applied, overriding external filters), **Synced** (reflecting filters from other visuals), or **Selectable** by the user. |
| **Simple Design** | The visual is designed to be **simple and intuitive**. It can be configured down to a **single date picker** by easily hiding unnecessary buttons. |
| **Core Function** | It effectively filters underlying Power BI data based on the chosen date range, working in conjunction with **DAX** to support advanced filtering logic (e.g., non-contiguous date ranges). |

## Anatomy

![Date Range Selector Anatomy](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector1.png?raw=true "Date Range Selector Anatomy")

### With dual timeline showing

![Date Range Selector with two level timeline](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector2.png?raw=true "Date Range Selector Timeline")

### Advanced features

![Date Range Selector Advanced Features](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector3.png?raw=true "Date Range Selector Advanced Features")

### Shortcut keys

![Date Range Selector Shortcut Keys](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector4.png?raw=true "Date Range Selector Shortcut Keys")

### Layout Options

![Layout Options](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector5.png?raw=true "Layout Options")

 ****

## Summary of Features

### 📅 Date Range Input & Interaction

* **Input Methods:** Dates can be entered via **field input**, **quick action buttons**, or the **range timeline slider**.
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

### 🚀 Start-up & State Management

* **Forced Startup:** The initial state can be **forced** to override the default persisted state or sync behavior.
* **Pre-set Range Access:** The range configured as the start-up value is easily accessible from the **icon separating the range** (date inputs).
* **Opening State (Pre-set vs. Default):** The slicer opens in its configured pre-set state:
    * **Default:** Behaves like a typical Power BI visual, restoring the last known state.
    * **Pre-sets:** Can be configured to specific relative dates (e.g., Today, YTD, This Month, Last Week).
* **Sync Behavior:** The slicer can be synced with the last page viewed.
    * **Conflict Resolution:** When a **forced pre-set range** is active, sync behavior is **not respected** on the pages where the pre-set is applied.
    * **Bookmark Priority:** **Bookmarks are always respected** and override the forced pre-set ranges after the initial load.

### ⌨️ Usability & Help

* **Keyboard Shortcuts:** Enables fast shortcuts when the range slider is active.
* **Help Tooltip:** Includes an optional descriptive tooltip feature.

## Installation
To use the DateSelector visual, you can import it into your Power BI report by following these steps:

Download the visual from [dist](https://github.com/o221/dateSelector/blob/main/dist) and import it into Power BI using the "Import from file" option.

1. Open the report in Power BI Desktop.
2. In the Visualizations pane, select the ellipsis (...).
3. Select "Import from file."
4. Select downloaded "DateSelector" file.
5. Click on the visual and select "Add."

## Usage
To use the DateSelector visual, add it to your report canvas and connect it to the relevant date field. Users can then use the visual to select a date range and filter data accordingly. Often the ther need not touch the visual because the wanted date is pre-set.

## Example
A sample Power BI model with a detailed help page is provided [here.](https://github.com/o221/dateSelector/blob/main/dist/date%20selector%20doc.pbix) Download it and open with Power BI Desktop.

## Version
The current version of the DateSelector visual is v3.2025.11.03.

## Limitations
The DateSelector visual currently supports only English language. Internationalisation is not yet planned.

## Support
If you encounter any issues while using the DateSelector visual, please visit the [support page](https://github.com/o221/dateSelector/issues) for assistance. Alternatively add any comments or feature requests on the [discussion page](https://github.com/o221/dateSelector/discussions)

## License
The DateSelector visual is released under the MIT License. Please refer to the LICENSE file for more information.

## Acknowledgments
We would like to thank the Power BI community for their support and feedback in the development of the DateSelector visual.
