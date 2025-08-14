import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import { areIntervalsOverlapping } from "date-fns";
import Typography from "@mui/material/Typography";
import { dateCardProps, dateRange } from "../interface";
import RngeTooltip from "./rngetooltip";
import DateIntervalPicker from "./dateintervalpicker";
import { Badge } from "@mui/material";

export default function UseCurrent(props: dateCardProps) {
  const {
    rangeScope,
    showMore,
    showCurrent,
    showIconText,
    current,
    stepValue,
    singleDay,
    handleVal,
    limitToScope,
    handleStep,
  } = props;

  const [ttl, setTtl] = React.useState(true);

  const handleDate = (val: dateRange) => {
    handleVal([val.start, singleDay ? val.start : val.end]);
  };

  const handleStepChange = (val: string) => {
    const _val = val === "today" ? "day" : val;
    handleStep(_val);
  };

  return (
    <>
      {showCurrent && (
        <Box sx={{ pl: 0 }}>
          <ButtonGroup size="small" aria-label="outlined button group">
            {current
              .filter((item) => {
                if (item.thisRange !== null) {
                  const x = ttl ? item.menu !== "2" : item.menu === "2";
                  const y =
                    !limitToScope &&
                    areIntervalsOverlapping(item.thisRange, rangeScope, {
                      inclusive: true,
                    });
                  return item.show && x && y;
                } else return showMore;
              })
              .map((item, index) => (
                <DateIntervalPicker
                  handleVal={handleDate}
                  stepValue={item.step}
                  key={`dip${item.thisRange}${index}`}
                >
                  <RngeTooltip
                    title={undefined}
                    key={`rtt${item.thisRange}${index}`}
                    detailRow={
                      item.menu !== "2"
                        ? `Set the date range to ${item.thisPeriod.toLowerCase()}. Right click for ${item.tip.toLowerCase()}s from today.`
                        : ``
                    }
                    placement="bottom"
                    topRow={
                      item.tip +
                      (item.step === stepValue && item.menu !== "2" ? " (T)" : "")
                    }
                  >
                    <IconButton
                      sx={
                        showIconText
                          ? {
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                width: item.thisPeriod.length * 0.2 + "rem",
                                minWidth: "24px",
                                alignItems: "center",
                                padding: "2px",top:"3px"
                            }
                          : { minWidth: "24px", padding: "2px" }
                      }
                      size="small"
                      color="primary"
                      key={`tbn${item.thisRange}${index}`}
                      value={item.tip.toLowerCase().trim()}
                      onMouseDown={() => {
                        if (item.thisRange) {
                          handleDate(item.thisRange);
                          handleStepChange(item.step);
                        } else {
                          setTtl(!ttl);
                        }
                      }}
                    >

                      <Badge
                        sx={{
                          "& .MuiBadge-badge": showIconText
                            ? {
                                display: "flex",
                                flexDirection: "row",
                                minWidth: item.thisPeriod.length * 0.21 + "rem",
                                padding: "2px", right: "-2px", top: "-2px",
                                textTransform: 'none',
                              }
                            : { minWidth: "24px", padding: "2px" , top: "-3px"},
                        }}
                        badgeContent={
                          showIconText && (
                            <Typography
                              key={`typ${item.thisRange}${index}`}
                              variant="caption"
                              sx={{ color: "text.primary", fontSize: "0.35rem" }}
                            >
                              {item.thisPeriod}
                            </Typography>
                          )
                        }
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        {item.icon}
                      </Badge>
                    </IconButton>
                  </RngeTooltip>
                </DateIntervalPicker>
              ))}
          </ButtonGroup>
        </Box>
      )}
    </>
  );
}
