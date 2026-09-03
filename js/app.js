import { CameraService } from './services/camera.js';
import { QrCodeService } from './services/qrcode.js';
import {
  getFuncionarioByQrHash,
  getJanelaHorario,
  uploadFotoPonto,
  registrarPonto,
  registrarOcorrencia
} from './services/supabase.js';
import { validarJanelaHorario, gerarHashComprovante } from './services/tolerance.js';
import { showTicketModal } from './components/ticket.js';
import { renderIcons } from './components/icons.js';

class KioskApp {
  constructor() {
    this.videoEl = document.getElementById('webcam-feed');
    this.canvasEl = document.getElementById('canvas-capture');
    this.statusBoxEl = document.getElementById('status-box');
    this.clockEl = document.getElementById('realtime-clock');

    this.camera = new CameraService(this.videoEl, this.canvasEl);
    this.qrService = new QrCodeService(this.camera);
    this.isProcessing = false;
  }

  async init() {
    renderIcons();
    this.startClock();

    const cameraStarted = await this.camera.start();
    if (cameraStarted) {
      this.updateStatus('Aproxime seu crachá com QR Code da câmera.', 'info');
      this.qrService.startScanning((qrData) => this.handleQrCodeScanned(qrData));
    } else {
      this.updateStatus('Não foi possível acessar a câmera. Verifique as permissões.', 'error');
    }

    // Manual simulator event listener for manual code entry test
    const btnSimulate = document.getElementById('btn-simulate-qr');
    const inputSimulate = document.getElementById('input-simulate-qr');
    if (btnSimulate && inputSimulate) {
      btnSimulate.addEventListener('click', () => {
        const val = inputSimulate.value.trim();
        if (val) {
          this.handleQrCodeScanned(val);
          inputSimulate.value = '';
        }
      });
    }
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      if (this.clockEl) {
        this.clockEl.textContent = now.toLocaleTimeString('pt-BR');
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateStatus(message, type = 'info') {
    if (!this.statusBoxEl) return;
    this.statusBoxEl.className = `status-box ${type}`;
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    this.statusBoxEl.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;
    renderIcons();
  }

  async handleQrCodeScanned(qrData) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.updateStatus('Lendo QR Code e verificando colaborador...', 'warning');

    try {
      // 1. Capture photo frame immediately
      const photoDataUrl = this.camera.captureFrame();

      // 2. Fetch employee
      const funcionario = await getFuncionarioByQrHash(qrData);

      if (!funcionario) {
        this.updateStatus('QR Code não reconhecido ou colaborador inativo.', 'error');
        // Register occurrence QRCODE_INVALIDO
        const fotoUrl = photoDataUrl ? await uploadFotoPonto(photoDataUrl, `ocorrencia_qrcode_${Date.now()}`) : null;
        await registrarOcorrencia({
          qrcodeLido: qrData,
          tipoOcorrencia: 'QRCODE_INVALIDO',
          fotoUrl
        });
        setTimeout(() => {
          this.updateStatus('Aproxime seu crachá com QR Code da câmera.', 'info');
          this.isProcessing = false;
        }, 3000);
        return;
      }

      // 3. Fetch time window
      const janela = await getJanelaHorario(funcionario.id);
      const dataHoraAtual = new Date();
      const validacao = validarJanelaHorario(janela, dataHoraAtual);

      // 4. Upload photo
      const fotoFilename = `ponto_${funcionario.matricula}_${Date.now()}`;
      const fotoUrl = photoDataUrl ? await uploadFotoPonto(photoDataUrl, fotoFilename) : null;

      if (validacao.ok) {
        // Point approved
        const hashComprovante = await gerarHashComprovante(funcionario.id, validacao.tipo, dataHoraAtual);

        await registrarPonto({
          funcionarioId: funcionario.id,
          tipoRegistro: validacao.tipo,
          fotoUrl: fotoUrl || '',
          hashComprovante
        });

        this.updateStatus(`Ponto registrado com sucesso! (${validacao.tipo} - ${funcionario.nome})`, 'success');

        showTicketModal({
          funcionario,
          tipoRegistro: validacao.tipo,
          dataHora: dataHoraAtual,
          hashComprovante,
          onClose: () => {
            this.updateStatus('Aproxime seu crachá com QR Code da câmera.', 'info');
            this.isProcessing = false;
          }
        });
      } else {
        // Point blocked - fuera de janela
        await registrarOcorrencia({
          funcionarioId: funcionario.id,
          qrcodeLido: qrData,
          tipoOcorrencia: validacao.tipoOcorrencia,
          fotoUrl
        });

        this.updateStatus(`REGISTRO BLOQUEADO: ${validacao.mensagem} (${funcionario.nome})`, 'error');

        setTimeout(() => {
          this.updateStatus('Aproxime seu crachá com QR Code da câmera.', 'info');
          this.isProcessing = false;
        }, 4500);
      }
    } catch (err) {
      console.error('Erro no processamento do ponto:', err);
      this.updateStatus('Erro ao comunicar com o servidor. Tente novamente.', 'error');
      setTimeout(() => {
        this.updateStatus('Aproxime seu crachá com QR Code da câmera.', 'info');
        this.isProcessing = false;
      }, 3000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new KioskApp();
  app.init();
});
