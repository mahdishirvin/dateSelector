import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Grow from "@mui/material/Grow";
import DateInput from "./dateinput";
import UseCurrent from "./usecurrent";
import ToggleSliderButton from "./togglesliderbutton";
import { dateCardProps } from "../interface";

const TopRow: React.FC<dateCardProps> = (props) => {
  return (
    <Grid
      container
      direction="row"
      rowSpacing={0.3}
      size={12}
      sx={{
        paddingLeft: 0.3,
      }}
    >
      {props.enableSlider && (
        <Grid
          size="auto"
        >
          <ToggleSliderButton
            openSlider={props.openSlider}
            toggleSlider={props.toggleSlider}
          />
        </Grid>
      )}
        <DateInput
          {...props}
          openSlider={props.openSlider}
          handleStep={props.setStepValue}
          handleViz={props.setStepOpen}
        />
      <Grid size="auto">
        {!props.stepOpen && (
          <Grow in={!props.stepOpen}
            style={{ transformOrigin: "0 0 0" }}
            {...(props.stepOpen ? { timeout: 1000 } : {})}
          >
            <Box>
              <UseCurrent {...props}
                handleStep={props.setStepValue}
                />
            </Box>
          </Grow>
         )}
      </Grid>
      <Grid size="grow">
        <Box></Box>
      </Grid>
    </Grid>
  );
};

export default TopRow;
