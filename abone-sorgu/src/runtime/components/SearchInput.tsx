import React from "react";
import { TextInput, Button } from "jimu-ui";
import type { SearchInputProps } from "../types/maks.search-input.types";

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
