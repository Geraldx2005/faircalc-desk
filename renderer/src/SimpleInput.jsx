import React from "react";

const SimpleInput = ({ label, placeholder, value, onChange, txtSize = "text-sm", padY = "2" }) => {
  return (
    <div className="flex w-full">
      <label
        className={`w-[40%] ${txtSize} flex items-center justify-center text-center p-2 py-${padY} font-medium text-white bg-[#1c4270] rounded-l-lg border border-[#1c395e]`}
      >
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value;

          if (val === "") {
            onChange("");
            return;
          }

          // Allow only numbers + optional single decimal point
          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
            onChange(val);
          }
        }}
        className="
          w-[60%] px-4 py-2.5
          border border-[#1c395e] rounded-lg rounded-l-none
          text-base text-neutral-900
          placeholder:text-sm placeholder-[#1c395e]/70
          transition-all duration-200

          focus:outline-none 
          focus:border-neutral-900 
          focus:ring-1 focus:ring-neutral-500/40
        "
      />
    </div>
  );
};

export default SimpleInput;
