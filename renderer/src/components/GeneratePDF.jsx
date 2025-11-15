import { Document, Page, View, Text, PDFDownloadLink, Image, Font, pdf } from "@react-pdf/renderer";
import { generateQR } from "../utils/generateQR";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/brand-logo.jpg";
import staticQr from "../assets/static-qr.png";
import TopLine from "../assets/Top-line.png";
import BtmLine from "../assets/Btm-line.png";
import { addTrimMarksToPDF } from "./TrimMarksPDFLib";

// Import font files from npm package
import montserratLight from "@fontsource/montserrat/files/montserrat-latin-300-normal.woff";
import montserratRegular from "@fontsource/montserrat/files/montserrat-latin-400-normal.woff";
import montserratSemiBold from "@fontsource/montserrat/files/montserrat-latin-600-normal.woff";
import montserratBold from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff";

// Register Montserrat font with React PDF - only once
let fontsRegistered = false;
if (!fontsRegistered) {
  Font.register({
    family: "Montserrat",
    fonts: [
      {
        src: montserratLight,
        fontWeight: 300, // Light
      },
      {
        src: montserratRegular,
        fontWeight: 400, // Regular
      },
      {
        src: montserratSemiBold,
        fontWeight: 600, // Semi-bold
      },
      {
        src: montserratBold,
        fontWeight: 700, // Bold
      },
    ],
  });
  fontsRegistered = true;
}

// Utility function to chunk array
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const LoadingSpinner = ({ message, className = "" }) => (
  <button
    disabled
    className={`w-48 h-10 flex items-center justify-center gap-2 bg-gray-400 text-white text-sm font-medium rounded-md cursor-not-allowed ${className}`}
  >
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
    <span>{message}</span>
  </button>
);

const DownloadButton = ({ onClick, disabled, isLoading }) => {
  if (isLoading) {
    return (
      <button
        disabled
        className="w-48 h-10 flex items-center justify-center gap-2 bg-gray-400 text-white text-sm font-medium rounded-md cursor-not-allowed"
      >
        <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <span>Generating PDF...</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-48 h-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white transition-all
        ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-denim-600 hover:bg-denim-700 active:scale-95"}`}
    >
      Download PDF
    </button>
  );
};

const CouponItem = ({ coupon, qrCode }) => (
  <View
    style={{
      width: 119.07, // 42 mm
      height: 212.63, // 75 mm
      padding: 5,
      paddingTop: 6,
      paddingBottom: 8,
      alignItems: "center",
      justifyContent: "flex-start",
      borderWidth: 0.75,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderColor: "#000",
    }}
  >
    <Image src={TopLine} style={{ width: 119.07, position: "absolute", top: 0 }} />
    <Image src={logo} style={{ height: 20, marginBottom: 4 }} />

    <Text
      style={{
        fontFamily: "Montserrat",
        fontWeight: 600,
        fontSize: 6,
        marginBottom: 6,
        textAlign: "left",
        width: "100%",
      }}
    >
      Scratch and scan for cashback
    </Text>

    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {qrCode && (
        <Image
          src={qrCode}
          style={{
            width: "94%",
            margin: 0,
            padding: 0,
          }}
        />
      )}

      <Text
        wrap={false}
        style={{
          fontFamily: "Montserrat",
          fontWeight: 300,
          fontSize: 4.5,
          position: "absolute",
          textAlign: "center",
          left: "55.5%",
          transform: "rotate(-90deg)",
          width: 94,
        }}
      >
        *For Technician use only
      </Text>
    </View>

    <Text
      style={{
        fontFamily: "Montserrat",
        fontWeight: 300,
        fontSize: 4.5,
        marginTop: 4,
        textAlign: "left",
        width: "100%",
      }}
    >
      *For Internal use only
    </Text>

    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 2,
        gap: 5,
      }}
    >
      <Image src={staticQr} style={{ width: "50%" }} />
      <View
        style={{
          width: "50%",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 4.5 }}>
          <Text style={{ fontFamily: "Montserrat", fontWeight: 400, fontSize: 4.5 }}>Sku Code: </Text>
          {"\n"}
          <Text>{coupon?.["SKU Code"] || "NA"}</Text>
        </Text>

        <Text style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 4.5 }}>
          <Text style={{ fontFamily: "Montserrat", fontWeight: 400, fontSize: 4.5 }}>Sku Name: </Text>
          {"\n"}
          <Text>{coupon?.["SKU Name"] || "NA"}</Text>
        </Text>

        <Text style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 4.5 }}>
          <Text style={{ fontFamily: "Montserrat", fontWeight: 400, fontSize: 4.5 }}>Internal Code: </Text>
          {"\n"}
          <Text>{coupon?.["Internal Code"] || "NA"}</Text>
        </Text>
      </View>
    </View>
    <Image src={BtmLine} style={{ width: 119.07, position: "absolute", bottom: 0 }} />
  </View>
);

