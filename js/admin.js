import {
  listRegistrosPonto,
  listOcorrencias,
  listFuncionarios,
  saveFuncionario
} from './services/supabase.js';
import { renderIcons } from './components/icons.js';

class AdminDashboard {
  constructor() {
    this.tableRegistrosEl = document.getElementById('table-registros');
    this.tableOcorrenciasEl = document.getElementById('table-ocorrencias');
    this.tableFuncionariosEl = document.getElementById('table-funcionarios');
  }

  async init() {
    renderIcons();
    this.setupTabs();
    this.setupModalForm();
    await this.loadRegistros();
    await this.loadOcorrencias();
    await this.loadFuncionarios();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        const activeContent = document.getElementById(`tab-${target}`);
        if (activeContent) activeContent.style.display = 'block';
      });
    });
  }

  setupModalForm() {
    const btnNew = document.getElementById('btn-new-func');
    const modal = document.getElementById('modal-funcionario');
    const form = document.getElementById('form-funcionario');
    const btnCancel = document.getElementById('btn-cancel-func');

    if (btnNew && modal) {
      btnNew.addEventListener('click', () => {
        if (form) form.reset();
        modal.classList.add('active');
      });
    }

    if (btnCancel && modal) {
      btnCancel.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('input-nome').value.trim();
        const matricula = document.getElementById('input-matricula').value.trim();
        const qrcodeHash = document.getElementById('input-qrcode').value.trim() || matricula;

        const entInicio = document.getElementById('input-ent-inicio').value;
        const entFim = document.getElementById('input-ent-fim').value;
        const saiInicio = document.getElementById('input-sai-inicio').value;
        const saiFim = document.getElementById('input-sai-fim').value;

        try {
          await saveFuncionario(
            { nome, matricula, qrcode_hash: qrcodeHash, ativo: true },
            {
              janela_entrada_inicio: `${entInicio}:00`,
              janela_entrada_fim: `${entFim}:00`,
              janela_saida_inicio: `${saiInicio}:00`,
              janela_saida_fim: `${saiFim}:00`
            }
          );
          modal.classList.remove('active');
          await this.loadFuncionarios();
          alert('Funcionário cadastrado com sucesso!');
        } catch (err) {
          console.error(err);
          alert('Erro ao salvar funcionário.');
        }
      });
    }
  }

  async loadRegistros() {
    if (!this.tableRegistrosEl) return;
    const registros = await listRegistrosPonto();

    if (registros.length === 0) {
      this.tableRegistrosEl.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">Nenhum registro de ponto encontrado.</td></tr>`;
      return;
    }

    this.tableRegistrosEl.innerHTML = registros.map(r => {
      const dataHora = new Date(r.data_hora).toLocaleString('pt-BR');
      const nome = r.funcionarios ? r.funcionarios.nome : 'Desconhecido';
      const matricula = r.funcionarios ? r.funcionarios.matricula : 'N/A';
      const badgeClass = r.tipo_registro === 'ENTRADA' ? 'badge-success' : 'badge-neutral';

      return `
        <tr>
          <td><strong>${nome}</strong> (${matricula})</td>
          <td><span class="badge ${badgeClass}">${r.tipo_registro}</span></td>
          <td>${dataHora}</td>
          <td><code style="font-size:0.75rem;">${r.hash_comprovante.substring(0, 16)}...</code></td>
          <td>
            ${r.foto_registro_url ? `<a href="${r.foto_registro_url}" target="_blank" class="btn" style="padding:0.25rem 0.5rem; font-size:0.75rem;"><i data-lucide="image"></i> Ver Foto</a>` : 'Sem foto'}
          </td>
        </tr>
      `;
    }).join('');

    renderIcons();
  }

  async loadOcorrencias() {
    if (!this.tableOcorrenciasEl) return;
    const ocorrencias = await listOcorrencias();

    if (ocorrencias.length === 0) {
      this.tableOcorrenciasEl.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">Nenhuma ocorrência registrada.</td></tr>`;
      return;
    }

    this.tableOcorrenciasEl.innerHTML = ocorrencias.map(o => {
      const dataHora = new Date(o.data_hora).toLocaleString('pt-BR');
      const nome = o.funcionarios ? o.funcionarios.nome : 'Não identificado';
      const qrLido = o.qrcode_lido || 'N/A';

      return `
        <tr>
          <td><strong>${nome}</strong></td>
          <td><code>${qrLido}</code></td>
          <td><span class="badge badge-error">${o.tipo_ocorrencia}</span></td>
          <td>${dataHora}</td>
          <td>
            ${o.foto_tentativa_url ? `<a href="${o.foto_tentativa_url}" target="_blank" class="btn" style="padding:0.25rem 0.5rem; font-size:0.75rem;"><i data-lucide="image"></i> Ver Foto</a>` : 'Sem foto'}
          </td>
        </tr>
      `;
    }).join('');

    renderIcons();
  }

  async loadFuncionarios() {
    if (!this.tableFuncionariosEl) return;
    const funcionarios = await listFuncionarios();

    if (funcionarios.length === 0) {
      this.tableFuncionariosEl.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>`;
      return;
    }

    this.tableFuncionariosEl.innerHTML = funcionarios.map(f => {
      const janela = Array.isArray(f.janelas_horario) ? f.janelas_horario[0] : f.janelas_horario;
      const janelaText = janela
        ? `Entrada: ${janela.janela_entrada_inicio.substring(0,5)}-${janela.janela_entrada_fim.substring(0,5)} | Saída: ${janela.janela_saida_inicio.substring(0,5)}-${janela.janela_saida_fim.substring(0,5)}`
        : 'Padrão Sem Restrição';

      return `
        <tr>
          <td><strong>${f.nome}</strong></td>
          <td>${f.matricula}</td>
          <td><code>${f.qrcode_hash}</code></td>
          <td><span class="badge ${f.ativo ? 'badge-success' : 'badge-error'}">${f.ativo ? 'ATIVO' : 'INATIVO'}</span></td>
          <td style="font-size:0.8rem;">${janelaText}</td>
        </tr>
      `;
    }).join('');

    renderIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const admin = new AdminDashboard();
  admin.init();
});
