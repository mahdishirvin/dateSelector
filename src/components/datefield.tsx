import * as React from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { hexToCSSFilter } from "hex-to-css-filter";
import {
  textMeasurementService as tms,
  interfaces,
} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";
import TextProperties = interfaces.TextProperties;

interface DateFieldProps {
  id: "start" | "end";
  value: string;
  max?: string;
  min?: string;
  error?: boolean;
  underline?: boolean;
  type?: string;
  width?: number;
  fontBold?: boolean;
  fontFamily?: string;
  fontColor?: string;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  fontWeight?: string;
  InputFontSize?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  doUpdate: (id: string, value: string) => void;
}

export const DateField: React.FC<DateFieldProps> = (props) => {
  const { id, value, doUpdate, underline, max, min = "date" } = props;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // console.log("Enter key pressed:", e);
  if (e.key === "Enter") {
      e.preventDefault();
      const inputElement = e.target as HTMLInputElement;
      if (inputElement && inputElement.value) {
        doUpdate(id, inputElement.value);
      }
    }
  };

  const theme = useTheme();
  const textProperties: TextProperties = {
    text: value,
    fontFamily: theme.typography.fontFamily,
    fontSize: pixelConverter.toString(theme.typography.fontSize),
  };

  return (
    <TextField
      id={id}
      sx={{
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          display: "initial !important",
          filter: theme.palette.primary.main
            ? hexToCSSFilter(theme.palette.primary.main).filter
            : "",
        },
        input: {
          color: props.fontColor,
          fontWeight: props.fontBold
            ? theme.typography.fontWeightBold
            : theme.typography.fontWeightRegular,
        fontStyle: props.fontItalic ? "italic" : "normal",
        },
        paddingTop: "2px",
        width:
          tms.measureSvgTextWidth(textProperties) +
          theme.typography.fontSize * 3.25,
      }}
      type="date"
      variant="standard"
      size="small"
      placeholder={"yyyy-MM-dd"}
      onKeyDown={handleKeyPress}
      slotProps={{
        input: {
          disableUnderline: underline,
        },
        htmlInput: {
          max,
          min,
        },
      }}
      {...props}
    />
  );
};
