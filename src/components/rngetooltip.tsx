import * as React from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { useHelpContext } from "./helpprovider";

interface RngeTooltipProps extends Omit<TooltipProps, "title"> {
  topRow?: string;
  detailRow?: string;
  title?: string;
  disableTooltip?: boolean;
  shortCut?: string;
  infoRow?: string;
  detailFlag?: boolean;
  children: React.ReactElement;
}

const RngeTooltip: React.FC<RngeTooltipProps> = ({
  topRow,
  shortCut,
  detailRow,
  title,
  disableTooltip = false,
  children,
  infoRow,
  detailFlag,
  ...tooltipProps
}) => {
  const { showTooltip, showExtendedTooltip } = useHelpContext();

  const effectiveDetailFlag = detailFlag ?? showExtendedTooltip;
  const shouldShow = showTooltip && !disableTooltip;

  const content = React.useMemo(() => {
    if (!effectiveDetailFlag) {
      // If not in extended mode, return the top row or title.
      return topRow || title || null;
    }

    // In extended mode, build the detailed tooltip content.
    const header = topRow || title;
    return (
      <div style={{ padding: "8px", boxSizing: "border-box" }}>
        {header && <div style={{ fontWeight: "bold" }}>{header}</div>}
        {detailRow && <div>{detailRow}</div>}
        {infoRow && <div style={{ fontStyle: "italic" }}>{infoRow}</div>}
      </div>
    );
  }, [effectiveDetailFlag, topRow, title, detailRow, infoRow]);

  if (!shouldShow || !content) {
    return children;
  }

  return (
    <Tooltip
      enterDelay={500}
      title={content}
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: "offset", options: { offset: [0, -5] } }],
        },
        tooltip: {
          sx: (theme) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            padding: "4px",
            boxShadow: theme.shadows[4],
            // backgroundColor: theme.palette.text.primary,
            // color: theme.palette.background.paper,
            // fontSize: theme.typography.pxToRem(11),
            // Set border-radius to 0 to make the corners sharp
            borderRadius: 0,
            // Removed padding here since it's now in the content div
            maxWidth: 250,
            // Added a border for better definition
            // border: `1px solid ${theme.palette.text.secondary}`,
          }),
        },
        arrow: {
          sx: (theme) => ({
            "&::before": {
              backgroundColor: theme.palette.background.paper,
            },
          }),
        }
      }}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

export default RngeTooltip;
