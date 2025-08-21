import * as React from "react";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import DateMove from "./datemove";
import DateRange from "./daterange";
import StepsMenu from "./stepsmenu";
import StepToggle from "./steptoggle";
import { dateCardProps } from "../interface";

function DateInput(props: dateCardProps) {
  // Destructure props for a clear overview and to avoid prop-drilling
  const {
    showMove,
    stepOpen,
    openSlider,
    handleClick,
    handleVal,
    dates,
    stepValue,
    localization,
    ...otherProps
  } = props;

  return (
    <>
      <Grid  sx={{ paddingRight: 1 }}>
        {/* Pass the dates prop explicitly to the DateRange component */}
        <DateRange dates={dates} {...otherProps} />
      </Grid>

      {/* Conditionally render the entire movement section */}
      {showMove && (
        <Grid container>
          {/* Backwards movement button */}
          <Zoom in={showMove}>
            <Grid >
              <DateMove
                dates={dates}
                stepValue={stepValue}
                handleVal={handleVal}
                bf="b"
                vertical={false}
                reverse={true}
                showExpand={true}
                localization={localization} // Pass localization prop
              />
            </Grid>
          </Zoom>

          {/* Toggle for the steps menu */}
          <Grid  sx={{ paddingRight: 1 }}>
            <StepToggle
              stepValue={stepValue}
              handleClick={handleClick}
              {...otherProps}
            />
          </Grid>

          {/* Steps menu */}
          <Zoom in={stepOpen}>
            <Grid >
              <StepsMenu
                stepValue={stepValue}
                {...otherProps}
              />
            </Grid>
          </Zoom>

          {/* Forward movement button, controlled by the openSlider prop */}
          {/* <Zoom in={openSlider}> */}
            <Grid >
              <DateMove
                dates={dates}
                stepValue={stepValue}
                handleVal={handleVal}
                bf="f"
                vertical={false}
                reverse={false}
                showExpand={true}
                localization={localization} // Pass localization prop
              />
            </Grid>
          {/* </Zoom> */}
        </Grid>
      )}
    </>
  );
}

export default DateInput;
