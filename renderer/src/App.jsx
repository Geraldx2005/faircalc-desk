import { useState } from "react";
import SegmentedButton from "./SegmentedButton";
import SimpleInput from "./SimpleInput";
import SimpleButton from "./SimpleButton";
import RadioOption from "./RadioOption";
import ExpandableSection from "./ExpandableSection";

const App = () => {
  const [tab, setTab] = useState("Label");
  const [selected, setSelected] = useState("mm");
  const [labelCost1000, setLabelCost1000] = useState(0);
  const [ribbonResults, setRibbonResults] = useState(null);
  const [isTTRSectionOpen, setIsTTRSectionOpen] = useState(false);

  const [labelForm, setLabelForm] = useState({
    labelWidth: "",
    labelHeight: "",
    rateSqIn: ""
  });

  const [ribbonForm, setRibbonForm] = useState({
    ribbonWidth: "",
    ribbonLength: "",
    rateSqMtr: "",
    howManyUp: "",
    orderedQty: ""
  });

  const deriveLabelDimsMM = (rawLabelForm, unit) => {
    const rawW = parseFloat(rawLabelForm.labelWidth);
    const rawH = parseFloat(rawLabelForm.labelHeight);
    if (isNaN(rawW) || isNaN(rawH)) return { widthMM: NaN, heightMM: NaN };
    if (unit === "inch") {
      return { widthMM: rawW * 25.4, heightMM: rawH * 25.4 };
    } else {
      return { widthMM: rawW, heightMM: rawH };
    }
  };

  const calculateLabelCost = (rawLabelForm, unit) => {
    const rate = parseFloat(rawLabelForm.rateSqIn);
    const { widthMM, heightMM } = deriveLabelDimsMM(rawLabelForm, unit);
    if (isNaN(widthMM) || isNaN(heightMM) || isNaN(rate)) return 0;
    const areaSqIn = (widthMM / 25.4) * (heightMM / 25.4);
    const costPerLabel = areaSqIn * rate;
    return Number((costPerLabel * 1000).toFixed(2));
  };

  const updateLabelField = (field, value) => {
    setLabelForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLabelCalculate = (unit) => {
    const usedUnit = unit || selected;
    const cost1000 = calculateLabelCost(labelForm, usedUnit);
    setLabelCost1000(cost1000);
    if (tab === "Ribbon") {
      handleRibbonCalculate(usedUnit, cost1000);
    }
  };

  const calculateRibbonCost = (ribbonForm, labelHeightMM, labelCost1000Param) => {
    const ribbonWidthMM = parseFloat(ribbonForm.ribbonWidth);
    const ribbonLengthM = parseFloat(ribbonForm.ribbonLength);
    const rateSqMtr = parseFloat(ribbonForm.rateSqMtr);
    const howManyUp = parseFloat(ribbonForm.howManyUp);
    const orderedQty = parseFloat(ribbonForm.orderedQty);

    if (
      isNaN(ribbonWidthMM) ||
      isNaN(ribbonLengthM) ||
      isNaN(rateSqMtr) ||
      isNaN(howManyUp) ||
      isNaN(labelHeightMM)
    ) {
      return null;
    }

    const ribbonWidthM = ribbonWidthMM / 1000;
    const areaSqM = ribbonWidthM * ribbonLengthM;
    const costPerRoll = areaSqM * rateSqMtr;

    const labelHeightM = labelHeightMM / 1000;
    const labelsPerRibbon = Math.floor((ribbonLengthM / labelHeightM) * howManyUp);

    if (labelsPerRibbon <= 0 || !isFinite(labelsPerRibbon)) {
      return {
        costPerRoll: Number(costPerRoll.toFixed(2)),
        labelsPerRibbon: 0,
        printingCostPer1000: 0,
        totalCostInclTTR: Number(labelCost1000Param || 0),
        ttrRequired: 0
      };
    }

    const costPerLabel = costPerRoll / labelsPerRibbon;
    const printingCostPer1000 = costPerLabel * 1000;
    const ttrRequired = orderedQty ? Math.ceil(orderedQty / labelsPerRibbon) : 0;
    const totalCostInclTTR = printingCostPer1000 + (labelCost1000Param || 0);

    return {
      costPerRoll: Number(costPerRoll.toFixed(2)),
      labelsPerRibbon: Number(labelsPerRibbon),
      printingCostPer1000: Number(printingCostPer1000.toFixed(2)),
      totalCostInclTTR: Number(totalCostInclTTR.toFixed(2)),
      ttrRequired: Number(ttrRequired)
    };
  };

  const handleRibbonCalculate = (unit, labelCostOverride) => {
    const usedUnit = unit || selected;
    const { heightMM } = deriveLabelDimsMM(labelForm, usedUnit);
    if (isNaN(heightMM)) return;

    const freshLabelCost =
      typeof labelCostOverride !== "undefined"
        ? labelCostOverride
        : calculateLabelCost(labelForm, usedUnit);

    const result = calculateRibbonCost(ribbonForm, heightMM, freshLabelCost);
    setRibbonResults(result);
  };

  const updateRibbonField = (field, value) => {
    setRibbonForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return "";
    return Number(num).toLocaleString("en-IN");
  };

  return (
    <>

      {/* ONE container: whole page scrolls */}
      <div className="minimal-scrollbar overflow-auto w-full min-h-screen bg-white flex justify-center">

        {/* App wrapper */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-4 p-4 bg-white">

          {/* HEADER */}
          <header className="flex items-center justify-center p-2 bg-white w-full">
            <span className="text-2xl font-bold text-[#1c395e]">
              {tab === "Label" ? "Label Calculator" : "Ribbon Calculator"}
            </span>
          </header>

          {/* SEGMENT BUTTONS */}
          <SegmentedButton
            options={["Label", "Ribbon"]}
            value={tab}
            onChange={setTab}
          />

          {/* CONTENT */}
          <div className="w-full h-full bg-white flex flex-col items-center justify-between">

            {/* LABEL TAB */}
            {tab === "Label" && (
              <div className="flex flex-col gap-4 w-full bg-white">
                <div className="bg-[#e5edf9] border border-[#1c395e] text-[#1c395e] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold">Cost per 1000 labels</p>
                  <p className="text-2xl font-bold">RS. {formatCurrency(labelCost1000)}</p>
                </div>

                <div className="flex justify-center gap-10">
                  <RadioOption
                    label="mm"
                    value="mm"
                    selected={selected}
                    onChange={(v) => setSelected(v)}
                    handleLabelCalculate={handleLabelCalculate}
                    handleRibbonCalculate={handleRibbonCalculate}
                  />
                  <RadioOption
                    label="inch"
                    value="inch"
                    selected={selected}
                    onChange={(v) => setSelected(v)}
                    handleLabelCalculate={handleLabelCalculate}
                    handleRibbonCalculate={handleRibbonCalculate}
                  />
                </div>

                <SimpleInput placeholder={"Width " + selected} label={`Width (${selected})`} value={labelForm.labelWidth} onChange={(v) => updateLabelField("labelWidth", v)} />
                <SimpleInput placeholder={"Height " + selected} label={`Height (${selected})`} value={labelForm.labelHeight} onChange={(v) => updateLabelField("labelHeight", v)} />
                <SimpleInput placeholder={"Rate per Sq. Inch"} label="Rate per Sq. Inch" value={labelForm.rateSqIn} onChange={(v) => updateLabelField("rateSqIn", v)} />

                <div className="flex justify-center gap-4">
                  <SimpleButton
                    label="Calculate"
                    onClick={() => {
                      handleLabelCalculate();
                      handleRibbonCalculate();
                    }}
                  />
                  <SimpleButton label="Clear" onClick={() => {
                    setLabelForm({ labelWidth: "", labelHeight: "", rateSqIn: "" });
                    setLabelCost1000(0);
                  }} />
                </div>
              </div>
            )}

            {/* RIBBON TAB */}
            {tab === "Ribbon" && (
              <div className="flex flex-col gap-4 w-full bg-white">
                <div className="bg-[#e5edf9] border border-[#1c395e] text-[#1c395e] font-semibold rounded-lg">
                  {ribbonResults ? (
                    <div className="w-full text-left">
                      <span className="w-full px-2 py-0 rounded-t-lg flex items-center justify-between gap-2 border-b border-[#1c395e]">
                        <p>Cost Per Ribbon Roll:</p>
                        <p className="font-bold">RS. {formatCurrency(ribbonResults.costPerRoll)}</p>
                      </span>
                      <span className="w-full px-2 py-0.5 flex items-center justify-between gap-2 border-b border-[#1c395e]">
                        <p>No. of Labels per Ribbon:</p>
                        <p className="font-bold">{ribbonResults.labelsPerRibbon}</p>
                      </span>
                      <span className="w-full px-2 py-0.5 flex items-center justify-between gap-2 border-b border-[#1c395e]">
                        <p>No. of TTR Required:</p>
                        <p className="font-bold">{ribbonResults.ttrRequired}</p>
                      </span>
                      <span className="w-full px-2 py-0.5 flex items-center justify-between gap-2 border-b border-[#1c395e]">
                        <p>Printing Cost per 1000 Labels:</p>
                        <p className="font-bold">RS. {formatCurrency(ribbonResults.printingCostPer1000)}</p>
                      </span>
                      <span className="w-full px-2 py-0.5 rounded-b-lg flex items-center justify-between gap-2">
                        <p>Total Cost incl. TTR per 1000:</p>
                        <p className="font-bold">RS. {formatCurrency(ribbonResults.totalCostInclTTR)}</p>
                      </span>
                    </div>
                  ) : (
                    <div className="w-full p-2">
                      <p className="text-[14px] text-neutral-700/95">
                        Fill ribbon inputs and click Calculate
                      </p>
                    </div>
                  )}
                </div>

                <SimpleInput placeholder={"Ribbon Width"} label="Ribbon Width (mm)" value={ribbonForm.ribbonWidth} onChange={(v) => updateRibbonField("ribbonWidth", v)} />
                <SimpleInput placeholder={"Ribbon Length"} label="Ribbon Length (m)" value={ribbonForm.ribbonLength} onChange={(v) => updateRibbonField("ribbonLength", v)} />
                <SimpleInput placeholder={"Rate per Sq. Mtr"} label="Rate per Sq. Mtr" value={ribbonForm.rateSqMtr} onChange={(v) => updateRibbonField("rateSqMtr", v)} />
                <SimpleInput placeholder={"How many up"} label="How many up labels" value={ribbonForm.howManyUp} onChange={(v) => updateRibbonField("howManyUp", v)} />

                <ExpandableSection
                  label="Calculate No. of TTR"
                  value={ribbonForm.orderedQty}
                  onChange={(v) => updateRibbonField("orderedQty", v)}
                  open={isTTRSectionOpen}
                  setOpen={setIsTTRSectionOpen}
                />

                <div className="flex justify-center gap-4">
                  <SimpleButton label="Calculate" onClick={() => handleRibbonCalculate()} />
                  <SimpleButton label="Clear" onClick={() => {
                    setRibbonForm({
                      ribbonWidth: "",
                      ribbonLength: "",
                      rateSqMtr: "",
                      howManyUp: "",
                      orderedQty: ""
                    });
                    setRibbonResults(null);
                  }} />
                </div>
              </div>
            )}

            <footer className="text-center font-bold text-[#1c395e]">
              Fairtech Systems
            </footer>
          </div>


        </div>
      </div>

    </>
  );
};

export default App;
