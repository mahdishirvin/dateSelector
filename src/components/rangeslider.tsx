import * as React from "react";
import { dateCardProps } from "../interface";
import DualSlider from "./dualslider";
import {
  mainMarks,
  superMarks,
  sliderMarkNumber,
  sliderMarkDate,
  useSliderMarkText,
} from "../dateutils";

/**
 * A component that renders a dual-thumb slider for selecting a date range.
 * The component handles state for the slider values and translates them
 * to and from date objects based on the provided props.
 *
 * @param {dateCardProps} props - The props for the component, including dates, range scope, and various handlers.
 * @returns {React.FC} The RangeSlider component.
 */
export default function RangeSlider(props: dateCardProps) {
  const {
    dates,
    rangeScope,
    stepValue,
    show2ndSlider,
    handleVal,
    singleDay,
    localization,
  } = props;

  const [sliderStart, setSliderStart] = React.useState<number>(
    sliderMarkNumber(dates.start, rangeScope.start)
  );
  const [sliderEnd, setSliderEnd] = React.useState<number>(
    sliderMarkNumber(dates.end, rangeScope.start)
  );

  // Effect to update the slider values when the dates or range scope props change.
  React.useEffect(() => {
    setSliderStart(sliderMarkNumber(dates.start, rangeScope.start));
    setSliderEnd(
      Math.min(
        sliderMarkNumber(dates.end, rangeScope.start),
        sliderMarkNumber(rangeScope.end, rangeScope.start)
      )
    );
  }, [dates, rangeScope]);

  /**
   * Finds the closest valid mark value to the given slider value(s).
   * @param {number[]} val - The current slider value(s).
   * @returns {number[]} The closest valid mark values.
   */
  const closestMark = React.useCallback(
    (val: number[]) => {
      // Memoize the marks array to avoid re-creation on every render.
      const marks = mainMarks(props).map((v) => v.value);
      return val.map(
        (x) => marks.sort((a, b) => Math.abs(x - a) - Math.abs(x - b))[0]
      );
    },
    [props] // Dependency is the props object.
  );

  /**
   * Main handler for all slider change events, including drag and commit.
   * @param {MouseEvent} event - The mouse event.
   * @param {number[]} val - The new slider value array [start, end].
   * @param {boolean} isStepped - Flag to check if the step is "day".
   * @param {boolean} isCommit - Flag to check if the user has released the thumb.
   */
  const handleChange = (
    event: MouseEvent,
    val: number[],
    isStepped: boolean,
    isCommit: boolean
  ): void => {
    if (!isNaN(val.reduce((a, b) => a + b, 0))) {
      // if (event.ctrlKey) {
      //   console.log("Ctrl key pressed", val);
      //   const d = [val[0] - sliderStart, val[1] - sliderEnd].filter(
      //     (v) => v !== 0
      //   )[0];
      //   val = d ? [sliderStart, sliderEnd].map((v) => v + d) : val;
      //   val = isStepped ? val : closestMark(val);
      // }


      val[1] = singleDay
        ? val[0]
        : sliderEnd === val[1] || isStepped
        ? val[1]
        : val[1] - 1;

      if (isCommit) {
        handleVal([
          sliderMarkDate(val[0], rangeScope.start),
          sliderMarkDate(val[1], rangeScope.start),
        ]);
      } else {
        setSliderStart(val[0]);
        setSliderEnd(val[1]);
      }
    }
  };

  const handleOnChange = (e: MouseEvent, val: number[], thumb: number) => {
    let newValues = [...val];
    // For single day mode, ensure both thumbs are at the same value.
    if (singleDay) {
      newValues = thumb === 1 ? [val[1], val[1]] : [val[0], val[0]];
    }
    handleChange(
      e,
      newValues,
      e.target["name"] === "top" ? stepValue === "day" : false,
      false
    );
  };

  // Helper functions for commit events, which are clearer and more explicit.
  const handleTopCommit = (e: MouseEvent, val: number[]) => {
    handleChange(e, val, stepValue === "day", true);
  };

  const handleBottomCommit = (e: MouseEvent, val: number[]) => {
    handleChange(e, val, false, true);
  };

  const sliderMarkText = useSliderMarkText();

  return (
    <DualSlider
      value={[sliderStart, sliderEnd]}
      step={stepValue === "day" ? 1 : null}
      stepValue={stepValue}
      showBottomSlider={show2ndSlider}
      handleTopCommit={handleTopCommit}
      handleBottomCommit={handleBottomCommit}
      mainMarks={mainMarks(props)}
      superMarks={superMarks(props)}
      valueLabelFormat={(val) => sliderMarkText(val, rangeScope.start)}
      max={sliderMarkNumber(rangeScope.end, rangeScope.start)}
      onChange={handleOnChange}
      localization={localization}
      // Spreading props here is less explicit; it's better to pass them individually if possible.
      {...props}
    />
  );
}
