/**
 * Gerador de Comprovante de Impressão de Ponto (Ticket)
 */

export function generateTicketHtml({ funcionario, registro, dataHora, hashComprovante }) {
  const formattedDate = dataHora.toLocaleDateString('pt-BR');
  const formattedTime = dataHora.toLocaleTimeString('pt-BR');

  return `
    <div class="ticket-preview" id="printable-ticket">
      <div class="ticket-header">
        <strong>CONTROLPOINT - COMPROVANTE DE PONTO</strong><br/>
        <span>REGISTRO ELETRÔNICO DE PONTO</span>
      </div>
      <div class="ticket-row">
        <span>Matrícula:</span>
        <strong>${funcionario.matricula}</strong>
      </div>
      <div class="ticket-row">
        <span>Colaborador:</span>
        <strong>${funcionario.nome}</strong>
      </div>
      <div class="ticket-row">
        <span>Tipo de Registro:</span>
        <strong>${registro.tipo_registro}</strong>
      </div>
      <div class="ticket-row">
        <span>Data / Hora:</span>
        <strong>${formattedDate} ${formattedTime}</strong>
      </div>
      <div class="ticket-row" style="margin-top: 10px; font-size: 0.75rem; word-break: break-all;">
        <span>Hash de Autenticação:</span><br/>
        <code style="display: block; margin-top: 4px; font-size: 0.7rem;">${hashComprovante}</code>
      </div>
      <div class="ticket-header" style="margin-top: 12px; padding-bottom: 0; border-bottom: none;">
        <span>--- Documento Emitido via Kiosk ---</span>
      </div>
    </div>
  `;
}

export function printTicket(ticketHtml) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    console.warn('Bloqueador de popup ativado ao tentar imprimir ticket.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Comprovante de Ponto</title>
      <style>
        body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; }
        .ticket-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .ticket-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      ${ticketHtml}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 500);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
