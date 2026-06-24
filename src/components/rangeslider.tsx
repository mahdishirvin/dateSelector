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
  sliderMarkText,
} from "../dateutils";
import { useDateFnsLocale } from "../localeutils";

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

  // Use a stable fallback date (today) instead of epoch (1970)
  const fallbackDate = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Strict property verification to identify genuinely missing data vs empty configurations
  const hasValidDates = !!(
    dates &&
    dates.start &&
    dates.end &&
    !isNaN(new Date(dates.start).getTime()) &&
    new Date(dates.start).getFullYear() > 1970
  );
  const hasValidRange = !!(
    rangeScope &&
    rangeScope.start &&
    rangeScope.end &&
    !isNaN(new Date(rangeScope.start).getTime()) &&
    new Date(rangeScope.start).getFullYear() > 1970
  );

  const safeDates = React.useMemo(
    () => (hasValidDates ? dates! : { start: fallbackDate, end: fallbackDate }),
    [hasValidDates, dates, fallbackDate],
  );

  const safeRangeScope = React.useMemo(
    () => (hasValidRange ? rangeScope! : safeDates),
    [hasValidRange, rangeScope, safeDates],
  );

  // Get locale at the component level
  const locale = useDateFnsLocale();

  // Create a guarded version of props to safely pass down to the mark utilities
  const guardedProps = React.useMemo(() => {
    return {
      ...props,
      dates: safeDates,
      rangeScope: safeRangeScope,
    };
  }, [props, safeDates, safeRangeScope]);

  // softBail tells us whether we should skip resource-heavy mark generation
  const softBail = !props.landingOff || !hasValidRange || !hasValidDates;

  // Memoize the marks array using guarded props to prevent crashes inside mainMarks
  const marks = React.useMemo(() => {
    if (softBail) {
      return [0];
    }
    try {
      const generatedMarks = mainMarks(guardedProps, locale);
      if (!generatedMarks || !Array.isArray(generatedMarks)) return [0];
      return generatedMarks.map((v: { value: number }) => v?.value ?? 0);
    } catch (e) {
      console.warn("Failed to generate main marks safely:", e);
      return [0];
    }
  }, [guardedProps, locale, softBail]);

  // State for the slider's numerical values, synchronized with props.dates.
  const [sliderStart, setSliderStart] = React.useState<number>(() =>
    sliderMarkNumber(safeDates.start, safeRangeScope.start),
  );
  const [sliderEnd, setSliderEnd] = React.useState<number>(() =>
    sliderMarkNumber(safeDates.end, safeRangeScope.start),
  );

  // Ref to store the initial values and range length at the start of a Ctrl+drag
  const dragStartRef = React.useRef<{
    start: number;
    end: number;
    length: number;
  } | null>(null);
  const isDraggingRef = React.useRef(false);

  // Effect to keep the slider values in sync with changes to the dates prop.
  React.useEffect(() => {
    // If we shouldn't process or if parameters are blank, clear to zero state safely
    if (softBail || isDraggingRef.current) {
      return;
    }

    const startNum = sliderMarkNumber(safeDates.start, safeRangeScope.start);
    const endNum = sliderMarkNumber(safeDates.end, safeRangeScope.start);
    const maxNum = sliderMarkNumber(safeRangeScope.end, safeRangeScope.start);

    setSliderStart(startNum);
    setSliderEnd(Math.min(endNum, maxNum));
  }, [safeDates, safeRangeScope, softBail]);

  /**
   * Finds the closest valid mark value to the given slider value(s).
   */
  const closestMark = React.useCallback(
    (val: number[]) => {
      if (!marks || marks.length === 0) return val;

      return val.map((x) => {
        let low = 0;
        let high = marks.length - 1;

        if (x <= marks[low]) return marks[low];
        if (x >= marks[high]) return marks[high];

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const midVal = marks[mid];

          if (midVal === x) {
            return x;
          } else if (midVal < x) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }

        // After the loop, 'low' is the insertion point.
        // The closest value is either marks[high] or marks[low].
        const diffHigh = Math.abs(x - marks[high]);
        const diffLow = Math.abs(x - marks[low]);

        return diffLow < diffHigh ? marks[low] : marks[high];
      });
    },
    [marks],
  );

  /**
   * Handles the live drag/change event of the slider.
   */
  const handleOnChange = React.useCallback(
    (
      event: Event | React.SyntheticEvent,
      val: number | number[],
      thumb = 0,
    ) => {
      if (softBail) return;
      isDraggingRef.current = true;
      const values = Array.isArray(val) ? val : [val, val];
      let newValues = [...values];
      const isStepped = stepValue === "day";

      const isKeyboard = event.type === "keydown";
      const isCtrlPressed =
        (event as KeyboardEvent).ctrlKey ??
        (event as { ctrlKey?: boolean }).ctrlKey;

      if (!isKeyboard && isCtrlPressed) {
        if (!dragStartRef.current) {
          dragStartRef.current = {
            start: sliderStart,
            end: sliderEnd,
            length: sliderEnd - sliderStart,
          };
        }

        const delta = values[thumb] - dragStartRef.current.start;
        newValues[0] = dragStartRef.current.start + delta;
        newValues[1] = newValues[0] + dragStartRef.current.length;
      } else {
        if (singleDay) {
          newValues =
            thumb === 1 ? [values[1], values[1]] : [values[0], values[0]];
        }
      }

      if (!isStepped) {
        newValues = closestMark(newValues);
        newValues[1] = newValues[1] - 1;
      }

      setSliderStart(newValues[0]);
      setSliderEnd(newValues[1]);

      onPreview([
        sliderMarkDate(newValues[0], safeRangeScope.start),
        sliderMarkDate(newValues[1], safeRangeScope.start),
      ]);
    },
    [
      softBail,
      stepValue,
      singleDay,
      closestMark,
      onPreview,
      safeRangeScope.start,
      sliderStart,
      sliderEnd,
    ],
  );

  /**
   * Handles the commit event when the user releases a slider thumb or clicks the track.
   */
  const handleOnCommit = React.useCallback(
    (_: Event | React.SyntheticEvent, val: number | number[]) => {
      if (softBail) return;
      isDraggingRef.current = false;
      const values = Array.isArray(val) ? val : [val, val];
      const newStart = values[0] ?? sliderStart;
      const newEnd = values[1] ?? sliderEnd;

      dragStartRef.current = null;

      onCommit([
        sliderMarkDate(newStart, safeRangeScope.start),
        sliderMarkDate(newEnd, safeRangeScope.start),
      ]);
    },
    [softBail, onCommit, safeRangeScope.start, sliderStart, sliderEnd],
  );

  // Safely resolve the mark definitions for the child layout
  const derivedMainMarks = React.useMemo(() => {
    if (softBail) return [];
    try {
      return mainMarks(guardedProps, locale) ?? [];
    } catch {
      return [];
    }
  }, [guardedProps, locale, softBail]);

  const derivedSuperMarks = React.useMemo(() => {
    if (softBail) return [];
    try {
      return superMarks(guardedProps, locale) ?? [];
    } catch {
      return [];
    }
  }, [guardedProps, locale, softBail]);

  return (
    <DualSlider
      value={[sliderStart, sliderEnd]}
      step={stepValue === "day" ? 1 : null}
      stepValue={stepValue}
      showBottomSlider={show2ndSlider ?? false}
      handleTopCommit={handleOnCommit}
      handleBottomCommit={handleOnCommit}
      mainMarks={derivedMainMarks}
      superMarks={derivedSuperMarks}
      valueLabelFormat={(val) =>
        sliderMarkText(val, safeRangeScope.start, locale)
      }
      max={sliderMarkNumber(safeRangeScope.end, safeRangeScope.start) || 1}
      onChange={handleOnChange}
      localization={localization}
      {...props}
    />
  );
}
