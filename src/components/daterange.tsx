import * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Remove from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material/styles";
import { format, parse, isValid } from "date-fns";

import { useInputParms } from "../dateutils";
import { DateField } from "./datefield";
import { useHelpContext } from "./helpprovider";
import RngeTooltip from "./rngetooltip";
import { dateCardProps, dateRange } from "../interface";
import { useDateFnsLocale, useLocalization } from "../localeutils";

export default function DateRange(props: dateCardProps) {
  const { dates, rangeScope, handleVal, singleDay, startupFilter, startRange } = props;

  const locale = useDateFnsLocale();
  const localization = useLocalization();
  const theme = useTheme();
  const { showExtendedTooltip } = useHelpContext();

  const tipDesc = `startRange_${startRange ?? ""}`;
  const tipDescription =
    localization.getDisplayName(tipDesc) && localization.getDisplayName(tipDesc) !== tipDesc
      ? localization.getDisplayName(tipDesc)
      : "Start Range";

  const [startText, setStartText] = useState(() =>
    format(dates.start, "yyyy-MM-dd", { locale })
  );
  const [endText, setEndText] = useState(() =>
    format(dates.end, "yyyy-MM-dd", { locale })
  );

  useEffect(() => {
    setStartText(format(dates.start, "yyyy-MM-dd", { locale }));
    setEndText(format(dates.end, "yyyy-MM-dd", { locale }));
  }, [dates, locale]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "start") setStartText(value);
    else setEndText(value);
  };

  const handleDate = (val: dateRange) => {
    handleVal([val.start, singleDay ? val.start : val.end]);
  };

  const input = useInputParms();
  const dateSpan = input(dates, rangeScope);

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
            topRow={(startRange === "sync") ? topRow : `${localization.getDisplayName("dateRangeResetTo")} ${tipDescription}`}
            detailRow={(startRange === "sync") ? dateSpan.string: ""}
            placement="bottom-start"
          >
            <IconButton
              size="small"
              onClick={(event) =>
             (startRange != "sync") && startupFilter && event.button === 0 ? handleDate(startupFilter) : undefined
              }
            >
              <Remove style={{ fontSize: theme.typography.fontSize }} color="disabled" />
            </IconButton>
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
