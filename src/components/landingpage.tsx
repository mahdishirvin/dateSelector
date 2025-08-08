import * as React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useLocalization } from "../localeutils";
// This component serves as a landing page for the Date Range Slicer visual in Power BI.
// It provides a brief description and a visual representation of the slicer when no date field is selected.

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper, // "#fefefe",
    color: theme.palette.text.primary, // "rgba(0, 0, 0, 0.87)",
    maxWidth: "80vw",
    boxShadow: theme.shadows[2],
  },
}));

export default function LandingPage() {
  const localisation = useLocalization();
  const tipTitle = localisation.getDisplayName("landingPageTitle");
  const tipButton = localisation.getDisplayName("landingPageButton");
  const tipDescription = localisation.getDisplayName("landingPageDescription");

  return (
    <Grid
      container
      spacing={1}
      sx={{
        justifyContent: "flex-start",
        alignItems: "flex-start",
        cursor: "pointer",
      }}
    >
      <Grid size="auto">
        <HtmlTooltip
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -14],
                  },
                },
              ],
            },
          }}
          placement="right-start"
          title={
            <React.Fragment>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                }}
                color="theme.palette.text.primary"
              >
                {tipTitle}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "light",
                  fontSize: "0.6rem",
                }}
                color="theme.palette.text.primary"
              >
                {tipDescription}
              </Typography>
            </React.Fragment>
          }
        >
          <Icon
            color="disabled"
            sx={{
              fontWeight: "light",
              fontSize: "0.9rem",
              padding: 0.5,
              cursor: "default",
            }}
            aria-label={tipTitle}
          >
            <InfoOutlinedIcon style={{ fontSize: "1.2rem" }} />
          </Icon>
        </HtmlTooltip>
      </Grid>
      <Grid size="grow">
        <Typography
          variant="body1"
          gutterBottom
          color="textDisabled"
            sx={{
              fontWeight: "light",
              fontSize: "0.8rem",
              padding: 0.5,
              cursor: "default",
            }}
        >
          {tipButton}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="80vh"
            width="80vw"
            viewBox="0 0 881 227"
          >
            <g transform="translate(-100 -109)">
              <rect
                width="881"
                height="227"
                transform="translate(100 109)"
                fill="#f4f4f4"
              />
              <rect
                width="197"
                height="52"
                transform="translate(156 152)"
                fill="#d2d3d4"
              />
              <rect
                width="197"
                height="52"
                transform="translate(372 152)"
                fill="#d2d3d4"
              />
              <line
                x2="809"
                y2="1"
                transform="translate(138.5 264.5)"
                fill="none"
                stroke="#d2d3d4"
                stroke-width="4"
              />
              <line
                y1="2"
                x2="464"
                transform="translate(336.5 263.5)"
                fill="none"
                stroke="#d2d3d4"
                stroke-width="5"
              />
              <g
                transform="translate(800 253)"
                fill="#d2d3d4"
                stroke="#d2d3d4"
                stroke-width="3"
              >
                <circle cx="12" cy="12" r="12" stroke="none" />
                <circle cx="12" cy="12" r="10.5" fill="none" />
              </g>
              <g
                transform="translate(312 253)"
                fill="#d2d3d4"
                stroke="#d2d3d4"
                stroke-width="3"
              >
                <circle cx="12" cy="12" r="12" stroke="none" />
                <circle cx="12" cy="12" r="10.5" fill="none" />
              </g>
            </g>
          </svg>
        </Box>
      </Grid>
    </Grid>
  );
}
