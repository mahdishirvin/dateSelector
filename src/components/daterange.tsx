import * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Remove from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material/styles";
import { format, parse, isValid, isEqual } from "date-fns";

import { useInputParms } from "../dateutils";
import { DateField } from "./datefield";
import { useHelpContext } from "./helpprovider";
import RngeTooltip from "./rngetooltip";
import { dateCardProps, dateRange } from "../interface";
import { useDateFnsLocale } from "../localeutils";
import { HorizontalRule, LinearScale } from "@mui/icons-material";

// DateRange input with optional reset.
// Uses the sync value if available; otherwise falls back to preset startup filter or scope.
// The reset button appears on the separator only when a startup value exists.

export default function DateRange(props: dateCardProps) {
  const {
    dates,
    rangeScope,
    handleVal,
    singleDay,
    startupFilter,
    startRange,
    localization,
  } = props;

  const locale = useDateFnsLocale();

  const theme = useTheme();
  const { showExtendedTooltip } = useHelpContext();

  const tipDesc = `startRange_${startRange ?? ""}`;
  const tipDescription =
    localization.getDisplayName(tipDesc) &&
    localization.getDisplayName(tipDesc) !== tipDesc
      ? localization.getDisplayName(tipDesc)
      : "Start Range";

  const [startText, setStartText] = useState(() =>
    format(dates.start, "yyyy-MM-dd", { locale })
  );
  const [endText, setEndText] = useState(() =>
    format(dates.end, "yyyy-MM-dd", { locale })
  );

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setStartText(format(dates.start, "yyyy-MM-dd", { locale }));
    setEndText(format(dates.end, "yyyy-MM-dd", { locale }));
  }, [dates, locale]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "start") setStartText(value);
    else setEndText(value);
  };

  // const handleDate = (val: dateRange) => {
  //   handleVal([val.start, singleDay ? val.start : val.end]);
  // };

  // ✅ memoized handler avoids redundant renders
  const handleDate = React.useCallback(
    (val: dateRange) => {
      // console.log(
      //   "DateRange dates:",
      //   format(val.start, "dd/MM/yy"),
      //   format(val.end, "dd/MM/yy")
      // );

      const newDates: [Date, Date] = [
        val.start,
        singleDay ? val.start : val.end,
      ];

      setStartText(format(newDates[0], "yyyy-MM-dd", { locale }));
      setEndText(format(newDates[1], "yyyy-MM-dd", { locale }));

      handleVal(newDates);
    },
    [handleVal, singleDay]
  );

const input = useInputParms();

const dateSpan = React.useMemo(() => {
  return input(dates, rangeScope);
}, [input, dates, rangeScope]);

const topRow = showExtendedTooltip
    ? localization.getDisplayName("dateRangeTopRow")
    : dateSpan.string;

  const doUpdate = (id: "start" | "end", value: string) => {
    const dte = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(dte)) {
      if (id === "start") handleVal([dte, dates.end]);
      else handleVal([dates.start, dte]);
    } else {
      setStartText(format(dates.start, "yyyy-MM-dd", { locale }));
      setEndText(format(dates.end, "yyyy-MM-dd", { locale }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    doUpdate(e.target.id as "start" | "end", e.target.value);
  };

  // 🔑 determine if reset is available
  const canReset =
    startupFilter &&
    (!isEqual(dates.start, startupFilter.start) ||
      !isEqual(dates.end, startupFilter.end));

  const showRefresh = hovered && canReset;

  return (
    <Grid container spacing={0.5} sx={{ paddingLeft: 0.3 }}>
      <Grid size="grow">
        <RngeTooltip
          topRow={topRow}
          detailRow={dateSpan.string}
          infoRow={dateSpan.info}
          placement="bottom-start"
        >
          <DateField
            id="start"
            value={startText}
            max={singleDay ? "" : endText}
            error={!dateSpan.toValid}
            onBlur={handleBlur}
            doUpdate={doUpdate}
            onChange={handleInput}
            {...props}
          />
        </RngeTooltip>
      </Grid>

      {!singleDay && (
        <>
          <RngeTooltip
            topRow={
              canReset
                ? `${localization.getDisplayName(
                    "dateRangeResetTo"
                  )} ${tipDescription}`
                : tipDescription
            }
            infoRow={
              canReset && startupFilter
                ? `${format(startupFilter.start, "yyyy-MM-dd", { locale })}${
                    startupFilter.start !== startupFilter.end
                      ? " - " +
                        format(startupFilter.end, "yyyy-MM-dd", { locale })
                      : ""
                  }`
                : undefined
            }
            placement="bottom-start"
          >
            <span
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {showRefresh ? (
                <IconButton
                  size="small"
                  onClick={() =>
                    canReset && startupFilter
                      ? handleDate(startupFilter)
                      : undefined
                  }
                >
                  <RefreshIcon
                    style={{ fontSize: theme.typography.fontSize }}
                  />
                </IconButton>
              ) : (
                <IconButton size="small" disabled={!canReset}>
                  {canReset ? (
                    <LinearScale
                      style={{ fontSize: theme.typography.fontSize }}
                      color={canReset ? "success" : "disabled"}
                    ></LinearScale>
                  ) : (
                    <HorizontalRule
                      style={{ fontSize: theme.typography.fontSize }}
                      color={canReset ? "success" : "disabled"}
                    ></HorizontalRule>
                  )}{" "}
                </IconButton>
              )}
            </span>
          </RngeTooltip>

          <Grid size="grow">
            <RngeTooltip
              topRow={topRow}
              detailRow={dateSpan.string}
              infoRow={dateSpan.info}
              placement="bottom-start"
            >
              <DateField
                id="end"
                value={endText}
                min={startText}
                error={!dateSpan.toValid}
                onBlur={handleBlur}
                doUpdate={doUpdate}
                onChange={handleInput}
                {...props}
              />
            </RngeTooltip>
          </Grid>
        </>
      )}
    </Grid>
  );
}
