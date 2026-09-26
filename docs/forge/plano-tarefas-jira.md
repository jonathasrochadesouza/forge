# Plano de Tarefas — Forge no JIRA

Demonstração de como eu colocaria a sua lista de ideias no JIRA: épicos, cards escritos,
ordem de execução e o que eu **não** criaria como task (e por quê).

Projeto destino: **FORGE** (`https://jonathasrochadesouza.atlassian.net`), tipos disponíveis:
`Epic`, `Story`, `Task`, `Bug`, `Subtask`.

---

## 1. Convenções que eu aplicaria no board

### Template de descrição (todo card usa o mesmo)

```
Problema        — 1 a 2 linhas, na visão do usuário
Solução         — o que passa a existir
Escopo técnico  — arquivos/pastas onde o código entra (aditivo)
Critérios de aceite — checklist verificável
Fora de escopo  — o que fica para outra task
Links           — repos, docs, contratos upstream
```

### Labels

| Label | Uso |
|---|---|
| `area:main` `area:renderer` `area:cli` `area:mobile` | camada tocada |
| `forge-additive` | código novo em namespace nosso (regra padrão do fork) |
| `upstream-whitelist` | toca arquivo upstream permitido → exige entrada em `FORGE-OVERRIDES.md` |
| `integra:senior` `integra:terceiros` | origem da integração |
| `needs-refinement` | ideia ainda ambígua, não pode entrar em sprint |
| `spike` | investigação com timebox, entrega decisão e não código |

### Definition of Ready

Card só entra em sprint com: problema claro, critérios de aceite verificáveis, e caminho de
arquivos definido. Sem isso, fica com `needs-refinement`.

### Definition of Done

`pnpm tc` + `pnpm test <arquivo>` + `pnpm run check:code-quality:changed` verdes, funciona em
Windows/macOS/Linux, e não editou arquivo upstream fora da whitelist.

---

## 2. A decisão mais importante antes de abrir 90 cards

Sua lista tem ~90 itens, mas eles **não são 90 features**. Três agrupamentos colapsam a maior parte:

| Grupo | Itens da sua lista que ele resolve de uma vez |
|---|---|
| **Um registro de "web apps fixados"** renderizado na aba de browser que já existe | Teams, ferramenta do Wallace, Herdr, Lovable, chat OpenWebUI, TraduzAI, devdocs/excalidraw/regex101/bundlephobia/4devs, redirecionador para página única, notícias/social/cortes do X |
| **Um configurador de projeto** (MCP + AGENTS.md + ambiente) | configurador de MCP, configurador de AGENTS.md, MCPs da empresa, ambiente automático com checklist, instalações automáticas, mostrar MCP de cada tool |
| **Já existe no upstream** — a task é validar/expor, não construir | git commit, git fetch, trocar branch, branches remotas, skills, notificações, downloads, abrir editor externo |

Então o plano real é: **1 épico-plataforma que destrava 12 ideias**, **1 épico-configurador que
destrava 6**, e o resto priorizado por valor. Isso é o que eu levaria para o board antes de
escrever card individual para cada linha da lista.

---

## 3. Mapa de épicos

| # | Épico | O que cobre | Onda |
|---|---|---|---|
| **FE-1** | Identidade & Distribuição | logo, rebrand, `.exe`, versionamento, updater, landing, docs, mobile | 1 |
| **FE-2** | Plataforma de Apps Web Fixados | Teams, Herdr, Lovable, OpenWebUI, TraduzAI, dev tools, redirecionador | 1 |
| **FE-3** | Configurador de Projeto (MCP / AGENTS.md / ambiente) | MCP por projeto, `.git/info/exclude`, AGENTS.md, checklist de ambiente | 1 |
| **FE-4** | Code Review & Fluxo do Projeto | REVAI 1-clique, aba REVAI, timeline de branch/commits/PRs | 1 |
| **FE-5** | Sync com Upstream & Contribuição | action diária, issue → task no JIRA, PRs de volta ao Orca | 1 |
| **FE-6** | UX & Personalização | 5 botões laterais + "more options", comandos rápidos, perfil por função | 2 |
| **FE-7** | Integrações Senior | SCL/tools do SPEED, login Senior, RAG SKB, Timesheet, Dexter (áudio) | 2 |
| **FE-8** | Orquestração & IA Local | orquestrador, agentes por provider, memória, SLM, resumo de e-mail | 2 |
| **FE-9** | Produtividade Pessoal | tasks (Google/Todoist/Obsidian), notas `.md`, agenda/reuniões, reminder, despertador | 3 |
| **FE-10** | Segurança & Conformidade | vazamento de dados, segredos, OAuth, telemetria | 1 (contínuo) |
| **FE-11** | Plataforma de Extensões Pública | padrão de extensão para terceiros, runner de extensões VS Code | 3 |
| **FE-12** | Programa de Entrega (5 dias) | time, dailies, QA, hackathon, docs, demo | — (processo) |

