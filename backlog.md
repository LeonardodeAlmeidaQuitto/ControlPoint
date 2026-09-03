# Backlog do Projeto - ControlPoint

## Visão Geral
Sistema de Controle de Ponto com verificação via QR Code, captura de fotos, validação de janela de horários e integração com Supabase REST API & Storage.

---

## 1. Estrutura e Configuração Inicial
- [x] Criação da estrutura de diretórios (`css/`, `js/`, `js/services/`, `js/components/`).
- [x] Configuração inicial do `backlog.md`.

## 2. Interface e Estilização (UI/UX)
- [ ] Implementar Design System minimalista (`css/main.css`) sem emojis e com bordas suaves (`#e2e8f0`).
- [ ] Implementar Componentes de UI (`css/components.css`) para modais, cards, badges, tabelas e comprovantes de ponto.
- [ ] Integrar Lucide Icons via CDN para iconografia visual.

## 3. Serviços e Integrações
- [ ] Configuração do cliente Supabase (`js/config.js` e `js/services/supabase.js`) com Publishable Key / REST API.
- [ ] Gerenciador de Câmera (`js/services/camera.js`) com `getUserMedia` e captura de fotos em Canvas.
- [ ] Decodificador de QR Code (`js/services/qrcode.js`) utilizando `jsQR`.
- [ ] Validador de Janela de Horário / Tolerância (`js/services/tolerance.js`).

## 4. Interfaces e Controladores
- [ ] Implementar Kiosk do Colaborador (`index.html` e `js/app.js`).
- [ ] Implementar Comprovante de Ponto (`js/components/ticket.js`).
- [ ] Implementar Painel Administrativo do RH (`admin.html` e `js/admin.js`).

## 5. Testes e Dados Globais
- [ ] Cadastrar dados iniciais de funcionários e janelas de horário no Supabase.
- [ ] Validar fluxo completo de batida de ponto aprovada e tentativa fora de janela.
