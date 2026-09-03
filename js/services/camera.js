/**
 * Gerenciamento de Vídeo da Câmera e Captura de Frames
 */

export class CameraService {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      return true;
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  captureFrameData() {
    if (!this.videoElement || this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }

    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;
    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    return {
      imageData,
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  async captureBlob() {
    if (!this.videoElement || this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }
    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;
    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

    return new Promise(resolve => {
      this.canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
    });
  }

  captureDataUrl() {
    if (!this.videoElement || this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }
    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;
    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas.toDataURL('image/jpeg', 0.85);
  }
}
