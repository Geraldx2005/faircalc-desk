// ----------------------------------------------
// TrimMarksPDFLib.jsx (FINAL - dynamic marginX + marginY reduction)
// ----------------------------------------------

import { PDFDocument, rgb } from "pdf-lib";

export const addTrimMarksToPDF = async (pdfBytes, layout) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const {
      paperWidthPt,
      paperHeightPt,
      couponWidthPt,
      couponHeightPt,
      leftMargin,
      rightMargin,
      topMargin,
      bottomMargin,
    } = layout;

    // dynamic reduction same as GeneratePDF
    const reduceX = paperWidthPt * 0.00008;
    const reduceY = paperHeightPt * 0.00008;

    pages.forEach((page) => {
      addDynamicTrimMarks(
        page,
        paperWidthPt,
        paperHeightPt,
        couponWidthPt,
        couponHeightPt,

        // updated margins (apply same correction)
        leftMargin - reduceX,
        rightMargin - reduceX,
        topMargin - reduceY,
        bottomMargin - reduceY
      );
    });

    return await pdfDoc.save();
  } catch (err) {
    console.error("Trim mark error:", err);
    throw err;
  }
};

// ----------------------------------------------
// TRIM MARK DRAWER
// ----------------------------------------------
function addDynamicTrimMarks(
  page,
  pageWidth,
  pageHeight,
  couponWidth,
  couponHeight,
  leftMargin,
  rightMargin,
  topMargin,
  bottomMargin
) {
  const thickness = 0.7;
  const len = 12;

  const cols = Math.floor(pageWidth / couponWidth);
  const rows = Math.floor(pageHeight / couponHeight);

  const blockLeft = leftMargin;
  const blockRight = leftMargin + cols * couponWidth;

  const blockTop = topMargin;
  const blockBottom = topMargin + rows * couponHeight;

  // vertical marks
  for (let c = 0; c <= cols; c++) {
    const x = blockLeft + c * couponWidth;

    page.drawLine({
      start: { x, y: blockTop - len },
      end: { x, y: blockTop },
      thickness,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x, y: blockBottom },
      end: { x, y: blockBottom + len },
      thickness,
      color: rgb(0, 0, 0),
    });
  }

  // horizontal marks
  for (let r = 0; r <= rows; r++) {
    const y = blockTop + r * couponHeight;

    page.drawLine({
      start: { x: blockLeft - len, y },
      end: { x: blockLeft, y },
      thickness,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x: blockRight, y },
      end: { x: blockRight + len, y },
      thickness,
      color: rgb(0, 0, 0),
    });
  }
}
