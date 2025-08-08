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
  const { stepViz, stepValue, payProps, viz, handleStep, handleViz } = props;
  const actions = React.useMemo(() => Increment(stepViz, null, null, payProps), [stepViz, payProps]);

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
              .filter((value) => value.show && value.tip)
              .map((action, index) => (
                <ToggleButton key={action.tip + index} value={action.step} onClick={(e) => handleClick(e, action.step)}>
                  <RngeTooltip
                    title={undefined}
                    topRow={`${action.tip} steps (${action.step.charAt(0).toUpperCase()})`}
                    placement="bottom-end"
                  >
                    <Badge
                      sx={{ "& .MuiBadge-badge": { right: -2, top: -1 } }}
                      badgeContent={
                        <Typography variant="overline" sx={{ fontSize: ".3rem", textTransform: "none" }}>
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
