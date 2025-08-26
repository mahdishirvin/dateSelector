import * as React from "react";
import { useMemo, useEffect, useState, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import debounce from "lodash.debounce";
import { useHotkeys } from "react-hotkeys-hook";
import { getRange } from "../dateutils";
import { dateMoveProps } from "../interface";
import RngeTooltip from "./rngetooltip";
import { arrowIcons } from "../dateutils"; // Assuming arrowIcons is from a utility file
import { parseJSON } from "date-fns";

type MoveParms = {
  isBack: boolean;
  placement: "left" | "right" | "bottom";
  iconLabel: string;
  reduceExpand: string;
  iconT: React.ReactElement;
  iconB: React.ReactElement;
  topRow1: string;
  detailRow1: string;
  topRow2: string;
  detailRow2: string;
};

/**
 * A utility function to build parameters for the DateMove component.
 * This function no longer uses a hook directly and is now a pure function.
 * @param {string} bf - Back ("b") or Forward ("f").
 * @param {boolean} vert - Is the layout vertical?
 * @param {boolean} ctrl - Is the control (Shift) key pressed?
 * @param {string} stepValue - The current step value (e.g., "day", "week").
 * @param {object} localization - An object containing localization display names.
 * @returns {MoveParms} - The parameters for the move component.
 */
const getMoveParms = (
  bf: string,
  vert: boolean,
  ctrl: boolean,
  stepValue: string,
  localization: any
): MoveParms => {
  const isBack = bf === "b";

  const stepLabels = {
    day: localization.getDisplayName("Step_Day"),
    week: localization.getDisplayName("Step_Week"),
    pay: localization.getDisplayName("Step_Pay"),
    month: localization.getDisplayName("Step_Month"),
    quarter: localization.getDisplayName("Step_Quarter"),
    year: localization.getDisplayName("Step_Year"),
  };

  const periodLabel = stepLabels[stepValue];
  const moveLabel = isBack
    ? localization.getDisplayName("dateUtilsMoveBack")
    : localization.getDisplayName("dateUtilsMoveForward");
  const reduceExpand = ctrl
    ? localization.getDisplayName("dateUtilsMoveReduceBy")
    : localization.getDisplayName("dateUtilsExtend");

  const iconT = isBack ? arrowIcons.arrowLeft : arrowIcons.arrowRight;
  const iconB = ctrl
    ? isBack
      ? arrowIcons.arrowDoubleRight
      : arrowIcons.arrowDoubleLeft
    : isBack
    ? arrowIcons.arrowDoubleLeft
    : arrowIcons.arrowDoubleRight;

  // --- Helpers to keep template clean ---
  const ctrlHint = () => {
    if (!ctrl) return isBack ? " (ctrl + <)" : " (ctrl + >)";
    return isBack ? " (shift + >)" : " (shift + <)";
  };

  const directionWord = () =>
    !ctrl
      ? moveLabel.toLowerCase()
      : isBack
      ? localization.getDisplayName("dateUtilsMoveForward")
      : localization.getDisplayName("dateUtilsMoveBack");

  // --- Tooltip content ---
  const topRow1 = `${periodLabel} ${moveLabel}${isBack ? " (L)" : " (N)"}`;
  const detailRow1 = `${localization.getDisplayName(
    "dateUtilsMoveTheSelectedRange"
  )}${moveLabel.toLowerCase()}${localization.getDisplayName(
    "dateUtilsMoveByTheStepLevel"
  )}`;

  const topRow2 = `${reduceExpand} ${periodLabel} ${directionWord()}${ctrlHint()}`;
  const detailRow2 = `${reduceExpand}${localization.getDisplayName(
    "dateUtilsMoveTheSelectedRange"
  )}${localization.getDisplayName("dateUtilsMoveByTheStepLevel")}`;

  return {
    isBack,
    placement: vert ? (isBack ? "left" : "right") : "bottom",
    iconLabel: moveLabel,
    iconT,
    iconB,
    reduceExpand,
    topRow1,
    detailRow1,
    topRow2,
    detailRow2,
  };
};

export default function DateMove(props: dateMoveProps) {
  // Destructure props for easier access
  const {
    dates,
    stepValue,
    bf,
    vertical,
    reverse,
    handleVal,
    showExpand,
    localization,
  } = props;

  // State to track if the shift key is held down
  const [ctrl, setCtrl] = useState(false);

  // Use useMemo to ensure moveParms is only re-calculated when its dependencies change
  const mve = useMemo(
    () => getMoveParms(bf, vertical, ctrl, stepValue, localization),
    [bf, vertical, ctrl, stepValue, localization]
  );

  // Use useRef to create a stable reference to the debounced function.
  // This prevents the debounce timer from resetting on every re-render.
  const handleValRef = useRef(handleVal);
  useEffect(() => {
    handleValRef.current = handleVal;
  }, [handleVal]);

  const debouncedHandleValRef = useRef(
    debounce((dt) => handleValRef.current?.(dt), 500, {
      leading: false,
      trailing: true,
    })
  );

  // Clean up the debounced function on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debouncedHandleValRef.current) {
        debouncedHandleValRef.current.cancel();
      }
    };
  }, []);

  // Hotkey logic moved to a useEffect hook to avoid dependency issues
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setCtrl(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setCtrl(false);
      }
    };

    // New: Added `{ passive: true }` to both event listeners to fix the warning.
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    window.addEventListener("keyup", handleKeyUp, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleClick = (fn: string) => {
    if (handleVal) {
      const newDates = getRange(fn, stepValue, dates);
      let start =
        parseJSON(newDates[0].toString()).toString() !== "Invalid Date"
          ? parseJSON(newDates[0].toString())
          : newDates[0];
      let end =
        parseJSON(newDates[1].toString()).toString() !== "Invalid Date"
          ? parseJSON(newDates[1].toString())
          : newDates[1];
      debouncedHandleValRef.current([start, end]);
    }
  };

  const handleExt = () => {
    // The `e` parameter isn't needed here as we use hotkeys to manage `ctrl`
    const _ctl = ctrl; // Use the state variable directly
    const _bf = _ctl ? (mve.isBack ? "f" : "b") : bf;
    const fn = _ctl ? "r" + _bf : "e" + _bf;
    handleClick(fn);
  };

  return (
    <Grid
      container
      direction={reverse ? "row-reverse" : vertical ? "column" : "row"}
    >
      <Box>
        <RngeTooltip
          title={undefined}
          topRow={mve.topRow1}
          detailRow={mve.detailRow1}
          placement={mve.placement}
        >
          <IconButton
            key={mve.iconLabel + reverse + vertical + stepValue}
            aria-label={mve.iconLabel + " a " + stepValue}
            size="small"
            onClick={() => handleClick(bf)}
          >
            {mve.iconT}
          </IconButton>
        </RngeTooltip>
      </Box>
      {showExpand && (
        <Box>
          <RngeTooltip
            title={undefined}
            topRow={mve.topRow2}
            detailRow={mve.detailRow2}
            placement={mve.placement}
          >
            <IconButton
              key={mve.placement + reverse + vertical + stepValue}
              id="eb"
              aria-label={mve.placement + " a " + stepValue}
              size="small"
              onClick={handleExt}
            >
              {mve.iconB}
            </IconButton>
          </RngeTooltip>
        </Box>
      )}
    </Grid>
  );
}
