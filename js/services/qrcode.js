import jsQR from 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm';

/**
 * Leitura e parsing de QR Code via jsQR
 */
export class QrCodeService {
  constructor() {
    this.lastScannedCode = null;
    this.lastScanTime = 0;
    this.cooldownMs = 3000;
  }

  scanFrame(frameData) {
    if (!frameData) return null;

    const { imageData, width, height } = frameData;
    const code = jsQR(imageData.data, width, height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      const now = Date.now();
      if (code.data === this.lastScannedCode && now - this.lastScanTime < this.cooldownMs) {
        return null;
      }
      this.lastScannedCode = code.data;
      this.lastScanTime = now;
      return code.data;
    }

    return null;
  }

  resetCooldown() {
    this.lastScannedCode = null;
    this.lastScanTime = 0;
  }
}
