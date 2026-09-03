/**
 * Validates whether current time falls into ENTRADA or SAIDA time window, or if it is blocked.
 */
export function validarJanelaHorario(janela, dataAtual = new Date()) {
  if (!janela) {
    // If employee has no time window defined, default to allowing ENTRADA/SAIDA based on current hour
    const hour = dataAtual.getHours();
    if (hour < 12) {
      return { ok: true, tipo: 'ENTRADA' };
    } else {
      return { ok: true, tipo: 'SAIDA' };
    }
  }

  const horaAtualString = dataAtual.toTimeString().split(' ')[0]; // HH:MM:SS format

  // Helper to compare HH:MM:SS
  const isBetween = (time, start, end) => {
    return time >= start && time <= end;
  };

  const {
    janela_entrada_inicio,
    janela_entrada_fim,
    janela_saida_inicio,
    janela_saida_fim
  } = janela;

  // Check ENTRADA window
  if (isBetween(horaAtualString, janela_entrada_inicio, janela_entrada_fim)) {
    return {
      ok: true,
      tipo: 'ENTRADA',
      mensagem: 'Janela de entrada autorizada.'
    };
  }

  // Check SAIDA window
  if (isBetween(horaAtualString, janela_saida_inicio, janela_saida_fim)) {
    return {
      ok: true,
      tipo: 'SAIDA',
      mensagem: 'Janela de saída autorizada.'
    };
  }

  // Determine if closer to entry or exit to classify occurrence
  if (horaAtualString < janela_saida_inicio) {
    return {
      ok: false,
      tipoOcorrencia: 'TENTATIVA_FORA_JANELA_ENTRADA',
      mensagem: `Fora do horário de entrada (${janela_entrada_inicio} às ${janela_entrada_fim}).`
    };
  } else {
    return {
      ok: false,
      tipoOcorrencia: 'TENTATIVA_FORA_JANELA_SAIDA',
      mensagem: `Fora do horário de saída (${janela_saida_inicio} às ${janela_saida_fim}).`
    };
  }
}

/**
 * Generates sha-256 hash receipt code for validation
 */
export async function gerarHashComprovante(funcionarioId, tipoRegistro, dataHora) {
  const str = `${funcionarioId}-${tipoRegistro}-${dataHora.toISOString()}-${Math.random()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
