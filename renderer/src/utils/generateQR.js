import QRCode from "qrcode";

export const generateQR = async (data) => {
  let qrValue = data;

  try {
    // Try to parse JSON if it's JSON-like
    if (typeof data === "string" && (data.startsWith("{") || data.startsWith("["))) {
      const parsed = JSON.parse(data);

      // If parsed is an object, extract the first string-like field
      if (parsed && typeof parsed === "object") {
        // Preferred keys
        if (parsed.qrCode) qrValue = parsed.qrCode;
        else if (parsed["Code URL"]) qrValue = parsed["Code URL"];
        else {
          // fallback: find ANY valid value
          const values = Object.values(parsed);
          const firstValid = values.find(v => v !== null && v !== undefined);
          if (firstValid) qrValue = firstValid;
        }
      }
    }
  } catch (err) {
    // Not JSON — ignore error
  }

  // As final fallback, convert ANYTHING to string
  if (qrValue === null || qrValue === undefined) {
    qrValue = "";
  }

  try {
    return await QRCode.toDataURL(qrValue.toString(), {
      margin: 0,
      width: 256,
      color: {
        dark: "#000000",
        light: "#FFFFFF00", // transparent background
      },
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    return null;
  }
};
