/*
This component represents a date range card that displays a timeline of dates.
It receives several props to customize its behavior and appearance.
@param {dateCardProps} props - An object containing the props passed to this component.
@returns {JSX.Element} A JSX element that renders the date range card.
*/
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { ThemeProvider } from "@mui/material/styles";
import { SetTheme } from "./settheme";
import { useHotkeys } from "react-hotkeys-hook";
import TopRow from "./toprow";
import RangeSlider from "./rangeslider";
import { dateCardProps, dateRange } from "../interface";
import { DateMoveKeys } from "./datemovekeys";
import { Increment, equalRanges } from "../dateutils";
import { HelpProvider } from "./helpprovider";
import LandingPage from "./landingpage";
import { compareAsc, format } from "date-fns";
import { useLocalization } from "../localeutils";

export default function DateRangeCard(props: dateCardProps) {
  // If the landing page is not disabled, render it and exit early.
  if (!props.landingOff) {
    return <LandingPage />;
  }

  // Use useState to manage the UI's date state, initialized from props.
  const [currentDates, setCurrentDates] = useState<dateRange>(props.dates);

  // keep UI in sync if the Power BI changes dates externally
  useEffect(() => {
    // only replace if it actually changed, to avoid extra renders
    if (!equalRanges(props.dates, currentDates)) {
      setCurrentDates(props.dates);
      // console.log(
      //   "DateRangeCard dates:",
      //   format(currentDates.start, "dd/MM/yy"),
      //   format(currentDates.end, "dd/MM/yy")
      // );
    }
  }, [props.dates]);

  // Use the localization hook to get the localization manager.
  const localization = useLocalization();

  // Memoize the theme creation to avoid re-calculating on every render.
  const theme = useMemo(
    () =>
      SetTheme({
        themeMode: props.themeMode,
        themeColor: props.themeColor,
        themeFont: props.themeFont,
        fontSize: String(props.fontSize),
        fontColor: props.fontColor,
      }),
    [props.themeMode, props.themeColor, props.themeFont, props.fontSize]
  );

  // Use useState to manage component-level state, initialized from props.
  const [openSlider, setOpenSlider] = useState<boolean>(props.showSlider);
  const [stepValue, setStepValue] = useState<string>(props.stepInit);
  const [stepOpen, setStepOpen] = useState<boolean>(false);

  // Memoize the current value to avoid unnecessary recalculations.
  const current = useMemo(
    () =>
      Increment(
        props.stepViz,
        props.weekStartDay,
        props.yearStartMonth,
        props.payProps,
        props.showMore,
        props.rangeScope
      ),
    [
      props.stepViz,
      props.weekStartDay,
      props.yearStartMonth,
      props.payProps,
      props.showMore,
      props.rangeScope,
    ]
  );

  // Use a single useEffect to handle prop changes for initial state.
  useEffect(() => {
    setOpenSlider(props.showSlider);
    setStepValue(props.stepInit);
  }, [props.showSlider, props.stepInit]);

  // Use useCallback to memoize the toggle functions, preventing them from
  // being recreated on every render. This optimizes child component rendering.
  const toggleSlider = useCallback(() => setOpenSlider((prev) => !prev), []);
  const toggleStepOpen = useCallback(() => setStepOpen((prev) => !prev), []);

  // Use a single useEffect for side effects related to the document.
  React.useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // UI-only updates
  const handlePreviewChange = useCallback(
    (range: [Date, Date]) => {
      const sorted = props.singleDay
        ? [range[0], range[0]]
        : [...range].sort((a, b) => a.getTime() - b.getTime());
      setCurrentDates({ start: sorted[0], end: sorted[1] });
    },
    [props.singleDay]
  );

  // This is the centralized handler. It updates the local state and then
  // calls the prop function to inform Power BI.
  const handleDateChange = useCallback(
    (filter: [Date, Date]) => {
      // Sort dates to ensure the start is always before the end.
      const sortedDates = props.singleDay
        ? [filter[0], filter[0]]
        : filter.sort(compareAsc);

      // Update local state first to trigger UI re-render
      setCurrentDates({
        start: sortedDates[0],
        end: sortedDates[1],
      });

      // Then inform Power BI
      props.onFilterChanged({
        start: sortedDates[0],
        end: sortedDates[1],
      });
    },
    [props.singleDay, props.onFilterChanged]
  );

  // This is the onChangeVal method that passes up a simple array of dates
  // to the main handler.
  const onChangeVal = useCallback(
    (filter: [Date, Date]) => {
      handleDateChange(filter);
    },
    [handleDateChange]
  );

  // Use the custom hook for keyboard shortcuts.
  DateMoveKeys(onChangeVal, stepValue, currentDates, current);
  useHotkeys("s", toggleSlider, [openSlider]);

  return (
    <ThemeProvider theme={theme}>
      <HelpProvider
        showHelpIcon={props.showHelpIcon}
        showTooltip={props.showTooltip}
        showExtendedTooltip={props.showExtendedTooltip}
        localization={localization}
        themeMode={props.themeMode}
      >
        <TopRow
          {...props}
          dates={currentDates}
          showMore={props.showMore}
          showMove={props.showMove}
          localization={localization}
          showExpand={props.showExpand}
          showSlider={props.showSlider}
          openSlider={openSlider}
          toggleSlider={toggleSlider}
          stepOpen={stepOpen}
          stepValue={stepValue}
          handleVal={onChangeVal}
          handleClick={toggleStepOpen}
          setStepValue={setStepValue}
          setStepOpen={setStepOpen}
          current={current}
        />
        <Zoom in={openSlider}>
          <Grid container spacing={0} size={12}>
            <Grid size="grow" sx={{ marginLeft: 1, paddingTop: 0.1 }}>
              <RangeSlider
                {...props}
                dates={currentDates}
                stepValue={stepValue}
                stepFmt={props.stepFmt}
                rangeScope={props.rangeScope}
                localization={localization}
                // During drag: preview only
                onPreview={handlePreviewChange}
                // On release: commit to host
                onCommit={onChangeVal}
              />
            </Grid>
          </Grid>
        </Zoom>
      </HelpProvider>
    </ThemeProvider>
  );
}
