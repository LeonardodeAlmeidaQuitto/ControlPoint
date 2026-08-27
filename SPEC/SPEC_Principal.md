Status de Viabilidade: ALTA CONFIANÇA
Este documento foi estruturado segundo as diretrizes de Spec-Driven Development para execução autônoma pelo
agente de IA Google Jules no GitHub.

1. Instruções Críticas para o Agente de IA (Google Jules)
Instrução de Dúvida Zero: Se houver qualquer ambiguidade, inconsistência ou incerteza durante a leitura do
código ou da especificação, NÃO CODIFIQUE. Solicite esclarecimentos ao desenvolvedor antes de prosseguir.
Decomposição de Tarefas: Divida todas as implementações em tarefas e subtarefas granulares no arquivo de
planejamento antes da escrita do código.
Obrigatoriedade do Backlog: Mantenha o arquivo backlog.md atualizado na raiz do repositório a cada
alteração, registrando novas funcionalidades, ajustes ou refatorações.

2. Arquitetura da Stack Tecnológica
Agente de Execução: Google Jules
Hospedagem & Controle de Versão: GitHub (GitHub Pages para deploy)
Banco de Dados & Storage: Supabase (PostgreSQL + PostgREST API + Cloud Storage)
Frontend: HTML5 Semântico, CSS3 Moderno, JavaScript Vanilla (ES6 Modules)
Bibliotecas via CDN ESM (Zero Node/npm/Composer):
@supabase/supabase-js via ESM (Gerenciamento de API/Database)
jsQR via CDN (Decodificação de QR Code robusta e resiliente)
Lucide Icons via CDN (Biblioteca de ícones vetoriais limpos)

3. Diretrizes de Interface (UI / UX)
Design System: Minimalista, fundo totalmente branco ( #ffffff ), bordas suaves ( #e2e8f0 ) e tipografia neutra
(Inter / Sans-serif nativo).
Target Hardware: Exclusivo para telas de Tablets (orientação paisagem) e Desktops.
Sem Emojis: É estritamente proibido o uso de emojis na interface. Toda sinalização visual deve utilizar unicamente
a biblioteca Lucide Icons.
APIs Nativas JS: Uso restrito e isolado da API W3C navigator.mediaDevices.getUserMedia() para captura
do feed de vídeo da câmera e geração de imagem via canvas .

4. Estrutura de Arquivos do Repositório

.
├── index.html # Interface do Kiosk (Tablet/Desktop)
├── admin.html # Painel Administrativo do RH / Ocorrências
├── backlog.md # Registro dinâmico de tarefas e alterações
├── css/
│ ├── main.css # Estilos globais e variáveis CSS
│ └── components.css # Estilos de cards, tabelas e modais
└── js/
├── app.js # Inicializador da aplicação
├── config.js # Credenciais Supabase e constantes
├── services/
│ ├── camera.js # Gerenciamento de vídeo e captura de frames
│ ├── qrcode.js # Leitura e parsing do QR Code via jsQR
│ ├── supabase.js # Cliente Supabase REST
│ └── tolerance.js # Regras de validação de janela de horário
└── components/
├── ticket.js # Gerador do comprovante de impressão
└── icons.js # Inicialização do Lucide Icons

5. Regras de Negócio e Matriz de Decisão
O fluxo de batida de ponto baseia-se na aproximação do crachá com QR Code do colaborador (ex: ID 99 - Mathias):
Evento

Janela
Permite

Status do
Registro

Ação do Sistema

Entrada

07:45 às
08:00

Aprovado Grava em registros_ponto , envia foto para o Supabase Storage e

imprime ticket.

Entrada (Fora
da Janela)

Antes 07:45 /
Após 08:00

Bloqueado
(Ocorrência)

Captura foto, registra em ocorrencias_ponto como
TENTATIVA_FORA_JANELA_ENTRADA e alerta em tela.

Saída 17:45 às
18:00

Aprovado Grava em registros_ponto (tipo SAIDA ) e imprime ticket.

Saída (Fora
da Janela)

Antes 17:45 /
Após 18:00

Bloqueado
(Ocorrência)

Captura foto, registra em ocorrencias_ponto como
TENTATIVA_FORA_JANELA_SAIDA e bloqueia.
