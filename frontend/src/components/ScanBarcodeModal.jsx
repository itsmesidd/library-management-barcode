function ScanBarcodeModal({
  showScanModal,
  closeScanModal,
  handleScan,
  isScanning,
}) {
  if (!showScanModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button
          className="close-btn"
          onClick={closeScanModal}
          disabled={isScanning}
        >
          ✕
        </button>

        <h2>Scan Barcode</h2>

        <div className="scan-options">
          <label className={`scan-option-btn ${isScanning ? "disabled" : ""}`}>
            {isScanning ? "⏳ Scanning..." : "📷 Take Photo"}

            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              disabled={isScanning}
              onChange={handleScan}
            />
          </label>

          <label className={`scan-option-btn ${isScanning ? "disabled" : ""}`}>
            {isScanning ? "⏳ Scanning..." : "🖼 Upload Image"}

            <input
              type="file"
              accept="image/*"
              hidden
              disabled={isScanning}
              onChange={handleScan}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default ScanBarcodeModal;