---

## 4. Onda 1 — cards escritos

Esses são os cards que eu criaria já prontos para sprint.

---

### FE-1 · Identidade & Distribuição

#### FORGE — Definir e aplicar a identidade visual do Forge
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `upstream-whitelist` `area:main`

**Problema** O app ainda se apresenta como Orca: ícone, nome do produto, instalador e janela.
Não é apresentável para a empresa nem distinguível do upstream.

**Solução** Um único card que fecha logo + aplicação em todos os pontos de marca, porque separar
"criar logo" de "trocar logo" gera dois cards que bloqueiam um ao outro.

**Escopo técnico** Arquivos da Mutation Whitelist: `package.json` (`name`, `description`,
`homepage`, `author`), config do electron-builder em `config/` (productName, appId, artifact
naming), `src/main/app-icon.ts` + assets em `resources/`.
Cada arquivo tocado gera uma linha em `FORGE-OVERRIDES.md`.

**Critérios de aceite**
- [ ] Ícone Forge em app, dock/taskbar, instalador e janela nas 3 plataformas
- [ ] `productName` e `appId` próprios (appId diferente do Orca — instalação lado a lado não conflita)
- [ ] `FORGE-OVERRIDES.md` com uma linha por arquivo tocado
- [ ] Nenhuma alteração em `LICENSE` nem remoção de atribuição ao upstream

**Fora de escopo** Landing page, docs públicas.

**Links** `FORGE.md` (Mutation Whitelist), `docs/reference/` conforme área.

---

#### FORGE — Pipeline de build e versionamento do instalador Windows
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `upstream-whitelist` `area:main`

**Problema** Não existe caminho definido para gerar um `.exe` do Forge a partir do nosso fonte,
nem esquema de versão que sobreviva ao sync com o upstream (que sobe versão todo dia).

**Solução** Build reproduzível + esquema de versão do Forge derivado, mas independente, da versão
upstream. Ex.: upstream `1.4.7` → Forge `1.4.7-forge.3`. Fica óbvio de qual base viemos.

**Escopo técnico** Config do electron-builder em `config/`, `package.json.version`, feed do updater
apontando para **o nosso** release (nunca o do upstream).

**Critérios de aceite**
- [ ] `pnpm build` gera instalador Windows assinável e instalável em máquina limpa
- [ ] Versão segue `<upstream>-forge.<n>` e aparece na tela Sobre
- [ ] Updater aponta para nosso feed; instalar sobre versão anterior preserva dados do usuário
- [ ] Procedimento documentado em `docs/forge/release.md`

**Fora de escopo** macOS/Linux (cards separados), assinatura de código corporativa.

---

#### FORGE — Spike: viabilidade do app mobile companion no Forge
`Task` · Prioridade **Média** · Estimativa **S** · Labels `spike` `area:mobile` `needs-refinement`

**Problema** O upstream tem app mobile que pareia via relay próprio (`cloud/`). Não sabemos se
usamos o relay deles, subimos o nosso, ou deixamos o mobile fora do escopo.

**Solução** Spike com timebox de 1 dia que entrega **uma decisão escrita**, não código.

**Critérios de aceite**
- [ ] Documento com as 3 opções, custo de infra e risco de compatibilidade de wire
- [ ] Recomendação explícita e cards de follow-up criados
- [ ] Leu `docs/reference/remote-wire-compatibility.md` e cita o impacto de versões mistas

---

### FE-2 · Plataforma de Apps Web Fixados

> Este épico é o que transforma ~12 ideias da sua lista em configuração, não em código novo por integração.

#### FORGE — Registro de apps web fixados (base da plataforma)
`Story` · Prioridade **Crítica** · Estimativa **L** · Labels `forge-additive` `area:main` `area:renderer`

