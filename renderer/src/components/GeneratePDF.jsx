import { Document, Page, View, pdf } from "@react-pdf/renderer";
import { useState, useEffect, useRef } from "react";
import { addTrimMarksToPDF } from "../utils/TrimMarksPDFLib";
import TokenTemplate from "../utils/TokenTemplate";
import { useLayout } from "../context/LayoutProvider";
import mergePDFBuffers from "../utils/mergePDFBuffers";
import ProgressBar from "../utils/ProgressBar";
import { useRefresh } from "../context/RefreshContext";
import Toast from "../utils/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { generateQR } from "../utils/generateQR";

// ----------------------------
// Utility Helpers
// ----------------------------

const split = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

function computeAutoMargins(layout) {
  const {
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
  } = layout.values;

  if (!paperWidthPt || !paperHeightPt || !couponWidthPt || !couponHeightPt)
    return;

  const cols = Math.floor(paperWidthPt / couponWidthPt);
  const rows = Math.floor(paperHeightPt / couponHeightPt);

  const usedW = cols * couponWidthPt;
  const usedH = rows * couponHeightPt;

  let marginX = Math.max(0, (paperWidthPt - usedW) / 2);
  let marginY = Math.max(0, (paperHeightPt - usedH) / 2);

  marginX -= paperWidthPt * 0.00008;
  marginY -= paperHeightPt * 0.00008;

  if (!layout.values.userMarginOverride) {
    layout.set.setLeftMargin(marginX);
    layout.set.setRightMargin(marginX);
    layout.set.setTopMargin(marginY);
    layout.set.setBottomMargin(marginY);
  }
}

const calculatePerPage = (layout) => {
  const {
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
  } = layout.values;

  const usableW = paperWidthPt - leftMargin - rightMargin;
  const usableH = paperHeightPt - topMargin - bottomMargin;

  const cols = Math.floor(usableW / couponWidthPt);
  const rows = Math.floor(usableH / couponHeightPt);

  return cols * rows;
};

// ----------------------------
// PDF Document Component
// ----------------------------

const PDFDoc = ({ coupons, qrList, layout }) => {
  const { values } = layout;
  const {
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    fontScale,
  } = values;

  const usableW = paperWidthPt - leftMargin - rightMargin;
  const usableH = paperHeightPt - topMargin - bottomMargin;

  const columns = Math.max(1, Math.floor(usableW / couponWidthPt));
  const rows = Math.max(1, Math.floor(usableH / couponHeightPt));
  const perPage = columns * rows;

  const pages = [];
  for (let i = 0; i < coupons.length; i += perPage) {
    pages.push(coupons.slice(i, i + perPage));
  }

  return (
    <Document>
      {pages.map((pageCoupons, pIndex) => (
        <Page
          key={pIndex}
          size={{ width: paperWidthPt, height: paperHeightPt }}
          style={{ position: "relative" }}
        >
          {pageCoupons.map((coupon, i) => {
            const globalIndex = pIndex * perPage + i;
            const row = Math.floor(i / columns);
            const col = i % columns;

            const x = leftMargin + col * couponWidthPt;
            const y = topMargin + row * couponHeightPt;

            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: couponWidthPt,
                  height: couponHeightPt,
                }}
              >
                <TokenTemplate
                  coupon={coupon}
                  qrCode={qrList[globalIndex] || null}
                  couponWidthPt={couponWidthPt}
                  couponHeightPt={couponHeightPt}
                  fontSize={5 * fontScale}
                />
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
};

// ----------------------------
// MAIN COMPONENT
// ----------------------------

export default function GeneratePDF({ coupons, error }) {
  const { resetSignal } = useRefresh();

  const qrListRef = useRef([]);
  const [pdfBlob, setPdfBlob] = useState(null);

  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("qr");

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const layout = useLayout();

  // --------------------------------------------
  // Reset when refresh signal triggers
  // --------------------------------------------
  useEffect(() => {
    setProgress(0);
    setPhase("qr");
    setPdfBlob(null);
    qrListRef.current = [];
    setIsReady(false);
    setIsGenerating(false);
  }, [resetSignal]);

  // --------------------------------------------
  // Auto margin calculation
  // --------------------------------------------
  useEffect(() => {
    computeAutoMargins(layout);
  }, [
    layout.values.paperWidthPt,
    layout.values.paperHeightPt,
    layout.values.couponWidthPt,
    layout.values.couponHeightPt,
    layout.values.userMarginOverride,
  ]);

  // --------------------------------------------
  // QR GENERATION (batching)
  // --------------------------------------------
  useEffect(() => {
    const run = async () => {
      if (!coupons.length) return;

      setProgress(0);
      setPhase("qr");

      const batches = split(coupons, 100);
      const temp = [];

      for (let batch of batches) {
        for (let coupon of batch) {
          if (!coupon.qrCode) {
            temp.push(null);
          } else {
            const qr = await generateQR(coupon.qrCode.toString());
            temp.push(qr);
          }
          setProgress(Math.round((temp.length / coupons.length) * 50));
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      qrListRef.current = temp;
      setProgress(50);
      setIsReady(true);
    };

    run();
  }, [coupons]);

  // --------------------------------------------
  // PAGE GENERATION + MERGING
  // --------------------------------------------
  useEffect(() => {
    const run = async () => {
      if (!isReady || qrListRef.current.length !== coupons.length) return;

      setIsGenerating(true);
      setPhase("pdf");

      const perPage = calculatePerPage(layout);
      const couponPages = split(coupons, perPage);
      const qrPages = split(qrListRef.current, perPage);

      const buffers = [];

      for (let i = 0; i < couponPages.length; i++) {
        setProgress(50 + Math.round(((i + 1) / couponPages.length) * 40));

        const blob = await pdf(
          <PDFDoc coupons={couponPages[i]} qrList={qrPages[i]} layout={layout} />
        ).toBlob();

        const raw = await blob.arrayBuffer();
        const trimmed = await addTrimMarksToPDF(raw, layout.values);
        buffers.push(trimmed);
      }

      setPhase("merge");
      setProgress(95);

      const merged = await mergePDFBuffers(buffers);
      setPdfBlob(new Blob([merged], { type: "application/pdf" }));

      setProgress(100);
      setIsGenerating(false);

      setToastMsg("PDF Generated!");
      setShowToast(true);
    };

    run();
  }, [isReady, coupons, layout.values]);

  // --------------------------------------------
  // ELECTRON DOWNLOAD
  // --------------------------------------------
  const handleElectronDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    window.electronAPI.startElectronDownload(url);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // --------------------------------------------
  // UI RENDER
  // --------------------------------------------

  if (!coupons.length || error) return null;

  return (
    <div className="w-full flex flex-col items-center gap-4 p-2.5 bg-nero-800">
      <AnimatePresence mode="wait">
        {(phase === "qr" || phase === "pdf" || phase === "merge") && (
          <ProgressBar progress={progress} phase={phase} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pdfBlob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              className="w-48 h-8 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-denim-600 hover:bg-denim-700 active:scale-95 transition-all focus:outline-none"
              onClick={handleElectronDownload}
            >
              Download
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
