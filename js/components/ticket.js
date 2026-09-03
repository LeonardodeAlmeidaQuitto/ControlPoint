export function showTicketModal({ funcionario, tipoRegistro, dataHora, hashComprovante, onClose }) {
  const overlay = document.getElementById('ticket-modal');
  if (!overlay) return;

  const dataFormatted = dataHora.toLocaleDateString('pt-BR');
  const horaFormatted = dataHora.toLocaleTimeString('pt-BR');

  overlay.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header">
        <h3>COMPROVANTE DE PONTO</h3>
        <p style="font-size:0.8rem; margin-top:0.25rem;">ControlPoint - Ponto Eletrônico</p>
      </div>

      <div class="ticket-row">
        <span>COLABORADOR:</span>
        <strong>${funcionario.nome}</strong>
      </div>
      <div class="ticket-row">
        <span>MATRÍCULA:</span>
        <strong>${funcionario.matricula}</strong>
      </div>
      <div class="ticket-row">
        <span>TIPO:</span>
        <strong style="color:${tipoRegistro === 'ENTRADA' ? '#10b981' : '#3b82f6'};">${tipoRegistro}</strong>
      </div>
      <div class="ticket-row">
        <span>DATA:</span>
        <strong>${dataFormatted}</strong>
      </div>
      <div class="ticket-row">
        <span>HORÁRIO:</span>
        <strong>${horaFormatted}</strong>
      </div>
      <div class="ticket-row" style="flex-direction:column; gap:0.25rem; margin-top:0.75rem;">
        <span style="font-size:0.75rem;">CÓDIGO DE AUTENTICAÇÃO:</span>
        <strong style="font-size:0.7rem; word-break:break-all;">${hashComprovante}</strong>
      </div>

      <div class="ticket-footer">
        <p>Documento gerado e armazenado com segurança no Supabase.</p>
        <button id="btn-close-ticket" class="btn btn-primary" style="margin-top:1rem; width:100%;">FECHAR COMPROVANTE</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  const closeBtn = document.getElementById('btn-close-ticket');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      if (onClose) onClose();
    });
  }

  // Auto hide ticket modal after 6 seconds
  setTimeout(() => {
    if (overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      if (onClose) onClose();
    }
  }, 6000);
}
