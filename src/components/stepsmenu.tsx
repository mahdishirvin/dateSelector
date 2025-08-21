import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import RngeTooltip from "./rngetooltip";
import { Increment } from "../dateutils";
import { stepProps } from "../interface";

export default function StepsMenu(props: stepProps) {
  const { stepViz, stepValue, payProps, viz, handleStep, handleViz, localization } = props;
  const actions = React.useMemo(() => Increment(stepViz, null, null, payProps), [stepViz, payProps]);
      const periodTitle = {
      day: localization.getDisplayName("Step_Day"),
      week: localization.getDisplayName("Step_Week"),
      pay: localization.getDisplayName("Step_Pay"),
      month: localization.getDisplayName("Step_Month"),
      quarter: localization.getDisplayName("Step_Quarter"),
      year: localization.getDisplayName("Step_Year"),
    };


  const handleClick = (event: React.MouseEvent<HTMLElement>, operation: string | null) => {
    const _op = operation?.toLowerCase().trim();
    if (handleStep && _op) {
      handleStep(_op);
      handleViz(!viz);
    }
  };

  return (
    <>
      {viz && (
        <Box sx={{ p: 0 }}>
          <ToggleButtonGroup value={stepValue} size="small" aria-label="outlined button group" exclusive>
            {actions
              .filter((value) => value.show && value.menu === "1")
              .map((action, index) => (
                <ToggleButton key={action.tip + index} value={action.step} onClick={(e) => handleClick(e, action.step)}>
                  <RngeTooltip
                    title={undefined}
                    topRow={`${periodTitle[action.step]} - (${action.step.charAt(0).toUpperCase()})`}
                    placement="bottom-end"
                  >
                    <Badge
                      sx={{ "& .MuiBadge-badge": { right: -2, top: -1 } }}
                      badgeContent={
                        <Typography variant="overline" sx={{ fontSize: ".35rem", textTransform: "none" }}>
                          {action.step.charAt(0).toUpperCase()}
                        </Typography>
                      }
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      {action.icon}
                    </Badge>
                  </RngeTooltip>
                </ToggleButton>
              ))}
          </ToggleButtonGroup>
        </Box>
      )}
    </>
  );
}
