import React from "react";
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

export const LocalizationContext = React.createContext<ILocalizationManager | undefined>(undefined);

export const useLocalization = () => {
  const context = React.useContext(LocalizationContext);
  if (!context) throw new Error("useLocalization must be used within a LocalizationProvider");
  return context;
};