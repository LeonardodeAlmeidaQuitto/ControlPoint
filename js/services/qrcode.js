export class QrCodeService {
  constructor(cameraService) {
    this.camera = cameraService;
    this.scanning = false;
    this.onScanCallback = null;
    this.scanInterval = null;
    this.lastScannedCode = null;
    this.lastScanTime = 0;
  }

  startScanning(onScan) {
    this.scanning = true;
    this.onScanCallback = onScan;

    this.scanInterval = setInterval(() => {
      if (!this.scanning) return;
      this.tick();
    }, 250); // Scan 4 times per second
  }

  stopScanning() {
    this.scanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  tick() {
    const imageData = this.camera.getFrameImageData();
    if (!imageData) return;

    if (typeof jsQR === 'function') {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        const now = Date.now();
        // Prevent duplicate scans within 4 seconds
        if (code.data === this.lastScannedCode && (now - this.lastScanTime) < 4000) {
          return;
        }

        this.lastScannedCode = code.data;
        this.lastScanTime = now;

        if (this.onScanCallback) {
          this.onScanCallback(code.data);
        }
      }
    }
  }
}
