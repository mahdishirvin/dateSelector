/*
This component represents a date range card that displays a timeline of dates.
It receives several props to customize its behavior and appearance.
@param {dateCardProps} props - An object containing the props passed to this component.
@returns {JSX.Element} A JSX element that renders the date range card.
*/
import * as React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { ThemeProvider } from "@mui/material/styles";
import { SetTheme } from "./settheme";
import { useHotkeys } from "react-hotkeys-hook";
import TopRow from "./toprow";
import RangeSlider from "./rangeslider";
import { dateCardProps, dateRange } from "../interface";
import { useDateMoveKeys } from "./datemovekeys";
import {
  Increment,
  clampRangeToScope,
  equalRanges,
  useInputParms,
} from "../dateutils";
import { HelpProvider } from "./helpprovider";
import LandingPage from "./landingpage";
import { compareAsc, format } from "date-fns";
import { useLocalization } from "../localeutils";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function DateRangeCard(props: dateCardProps) {
  const fallbackRange: dateRange = React.useMemo(
    () => ({ start: new Date(), end: new Date() }),
    [],
  );
  // console.log("DateRangeCard rendered with props:", props); // Debug log to trace renders and prop values

  // Validate that the dates are not uninitialized or legacy epoch values
  const hasValidDates = !!(
    props.dates &&
    props.dates.start &&
    new Date(props.dates.start).getFullYear() > 1970
  );
  const hasValidScope = !!(
    props.rangeScope &&
    props.rangeScope.start &&
    new Date(props.rangeScope.start).getFullYear() > 1970
  );

  const safeDates = useMemo(
    () =>
      hasValidDates
        ? props.dates!
        : hasValidScope
          ? props.rangeScope!
          : fallbackRange,
    [
      hasValidDates,
      props.dates,
      hasValidScope,
      props.rangeScope,
      fallbackRange,
    ],
  );
  const safeRangeScope = useMemo(
    () => (hasValidScope ? props.rangeScope! : safeDates),
    [hasValidScope, props.rangeScope, safeDates],
  );
  const safeStepInit = useMemo(() => props.stepInit ?? "day", [props.stepInit]);
  const safeStepViz = useMemo(
    () =>
      props.stepViz ??
      ({
        day: true,
        week: true,
        pay: false,
        month: true,
        quarter: false,
        year: true,
      } as const),
    [props.stepViz],
  );

  // Use useState to manage the UI's date state, initialized from props.
  const [currentDates, setCurrentDates] = useState<dateRange>(safeDates);
  const [previewDates, setPreviewDates] = useState<dateRange | null>(null);
  const previewFrameRef = useRef<number | null>(null);
  const pendingPreviewRef = useRef<dateRange | null>(null);
  const suppressPropSyncRef = useRef(false);
  const propSyncTimeoutRef = useRef<number | null>(null);
  const prevScopeRef = useRef<dateRange | null>(null);

  // State for the context menu: tracks the mouse coordinates when open
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // keep UI in sync if the Power BI changes dates externally
  useEffect(() => {
    if (suppressPropSyncRef.current) {
      return;
    }

    if (hasValidDates && !equalRanges(props.dates!, currentDates)) {
      setCurrentDates(props.dates!);
      setPreviewDates(null);
      pendingPreviewRef.current = null;
      if (previewFrameRef.current !== null) {
        if (
          typeof window !== "undefined" &&
          typeof window.cancelAnimationFrame === "function"
        ) {
          window.cancelAnimationFrame(previewFrameRef.current);
        } else {
          window.clearTimeout(previewFrameRef.current);
        }
        previewFrameRef.current = null;
      }
    }
  }, [props.dates, currentDates, hasValidDates]);

  // When an external filter changes the data scope, adjust selection to stay within it.
  // If the current selection is completely outside the new scope, reset to the full scope.
  // If it partially overlaps, clamp the edges.
  useEffect(() => {
    if (!hasValidScope) return;
    const prevScope = prevScopeRef.current;
    prevScopeRef.current = safeRangeScope;
    if (!prevScope || equalRanges(prevScope, safeRangeScope)) return;

    const isCompletelyOutside =
      currentDates.end.getTime() < safeRangeScope.start.getTime() ||
      currentDates.start.getTime() > safeRangeScope.end.getTime();

    const adjusted = isCompletelyOutside
      ? safeRangeScope
      : clampRangeToScope(currentDates, safeRangeScope);

    if (!equalRanges(adjusted, currentDates)) {
      suppressPropSyncRef.current = true;
      if (propSyncTimeoutRef.current !== null) window.clearTimeout(propSyncTimeoutRef.current);
      propSyncTimeoutRef.current = window.setTimeout(() => {
        suppressPropSyncRef.current = false;
        propSyncTimeoutRef.current = null;
      }, 500);
      setCurrentDates(adjusted);
      setPreviewDates(null);
      props.onFilterChanged?.(adjusted);
    }
    // currentDates intentionally excluded — we only want to run when scope changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRangeScope, hasValidScope]);

  useEffect(() => {
    return () => {
      if (previewFrameRef.current !== null) {
        if (
          typeof window !== "undefined" &&
          typeof window.cancelAnimationFrame === "function"
        ) {
          window.cancelAnimationFrame(previewFrameRef.current);
        } else {
          window.clearTimeout(previewFrameRef.current);
        }
        previewFrameRef.current = null;
      }
    };
  }, []);

  // Use the localization hook to get the localization manager.
  const localization = useLocalization();

  // Hook to get date utilities for calculation
  const input = useInputParms();

  // CRITICAL GUARD: Added try/catch and baseline string fallback to prevent calculation crashes
  const visibleDates = previewDates ?? currentDates;

  const dateSpan = useMemo(() => {
    if (!props.landingOff || !visibleDates?.start || !safeRangeScope?.start) {
      return { string: "" };
    }
    try {
      return input(visibleDates, safeRangeScope) ?? { string: "" };
    } catch (e) {
      console.warn("Failed to calculate dateSpan safely:", e);
      return { string: "" };
    }
  }, [input, visibleDates, safeRangeScope, props.landingOff]);

  // Memoize the theme creation to avoid re-calculating on every render.
  const theme = useMemo(
    () =>
      SetTheme({
        themeMode: props.themeMode,
        themeColor: props.themeColor ?? "#607d8b",
        themeFont: props.themeFont ?? "Segoe UI",
        fontSize: String(props.fontSize ?? 10),
        fontColor: props.fontColor ?? "#000000",
      }),
    [
      props.themeMode,
      props.themeColor,
      props.themeFont,
      props.fontSize,
      props.fontColor,
    ],
  );

  // Use useState to manage component-level state, initialized from props.
  const [openSlider, setOpenSlider] = useState<boolean>(
    props.showSlider ?? false,
  );
  const [stepValue, setStepValue] = useState<string>(safeStepInit);
  const [stepOpen, setStepOpen] = useState<boolean>(false);

  // SAFETY GUARD: Short circuit Increment loop checks if dates are missing
  const current = useMemo(() => {
    if (!props.landingOff || !hasValidScope) return [];
    try {
      return Increment(
        safeStepViz,
        props.weekStartDay ?? 0,
        props.yearStartMonth ?? 0,
        localization,
        props.payProps,
        props.showMore ?? false,
        safeRangeScope,
      );
    } catch {
      return [];
    }
  }, [
    safeStepViz,
    props.weekStartDay,
    props.yearStartMonth,
    localization,
    props.payProps,
    props.showMore,
    safeRangeScope,
    props.landingOff,
    hasValidScope,
  ]);

  // Use a single useEffect to handle prop changes for initial state.
  useEffect(() => {
    setOpenSlider(props.showSlider ?? false);
    setStepValue(props.stepInit ?? "day");
  }, [props.showSlider, props.stepInit]);

  // Use useCallback to memoize the toggle functions
  const toggleSlider = useCallback(() => setOpenSlider((prev) => !prev), []);
  const toggleStepOpen = useCallback(() => setStepOpen((prev) => !prev), []);

  // Handler for opening the context menu
  const handleContextMenu = (event: React.MouseEvent) => {
    if (!props.landingOff) return; // Block interactions if fields are missing
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  // Handler for closing the context menu
  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handler to prevent context menu from appearing when the MUI menu is already open
  const handleMenuContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleClose();
  };

  // UI-only updates
  const handlePreviewChange = useCallback(
    (range: [Date, Date]) => {
      const sorted = props.singleDay
        ? [range[0], range[0]]
        : [...range].sort((a, b) => a.getTime() - b.getTime());

      const nextRange = { start: sorted[0], end: sorted[1] };
      const resolvedRange = props.limitToScope
        ? clampRangeToScope(nextRange, safeRangeScope)
        : nextRange;

      pendingPreviewRef.current = resolvedRange;
      if (previewFrameRef.current !== null) {
        return;
      }

      const applyPreview = () => {
        setPreviewDates(pendingPreviewRef.current);
        previewFrameRef.current = null;
      };

      if (
        typeof window !== "undefined" &&
        typeof window.requestAnimationFrame === "function"
      ) {
        previewFrameRef.current = window.requestAnimationFrame(applyPreview);
      } else {
        previewFrameRef.current = window.setTimeout(applyPreview, 0);
      }
    },
    [props.singleDay, props.limitToScope, safeRangeScope],
  );

  // This is the centralized handler.
  const handleDateChange = useCallback(
    (filter: [Date, Date]) => {
      const sortedDates = props.singleDay
        ? [filter[0], filter[0]]
        : filter.sort(compareAsc);

      const nextRange: dateRange = {
        start: sortedDates[0],
        end: sortedDates[1],
      };

      const resolvedRange = props.limitToScope
        ? clampRangeToScope(nextRange, safeRangeScope)
        : nextRange;

      suppressPropSyncRef.current = true;
      if (propSyncTimeoutRef.current !== null) {
        window.clearTimeout(propSyncTimeoutRef.current);
      }
      // 500ms covers PBI's async update() cycle; 0ms cleared before it ran.
      propSyncTimeoutRef.current = window.setTimeout(() => {
        suppressPropSyncRef.current = false;
        propSyncTimeoutRef.current = null;
      }, 500);

      setCurrentDates(resolvedRange);
      setPreviewDates(null);
      pendingPreviewRef.current = null;
      if (previewFrameRef.current !== null) {
        if (
          typeof window !== "undefined" &&
          typeof window.cancelAnimationFrame === "function"
        ) {
          window.cancelAnimationFrame(previewFrameRef.current);
        } else {
          window.clearTimeout(previewFrameRef.current);
        }
        previewFrameRef.current = null;
      }
      props.onFilterChanged?.(resolvedRange);
    },
    [
      props.singleDay,
      props.limitToScope,
      props.onFilterChanged,
      safeRangeScope,
    ],
  );

  const onChangeVal = useCallback(
    (filter: Date[]) => {
      if (filter.length < 2) return;
      handleDateChange([filter[0], filter[1]]);
    },
    [handleDateChange],
  );

  // Use the custom hook for keyboard shortcuts.
  useDateMoveKeys(onChangeVal, stepValue, visibleDates, current);
  useHotkeys("s", toggleSlider, [openSlider]);

  const rangeDescriptionLabel = localization.getDisplayName("Range");

  // RENDER CONTAINER CRITICAL CHANGE: Always render the outer wrapper framework
  return (
    <ThemeProvider theme={theme}>
      <HelpProvider
        showHelpIcon={props.showHelpIcon}
        showTooltip={props.showTooltip}
        showExtendedTooltip={props.showExtendedTooltip}
        localization={localization}
        themeMode={props.themeMode}
      >
        {!props.landingOff ? (
          // Renders inside the wrapper tree so settings panel properties register properly
          <LandingPage />
        ) : (
          <>
            <div
              onContextMenu={handleContextMenu}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                background: "transparent",
              }}
            />

            <Grid
              container
              sx={{ display: "flex", flexDirection: "column" }}
              onContextMenu={handleContextMenu}
              style={{ position: "relative", zIndex: 1 }}
            >
              <TopRow
                {...props}
                dates={visibleDates}
                showMore={props.showMore}
                showMove={props.showMove}
                localization={localization}
                showExpand={props.showExpand}
                showSlider={props.showSlider ?? false}
                openSlider={openSlider}
                toggleSlider={toggleSlider}
                stepOpen={stepOpen}
                stepValue={stepValue}
                handleVal={onChangeVal}
                handleClick={toggleStepOpen}
                setStepValue={setStepValue}
                setStepOpen={setStepOpen}
                current={current}
              />
              <Zoom in={openSlider}>
                <Grid container spacing={0} size={12}>
                  <Grid size="grow" sx={{ marginLeft: 1, paddingTop: 0.1 }}>
                    <RangeSlider
                      {...props}
                      dates={visibleDates}
                      stepValue={stepValue}
                      stepFmt={props.stepFmt}
                      rangeScope={safeRangeScope}
                      localization={localization}
                      onPreview={handlePreviewChange}
                      onCommit={onChangeVal}
                    />
                  </Grid>
                </Grid>
              </Zoom>
            </Grid>
          </>
        )}
      </HelpProvider>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        onClick={handleClose}
        onContextMenu={handleMenuContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        sx={{
          "& .MuiPaper-root": {
            maxHeight: "60px",
            "& .MuiList-root": {
              paddingTop: "2px",
              paddingBottom: "2px",
            },
          },
        }}
      >
        <MenuItem
          sx={{
            minHeight: "20px",
            paddingY: "2px",
            fontSize: "0.55rem",
            color: theme.palette.text.primary,
          }}
        >
          {rangeDescriptionLabel}: {dateSpan?.string ?? ""}
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
}
