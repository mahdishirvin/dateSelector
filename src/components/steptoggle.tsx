import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import BlurOn from "@mui/icons-material/BlurOn";
import { stepProps } from "../interface";
import { useHotkeys } from "react-hotkeys-hook";
import RngeTooltip from "./rngetooltip";
import { useLocalization } from "../localeutils";

export default function StepToggle(props: stepProps) {
  const { stepViz, stepValue, viz, handleStep, handleClick, localization } = props;

  const TopRow = localization.getDisplayName("stepToggleTopRow");
  const DetailRow = localization.getDisplayName("stepToggleDetailRow");
  const periodTitle = {
    day: localization.getDisplayName("Step_Day"),
    week: localization.getDisplayName("Step_Week"),
    pay: localization.getDisplayName("Step_Pay"),
    month: localization.getDisplayName("Step_Month"),
    quarter: localization.getDisplayName("Step_Quarter"),
    year: localization.getDisplayName("Step_Year"),
  };

  const keyHandler = (period) => {
    if (handleStep && stepViz[period]) {
      handleStep(period);
    }
  };

  const trueKeys = Object.keys(stepViz).filter((key) => stepViz[key]);
  const ShortCut = trueKeys
    .map((key) => key.charAt(0).toUpperCase())
    .join(", ");

  useHotkeys("d", () => keyHandler("day"));
  useHotkeys("w", () => keyHandler("week"));
  useHotkeys("p", () => keyHandler("pay"));
  useHotkeys("m", () => keyHandler("month"));
  useHotkeys("q", () => keyHandler("quarter"));
  useHotkeys("y", () => keyHandler("year"));

  return (
    !viz && (
      <IconButton value="on" size="small" onClick={handleClick}>
        <Badge
          sx={{ "& .MuiBadge-badge": { right: -2, top: -1 } }}
          badgeContent={
            <Typography
              variant="overline"
              sx={{ fontSize: ".4rem", textTransform: "none" }}
            >
              {stepValue.charAt(0).toUpperCase()}
            </Typography>
          }
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <RngeTooltip
            title={undefined}
            topRow={`${TopRow}${periodTitle[stepValue]} (${ShortCut})`}
            detailRow={DetailRow}
            placement="bottom"
          >
            <BlurOn style={{ fontSize: "inherit" }} color="primary" />
          </RngeTooltip>
        </Badge>
      </IconButton>
    )
  );
}
