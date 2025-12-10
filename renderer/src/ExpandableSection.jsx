import SimpleInput from "./SimpleInput";

const ExpandableSection = ({ label, value, onChange, open, setOpen }) => {
  return (
    <div className="w-full border border-[#1c395e] rounded-xl p-4 bg-white">

      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center cursor-pointer select-none"
      >
        <p className="text-base font-medium text-[#1c395e]">{label}</p>

        <span
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${open ? "border-[#1c395e]" : "border-neutral-400"}
          `}
        >
          <span
            className={`
              w-2.5 h-2.5 rounded-full bg-[#1c395e] transition-all duration-200
              ${open ? "scale-100 opacity-100" : "scale-0 opacity-0"}
            `}
          ></span>
        </span>
      </div>

      {/* Expandable content */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${open ? "mt-4 max-h-40 opacity-100" : "max-h-0 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()} // prevent closing when input is clicked
      >
        <SimpleInput
          label="Qty of Ordered Labels"
          placeholder="Qty of Ordered Labels"
          txtSize="text-[13px]"
          padY="0"
          value={value}
          onChange={onChange}
        />
      </div>

    </div>
  );
};

export default ExpandableSection;
