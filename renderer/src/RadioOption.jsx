// :contentReference[oaicite:1]{index=1}
const RadioOption = ({ label, value, selected, onChange, handleLabelCalculate, handleRibbonCalculate }) => {
  const isSelected = selected === value;

  const handleChange = () => {
    // update selected in parent
    onChange(value);

    // immediately request both calculations using the new unit (pass unit directly)
    handleLabelCalculate?.(value);
    handleRibbonCalculate?.(value);
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${isSelected ? "border-[#1c395e]" : "border-neutral-400"}
        `}
      >
        <span
          className={`
            w-2.5 h-2.5 rounded-full bg-[#1c395e] transition-all duration-200
            ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}
          `}
        />
      </span>

      <span className="text-base text-neutral-800">{label}</span>

      <input
        type="radio"
        value={value}
        checked={isSelected}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
};

export default RadioOption;
