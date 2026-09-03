import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from '../config.js';

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Fetch active employee by qrcode_hash or matricula
export async function getFuncionarioByQrHash(qrHash) {
  // First attempt query by qrcode_hash
  const { data: byHash, error: errHash } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('qrcode_hash', qrHash)
    .eq('ativo', true)
    .single();

  if (byHash) return byHash;

  // Fallback: search by matricula directly if string matches matricula format
  const { data: byMatricula, error: errMatricula } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('matricula', qrHash)
    .eq('ativo', true)
    .single();

  if (byMatricula) return byMatricula;

  return null;
}

// Fetch employee time windows
export async function getJanelaHorario(funcionarioId) {
  const { data, error } = await supabase
    .from('janelas_horario')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .single();

  if (error) {
    console.warn('Erro ao buscar janela de horario:', error);
    return null;
  }

  return data;
}

// Upload photo blob/dataURL to Supabase Storage
export async function uploadFotoPonto(dataUrl, filename) {
  try {
    // Convert dataURL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const path = `${filename}.jpg`;
    const { data, error } = await supabase.storage
      .from(CONFIG.STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Erro no upload da foto:', error);
      // Return fallback placeholder string if upload fails due to permissions or missing bucket
      return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${path}`;
    }

    const { data: publicUrlData } = supabase.storage
      .from(CONFIG.STORAGE_BUCKET)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Exceção ao fazer upload da foto:', err);
    return 'https://via.placeholder.com/300x300?text=Foto+Indisponivel';
  }
}

// Register valid clock-in / clock-out record
export async function registrarPonto({ funcionarioId, tipoRegistro, fotoUrl, hashComprovante }) {
  const { data, error } = await supabase
    .from('registros_ponto')
    .insert([{
      funcionario_id: funcionarioId,
      tipo_registro: tipoRegistro,
      foto_registro_url: fotoUrl,
      hash_comprovante: hashComprovante
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Register occurrence (blocked entry/exit or invalid QR)
export async function registrarOcorrencia({ funcionarioId = null, qrcodeLido, tipoOcorrencia, fotoUrl = null }) {
  const { data, error } = await supabase
    .from('ocorrencias_ponto')
    .insert([{
      funcionario_id: funcionarioId,
      qrcode_lido: qrcodeLido,
      tipo_ocorrencia: tipoOcorrencia,
      foto_tentativa_url: fotoUrl
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar ocorrencia:', error);
  }

  return data;
}

// Query all records for admin
export async function listRegistrosPonto() {
  const { data, error } = await supabase
    .from('registros_ponto')
    .select('*, funcionarios(nome, matricula)')
    .order('data_hora', { ascending: false });

  if (error) console.error('Erro ao listar registros:', error);
  return data || [];
}

// Query all occurrences for admin
export async function listOcorrencias() {
  const { data, error } = await supabase
    .from('ocorrencias_ponto')
    .select('*, funcionarios(nome, matricula)')
    .order('data_hora', { ascending: false });

  if (error) console.error('Erro ao listar ocorrencias:', error);
  return data || [];
}

// Query all employees for admin
export async function listFuncionarios() {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*, janelas_horario(*)')
    .order('nome', { ascending: true });

  if (error) console.error('Erro ao listar funcionarios:', error);
  return data || [];
}

// Save or create new employee
export async function saveFuncionario(funcionario, janela) {
  const { data: funcData, error: funcErr } = await supabase
    .from('funcionarios')
    .upsert(funcionario)
    .select()
    .single();

  if (funcErr) throw funcErr;

  if (janela) {
    janela.funcionario_id = funcData.id;
    const { error: janErr } = await supabase
      .from('janelas_horario')
      .upsert(janela, { onConflict: 'funcionario_id' });

    if (janErr) throw janErr;
  }

  return funcData;
}
