import { CameraService } from './services/camera.js';
import { QrCodeService } from './services/qrcode.js';
import { avaliarJanelaHorario } from './services/tolerance.js';
import {
  getFuncionarioByQrCode,
  getJanelaHorario,
  uploadFotoRegistro,
  registrarPontoApproved,
  registrarOcorrencia
} from './services/supabase.js';
import { TIPO_OCORRENCIA } from './config.js';
import { initIcons } from './components/icons.js';
import { generateTicketHtml, printTicket } from './components/ticket.js';

class KioskApp {
  constructor() {
    this.videoElement = document.getElementById('video-feed');
    this.cameraService = new CameraService(this.videoElement);
    this.qrCodeService = new QrCodeService();
    this.isProcessing = false;

    this.modalOverlay = document.getElementById('feedback-modal');
    this.modalIconContainer = document.getElementById('modal-icon-container');
    this.modalTitle = document.getElementById('modal-title');
    this.modalMessage = document.getElementById('modal-message');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    this.setupClock();
    this.setupListeners();
  }

  setupClock() {
    const clockEl = document.getElementById('live-clock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('pt-BR');
      }
    };
    update();
    setInterval(update, 1000);
  }

  setupListeners() {
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
  }

  async start() {
    initIcons();
    const cameraOk = await this.cameraService.startCamera();
    if (!cameraOk) {
      const cameraStatusBadge = document.getElementById('camera-status');
      if (cameraStatusBadge) {
        cameraStatusBadge.className = 'badge badge-error';
        cameraStatusBadge.innerHTML = `<i data-lucide="camera-off" style="width: 14px; height: 14px;"></i> Câmera Desativada`;
        initIcons();
      }

      this.showModal({
        success: false,
        title: 'Câmera Não Detectada',
        message: 'Por favor, verifique a permissão ou conexão da câmera.'
      });
      return;
    }
    this.startScanLoop();
  }

  startScanLoop() {
    const loop = async () => {
      if (!this.isProcessing) {
        const frameData = this.cameraService.captureFrameData();
        if (frameData) {
          const qrCodePayload = this.qrCodeService.scanFrame(frameData);
          if (qrCodePayload) {
            await this.processQrCode(qrCodePayload);
          }
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  async processQrCode(qrCodePayload) {
    this.isProcessing = true;

    try {
      // 1. Busca funcionário pelo hash lido no QR Code
      const funcionario = await getFuncionarioByQrCode(qrCodePayload);

      if (!funcionario) {
        // Ocorrência: QR Code Inválido
        const blobFoto = await this.cameraService.captureBlob();
        let fotoUrl = null;
        if (blobFoto) {
          fotoUrl = await uploadFotoRegistro(blobFoto, 'ocorrencia_invalid_qr');
        }

        await registrarOcorrencia({
          funcionarioId: null,
          qrcodeLido: qrCodePayload,
          tipoOcorrencia: TIPO_OCORRENCIA.QRCODE_INVALIDO,
          fotoUrl
        });

        this.showModal({
          success: false,
          title: 'QR Code Inválido',
          message: 'Crachá não reconhecido no sistema. Ocorrência registrada.'
        });
        return;
      }

      // 2. Busca Janela de Horário do Colaborador
      const janelaHorario = await getJanelaHorario(funcionario.id);

      // 3. Avalia tolerância e Janela de Horário
      const avaliacao = avaliarJanelaHorario(janelaHorario, new Date());

      // Capture foto para registro de auditoria
      const blobFoto = await this.cameraService.captureBlob();
      let fotoUrl = null;
      if (blobFoto) {
        fotoUrl = await uploadFotoRegistro(blobFoto, `ponto_${funcionario.matricula}`);
      }

      if (avaliacao.aprovado) {
        // Gerar Hash de Autenticação do Comprovante
        const timestamp = new Date().toISOString();
        const rawHashData = `${funcionario.id}_${timestamp}_${avaliacao.tipoRegistro}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(rawHashData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashComprovante = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Gravar em registros_ponto
        const registroGravado = await registrarPontoApproved({
          funcionarioId: funcionario.id,
          tipoRegistro: avaliacao.tipoRegistro,
          fotoUrl,
          hashComprovante
        });

        // Gerar e Imprimir Ticket
        const ticketHtml = generateTicketHtml({
          funcionario,
          registro: registroGravado,
          dataHora: new Date(registroGravado.data_hora || timestamp),
          hashComprovante
        });

        const latestContainer = document.getElementById('latest-ticket-container');
        if (latestContainer) {
          latestContainer.style.display = 'block';
          latestContainer.innerHTML = `<h4 style="font-size: 0.875rem; margin-bottom: 8px;">Último Comprovante:</h4>${ticketHtml}`;
        }

        printTicket(ticketHtml);

        this.showModal({
          success: true,
          title: `Ponto Registrado (${avaliacao.tipoRegistro})`,
          message: `Olá, ${funcionario.nome}! Seu ponto de ${avaliacao.tipoRegistro.toLowerCase()} foi confirmado.`
        });
      } else {
        // Gravar em ocorrencias_ponto
        await registrarOcorrencia({
          funcionarioId: funcionario.id,
          qrcodeLido: qrCodePayload,
          tipoOcorrencia: avaliacao.tipoOcorrencia,
          fotoUrl
        });

        this.showModal({
          success: false,
          title: 'Batida Bloqueada',
          message: `${funcionario.nome}, ${avaliacao.mensagem}`
        });
      }

    } catch (err) {
      console.error('Erro ao processar ponto:', err);
      this.showModal({
        success: false,
        title: 'Erro de Processamento',
        message: 'Ocorreu um erro ao registrar seu ponto. Tente novamente.'
      });
    }
  }

  showModal({ success, title, message }) {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;

    if (success) {
      this.modalIconContainer.className = 'modal-icon success';
      this.modalIconContainer.innerHTML = `<i data-lucide="check-circle" style="width: 32px; height: 32px;"></i>`;
    } else {
      this.modalIconContainer.className = 'modal-icon error';
      this.modalIconContainer.innerHTML = `<i data-lucide="alert-triangle" style="width: 32px; height: 32px;"></i>`;
    }

    initIcons();
    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    this.modalOverlay.classList.remove('active');
    setTimeout(() => {
      this.isProcessing = false;
      this.qrCodeService.resetCooldown();
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new KioskApp();
  app.start();
});
