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
  detailFlag = useHelpContext().showExtendedTooltip,
  ...tooltipProps
}) => {
  const { showTooltip } = useHelpContext();

  const shouldShow = showTooltip && !disableTooltip;
  const content = detailFlag ? (
    <div>
      {topRow || title && <div style={{ fontWeight: "bold" }}>{topRow? topRow:title}</div>}
      {detailRow && <div>{detailRow}</div>}
      {infoRow && <div style={{ fontStyle: "italic" }}>{infoRow}</div>}
    </div>
  ) : (
    title || topRow
  );

  if (!shouldShow || !content) return children;

  return (
    <Tooltip
      title={content}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, -5] },
            },
          ],
        },
        tooltip: {
          sx: (theme) => ({
            backgroundColor: theme.palette.text.primary,
            color: theme.palette.background.paper,
            fontSize: theme.typography.pxToRem(11),
            padding: theme.spacing(1),
            maxWidth: 250,
          }),
        },
        arrow: {
          sx: (theme) => ({
            color: theme.palette.text.primary,
          }),
        },
      }}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

export default RngeTooltip;
interface valueProps {
  children: React.ReactElement;
  index: number;
}
export function ValueLabel(props: valueProps) {
  const { children,  index } = props;
  const loc = index === 0 ? "top-end" : "bottom-start";
  return (
    <RngeTooltip enterTouchDelay={0} placement={loc}  arrow>
      {children}
    </RngeTooltip>
  );
}