**Problema** Cada ferramenta que queremos "dentro do Forge" (Teams, Herdr, Lovable, OpenWebUI,
TraduzAI, devdocs) hoje seria uma integração ad-hoc. Doze integrações ad-hoc = doze pontos de
conflito no próximo sync.

**Solução** Um registro declarativo de apps web, renderizado pela aba de browser que **já existe**
no upstream (`src/main/browser/`). Adicionar uma ferramenta passa a ser acrescentar uma entrada,
sem código novo.

Exemplo da entrada:

```ts
// src/shared/forge-web-app-registry.ts
{
  id: 'teams',
  title: 'Teams',
  url: 'https://teams.microsoft.com',
  icon: 'teams',
  category: 'comunicacao',
  partition: 'persist:forge-teams', // sessão isolada: login não vaza entre apps
}
```

**Escopo técnico**
- `src/shared/forge-web-app-registry.ts` — contrato + catálogo
- `src/main/forge/web-apps/` — resolução, partição de sessão, política de navegação externa
- `src/renderer/src/forge/web-apps/` — lista, abertura em aba, ícone na sidebar
- Reusa `src/main/browser/` (não cria segundo backend de browser)

**Critérios de aceite**
- [ ] Adicionar um app novo exige apenas 1 entrada no registro (provado adicionando 2 apps no mesmo PR)
- [ ] Cada app tem partição de sessão própria — login do Teams não compartilha cookie com Lovable
- [ ] Link externo clicado dentro do app abre no navegador do sistema, não navega a aba para fora do domínio
- [ ] Testes co-localizados para resolução de registro e política de navegação
- [ ] Nenhum arquivo de `src/main/browser/` modificado

**Fora de escopo** SSO corporativo, apps específicos (cards abaixo).

**Links** `src/main/browser/`, `docs/STYLEGUIDE.md`

---

#### FORGE — Apps de comunicação: Teams e agenda
`Story` · Prioridade **Alta** · Estimativa **S** · Labels `forge-additive` `integra:senior`
Depende de: *Registro de apps web fixados*

**Problema** O usuário sai do Forge para ver Teams e agenda — quebra o fluxo de trabalho.

**Solução** Entradas no registro para Teams (chat) e calendário, com posição fixa na sidebar.

**Critérios de aceite**
- [ ] Teams abre autenticado e mantém sessão entre reinícios do app
- [ ] Notificação de mensagem não lida aparece no badge da aba
- [ ] Documentado qual comportamento o Teams web **não** permite (ex.: chamadas com áudio/vídeo podem exigir o cliente nativo)

**Fora de escopo** Confirmar/cancelar reunião programaticamente — precisa de Graph API, virou card
separado em FE-9 com `needs-refinement`.

---

#### FORGE — Aba de Engenharia com dev tools
`Story` · Prioridade **Média** · Estimativa **S** · Labels `forge-additive` `area:renderer`
Depende de: *Registro de apps web fixados*

**Problema** Ferramentas do dia a dia (devdocs, excalidraw, regex101, bundlephobia, 4devs) vivem em
abas soltas do navegador e se perdem.

**Solução** Categoria "Engenharia" no registro, agrupando essas ferramentas em um lugar.

**Critérios de aceite**
- [ ] As 5 ferramentas abrem em aba interna e preservam estado ao trocar de aba
- [ ] Usuário pode esconder ferramenta que não usa
- [ ] Categorias vêm do campo `category` do registro (sem lista paralela hardcoded)

---

#### FORGE — Chat conversacional com modelos locais via OpenWebUI Gateway
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `forge-additive` `integra:terceiros`
Depende de: *Registro de apps web fixados*

**Problema** O usuário tem modelos rodando na própria máquina, mas não tem onde conversar com eles
dentro do Forge.

