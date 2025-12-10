const SimpleButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full h-12
        px-5 py-2.5
        bg-[#1c4270] text-white
        flex items-center justify-center
        rounded-lg
        text-base font-medium
        shadow-sm
        transition-all duration-200

        hover:bg-[#1c395e]
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-neutral-900/20
      "
    >
      {label}
    </button>
  );
};

export default SimpleButton;
