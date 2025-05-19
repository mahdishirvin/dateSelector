import * as React from "react";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import DateMove from "./datemove";
import DateRange from "./daterange";
import StepsMenu from "./stepsmenu";
import StepToggle from "./steptoggle";
import { dateCardProps } from "../interface";

function DateInput(props: dateCardProps) {
  return (
    <>
      <Grid
        size="auto"
        sx={{
          paddingRight: 1,
        }}
      >
        <DateRange
          {...props}
        />
      </Grid>
      {props.showMove && (
        <Grid container>
          <Zoom in={props.showMove}>
            <Grid size="auto">
              <DateMove {...props}
                bf={"b"}
                vertical={false}
                reverse={true}
              />
            </Grid>
          </Zoom>
          <Grid
            size="auto"
            sx={{
              paddingRight: 1,
            }}
          >
             <StepToggle {...props} onClick={props.handleClick} />
             </Grid>
          <Zoom in={props.stepOpen}>
            <Grid size="auto">
              <StepsMenu {...props}
                viz={props.stepOpen}
              />
            </Grid>
          </Zoom>
          {/* <Zoom in={openSlider}> */}
          <Grid size="auto">
            <DateMove {...props}
              bf={"f"}
              vertical={false}
              reverse={false}
              viz={props.openSlider}
            />
          </Grid>
          {/* </Zoom> */}
        </Grid>
      )}
    </>
  );
}

export default DateInput;
