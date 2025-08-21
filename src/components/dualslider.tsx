import * as React from "react";
// import Box from "@mui/material/Box";
import Slider, {SliderValueLabelProps } from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
// import { ValueLabel } from "./rngetooltip";
import { style, styleB, styleT } from "./sliderstyles";
import Grid from "@mui/material/Grid";

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value ,index} = props;
  const loc = index === 0 ? "top-end" : "bottom-start";

  return (
    <Tooltip enterTouchDelay={10} placement={loc} title={value}  enterDelay={500} arrow  color="primary">
      {children}
    </Tooltip>
  );
}


interface DualSliderProps {
  value: number[];
  step: number | null;
  showBottomSlider: boolean;
  mainMarks: Array<{ value: number; label: string }>;
  superMarks: Array<{ value: number; label: string }>;
  max: number;
  valueLabelFormat: (value: number) => string;
  handleTopCommit: (e: Event, val: number[]) => void;
  handleBottomCommit: (e: Event, val: number[]) => void;
  onChange: (event: Event, value: number | number[], activeThumb?: number) => void;
  onClick?: (event: React.SyntheticEvent) => void;
  localization?: any; // Optional localization prop
}

function DualSlider(props: DualSliderProps): React.ReactElement {
  const {
    showBottomSlider,
    handleTopCommit,
    handleBottomCommit,
    mainMarks,
    superMarks,
    valueLabelFormat,
    localization
  } = props;

  return (
    <Grid container size={12}>
      <Grid sx={{ height: "52px" }} size={12}>
        <Slider
          name="top"
          key="slider1"
          size="medium"
          color="primary"
          onChangeCommitted={handleTopCommit}
          marks={mainMarks}
          valueLabelDisplay="auto"
          slots={{ valueLabel: ValueLabelComponent }}
          min={0}
          sx={{ ...style, ...styleT }}
          {...props}
        />
      </Grid>
      <Zoom in={showBottomSlider}>
        <Grid sx={{ height: "55px" }} size={12}>
          <Slider
            name="bottom"
            key="slider2"
            size="small"
            color="secondary"
            onChangeCommitted={handleBottomCommit}
            step={null}
            marks={superMarks}
            slots={{ valueLabel: ValueLabelComponent }}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider2"
            getAriaValueText={valueLabelFormat}
            min={0}
            sx={{ ...style, ...styleB }}
            {...props}
          />
        </Grid>
      </Zoom>
    </Grid>
  );
}

export default DualSlider;
