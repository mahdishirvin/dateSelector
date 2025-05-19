import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Icon from "@mui/material/Icon";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

export default function LandingPage() {
  return (
    <Grid
      container
      spacing={1}
      direction="row"
      sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}
    >
      <Grid size="auto">
        <Icon color="disabled" fontSize="large">
          <CalendarMonthOutlinedIcon />
        </Icon>
      </Grid>
      <Grid size="grow">
        <Box sx={{ padding: 0.5 }}>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            sx={{ fontWeight: "light", color: "text.disabled" }}
          >
            Date Range Slicer, add a Date field to activate.
          </Typography>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            sx={{ color: "text.disabled", fontWeight: "light" }}
          >
            Features startup range, presets, an interactive timeline or a
            minimised date picker (range or single day).
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
