import * as React from "react";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RngeTooltip from "./rngetooltip";
import { useLocalization } from "../localeutils";
interface ToggleSliderButtonProps {
  openSlider: boolean;
  toggleSlider: () => void;
}

function ToggleSliderButton({
  openSlider,
  toggleSlider,
}: ToggleSliderButtonProps) {

  const localisation = useLocalization();

  const TopRowOpen = localisation.getDisplayName("toggleSliderButtonTopRowOpen");
  const TopRowClosed = localisation.getDisplayName("toggleSliderButtonTopRowClosed");
  const TopRowEnd = localisation.getDisplayName("toggleSliderButtonTopRowEnd");
  const DetailRowOpen = localisation.getDisplayName("toggleSliderButtonDetailRowOpen");
  const DetailRowClosed = localisation.getDisplayName("toggleSliderButtonDetailRowClosed");

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
