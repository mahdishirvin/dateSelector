import * as React from "react";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RngeTooltip from "./rngetooltip";
import { useLocalization } from "../localeutils";
interface ToggleSliderButtonProps {
  openSlider: boolean;
  toggleSlider: () => void;
  localization?: {
    getDisplayName: (key: string) => string;
  };
}

function ToggleSliderButton({
  openSlider,
  toggleSlider,
  localization,
}: ToggleSliderButtonProps) {
  const TopRowOpen = localization.getDisplayName(
    "toggleSliderButtonTopRowOpen"
  );
  const TopRowClosed = localization.getDisplayName(
    "toggleSliderButtonTopRowClosed"
  );
  const TopRowEnd = localization.getDisplayName("toggleSliderButtonTopRowEnd");
  const DetailRowOpen = localization.getDisplayName(
    "toggleSliderButtonDetailRowOpen"
  );
  const DetailRowClosed = localization.getDisplayName(
    "toggleSliderButtonDetailRowClosed"
  );

  const topRow = (openSlider ? TopRowOpen : TopRowClosed) + TopRowEnd;
  const detailRow = openSlider ? DetailRowOpen : DetailRowClosed;

  return (
    <IconButton
      aria-label="Toggle Slider"
      onClick={toggleSlider}
      id="menuToggle"
      size="small"
    >
      <RngeTooltip
        title={undefined}
        topRow={topRow}
        detailRow={detailRow}
        placement="bottom"
      >
        <MoreVertIcon style={{ fontSize: "inherit" }} />
      </RngeTooltip>
    </IconButton>
  );
}

export default React.memo(ToggleSliderButton);
