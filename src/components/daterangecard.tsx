/*
This component represents a date range card that displays a timeline of dates.
It receives several props to customize its behavior and appearance.
@param {dateCardProps} props - An object containing the props passed to this component.
@returns {JSX.Element} A JSX element that renders the date range card.
*/
import * as React from "react";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { ThemeProvider } from "@mui/material/styles";
import { SetTheme } from "./settheme";
// import { LanguageProvider } from "../languages/LanguageContext";
import { useHotkeys } from "react-hotkeys-hook";
import TopRow from "./toprow";
import RangeSlider from "./rangeslider";
import { dateCardProps } from "../interface";
import { dateMoveKeys } from "./datemovekeys";
import { Increment } from "../dateutils";
import { HelpProvider } from "./helpprovider";
import LandingPage from "./landingpage";
import { compareAsc } from "date-fns";

export default function DateRangeCard(props: dateCardProps) {
// console.log("[DateRangeCard] props: ", props.dates);
  if (!props.landingOff) return <LandingPage />;

  const theme = SetTheme({
    themeMode: props.themeMode,
    themeColor: props.themeColor,
    themeFont: props.themeFont,
    fontSize: String(props.fontSize),
  });

  const [openSlider, setOpenSlider] = React.useState<boolean>(props.showSlider);
  const [stepValue, setStepValue] = React.useState<string>(props.stepInit);
  const [stepOpen, setStepOpen] = React.useState<boolean>(false);

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

  React.useEffect(() => setOpenSlider(props.showSlider), [props.showSlider]);
  React.useEffect(() => setStepValue(props.stepInit), [props.stepInit]);
  React.useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const toggleSlider = () => setOpenSlider(!openSlider);

  const onChangeVal = (filter: [Date, Date]) => {
    const sortedDates = props.singleDay
      ? [filter[0], filter[0]]
      : filter.sort(compareAsc);
    props.onFilterChanged({ start: sortedDates[0], end: sortedDates[1] });
  };

  dateMoveKeys(onChangeVal, stepValue, props.dates, current);
  useHotkeys("s", toggleSlider, [openSlider]);

  return (
    <ThemeProvider theme={theme}>
      <HelpProvider
        showHelpIcon={props.showHelpIcon}
        showTooltip={props.showTooltip}
        showExtendedTooltip={props.showExtendedTooltip}
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
