import * as React from "react";
import { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import { DateRange as RdDateRange } from "react-date-range";
import { startOfToday } from "date-fns";

import { dateRange } from "../interface";

// CSS for react-date-range — webpack (pbiviz) bundles CSS from node_modules via css-loader.
// If the build fails, remove these two imports and add them to visual.less instead:
//   @import (less) "../../node_modules/react-date-range/dist/styles.css";
//   @import (less) "../../node_modules/react-date-range/dist/theme/default.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DatePickerDialogProps {
  open: boolean;
  dates: dateRange;
  rangeScope?: dateRange;
  themeColor?: string;
  calendarMonths?: number;
  showGoToToday?: boolean;
  allowSessionDismiss?: boolean;
  onConfirm: (range: dateRange) => void;
  onDismiss: () => void;
  onSessionDismiss?: () => void;
}

const DatePickerDialog = ({
  open,
  dates,
  rangeScope,
  themeColor,
  calendarMonths = 2,
  showGoToToday = true,
  allowSessionDismiss = false,
  onConfirm,
  onDismiss,
  onSessionDismiss,
}: DatePickerDialogProps) => {
  const theme = useTheme();
  const [stagedRange, setStagedRange] = useState<dateRange>(dates);
  const [sessionDismiss, setSessionDismiss] = useState(false);

  React.useEffect(() => {
    if (open) {
      setStagedRange(dates);
      setSessionDismiss(false);
    }
  }, [open, dates]);

  const handleRangeChange = useCallback((item: any) => {
    const sel = item.selection;
    if (sel.startDate && sel.endDate) {
      setStagedRange({ start: sel.startDate, end: sel.endDate });
    }
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(stagedRange);
    if (sessionDismiss && onSessionDismiss) onSessionDismiss();
  }, [stagedRange, sessionDismiss, onConfirm, onSessionDismiss]);

  const handleGoToToday = useCallback(() => {
    const today = startOfToday();
    setStagedRange({ start: today, end: today });
  }, []);

  const accentColor = themeColor ?? theme.palette.primary.main;

  return (
    <Dialog open={open} onClose={onDismiss} maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 0.5,
        }}
      >
        <span>Select Date Range</span>
        {showGoToToday && (
          <Button size="small" variant="outlined" onClick={handleGoToToday}>
            Go To Today
          </Button>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <RdDateRange
          ranges={[
            {
              startDate: stagedRange.start,
              endDate: stagedRange.end,
              key: "selection",
            },
          ]}
          onChange={handleRangeChange}
          months={calendarMonths}
          direction="horizontal"
          rangeColors={[accentColor]}
          minDate={rangeScope?.start}
          maxDate={rangeScope?.end}
          showMonthAndYearPickers
          showDateDisplay={false}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
        <Box>
          {allowSessionDismiss && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={sessionDismiss}
                  onChange={(e) => setSessionDismiss(e.target.checked)}
                />
              }
              label="Don't show again this session"
              componentsProps={{ typography: { sx: { fontSize: "0.75rem" } } }}
            />
          )}
        </Box>
        <Box>
          <Button onClick={onDismiss} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            OK
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DatePickerDialog;
