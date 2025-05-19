import React, { createContext, useContext, useState, ReactNode } from "react";
import enAU from "./enAU";
// import enUS from "./enUS";

const languages = {
  enAU,
  //   enUS,
};

type Language = keyof typeof languages;

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  tokens: typeof enAU;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("enAU");

  const value = {
    language,
    setLanguage,
    tokens: languages[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
