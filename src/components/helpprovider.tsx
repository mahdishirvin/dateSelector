import React, { useState, useContext, useMemo, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { Chat, ChatBubbleOutlineOutlined } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocalization } from "../localeutils";
import { useTheme } from "@mui/material/styles";

const HelpContext = React.createContext({
  showHelpIcon: false,
  showTooltip: true,
  showExtendedTooltip: false,
  toggleHelp: () => {},
  setShowHelpIcon: (_: boolean) => {},
  setShowTooltip: (_: boolean) => {},
  setShowExtendedTooltip: (_: boolean) => {},
  setTooltipEnabled: (enabled: boolean) => {},
});

export const useHelpContext = () => useContext(HelpContext);

export const HelpProvider = ({
  children,
  showHelpIcon,
  showTooltip,
  showExtendedTooltip,
}) => {
 const theme = useTheme();

   const localisation = useLocalization();
   const TopRowInfo = localisation.getDisplayName("helpProviderTopRowInfo");
   const DetailRowInfo = localisation.getDisplayName("helpProviderDetailRowInfo");
   const TopRowHelp = localisation.getDisplayName("helpProviderTopRowHelp");
   const DetailRowHelp = localisation.getDisplayName("helpProviderDetailRowHelp");

 const [helpIcon, setHelpIcon] = useState(showHelpIcon ?? false);
  const [tooltip, setTooltip] = useState(showTooltip ?? true);
  const [extendedTooltip, setExtendedTooltip] = useState(showExtendedTooltip ?? false);

  useEffect(() => {
    setHelpIcon(showHelpIcon ?? false);
  }, [showHelpIcon]);
  useEffect(() => {
    setTooltip(showTooltip ?? true);
  }, [showTooltip]);
  useEffect(() => {
    setExtendedTooltip(showExtendedTooltip ?? false);
  }, [showExtendedTooltip]);

  const toggleHelp = () => setExtendedTooltip((prev) => !prev);

  useHotkeys("escape", () => setHelpIcon(false));
  useHotkeys(["h"], () => toggleHelp());

  const value = useMemo(() => ({
    showHelpIcon: helpIcon,
    showTooltip: tooltip,
    showExtendedTooltip: extendedTooltip,
    toggleHelp,
    setShowHelpIcon: setHelpIcon,
    setShowTooltip: setTooltip,
    setShowExtendedTooltip: setExtendedTooltip,
    setTooltipEnabled: (enabled: boolean) => setTooltip(enabled),
  }), [helpIcon, tooltip, extendedTooltip, toggleHelp]);

  return (
    <HelpContext.Provider value={value}>
      {helpIcon && tooltip && (
        <Tooltip
          arrow
          title={
            extendedTooltip ? (
              <>
                <div>
                  <b>{TopRowInfo}</b>
                </div>
                <div>{DetailRowInfo}</div>
              </>
            ) : (
              <>
                <div>
                  <b>{TopRowHelp}</b>
                </div>
                <div>{DetailRowHelp}</div>
              </>
            )
          }
          placement="left"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: extendedTooltip
                  ? theme.palette.secondary.dark
                  : theme.palette.primary.dark,
                color: theme.palette.background.paper,
                maxWidth: 350,
                fontSize: theme.typography.pxToRem(11),
                padding: theme.spacing(1),
                zIndex: theme.zIndex.tooltip + 1,
              },
            },          }}
        >
          <IconButton
            size="small"
            sx={{ position: "absolute", right: 0, top: 0, margin: 0.2 }}
            color={extendedTooltip ? "secondary" : "primary"}
            onClick={toggleHelp}
          >
            {extendedTooltip ? (
              <Chat style={{ fontSize: 8 }} />
            ) : (
              <ChatBubbleOutlineOutlined style={{ fontSize: 8 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
      {children}
    </HelpContext.Provider>
  );
};