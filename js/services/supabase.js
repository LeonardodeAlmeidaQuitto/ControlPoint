import { CONFIG } from '../config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLISHABLE_KEY);

/**
 * Busca funcionário pelo qrcode_hash
 */
export async function getFuncionarioByQrCode(qrCodeHash) {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('qrcode_hash', qrCodeHash)
    .eq('ativo', true)
    .single();

  if (error) {
    console.error('Erro ao buscar funcionário:', error);
    return null;
  }
  return data;
}

/**
 * Busca janelas de horário do funcionário
 */
export async function getJanelaHorario(funcionarioId) {
  const { data, error } = await supabase
    .from('janelas_horario')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .single();

  if (error) {
    console.error('Erro ao buscar janelas de horário:', error);
    return null;
  }
  return data;
}

/**
 * Upload da foto capturada para o Supabase Storage
 */
export async function uploadFotoRegistro(blob, filename) {
  try {
    const filePath = `${Date.now()}_${filename}.jpg`;
    const { data, error } = await supabase.storage
      .from(CONFIG.STORAGE_BUCKET)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.warn('Erro ao enviar foto para Supabase Storage, utilizando DataURL local como fallback:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(CONFIG.STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Erro de upload de foto:', err);
    return null;
  }
}

/**
 * Registra um ponto aprovado na tabela registros_ponto
 */
export async function registrarPontoApproved({ funcionarioId, tipoRegistro, fotoUrl, hashComprovante }) {
  const { data, error } = await supabase
    .from('registros_ponto')
    .insert([
      {
        funcionario_id: funcionarioId,
        tipo_registro: tipoRegistro,
        foto_registro_url: fotoUrl || 'https://via.placeholder.com/300x200?text=Sem+Foto',
        hash_comprovante: hashComprovante
      }
    ])
    .select();

  if (error) {
    console.error('Erro ao gravar registro de ponto:', error);
    throw error;
  }
  return data[0];
}

/**
 * Registra uma ocorrência (batida bloqueada ou QR inválido) na tabela ocorrencias_ponto
 */
export async function registrarOcorrencia({ funcionarioId, qrcodeLido, tipoOcorrencia, fotoUrl }) {
  const { data, error } = await supabase
    .from('ocorrencias_ponto')
    .insert([
      {
        funcionario_id: funcionarioId || null,
        qrcode_lido: qrcodeLido,
        tipo_ocorrencia: tipoOcorrencia,
        foto_tentativa_url: fotoUrl || null
      }
    ])
    .select();

  if (error) {
    console.error('Erro ao registrar ocorrência:', error);
    throw error;
  }
  return data[0];
}

/**
 * Busca todos os registros de ponto com dados do funcionário
 */
export async function getRegistrosPonto() {
  const { data, error } = await supabase
    .from('registros_ponto')
    .select('*, funcionarios(nome, matricula)')
    .order('data_hora', { ascending: false });

  if (error) {
    console.error('Erro ao buscar registros de ponto:', error);
    return [];
  }
  return data;
}

/**
 * Busca todas as ocorrências de ponto
 */
export async function getOcorrenciasPonto() {
  const { data, error } = await supabase
    .from('ocorrencias_ponto')
    .select('*, funcionarios(nome, matricula)')
    .order('data_hora', { ascending: false });

  if (error) {
    console.error('Erro ao buscar ocorrências de ponto:', error);
    return [];
  }
  return data;
}
