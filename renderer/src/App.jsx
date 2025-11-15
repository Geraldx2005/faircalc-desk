import { useState, useCallback, useEffect } from "react";
import UploadExcel from "./components/UploadExcel";
import GeneratePDF from "./components/GeneratePDF";
import RefreshBtn from "./components/RefreshBtn";
import ErrorBoundary from "./components/ErrorBoundary";
import headerImg from "./assets/eureka-heade-logo.svg";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function App() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    if (!window.electronAPI) return;

    // window.electronAPI.onDownloadStarted(() => {
    //   toast.loading(`Waiting for User...`, {
    //     id: "download", // keeps single toast
    //   });
    // });

    window.electronAPI.onDownloadComplete(() => {
      toast.success(`Download Successful!`, {
        id: "download", // replaces the previous loading toast
      });
    });

    window.electronAPI.onDownloadFailed(() => {
      toast.error(`Download Cancelled`, {
        id: "download",
      });
    });
  }, []);

  // Memoized handler to clear coupons
  const handleRefresh = useCallback(() => {
    setCoupons([]);
  }, []);

  const hasCoupons = coupons.length > 0;

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1e3a8a", // denim-800
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            padding: "10px 14px",
            userSelect: "none",
          },
          success: {
            icon: null,
            style: {
              color: "#1d4c87", // denim-700
              background: "#c5d9f2", // denim-200
              border: "2px solid #1d4c87", // denim-700
            },
          },
          error: {
            icon: null,
            style: {
              color: "#dc2626", // red-600
              background: "#fee2e2", // red-100
              border: "2px solid #dc2626", // red-600
            },
          },
          loading: {
            style: {
              background: "#1c395e", // denim-900
            },
          },
        }}
      />

      <div className="min-h-screen flex flex-col select-none">
        <header className="w-full h-15 bg-denim-700 flex items-center justify-center text-2xl text-white font-semibold sticky top-0 z-10">
          <img src={headerImg} alt="Chronos Logo" className="h-7 mr-2 absolute left-4" />
          <span>Coupons Generator</span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <UploadExcel setCoupons={setCoupons} />

          {hasCoupons && (
            <div className="w-full max-w-4xl mx-auto mt-6 space-y-4">
              <h1 className="text-xl font-semibold text-denim-950 text-center">
                {coupons.length} Coupon{coupons.length !== 1 ? "s" : ""}
              </h1>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <ErrorBoundary>
                  <GeneratePDF coupons={coupons} />
                </ErrorBoundary>
                <RefreshBtn handleRefresh={handleRefresh} />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