const PDFDoc = ({ coupons, qrList }) => (
  <Document>
    {chunk(coupons, 42).map((pageCoupons, pageIndex) => (
      <Page
        key={pageIndex}
        size={{ width: 864, height: 1296 }}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 15.255,
          paddingTop: 10.11,
          paddingBottom: 10.11,
          fontFamily: "Montserrat",
        }}
      >
        {pageCoupons.map((coupon, index) => {
          const globalIndex = pageIndex * 42 + index;
          return (
            <CouponItem key={globalIndex} coupon={coupon} qrCode={qrList[globalIndex]} globalIndex={globalIndex} />
          );
        })}
      </Page>
    ))}
  </Document>
);

export default function GeneratePDF({ coupons }) {
  const [qrList, setQrList] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const prevCouponsRef = useRef([]);

  // console.log(coupons); --> For testing of coupon data

  // Generate QR for ALL coupons so indexing matches across pages
  useEffect(() => {
    const loadQR = async () => {
      if (JSON.stringify(coupons) === JSON.stringify(prevCouponsRef.current)) {
        return;
      }

      setIsReady(false);
      try {
        const qrs = await Promise.all(coupons.map((c) => generateQR(JSON.stringify(c || {}))));
        setQrList(qrs);
        prevCouponsRef.current = coupons;
        setTimeout(() => setIsReady(true), 100);
      } catch (error) {
        console.error("Error generating QR codes:", error);
        setIsReady(true);
      }
    };

    if (coupons.length > 0) {
      loadQR();
    } else {
      setQrList([]);
      setIsReady(false);
    }
  }, [coupons]);

  // Generate PDF when ready
  useEffect(() => {
    const generatePDFWhenReady = async () => {
      if (isReady && qrList.length === coupons.length && coupons.length > 0) {
        setIsGenerating(true);
        try {
          const blob = await pdf(<PDFDoc coupons={coupons} qrList={qrList} />).toBlob();
          const arrayBuffer = await blob.arrayBuffer();
          const pdfWithTrimMarks = await addTrimMarksToPDF(arrayBuffer);
          setPdfBlob(new Blob([pdfWithTrimMarks], { type: "application/pdf" }));
        } catch (error) {
          console.error("Error pre-generating PDF:", error);
        } finally {
          setIsGenerating(false);
        }
      } else {
        setPdfBlob(null);
      }
    };

    generatePDFWhenReady();
  }, [isReady, qrList, coupons]);

  const handleDownload = () => {
    if (!pdfBlob) return;

    const blobURL = URL.createObjectURL(pdfBlob);

    // trigger actual electron forced download
    window.electronAPI.startElectronDownload(blobURL);

    setTimeout(() => URL.revokeObjectURL(blobURL), 5000);
  };
  
  if (!isReady || qrList.length !== coupons.length) {
    return <LoadingSpinner message="Generating QR..." />;
  }

  if (isGenerating) {
    return <DownloadButton onClick={handleDownload} disabled={!pdfBlob} isLoading={true} />;
  }

  return <DownloadButton onClick={handleDownload} disabled={!pdfBlob} isLoading={false} />;
}
