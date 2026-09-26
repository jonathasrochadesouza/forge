# FORGE — Recuperação pós-crash, identidade do fork e bugs residuais

> Card para o Jira (projeto **FORGE**, tipo `Task`). Criar como `In Progress` — parte
> já executada em 2026-09-25/26; as pendências abaixo são o restante do plano.
> Depois de criar no board, preencher a chave real (ex.: FORGE-70) e mover para In Progress.

```
Problema        — O crash do Orca oficial (auto-update corrompido) destruiu o estado do git do
                  fork e matou a sessão do agente no meio da correção de identidade Forge/Orca.
                  O fork ficou 385 commits atrás do upstream e os bugs 5-7 (instabilidade,
                  desinstalação, apagar dados do Orca oficial) continuavam valendo no build
                  instalado.
Solução         — Reparar o estado do git, recuperar e commitar a correção em andamento,
                  sincronizar com o upstream/main, gerar um build Windows novo do Forge e
                  validar os bugs residuais no build novo.
Escopo técnico  — .git/config e refs (reparo, não código); FORGE-OVERRIDES (identidade já
                  logada); build via pnpm build:win → dist/. Bugs residuais: renderer/main
                  dos web apps fixados e agregação de notificações (FE-9).
Critérios de aceite — checklist abaixo.
Fora de escopo  — Notificação nativa como feature completa (card FE-9), sync diário
                  automatizado (FE-5), pipeline de CI com assinatura.
Links           — FORGE.md (regra aditiva), FORGE-OVERRIDES.md, docs/forge/plano-tarefas-jira.md,
                  commit a00cf502e (sync), commit 070ee9387 (identidade).
```

## Estado atual (o que já está feito)

- [x] `.git/config` recriado (origin + upstream) e `refs/heads/forge` restaurado
      via reflog (branch tinha sido apagada; último commit pruneado pelo gc)
- [x] Correção em andamento do agente recuperada do working tree e commitada
      (`070ee9387`): appId `com.forge.ide`, productName/executableName `Forge`,
      hooks NSIS, daemon-host em `%LOCALAPPDATA%\Forge`, ProgID `Forge.Markdown`
- [x] Docs do plano JIRA recommittados (`docs/forge/plano-tarefas-jira.md`)
- [x] Sync: merge de `upstream/main` (385 commits, até 25/09) em `a00cf502e`;
      3 conflitos resolvidos nos arquivos da whitelist ("ours wins" no feed de publish)
- [x] Gates verdes: `pnpm tc` pré e pós-sync; 64 testes scoped; lint do diff próprio: 0 findings
- [x] Build Windows gerado e pushed: `dist/forge-windows-setup.exe` (v1.4.197) + `origin/forge`

## Pendências (plano restante)

### 1. Validar o build novo na máquina (usuário)
- [ ] Instalar `dist/forge-windows-setup.exe` com o Orca oficial instalado e confirmar
      coexistência: Orca em `%LOCALAPPDATA%\Programs\orca` intacto, Forge em caminho próprio
- [ ] Instalar, desinstalar e reinstalar o Forge sem o Orca oficial perder dados/sessões
      (daemon-host, userData e ProgID separados)

### 2. Crash do Teams na 1ª abertura (FORGE-19, bug 1)
- [ ] Reproduzir no build novo clicando em Teams/calendário pela primeira vez
- [ ] Se reproduzir: capturar stack do main process (CDP/log) e corrigir de forma aditiva
      em `src/main/forge/web-apps/` ou `src/renderer/src/forge/web-apps/`
- [ ] Se não reproduzir: registrar evidência no card e fechar como corrigido pelo sync
      (correções upstream no subsistema browser entre 22 e 25/09)

### 3. Notificações nativas das web apps fixadas (bug 2, vínculo FE-9)
- [ ] Badge de não-lidas já funciona (título da aba); falta o banner nativo do SO
- [ ] Card separado: ponte `forge-web-app-unread-count` → subsistema de notificações do
      upstream (agregar fonte, não criar segundo subsistema)

### 4. Erro "The workspace list hit an error" na sidebar (bug 3)
- [ ] Reproduzir em build novo com logs de renderer/main
- [ ] Diagnosticar se é sintoma do ambiente corrompido (resolvido pela reinstalação)
      ou erro real do shell de workspace; corrigir se real

### 5. Follow-ups de qualidade (não bloqueiam)
- [ ] `pnpm lint` completo falha em 9 avisos `import/no-cycle` herdados do upstream em
      `mobile/src` (só aparecem com os deps do mobile instalados) — candidato a issue
      para o upstream ou exclusão justificada
- [ ] Teste `local-build-candidate` falha por `EPERM` ao criar symlink no Windows sem
      modo desenvolvedor — fixture precisa de skip condicional
