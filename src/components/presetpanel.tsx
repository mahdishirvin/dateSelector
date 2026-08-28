import * as React from "react";
import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { subDays, addDays, startOfDay, endOfDay, startOfToday, endOfToday } from "date-fns";
import { dateRange } from "../interface";
import { getInitRange, equalRanges } from "../dateutils";

interface PresetPanelProps {
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  activeDates?: dateRange;
  onPresetSelect: (range: dateRange) => void;
  showYesterday?: boolean;
  showToday?: boolean;
  showMinDate?: boolean;
  showThisWeek?: boolean;
  showLastWeek?: boolean;
  showThisMonth?: boolean;
  showLastMonth?: boolean;
  showLast3Months?: boolean;
  showLast6Months?: boolean;
  daysUpToToday?: number;
  daysStartingToday?: number;
}

export default function PresetPanel(props: PresetPanelProps) {
  const theme = useTheme();
  const {
    rangeScope = { start: new Date(), end: new Date() },
    weekStartDay = 0,
    activeDates,
    onPresetSelect,
    showYesterday = true,
    showToday = true,
    showMinDate = true,
    showThisWeek = true,
    showLastWeek = true,
    showThisMonth = true,
    showLastMonth = true,
    showLast3Months = true,
    showLast6Months = true,
    daysUpToToday = 0,
    daysStartingToday = 0,
  } = props;

  const ranges = getInitRange("", weekStartDay, 0, rangeScope, "matrix");

  const presets = [
    { label: "Yesterday", range: ranges.yesterday, show: showYesterday },
    { label: "Today", range: ranges.today, show: showToday },
    { label: "Min Date", range: { start: rangeScope.start, end: rangeScope.end }, show: showMinDate },
    { label: "This Week", range: ranges.thisWeek, show: showThisWeek },
    { label: "Last Week", range: ranges.lastWeek, show: showLastWeek },
    { label: "This Month", range: ranges.thisMonth, show: showThisMonth },
    { label: "Last Month", range: ranges.lastMonth, show: showLastMonth },
    { label: "Last 3 Months", range: ranges.last3Months, show: showLast3Months },
    { label: "Last 6 Months", range: ranges.last6Months, show: showLast6Months },
  ].filter((p) => p.show && p.range && p.range.start && p.range.end);

  const [daysUp, setDaysUp] = useState<string>(daysUpToToday > 0 ? String(daysUpToToday) : "");
  const [daysStart, setDaysStart] = useState<string>(daysStartingToday > 0 ? String(daysStartingToday) : "");

  const applyDaysUp = useCallback(
    (val: string) => {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        onPresetSelect({ start: startOfDay(subDays(startOfToday(), n)), end: endOfToday() });
      }
    },
    [onPresetSelect],
  );

  const applyDaysStart = useCallback(
    (val: string) => {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        onPresetSelect({ start: startOfToday(), end: endOfDay(addDays(startOfToday(), n - 1)) });
      }
    },
    [onPresetSelect],
  );

  const isActive = (range: dateRange) => (activeDates ? equalRanges(activeDates, range) : false);

  const buttonSx = (range: dateRange) => ({
    display: "block",
    textAlign: "left" as const,
    width: "100%",
    px: 1,
    py: 0.4,
    borderRadius: 1,
    backgroundColor: isActive(range) ? theme.palette.primary.main : "transparent",
    color: isActive(range) ? theme.palette.primary.contrastText : theme.palette.text.primary,
    "&:hover": {
      backgroundColor: isActive(range) ? theme.palette.primary.dark : theme.palette.action.hover,
    },
    transition: "background-color 0.15s",
  });

  const inputStyle: React.CSSProperties = {
    width: 36,
    fontSize: "0.68rem",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    padding: "2px 4px",
    background: "transparent",
    color: theme.palette.text.primary,
    outline: "none",
  };

  return (
    <Box
      sx={{
        width: 130,
        flexShrink: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        pr: 0.5,
        mr: 0.5,
        display: "flex",
        flexDirection: "column",
        gap: 0.2,
      }}
    >
      {presets.map(({ label, range }) => (
        <ButtonBase key={label} onClick={() => onPresetSelect(range as dateRange)} sx={buttonSx(range as dateRange)}>
          <Typography variant="body2" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
            {label}
          </Typography>
        </ButtonBase>
      ))}

      {daysUpToToday > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, px: 0.5 }}>
          <input
            type="number"
            value={daysUp}
            min={1}
            style={inputStyle}
            onChange={(e) => setDaysUp(e.target.value)}
            onBlur={() => applyDaysUp(daysUp)}
            onKeyDown={(e) => e.key === "Enter" && applyDaysUp(daysUp)}
          />
          <Typography variant="caption" sx={{ fontSize: "0.62rem", lineHeight: 1.2, color: theme.palette.text.secondary }}>
            days up to today
          </Typography>
        </Box>
      )}

      {daysStartingToday > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.5 }}>
          <input
            type="number"
            value={daysStart}
            min={1}
            style={inputStyle}
            onChange={(e) => setDaysStart(e.target.value)}
            onBlur={() => applyDaysStart(daysStart)}
            onKeyDown={(e) => e.key === "Enter" && applyDaysStart(daysStart)}
          />
          <Typography variant="caption" sx={{ fontSize: "0.62rem", lineHeight: 1.2, color: theme.palette.text.secondary }}>
            days starting today
          </Typography>
        </Box>
      )}
    </Box>
  );
}
