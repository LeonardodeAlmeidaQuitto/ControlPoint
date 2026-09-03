# PROMPT DE COMANDO - GOOGLE JULES (AGENTE AUTÔNOMO)

**Atue como o Google Jules**, um Engenheiro de Software Autônomo executando tarefas via GitHub. Sua missão é implementar um Sistema de Controle de Ponto com Leitura de QR Code e conectá-lo ao Supabase.

Siga rigorosamente as 3 etapas abaixo para inicializar o desenvolvimento:

## ETAPA 1: Analisar a SPEC e aplicar as Diretrizes de Interface

* **Stack Tecnológica:** O desenvolvimento deve utilizar HTML5 Semântico, CSS3 Moderno e JavaScript Vanilla (ES6 Modules).
* **Restrições:** Não utilize frameworks, Node.js, npm ou Composer.
* **Bibliotecas:** Importe as bibliotecas permitidas unicamente via CDN ESM: `@supabase/supabase-js`, `jsQR` e `Lucide Icons`.
* **UI/UX:** A interface deve ser minimalista, com fundo totalmente branco (`#ffffff`), bordas suaves (`#e2e8f0`) e tipografia neutra, otimizada exclusivamente para telas de Tablets (orientação paisagem) e Desktops.
* **Sinalização Visual:** É estritamente proibido o uso de emojis na interface; utilize unicamente a biblioteca Lucide Icons para sinalização visual.
* **Regras de Negócio (Aprovação):** O fluxo de negócio exige que batidas de ponto dentro da janela (ex: 07:45 às 08:00) sejam aprovadas, gravadas na tabela `registros_ponto`, e que um ticket seja impresso.
* **Regras de Negócio (Bloqueio):** Tentativas de batida fora da janela (ex: Antes das 07:45 ou Após 08:00) devem ser bloqueadas, registrar uma foto da ocorrência na tabela `ocorrencias_ponto` como `TENTATIVA_FORA_JANELA_ENTRADA` e emitir um alerta na tela.

## ETAPA 2: Quebrar a SPEC em Tópicos e Gerar o Backlog

* **Decomposição:** Divida todas as implementações em tarefas e subtarefas granulares no arquivo de planejamento antes da escrita do código.
* **Backlog:** Crie e mantenha o arquivo `backlog.md` atualizado na raiz do repositório a cada alteração, registrando novas funcionalidades, ajustes ou refatorações.

## ETAPA 3: Processar os dados de Acesso do Supabase

Configure a conexão da aplicação com o Supabase instanciando o cliente no arquivo `js/config.js`. Utilize estritamente as credenciais abaixo:

* **API URL:** `https://smnsigtjygtbnvrjfiot.supabase.co/rest/v1/`
* **Publishable key:** `sb_publishable_zoBchxAJRxW9_Z2QrILpvw_grcGfcd3`
* **Secret key:** `sb_secret_ECz5Zf8tqeT7okDK8mRmMg_V8hCIt7j`

### Estrutura de Banco de Dados Existente

Considere que o banco de dados já está provisionado com a seguinte arquitetura:

* Tabela `funcionarios` contendo `matricula`, `nome` e `qrcode_hash`.
* Tabela `janelas_horario` contendo `janela_entrada_inicio`, `janela_entrada_fim`, `janela_saida_inicio` e `janela_saida_fim`.
* Tabela `registros_ponto` protegida por um Trigger (`bloquear_alteracao_ponto`) que garante a imutabilidade dos dados, impedindo alterações ou exclusões.
* Tabela `ocorrencias_ponto` para registro de auditoria via Enum `tipo_ocorrencia_enum` (`TENTATIVA_FORA_JANELA_ENTRADA`, `TENTATIVA_FORA_JANELA_SAIDA`, `QRCODE_INVALIDO`).

---

> ⚠️ **INSTRUÇÃO CRÍTICA (REGRA DE DÚVIDA ZERO):**
> Se houver qualquer ambiguidade, inconsistência ou incerteza durante a leitura do código ou da especificação, **NÃO CODIFIQUE**. Solicite esclarecimentos ao desenvolvedor antes de prosseguir.

**Ação inicial exigida:** Confirme o entendimento destas instruções iniciando a criação da estrutura de pastas (`css/`, `js/`, `components/`, `services/`) e a geração do arquivo `backlog.md`.
