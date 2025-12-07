// src/context/LayoutProvider.jsx
import { createContext, useContext, useState } from "react";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [paperUnit, setPaperUnit] = useState("mm");
  const [couponUnit, setCouponUnit] = useState("mm");

  const [paperWidthPt, setPaperWidthPt] = useState(0);
  const [paperHeightPt, setPaperHeightPt] = useState(0);

  const [couponWidthPt, setCouponWidthPt] = useState(0);
  const [couponHeightPt, setCouponHeightPt] = useState(0);

  const [orientation, setOrientation] = useState("portrait");

  const [fontScale, setFontScale] = useState(1);

  const [rightMargin, setRightMargin] = useState(0);
  const [leftMargin, setLeftMargin] = useState(0);
  const [topMargin, setTopMargin] = useState(0);
  const [bottomMargin, setBottomMargin] = useState(0);

  const [userMarginOverride, setUserMarginOverride] = useState(false);

  // ⭐ NEW — tells SizeConfigPanel that a preset updated sizes
  const [presetUpdate, setPresetUpdate] = useState(false);

  const layout = {
    values: {
      paperUnit,
      couponUnit,
      paperWidthPt,
      paperHeightPt,
      couponWidthPt,
      couponHeightPt,
      orientation,
      fontScale,
      rightMargin,
      leftMargin,
      topMargin,
      bottomMargin,
      userMarginOverride,
      presetUpdate,        // ⭐ include it
    },

    set: {
      setPaperUnit,
      setCouponUnit,
      setPaperWidthPt,
      setPaperHeightPt,
      setCouponWidthPt,
      setCouponHeightPt,
      setOrientation,
      setFontScale,
      setRightMargin,
      setLeftMargin,
      setTopMargin,
      setBottomMargin,
      setUserMarginOverride,

      setPresetUpdate,     // ⭐ include setter
    },
  };

  return (
    <LayoutContext.Provider value={layout}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
