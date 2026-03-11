import React from "react";
import { ButtonProps } from "../types/maks.button.types";


const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, styles }) => {
  return (
    <button
      className="custom-button"
      onClick={onClick}
      disabled={disabled}
      style={styles}
    >
      {children}
    </button>
  );
};

export default Button;