**Solução** Integrar [openwebui-gateway-providers](https://github.com/jonathasrochadesouza/openwebui-gateway-providers)
como gateway local, expondo **somente** os modelos presentes na máquina do usuário.

**Escopo técnico** `src/main/forge/openwebui/` — descoberta de modelos, ciclo de vida do gateway
(subir/derrubar), health check. Processo iniciado **via `src/shared/child-process/`**, nunca
`child_process` direto (teste de ratchet falha o build).

**Critérios de aceite**
- [ ] Só aparecem modelos efetivamente disponíveis na máquina — lista vazia mostra estado vazio explicativo, não erro
- [ ] Gateway sobe sob demanda e é derrubado ao fechar o app (sem processo órfão)
- [ ] Sem modelo instalado, o app funciona normalmente (degradação silenciosa)
- [ ] Funciona em Windows, macOS e Linux
- [ ] Nenhum prompt ou conteúdo de conversa sai da máquina

**Links** https://github.com/jonathasrochadesouza/openwebui-gateway-providers

---

### FE-3 · Configurador de Projeto

#### FORGE — Configurador de MCP por projeto sem sujar o repositório
`Story` · Prioridade **Crítica** · Estimativa **M** · Labels `forge-additive` `area:main`

**Problema** Configurar MCP por projeto hoje significa commitar arquivo de config, ou reconfigurar
a cada troca de branch. Ambos ruins: um vaza config pessoal no repo do time, o outro é trabalho
manual repetido.

**Solução** Configurador que grava a config de MCP **fora do versionamento**, registrando o caminho
em `.git/info/exclude` — efeito de `.gitignore`, mas local à máquina e **compartilhado entre todas
as branches** (é exatamente o que você descreveu).

**Escopo técnico**
- `src/main/forge/project-config/mcp-writer.ts` — escrita idempotente + entrada em `.git/info/exclude`
- Reusa `src/shared/mcp-config.ts` (contrato de MCP **já existe** upstream — não recriar)
- Usa `path.join`; resolve o git dir real (worktree tem `.git` como arquivo, não pasta)

**Critérios de aceite**
- [ ] Config gravada e projeto continua com `git status` limpo
- [ ] Entrada em `.git/info/exclude` é idempotente (rodar 2× não duplica linha)
- [ ] Funciona em git worktree (onde `.git` é arquivo) e em folder workspace sem git — neste último, avisa que não há onde excluir em vez de falhar
- [ ] Config sobrevive à troca de branch
- [ ] Testes cobrindo: repo normal, worktree, pasta sem git, execução repetida

**Fora de escopo** Catálogo de MCPs da empresa (card seguinte).

**Links** `src/shared/mcp-config.ts`

---

#### FORGE — Catálogo de MCPs e skills com instalação em 1 clique
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `forge-additive`
Depende de: *Configurador de MCP por projeto*

**Problema** Skills boas (ponytail, caveman, …) e MCPs da empresa circulam por link em chat. Ninguém
sabe o que existe nem o que está instalado.

**Solução** Catálogo curado, instalação em 1 clique reusando o subsistema de skills que **já existe**
no upstream (`src/main/skills/` tem discovery, install transaction, remoção, install remoto via SSH).
Nosso código é catálogo + UI, não instalador novo.

**Critérios de aceite**
- [ ] Catálogo lista skills/MCPs com origem, descrição e estado (instalado / disponível / atualizável)
- [ ] Instalar usa `skill-install-service` do upstream, sem reimplementar transação de instalação
- [ ] Instalação remota/SSH funciona (o upstream já suporta — não regredir)
- [ ] Mostra quais MCPs cada agente está usando

**Links** `src/main/skills/skill-install-service.ts`, `skill-discovery-sources.ts`

---

#### FORGE — Configurador de ambiente com checklist verificável
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `forge-additive` `area:main`

**Problema** Preparar máquina nova (runtimes, CLIs de agente, git, credenciais) é tribal knowledge.
Cada pessoa descobre sozinha o que falta.

**Solução** Checklist que **detecta** o estado de cada requisito e oferece ação de correção. Detectar
primeiro, instalar depois — e sempre com confirmação do usuário.

**Escopo técnico** `src/main/forge/environment/` — probes por requisito + ações de correção via
`src/shared/child-process/`.

**Critérios de aceite**
- [ ] Checklist mostra ok / faltando / versão incompatível por item
- [ ] Nenhuma instalação roda sem confirmação explícita (nunca instala em silêncio)
- [ ] Probes funcionam nas 3 plataformas; em Windows respeitam a postura de EDR documentada (sem `-ExecutionPolicy Bypass`, sem `cmd.exe /c` com texto livre escapado)
- [ ] Falha de um probe não derruba o checklist inteiro

**Links** `docs/reference/windows-edr-posture.md`, AGENTS.md (Windows child processes)

---

#### FORGE — Configurador de AGENTS.md por projeto
`Task` · Prioridade **Média** · Estimativa **S** · Labels `forge-additive`

**Problema** Todo projeto novo precisa de `AGENTS.md` e ele nasce em branco ou copiado errado.

**Solução** Gerador com blocos por stack detectada (build, test, lint, convenções), editável antes
de gravar.

**Critérios de aceite**
- [ ] Detecta gerenciador de pacotes e comandos de build/test reais do projeto
- [ ] Mostra preview antes de gravar; **nunca** sobrescreve `AGENTS.md` existente sem diff aprovado
- [ ] Arquivo gerado passa como válido para pelo menos 2 CLIs de agente diferentes

---

### FE-4 · Code Review & Fluxo do Projeto

#### FORGE — Code review com REVAI em 1 clique
`Story` · Prioridade **Alta** · Estimativa **M** · Labels `forge-additive` `integra:terceiros`

**Problema** Revisar antes de abrir PR exige sair da ferramenta e rodar coisa na mão. Resultado:
não se faz.

**Solução** Botão de review na etapa de revisão que já existe no Forge, rodando
[REVAI](https://github.com/jonathasrochadesouza/revai) sobre o diff do worktree atual e devolvendo
os achados na UI de diff.

**Escopo técnico** `src/main/forge/revai/` — invocação (via `src/shared/child-process/`), parsing de
resultado, mapeamento achado → arquivo/linha. Reusa a UI de comentários de diff do upstream.

**Critérios de aceite**
- [ ] Um clique roda review do diff atual e mostra progresso (não congela a UI)
- [ ] Achado é clicável e navega para arquivo/linha
- [ ] Funciona em worktree git **e** folder workspace
- [ ] Funciona quando o worktree é remoto/SSH — ou declara explicitamente que só roda local nesta versão
- [ ] REVAI ausente/quebrado mostra erro acionável, não tela branca

**Links** https://github.com/jonathasrochadesouza/revai, `docs/reference/ssh-execution-boundary.md`

---

#### FORGE — Timeline do projeto: branch, commits, PRs e comentários
`Story` · Prioridade **Média** · Estimativa **M** · Labels `forge-additive` `area:renderer`

**Problema** Depois de uma sessão com agente, é difícil reconstruir o que aconteceu: qual branch,
quais commits, qual arquivo nasceu quando, qual PR e comentário.

**Solução** Visão cronológica única por worktree, montada sobre o que o upstream já lê de git
(`src/main/git/source-control/` tem commits, branch compare, diff, status).

**Critérios de aceite**
- [ ] Timeline mostra criação de branch, commits, arquivos criados e PR/comentários quando houver
- [ ] Usa leitura de git existente; **não** faz fan-out de refs × `ls-tree` (regra de Git Scan Safety — esse padrão retém gigabytes)
- [ ] Repositório grande carrega em tempo aceitável com saída limitada
- [ ] Funciona com GitLab, não só GitHub (ou degrada explicando)

**Links** `docs/reference/git-compatibility.md`, AGENTS.md (Git Scan Safety, Git Provider Compatibility)

---

### FE-5 · Sync com Upstream & Contribuição

#### FORGE — Sync diário automatizado com upstream e triagem de falha
`Story` · Prioridade **Crítica** · Estimativa **M** · Labels `forge-additive` `area:cli`

**Problema** O upstream ships daily. Sem sync automático, a divergência cresce até virar merge war
— o risco número um deste fork.

**Solução** Action diária que faz merge de `upstream/main` em `forge`, roda os gates e **abre issue
no GitHub quando falha**. Ao abrir o Forge, o app detecta issue aberta e oferece criar a task no
JIRA para correção.

**Critérios de aceite**
- [ ] Action roda diariamente e faz merge + `pnpm tc` + `pnpm test` + lint
- [ ] Sucesso: merge publicado. Falha: issue com arquivos em conflito e log do gate que quebrou
- [ ] Forge detecta issue aberta e oferece abrir task no JIRA em 1 clique (usuário confirma, nada automático sem consentimento)
- [ ] Conflito em arquivo **fora** da Mutation Whitelist é sinalizado como violação da regra aditiva, não como conflito comum

**Links** `FORGE.md`, `.kiro/skills/forge-sync/SKILL.md`

---

#### FORGE — Identificar e enviar contribuições ao Orca oficial
`Task` · Prioridade **Baixa** · Estimativa **S** · Labels `needs-refinement`

**Problema** Parte do que fazemos é correção genérica que beneficia o upstream — e manter isso só
no fork é custo de merge recorrente para nós.

**Solução** Critério escrito do que é "upstreamable" (correção genérica, sem marca nossa, sem
dependência interna) e processo de PR.

**Critérios de aceite**
- [ ] Critério documentado em `docs/forge/upstream-contribution.md`
- [ ] Ao menos 1 PR submetido ao upstream como prova do processo

---

### FE-10 · Segurança & Conformidade

#### FORGE — Auditoria de vazamento de dados e segredos
`Story` · Prioridade **Crítica** · Estimativa **M** · Labels `area:main`

**Problema** A ferramenta vai rodar em máquina corporativa com código proprietário, credenciais e
e-mail. Sem auditoria, não passa em uma conversa com segurança — e isso bloqueia a adoção toda.

**Solução** Auditoria do que sai da máquina, por qual caminho e com qual consentimento; telemetria
desligada ou apontada para nós; segredos fora de arquivo em texto plano.

**Critérios de aceite**
- [ ] Inventário escrito de todo destino externo (modelos, gateway, relay, updater, telemetria)
- [ ] Telemetria upstream desabilitada ou apontada para nós, com entrada em `FORGE-OVERRIDES.md`
- [ ] Segredos via armazenamento protegido do SO (`protected-secret-persistence` já existe upstream), nunca em JSON claro
- [ ] Chat/prompt com modelo local comprovadamente não sai da máquina
- [ ] Documento pronto para revisão de segurança corporativa

**Fora de escopo** Pentest formal.

---

## 5. Ondas 2 e 3 — backlog priorizado (formato compacto)

Escreveria card completo só quando entrar na sprint. Antes disso, uma linha basta.

### FE-6 · UX & Personalização

| Título | Tipo | Est. | Resumo |
|---|---|---|---|
| Sidebar com até 5 atalhos escolhidos pelo usuário + "more options" | Story | M | Máx. 5 ícones acima dos projetos; 6º botão abre painel lateral rolável com o resto. Preferência persistida por usuário |
| Comandos rápidos cadastráveis para funções do sistema | Story | M | Usuário mapeia atalho → ação. Sem hardcode de `metaKey`: check de plataforma, rótulo `⌘` no Mac / `Ctrl+` nos outros |
| Perfil por função define interface inicial | Story | S | Escolha na primeira execução (dev, QA, líder…), trocável a qualquer momento. Só muda o que aparece por padrão, não remove capacidade |
| Área de edição de código | Story | ? | `needs-refinement` — o upstream já tem editor. Definir o que falta antes de abrir card |

### FE-7 · Integrações Senior

| Título | Tipo | Est. | Resumo |
|---|---|---|---|
| Login Senior no lugar do login genérico | Story | M | Depende da ferramenta do Ruan. **Bloqueado** até definir protocolo (OAuth? SSO?) |
| Integrar SCL do SPEED | Story | ? | `needs-refinement` — precisa de doc de API e caso de uso concreto |
| Integrar tools do SPEED | Story | ? | `needs-refinement` — "tools" precisa virar lista nomeada |
| Ativação automática do RAG (SKB) | Story | M | Depende de endpoint e autenticação do SKB (Igor) |
| Timesheet integrado | Story | S | Provável entrada no registro de apps web (FE-2) em vez de integração própria |
| TraduzAI | Story | S | Idem — candidato a app web fixado |
| Dexter: áudio conversacional operando o PC | Story | L | Alto risco: executa ações reais na máquina. Exige confirmação por ação e trilha de auditoria. `spike` primeiro |
| Apresentação para o Torres | Task | S | Entregável de comunicação, não de código |

### FE-8 · Orquestração & IA Local

| Título | Tipo | Est. | Resumo |
|---|---|---|---|
| Orquestrador de agentes | Story | L | Enviar task a agente específico escolhendo skills/SPECS/orquestrador. Ler `docs/reference/agent-status-store.md` antes — status tem uma fonte única, não criar segunda |
| Instanciar agentes em múltiplos providers | Story | M | Agentes padrão criáveis em provedores diferentes. Segue o padrão Adapter de `src/main/<agent-id>/` |
| Memória computacional / de IA | Story | L | `needs-refinement` — "memória" precisa de escopo: o que persiste, por quanto tempo, quem pode ler |
| SLM local para autocomplete e tarefas pequenas | Story | M | Depende do gateway de FE-2 |
| Resumo de e-mail via MCP | Story | M | Leitura por MCP + resumo com modelo local. Requer OAuth do provedor e trilha do que foi lido |
| IA fala as tarefas do dia | Story | S | TTS opcional das tarefas; usuário escolhe quais viram afazeres |
| Alerta proativo de instalação sugerida (MCP/ACP) | Story | L | Fluxo criar → configurar → testar → pedir OAuth. Só com confirmação do usuário em cada etapa |
| Criador de imagens/logos com ComfyUI local | Story | M | Modelo local; provavelmente app web fixado + ciclo de vida de processo |

### FE-9 · Produtividade Pessoal

| Título | Tipo | Est. | Resumo |
|---|---|---|---|
| Tasks integradas (Google Tasks, Todoist, checklist do Obsidian) | Story | M | Um provider por vez atrás de uma interface comum; começar por um só |
| Salvar notas `.md` em pasta/vault do Obsidian | Story | S | Detecta vault, deixa o destino configurável, `path.join` sempre |
| Agenda do Teams com confirmar/recusar reunião | Story | M | Precisa Graph API — vai além de app web fixado. `needs-refinement` |
| Notificações do app conectadas às do SO | Story | M | Upstream já tem notificações; a task é agregar fontes, não criar sistema novo |
| Barra de progresso de downloads | Story | S | Upstream já tem download relay/routing — validar e expor na UI |
| Ponto reminder | Story | S | Voltar comportamento anterior; definir fonte do horário |
| Despertador | Task | S | Baixo valor, alto ruído. Eu questionaria se entra |
| Notícias, social, cortes do X | Story | S | Apps web fixados + agregação. Baixa prioridade; risco de distração dentro de ferramenta de trabalho |

### FE-11 · Plataforma de Extensões Pública

| Título | Tipo | Est. | Resumo |
|---|---|---|---|
| Padrão público de extensão do Forge | Story | XL | Contrato + sandbox + versionamento. **Só depois** de FE-2 provar o padrão internamente |
| Runner de extensões do VS Code | Story | XL | `spike` obrigatório: rodar só o runner/core do VS Code é tecnicamente pesado e legalmente sensível (marca e licença de marketplace) |
| Abrir VS Code / Kiro dentro do Forge | Story | ? | O upstream **já** lança editor externo (`src/main/external-editor-launch.ts`). Embutir é ordens de magnitude mais caro. Decidir: lançar (pronto) ou embutir (épico próprio) |

---

## 6. Itens que eu NÃO abriria como task de desenvolvimento

Aqui é onde o tempo se ganha. Estes itens da sua lista já existem no upstream — a task certa é
**validar e expor**, não construir:

| Item da lista | Situação real | Task que eu criaria |
|---|---|---|
| Git commit | `src/main/git/source-control/commit-changes.ts` | Nenhuma — validar na demo |
| Git fetch / trocar branch / branches remotas | `branch-change-entries.ts`, `effective-upstream-status-probe.ts`, `branch-compare.ts` | Uma única `Task` de QA: confirmar o fluxo nas 3 plataformas |
| Skills | `src/main/skills/` completo (discovery, install, remoção, SSH) | Só o catálogo (FE-3) |
| MCP | `src/shared/mcp-config.ts` | Só o configurador por projeto (FE-3) |
| Notificações | Subsistema existente | Só agregação de fontes (FE-9) |
| Abrir editor externo | `src/main/external-editor-launch.ts` | Decisão lançar vs. embutir |
| "Mexer no fonte e gerar novo `.exe`" | É o pipeline de build | Coberto por FE-1 |

E estes eu devolveria para refinamento antes de virar card, porque não têm critério de aceite
possível hoje:

- **"Integrar as coisas dentro da ferramenta"** — é o objetivo do produto, não uma task.
- **"Workflow…"** — precisa dizer qual workflow, de quem, com qual gatilho.
- **"MCP"** e **"Skills"** soltos — já cobertos por cards específicos.
- **"Redirecionador para o ORCA"** — resolvido por FE-2; confirmar se era isso.
- **"Categorias de tipos de ferramentas"** — vem de graça com o campo `category` do registro.
- **"Validar sobre o versionamento do app"** — virou FE-1; **"validar sobre o mobile"** virou o spike.

---

## 7. FE-12 · Programa de entrega (processo, não produto)

Seus itens de time e cronograma. Eu manteria num épico separado ou em Confluence, nunca misturados
com o backlog de produto — senão poluem a velocidade do board.

**Estrutura de time**
- Três domínios com um responsável claro cada. Sugestão alinhada aos épicos: (1) Plataforma & Distribuição — FE-1/FE-2, (2) Integrações & IA — FE-3/FE-7/FE-8, (3) Fluxo de Dev & Sync — FE-4/FE-5.
- Duas pessoas extras via desafio (hackathon interno) e, depois, hackathon da empresa usando a ferramenta.
- QA geral para o time + uma QA dedicada (empréstimo de outro time, limite de três pessoas).

**Ritual**
- Alinhamento no início da manhã e no início da tarde.

**Cronograma de 5 dias**

| Dia | Foco | Entregável |
|---|---|---|
| 1 | FE-1 + FE-2 (registro de apps) | `.exe` com marca Forge e 2 apps web funcionando |
| 2 | FE-3 (MCP + ambiente) | Configuração de projeto sem sujar o repo |
| 3 | FE-4 + FE-5 | Review em 1 clique + sync automatizado |
| 4 | Docs e registro do que foi feito | `docs/forge/` atualizado, changelog |
| 5 | Liberação e apresentação com coffee | Build distribuível + demo |

Observação honesta sobre o cronograma: cinco dias comportam FE-1 a FE-5 **se** FE-2 for o registro
genérico e não integração por integração. Se o time tentar Teams, Herdr, Lovable e OpenWebUI como
quatro trabalhos separados, o dia 5 chega sem build apresentável.

---

## 8. Riscos que eu colocaria visíveis no board

| Risco | Impacto | Mitigação |
|---|---|---|
| Editar arquivo upstream fora da whitelist | Merge war, o fork morre | Regra aditiva + `FORGE-OVERRIDES.md` como gate de review |
| Integração feita uma a uma em vez do registro | Estoura o prazo e o custo de sync | FE-2 é pré-requisito declarado de 6 outros cards |
| Dependências externas (SPEED, SKB, login Senior) | Cards bloqueados sem aviso | Marcados `needs-refinement` com dono do desbloqueio nomeado |
| Áudio que opera o PC (Dexter) | Ação destrutiva sem revisão | Confirmação por ação + auditoria; spike antes |
| Sync diário quebrando silenciosamente | Divergência acumulada | FE-5 abre issue e puxa para o JIRA |

---

## 9. Estado no JIRA

Criado no projeto **FORGE**: 12 épicos + 57 itens = 69 issues.

| Épico | Chave |
|---|---|
| FE-1 Identidade & Distribuição | FORGE-4 |
| FE-2 Plataforma de Apps Web Fixados | FORGE-3 |
| FE-3 Configurador de Projeto | FORGE-1 |
| FE-4 Code Review & Fluxo do Projeto | FORGE-2 |
| FE-5 Sync com Upstream & Contribuição | FORGE-6 |
| FE-6 UX & Personalização | FORGE-8 |
| FE-7 Integrações Senior | FORGE-7 |
| FE-8 Orquestração & IA Local | FORGE-5 |
| FE-9 Produtividade Pessoal | FORGE-12 |
| FE-10 Segurança & Conformidade | FORGE-9 |
| FE-11 Plataforma de Extensões Pública | FORGE-10 |
| FE-12 Programa de Entrega | FORGE-11 |

**Primeiros a puxar** (prioridade Highest): FORGE-16 (registro de apps web), FORGE-18
(configurador de MCP), FORGE-28 (sync diário), FORGE-30 (auditoria de segurança).

**Dependências ligadas como "blocks" no board**: FORGE-16 → 17, 19, 20, 53, 59, 61 ·
FORGE-18 → 23 · FORGE-15 → 57.

Itens marcados `needs-refinement` não entram em sprint antes de responder a pergunta que falta
(documentada no próprio card): FORGE-14, 25, 34, 35, 36, 38, 43, 52, 55, 56, 59, 60, 63, 64.

