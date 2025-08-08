import * as React from "react";
import { SliderProps } from "../interface";
import DualSlider from "./dualslider";
import {
  mainMarks,
  superMarks,
  sliderMarkNumber,
  sliderMarkDate,
  sliderMarkText,
} from "../dateutils";

export default function RangeSlider(props: SliderProps) {
  const { dates, rangeScope, stepValue, show2ndSlider, handleVal, singleDay } = props;

  const [sliderStart, setSliderStart] = React.useState<number>(
    sliderMarkNumber(dates.start, rangeScope.start)
  );
  const [sliderEnd, setSliderEnd] = React.useState<number>(
    sliderMarkNumber(dates.end, rangeScope.start)
  );

  // Store the previous slider values to calculate delta for range dragging
  const prevSliderValuesRef = React.useRef({ start: sliderStart, end: sliderEnd });

  React.useEffect(() => {
    setSliderStart(sliderMarkNumber(dates.start, rangeScope.start));
    setSliderEnd(
      Math.min(
        sliderMarkNumber(dates.end, rangeScope.start),
        sliderMarkNumber(rangeScope.end, rangeScope.start)
      )
    );
  }, [dates, rangeScope]);

  // Update ref whenever sliderStart or sliderEnd changes
  React.useEffect(() => {
    prevSliderValuesRef.current = { start: sliderStart, end: sliderEnd };
  }, [sliderStart, sliderEnd]);

  const closestMark = (val: number[]) => {
    const marks = mainMarks(props).map((v) => v.value);
    return val.map((x) => marks.sort((a, b) => Math.abs(x - a) - Math.abs(x - b))[0]);
  };

  const handleChange = (
    event: MouseEvent,
    val: number[], // The new [start, end] values from the slider
    isStepping: boolean, // True if it's a step change (e.g., keyboard arrow)
    commit: boolean, // True if the change is committed (mouse up)
    activeThumb: number | undefined // 0 for start thumb, 1 for end thumb, undefined for track drag
  ): void => {
    if (isNaN(val[0]) || isNaN(val[1])) {
      return;
    }

    let newStart = val[0];
    let newEnd = val[1];

    const prevStart = prevSliderValuesRef.current.start;
    const prevEnd = prevSliderValuesRef.current.end;

    // Calculate deltas from the previous state
    const deltaStart = newStart - prevStart;
    const deltaEnd = newEnd - prevEnd;

    // Determine if it's an active rail drag (range move)
    // Conditions for range drag:
    // 1. No specific thumb was actively dragged (`activeThumb === undefined`). This is the primary indicator.
    // 2. Both ends of the range have moved by approximately the same amount, and there was actual movement.
    const isRangeDrag = (activeThumb === undefined) &&
                        (Math.abs(deltaStart - deltaEnd) < 0.001) && // Deltas are very close
                        (deltaStart !== 0 || deltaEnd !== 0);       // And there was actual movement

    if (isRangeDrag) {
        // If it's a range drag, apply the calculated delta to both ends
        newStart = prevStart + deltaStart;
        newEnd = prevEnd + deltaStart;

        // Ensure the dragged range stays within the overall rangeScope
        const maxAllowed = sliderMarkNumber(rangeScope.end, rangeScope.start);
        const minAllowed = sliderMarkNumber(rangeScope.start, rangeScope.start);

        // Adjust if the new range goes beyond the max allowed
        if (newEnd > maxAllowed) {
            const overshoot = newEnd - maxAllowed;
            newEnd = maxAllowed;
            newStart = Math.max(minAllowed, newStart - overshoot); // Shift start back, but not below min
        }
        // Adjust if the new range goes below the min allowed
        if (newStart < minAllowed) {
            const undershoot = minAllowed - newStart;
            newStart = minAllowed;
            newEnd = Math.min(maxAllowed, newEnd + undershoot); // Shift end forward, but not above max
        }
    } else if (event.ctrlKey) {
        // Retain original ctrlKey behavior for range move if explicitly used
        const d = [newStart - prevStart, newEnd - prevEnd].filter((v) => v !== 0)[0];
        newStart = d ? prevStart + d : newStart;
        newEnd = d ? prevEnd + d : newEnd;
        // Snap to closest mark if not stepping
        if (!isStepping) {
            const snappedValues = closestMark([newStart, newEnd]);
            newStart = snappedValues[0];
            newEnd = snappedValues[1];
        }
    } else {
        // If not a range drag and not ctrlKey, apply original singleDay logic or snap individual thumbs
        if (singleDay) {
            newEnd = newStart;
        } else if (!isStepping) {
            // Snap individual thumbs if not stepping
            const snappedValues = closestMark([newStart, newEnd]);
            newStart = snappedValues[0];
            newEnd = snappedValues[1];
        }
    }

    if (commit) {
      handleVal([
        sliderMarkDate(newStart, rangeScope.start),
        sliderMarkDate(newEnd, rangeScope.start),
      ]);
    } else {
      setSliderStart(newStart);
      setSliderEnd(newEnd);
    }
  };

  // DualSlider's onChange should pass `activeThumb` as the third argument
  const handleOnChange = (e: MouseEvent, val: number[], activeThumb?: number) => {
    // If singleDay, ensure both values are the same based on the actively dragged thumb
    if (singleDay) {
        val = (activeThumb === 1) ? [val[1], val[1]] : [val[0], val[0]];
    }
    handleChange(e, val, e.target["name"] === "top" ? stepValue === "day" : false, false, activeThumb);
  };

  const handleTopCommit = (e: MouseEvent, val: number[], activeThumb?: number) => {
    handleChange(e, val, stepValue === "day", true, activeThumb);
  };

  const handleBottomCommit = (e: MouseEvent, val: number[], activeThumb?: number) => {
    handleChange(e, val, false, true, activeThumb);
  };

  return (
    <DualSlider
      value={[sliderStart, sliderEnd]}
      step={stepValue === "day" ? 1 : null}
      showBottomSlider={show2ndSlider}
      handleTopCommit={handleTopCommit}
      handleBottomCommit={handleBottomCommit}
      mainMarks={mainMarks(props)}
      superMarks={superMarks(props)}
      valueLabelFormat={(val) => sliderMarkText(val, rangeScope.start)}
      max={sliderMarkNumber(rangeScope.end, rangeScope.start)}
      onChange={handleOnChange}
      {...props}
    />
  );
}