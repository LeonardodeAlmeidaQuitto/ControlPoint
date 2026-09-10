import { TIPO_REGISTRO, TIPO_OCORRENCIA } from '../config.js';

/**
 * Converte string TIME 'HH:MM:SS' para minutos do dia
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2] || '0', 10) || 0;
  return hours * 60 + minutes + seconds / 60;
}

/**
 * Valida batida de ponto baseada na janela do funcionário e no horário atual.
 * Se no_windows é true ou janelas_horario não existe, aceita por padrão.
 */
export function avaliarJanelaHorario(janelaHorario, currentTime = new Date()) {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;

  if (!janelaHorario) {
    // Se não houver janela cadastrada, determina o tipo pelo horário aproximado (antes/depois do meio-dia)
    const isMorning = currentTime.getHours() < 12;
    return {
      aprovado: true,
      tipoRegistro: isMorning ? TIPO_REGISTRO.ENTRADA : TIPO_REGISTRO.SAIDA,
      mensagem: 'Janela de horário não configurada. Batida aceita.'
    };
  }

  const entInicio = timeToMinutes(janelaHorario.janela_entrada_inicio); // Ex: 07:45 -> 465
  const entFim = timeToMinutes(janelaHorario.janela_entrada_fim);       // Ex: 08:00 -> 480
  const saiInicio = timeToMinutes(janelaHorario.janela_saida_inicio);   // Ex: 17:45 -> 1065
  const saiFim = timeToMinutes(janelaHorario.janela_saida_fim);         // Ex: 18:00 -> 1080

  // 1. Verifica janela de ENTRADA
  if (currentMinutes >= entInicio && currentMinutes <= entFim) {
    return {
      aprovado: true,
      tipoRegistro: TIPO_REGISTRO.ENTRADA,
      mensagem: 'Entrada aprovada dentro do horário de tolerância.'
    };
  }

  // 2. Verifica janela de SAÍDA
  if (currentMinutes >= saiInicio && currentMinutes <= saiFim) {
    return {
      aprovado: true,
      tipoRegistro: TIPO_REGISTRO.SAIDA,
      mensagem: 'Saída aprovada dentro do horário de tolerância.'
    };
  }

  // 3. Fora de janela - Determinar se tentativa de Entrada ou Saída
  // Se horário é mais próximo/antes do meio dia (ou antes do início da saída), é tentativa de Entrada
  const meioDia = 12 * 60;
  const isEntradaTentativa = currentMinutes < meioDia || currentMinutes < saiInicio;

  if (isEntradaTentativa) {
    return {
      aprovado: false,
      tipoOcorrencia: TIPO_OCORRENCIA.TENTATIVA_FORA_JANELA_ENTRADA,
      mensagem: `Batida de Entrada bloqueada. Fora da janela permitida (${janelaHorario.janela_entrada_inicio.slice(0,5)} às ${janelaHorario.janela_entrada_fim.slice(0,5)}).`
    };
  } else {
    return {
      aprovado: false,
      tipoOcorrencia: TIPO_OCORRENCIA.TENTATIVA_FORA_JANELA_SAIDA,
      mensagem: `Batida de Saída bloqueada. Fora da janela permitida (${janelaHorario.janela_saida_inicio.slice(0,5)} às ${janelaHorario.janela_saida_fim.slice(0,5)}).`
    };
  }
}
