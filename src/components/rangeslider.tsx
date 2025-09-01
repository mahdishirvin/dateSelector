/*
This component renders a dual-thumb slider for selecting a date range.
It handles state for the slider values and translates them to and from
date objects based on the provided props.
*/
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

type Props = dateCardProps & {
  onPreview: (range: [Date, Date]) => void;
  onCommit: (range: [Date, Date]) => void;
};

/**
 * A component that renders a dual-thumb slider for selecting a date range.
 * The component handles state for the slider values and translates them
 * to and from date objects based on the provided props.
 * Dual-thumb slider for selecting a date range.
 * - Drag → preview only (UI updates)
 * - Release / click → commit to host
 *
 * @param {dateCardProps} props - The props for the component, including dates, range scope, and various handlers.
 * @returns {React.FC} The RangeSlider component.
 */

export default function RangeSlider(props: Props) {
  const {
    rangeScope,
    dates,
    show2ndSlider,
    singleDay,
    stepValue,
    onPreview,
    onCommit,
    localization,
  } = props;

  // Memoize the marks array to prevent unnecessary re-calculation on every render.
  const marks = React.useMemo(
    () => mainMarks(props).map((v) => v.value),
    [props]
  );

  // State for the slider's numerical values, synchronized with props.dates.
  const [sliderStart, setSliderStart] = React.useState<number>(
    sliderMarkNumber(dates.start, rangeScope.start)
  );
  const [sliderEnd, setSliderEnd] = React.useState<number>(
    sliderMarkNumber(dates.end, rangeScope.start)
  );

  // State to track if the Ctrl key is currently pressed
  const [isCtrlPressed, setIsCtrlPressed] = React.useState<boolean>(false);

  // Ref to store the initial values and range length at the start of a Ctrl+drag
  const dragStartRef = React.useRef<{
    start: number;
    end: number;
    length: number;
  } | null>(null);

  // Effect to keep the slider values in sync with changes to the dates prop.
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
      return val.map((x) => {
        let closestValue = marks[0];
        let minDiff = Math.abs(x - closestValue);

        for (let i = 1; i < marks.length; i++) {
          const currentDiff = Math.abs(x - marks[i]);
          if (currentDiff < minDiff) {
            minDiff = currentDiff;
            closestValue = marks[i];
          }
        }
        return closestValue;
      });
    },
    [marks]
  );

  /**
   * Handles the live drag/change event of the slider.
   * Updates the local state to show the user the new position and calls the onPreview prop.
   */
  const handleOnChange = (event: Event, val: number[], thumb: number) => {
    let newValues = [...val];
    const isStepped = stepValue === "day";

    const isKeyboard = event.type === "keydown"; // ← detect keyboard events
    const isCtrlPressed =
      (event as KeyboardEvent).ctrlKey ?? (event as any).ctrlKey;

    if (!isKeyboard && isCtrlPressed) {
      if (!dragStartRef.current) {
        // Start of a new Ctrl+drag, capture initial state
        dragStartRef.current = {
          start: sliderStart,
          end: sliderEnd,
          length: sliderEnd - sliderStart,
        };
      }

      // Calculate the new positions based on the drag and the original range length
      const delta = val[thumb] - dragStartRef.current.start;
      newValues[0] = dragStartRef.current.start + delta;
      newValues[1] = newValues[0] + dragStartRef.current.length;

      // ✅ Only snap to marks for mouse interactions, not keyboard
    } else {
      // Normal drag behavior
      if (singleDay) {
        newValues = thumb === 1 ? [val[1], val[1]] : [val[0], val[0]];
      }
    }

    if (!isStepped) {
      newValues = closestMark(newValues);
      newValues[1] = newValues[1] - 1;
    }

    setSliderStart(newValues[0]);
    setSliderEnd(newValues[1]);

    // Preview the change to the parent component
    onPreview([
      sliderMarkDate(newValues[0], rangeScope.start),
      sliderMarkDate(newValues[1], rangeScope.start),
    ]);
  };

  /**
   * Handles the commit event when the user releases a slider thumb or clicks the track.
   * This function sends the new date range to the parent component via the onCommit prop.
   */
  const handleOnCommit = (_: MouseEvent, val: number[]) => {
    let newStart = sliderStart;
    let newEnd = sliderEnd;

    // Reset the drag state
    dragStartRef.current = null;

    onCommit([
      sliderMarkDate(newStart, rangeScope.start),
      sliderMarkDate(newEnd, rangeScope.start),
    ]);
  };

  const sliderMarkText = useSliderMarkText();
  return (
    <DualSlider
      value={[sliderStart, sliderEnd]}
      step={stepValue === "day" ? 1 : null}
      stepValue={stepValue}
      showBottomSlider={show2ndSlider}
      handleTopCommit={handleOnCommit}
      handleBottomCommit={handleOnCommit}
      mainMarks={mainMarks(props)}
      superMarks={superMarks(props)}
      valueLabelFormat={(val) => sliderMarkText(val, rangeScope.start)}
      max={sliderMarkNumber(rangeScope.end, rangeScope.start)}
      onChange={handleOnChange}
      localization={localization}
      {...props}
    />
  );
}
