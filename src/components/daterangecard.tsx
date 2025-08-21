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
// import { LanguageProvider } from "../languages/LanguageContext";
import { useHotkeys } from "react-hotkeys-hook";
import TopRow from "./toprow";
import RangeSlider from "./rangeslider";
import { dateCardProps } from "../interface";
import { DateMoveKeys } from "./datemovekeys";
import { Increment } from "../dateutils";
import { HelpProvider } from "./helpprovider";
import LandingPage from "./landingpage";
import { compareAsc } from "date-fns";

export default function DateRangeCard(props: dateCardProps) {
  // If the landing page is not disabled, render it and exit early.
  if (!props.landingOff) {
    return <LandingPage />;
  }

  // Memoize the theme creation to avoid re-calculating on every render.
  const theme = useMemo(
    () =>
      SetTheme({
        themeMode: props.themeMode,
        themeColor: props.themeColor,
        themeFont: props.themeFont,
        fontSize: String(props.fontSize),
      }),
    [props.themeMode, props.themeColor, props.themeFont, props.fontSize]
  );

  // Use useState to manage component-level state, initialized from props.
  const [openSlider, setOpenSlider] = useState<boolean>(props.showSlider);
  const [stepValue, setStepValue] = useState<string>(props.stepInit);
  const [stepOpen, setStepOpen] = useState<boolean>(false);

  // Memoize the current value to avoid unnecessary recalculations.
  const current = React.useMemo(
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
  // const toggleStepOpen = useCallback(() => setStepOpen((prev) => !prev), []);

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

  const onChangeVal = useCallback(
    (filter: [Date, Date]) => {
      // Sort dates to ensure the start is always before the end.
      const sortedDates = props.singleDay
        ? [filter[0], filter[0]]
        : filter.sort(compareAsc);
      props.onFilterChanged({ start: sortedDates[0], end: sortedDates[1] });
    },
    [props.singleDay, props.onFilterChanged]
  );

  // Use the custom hook for keyboard shortcuts.
  DateMoveKeys(onChangeVal, stepValue, props.dates, current);
  useHotkeys("s", toggleSlider, [openSlider]);

  return (
    <ThemeProvider theme={theme}>
      <HelpProvider
        showHelpIcon={props.showHelpIcon}
        showTooltip={props.showTooltip}
        showExtendedTooltip={props.showExtendedTooltip}
        localization={props.localization}
        themeMode={props.themeMode}
      >
        <TopRow
          {...props}
          openSlider={openSlider}
          toggleSlider={toggleSlider}
          stepOpen={stepOpen}
          stepValue={stepValue}
          handleVal={onChangeVal}
          handleClick={() => setStepOpen(!stepOpen)}
          setStepOpen={setStepOpen}
          setStepValue={setStepValue}
          current={current}
        />
        <Zoom in={openSlider}>
          <Grid container spacing={0} size={12}>
            <Grid size="grow" sx={{ marginLeft: 1, paddingTop: 0.1 }}>
              <RangeSlider
                {...props}
                stepValue={stepValue}
                handleVal={onChangeVal}
              />
            </Grid>
          </Grid>
        </Zoom>
      </HelpProvider>
    </ThemeProvider>
  );
}
