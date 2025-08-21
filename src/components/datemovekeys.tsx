import { getRange } from "../dateutils";
import { useHotkeys } from "react-hotkeys-hook";
import debounce from "lodash.debounce";
import type { dateRange } from "../interface";

export function DateMoveKeys(
  fn: (result: Date[]) => void,
  stepValue: string,
  dates: dateRange,
  current: any,
  debounceTime = 500
) {
  const updateResult = (x: string) => {
    const dteRange = getRange(x, stepValue, dates);
    fn(dteRange);
  };

  const debouncedResult = debounce(updateResult, debounceTime, {
    leading: false,
    trailing: true
  });

  useHotkeys(["n", "right"], () => debouncedResult("f"), [stepValue, dates]);
  useHotkeys(["left", "l"], () => debouncedResult("b"), [stepValue, dates]);
  useHotkeys("ctrl+right", () => debouncedResult("ef"), [stepValue, dates]);
  useHotkeys("ctrl+left", () => debouncedResult("eb"), [stepValue, dates]);
  useHotkeys("shift+right", () => debouncedResult("rf"), [stepValue, dates]);
  useHotkeys("shift+left", () => debouncedResult("rb"), [stepValue, dates]);
  useHotkeys(
    "t",
    () => {
      const thisRange = current
        .filter((item) => item.step === stepValue)
        .map((item) => item.thisRange)[0];
      fn([thisRange.start, thisRange.end]);
    },
    [stepValue]
  );
}
