export class CameraService {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.stream = null;
    this.isStreaming = false;
  }

  async start() {
    if (this.isStreaming) return true;

    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.isStreaming = true;
      return true;
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      return false;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isStreaming = false;
    }
  }

  captureFrame() {
    if (!this.video || !this.isStreaming) return null;

    const width = this.video.videoWidth || 640;
    const height = this.video.videoHeight || 480;

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, width, height);

    return this.canvas.toDataURL('image/jpeg', 0.8);
  }

  getFrameImageData() {
    if (!this.video || !this.isStreaming) return null;

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    if (!width || !height) return null;

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, width, height);

    return ctx.getImageData(0, 0, width, height);
  }
}
