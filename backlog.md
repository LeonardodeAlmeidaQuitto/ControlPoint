# Backlog do Projeto - ControlPoint

## Status das Tarefas

### 1. Inicialização e Estrutura do Projeto
- [x] Criar estrutura de diretórios (`css/`, `js/services/`, `js/components/`)
- [x] Criar arquivo `backlog.md` para acompanhamento de tarefas

### 2. Configuração de Credenciais e Serviços
- [x] Criar `js/config.js` com URLs e Chaves do Supabase e Constantes de Negócio
- [x] Criar `js/services/supabase.js` para integração REST e Storage Supabase via CDN ESM

### 3. Módulos do Sistema
- [x] Criar `js/services/camera.js` para captura e gerenciamento de stream e snapshot de vídeo
- [x] Criar `js/services/qrcode.js` para leitura e parsing de QR Code via jsQR
- [x] Criar `js/services/tolerance.js` para validação de horários de tolerância e janelas de entrada/saída

### 4. Componentes de UI e Estilização
- [x] Criar `css/main.css` com variáveis globais e layout minimalista (#ffffff / #e2e8f0)
- [x] Criar `css/components.css` com estilos de cards, modais, tabelas e comprovantes
- [x] Criar `js/components/icons.js` para inicialização e renderização do Lucide Icons (zero emojis)
- [x] Criar `js/components/ticket.js` para geração e impressão do comprovante de ponto

### 5. Aplicação Kiosk e Painel de Administração
- [x] Criar `index.html` (Interface do Kiosk para Tablet/Desktop)
- [x] Criar `js/app.js` (Orquestrador do Kiosk de Ponto)
- [x] Atualizar indicador visual para "Câmera Desativada" (vermelho) quando a câmera não for encontrada
- [x] Criar `admin.html` (Painel Administrativo do RH e Ocorrências)

### 6. Testes e Validação
- [x] Validar inicialização local via servidor HTTP ESM
- [x] Testar fluxo de batida de ponto dentro e fora da janela
- [x] Verificar upload de fotos no Supabase Storage e gravação em registros/ocorrências
- [x] Garantir conformidade com diretrizes de UI (Minimalista, Lucide Icons, sem emojis)
