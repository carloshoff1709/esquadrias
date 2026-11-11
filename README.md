# Esquadrias — Chaparia, Montagem e Pintura

Dashboard para apontar, por esquadria, as etapas **chaparia solicitada → chaparia recebida → montagem feita → enviada para pintura → pintura concluída**, com prazos em dias úteis contados para trás a partir da **Data 1** (data em que a esquadria precisa estar pintada).

| Etapa | Prazo |
|---|---|
| Pedir a chaparia | Data 1 − 24 dias úteis |
| Receber a chaparia | Data 1 − 14 dias úteis (fornecedor: 10) |
| Montar e enviar para pintura | Data 1 − 7 dias úteis (montagem: 7) |
| Pintura pronta | Data 1 (pintura: 7) |

Os prazos (10 / 7 / 7) ficam no `index.html`, no objeto `LEAD`.

## Arquivos

- `index.html` — o dashboard (vai para o GitHub Pages)
- `Code.gs` — o Apps Script (vai para a planilha, **não** para o GitHub)
- `projetos/` — 99 PDFs, um por código de esquadria, tirados do Caderno de Esquadrias Metálicas R02 (vai para o GitHub, com a pasta)

## Instalação

### 1. Apps Script na planilha
1. Abra a planilha da programação de esquadrias → **Extensões → Apps Script**.
2. Apague o conteúdo de `Code.gs` e cole o `Code.gs` deste repositório. Salve.
3. **Implantar → Nova implantação** → tipo **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize e copie a URL que termina em `/exec`.

### 2. Usuários
Na primeira tentativa de login, a aba **Usuarios** é criada sozinha. Preencha:

| usuario | senha | nome | perfil |
|---|---|---|---|
| carlos | ***** | Carlos Hoff | admin |
| joao | ***** | João | apontador |
| ana | ***** | Ana | visualizador |

Perfis: `apontador` e `admin` apontam; `visualizador` só vê. **Todo acesso exige login** (a página abre na tela de login e o Apps Script só entrega dados para usuário válido).
As senhas ficam em texto na planilha — use senhas próprias deste sistema e restrinja quem edita a planilha.

### 3. GitHub Pages
1. Crie um repositório novo no GitHub e envie o `index.html` (e este README).
   A pasta `projetos` vai junto, mas o upload pela página do GitHub aceita até 100 arquivos por vez:
   envie primeiro `index.html` e `README.md`; depois **Add file → Upload files** e arraste a **pasta** `projetos` inteira (99 arquivos).
2. No `index.html`, troque `COLE_AQUI_A_URL_DO_APPS_SCRIPT` (const API_URL) pela URL do passo 1.4.
3. **Settings → Pages → Branch: main / (root) → Save**. O endereço aparece em alguns minutos.

## Abas da planilha

- **Programação de Esquadrias** — só leitura. O script procura o cabeçalho (Módulo, Esquadria, Data 1) nas 15 primeiras linhas. Esquadrias separadas por vírgula; "- 2pç" vira duas linhas.
- **Status_Esquadrias** — apontamentos (criada sozinha). Não renomeie as colunas.
- **Usuarios** — logins.
- **Feriados** (opcional) — datas na coluna A, somadas aos feriados nacionais e ao 20/09 já previstos.

## Portas (fornecedor externo)

Portas (códigos que começam com P) são compradas prontas e têm outro fluxo. **Data 1 = prazo de entrega da porta.**

| Etapa | Prazo | Coluna na Status_Esquadrias |
|---|---|---|
| Solicitação de compra emitida | Data 1 − 35 du | solicitada |
| OC aprovada | Data 1 − 30 du (entrega do fornecedor: 30 du) | recebida |
| Recebimento previsto | data informada (vem da OC; vermelho se depois da Data 1) | montada |
| Porta recebida | Data 1 | env_pintura |

Prazos em `LEAD_PORTA` no `index.html` (aprovação 5 du, entrega 30 du).
Ao importar uma OC, as portas recebem *OC aprovada* (data do pedido) e *Recebimento previsto* (data de entrega da OC);
uma *Solicitação de compra* marcada antes é mantida. Saldo de portas funciona igual ao das janelas.

## Filtro Portas / Janelas

Botões **Todas · Portas · Janelas** ao lado das abas. Vale para indicadores, alerta, lista, carga semanal e saldo, e fica lembrado no navegador.
O filtro **Próxima etapa** acompanha o tipo: em **Janelas** só as etapas de chaparia/montagem/pintura; em **Portas** só
*Falta emitir solicitação de compra · Falta OC aprovada · Falta recebimento previsto · Aguardando recebimento*; em **Todas**, os dois grupos
e *Falta pedido (chaparia ou SC de porta)*.
Classificação como nas tabelas do caderno: **portas** = códigos que começam com P (PF, PC, PGF, POF, PM); **janelas** = demais (JPF, JVF, VPF, GLF, GF, GPF, VBF, TE).

## Projeto de cada esquadria

Ao lado de cada código aparece **📐 projeto**: abre as folhas de detalhamento daquele código (caderno R02) dentro da página, com zoom e **Abrir PDF**.
Para uma revisão nova do caderno, gere de novo a pasta `projetos/` (um PDF por código, nome = código sem hífen, ex.: `PF151E.pdf`, `JPF350.pdf`) e atualize a lista `PROJETOS` no `index.html`.

## Complementos (policarbonato, vidro, tela)

Ao lado de *Chaparia solicitada* aparece o revestimento que a esquadria leva conforme o caderno R02
(🔷 policarbonato · 🪟 vidro · 🛡️ vidro blindado · ▦ tela), com a especificação completa ao passar o mouse.
Esses itens **não vêm na OC de chaparia** e precisam ser comprados à parte:
- a faixa de *Chaparia não solicitada* mostra **Comprar junto (complementos)** por tipo e código;
- a prévia da importação de OC mostra os **Itens complementares para o setor de compras** com as quantidades da OC.
Medidas e número de placas por esquadria: botão 📐 projeto. A lista fica em `COMPLEMENTOS` no `index.html`
(gerada do caderno; refazer quando sair nova revisão).

## Alerta de chaparia não solicitada

Faixa no topo quando há esquadrias **sem pedido de chaparia** com o prazo do pedido (Data 1 − 24 dias úteis):
- **vencido** (vermelho), ou
- vencendo em **até 3 dias úteis** (amarelo).
Mostra o resumo por código (quantidade e prazo) e o botão **Ver na lista** filtra essas esquadrias. A antecedência fica em `ALERTA_PEDIDO_DU` no `index.html`.

## Importar ordem de compra (só admin)

Botão **📄 Importar OC** no topo (aparece só para perfil `admin`).
1. Escolha o PDF da ordem de compra (padrão do sistema de compras: Insumo / Quant.).
2. O PDF é lido no navegador: para cada insumo, pega o código da esquadria da descrição (ex.: `JPF-350`, `VPF452`, `GLF-462`) e a quantidade.
3. As quantidades vão para as esquadrias **ainda sem pedido**, na ordem da **data de montagem** (Data 1 − 7 dias úteis).
4. Aparece uma prévia (para onde vai cada unidade e o que sobra). Só grava depois de **Confirmar**.
5. Grava *Chaparia solicitada* com a **data do pedido**, o **número da OC** e a **entrega prevista**. A previsão de término passa a usar essa entrega.

- A mesma OC não é importada duas vezes: a prévia procura o número da OC nas esquadrias **e** no saldo e avisa antes de gravar; o servidor confere de novo e recusa. Para atualizar uma OC, use **Reimportar esta OC** (desconta o que já foi usado e refaz só o saldo dela, sem duplicar).
- Esquadrias que já tinham pedido não são alteradas.
- **Marcadas à mão, sem OC**: a prévia lista as esquadrias do mesmo código que tiveram *Chaparia solicitada* marcada manualmente e ainda não têm OC,
  já selecionadas (até a quantidade da OC, pela ordem da montagem). As selecionadas são **vinculadas**: mantêm a data marcada,
  recebem o número e a entrega da OC e **contam dentro da quantidade da OC** (não inflam o saldo). Desmarque as que não pertencem ao pedido.
- **Saldo da OC**: se a OC tiver mais unidades do que esquadrias sem pedido na programação, cada unidade a mais vira uma **unidade de saldo**
  (aba **Saldo de OCs** do dashboard; na planilha, linhas `SALDO|OC|código|n` em Status_Esquadrias e o resumo em **Saldo_OC**).
  As unidades de saldo podem ser apontadas (recebida, montada, enviada p/ pintura, pintada) mesmo sem módulo.
  Quando um módulo novo entra com o código, ele **herda a unidade mais adiantada** (todas as datas, OC e entrega).
  Quando o PCP incluir módulos novos com esse código, ao abrir o dashboard as esquadrias novas recebem o pedido automaticamente
  (OC mais antiga primeiro, na ordem da Data 1). A aba **Saldo de OCs** do dashboard mostra o que sobra.
- Reimportar a mesma OC ("gravar mesmo assim") recalcula o saldo dela, descontando o que já foi usado.
- Desfazer *Chaparia solicitada* numa esquadria limpa também a OC dela.
- Portas com lado (ex.: `PF-151E`) só vão para esquadrias do mesmo lado; sem lado na OC, vale qualquer lado.

## Versão do servidor

O Apps Script informa a versão (`ESQ_VERSAO` no Code.gs). Se o dashboard mostrar **"O Apps Script publicado está desatualizado"**,
cole o Code.gs novo e publique uma **Nova versão** (Implantar → Gerenciar implantações → lápis).
Teste rápido: abra a URL `/exec` no navegador — aparece `{"ok":true,"app":"Esquadrias","versao":"..."}`.

## Observações

- O apontamento fica ligado a **módulo + código da esquadria**. Reordenar linhas na programação não perde nada; trocar o código ou o nome do módulo faz a esquadria aparecer sem apontamentos.
- Marcar uma etapa preenche as anteriores vazias com a mesma data; desfazer uma etapa limpa as seguintes.
- Datas sem ano digitadas na planilha podem ficar com o ano errado — o dashboard avisa quando a Data 1 cai muito no passado.
- Ao mudar o `Code.gs`: **Implantar → Gerenciar implantações → lápis → Nova versão**. A URL continua a mesma.

## Visão geral (aba inicial)

Painel no estilo BI, sem biblioteca externa (SVG/HTML no próprio `index.html`):

- **Anéis:** esquadrias por situação; módulos por situação (cada módulo/lote assume a pior situação entre as suas esquadrias); avanço das etapas (% apontado, com medidores de janelas e portas).
- **Onde estão:** barras empilhadas por etapa, para janelas e para portas, com os segmentos atrasadas / atenção / em dia. A etapa com mais atrasadas recebe o selo **gargalo**.
- **Data 1 por semana:** colunas pela semana da Data 1 (8 semanas), coloridas pela situação atual. "Venc." agrupa as pendentes com Data 1 já passada.
- **Carga semanal de prazos:** etapas pendentes pela semana do prazo, pela mesma regra da aba Carga semanal. Há um botão **Tabela** para ver os números.
- **Tabelas:** prazos de etapa (vencidas e próximos 10 du), módulos em risco (barra de du após a Data 1) e entregas de fornecedor atrasadas.

### Programa de montagem (na Visão geral)

O cartão lista as **janelas ainda não montadas** com prazo de montagem (Data 1 − 7 du) vencido ou dentro do período. A sequência segue a **Data 1** (entrega); empates vão pelo prazo de montagem e depois pelo módulo.

- **Períodos:** *Hoje* (atrasadas + prazo hoje), *Esta semana* (atrasadas + prazo até sexta) e *Próxima semana* (só o prazo da semana seguinte).
- **Blocos por dia:** atrasadas e cada dia útil, com quantas estão prontas. Feriados ficam de fora.
- **Situação de cada linha:** *Pronta* (chaparia recebida) ou *Aguardando chaparia*, com a entrega prevista da OC ou "sem pedido". "Só prontas" esconde as que aguardam.
- **Corte de capacidade:** se a capacidade de montagem estiver preenchida na aba Carga semanal, aparece uma linha de corte. Por semana vale a capacidade semanal; por dia, cerca de 1/5 dela.
- **Ações:** *Abrir no Apontamento* (para marcar "montada" em lote), *Excel* (com a coluna "Montada ✓") e *Imprimir* (A4 deitado, com caixa de seleção).

Passar o mouse mostra os números. Clicar em qualquer fatia, segmento, coluna ou número sublinhado abre o Apontamento só com aquelas esquadrias.
Todo o painel respeita o filtro Todas/Portas/Janelas.

### Como a situação de cada esquadria é calculada

Cada etapa tem um prazo = Data 1 menos os dias úteis das etapas seguintes. Exemplo de janela: montagem até D1−7, chaparia recebida até D1−14.
Olha-se só a **próxima etapa pendente**:

- **Atrasada** — o prazo dessa etapa já passou, **ou** a data do fornecedor (entrega prevista da OC de chaparia; recebimento previsto da porta) cai depois desse prazo.
- **Atenção** — o prazo vence nos próximos 2 dias úteis (pedido de chaparia: 3).
- **Em dia** — ainda dentro do prazo da etapa. Por exemplo, uma janela com chaparia recebida e montagem até 18/11 está em dia hoje (11/11), mesmo que montagem e pintura somem 14 du.
- **Previsão de término** — Data 1 mais os dias úteis que a etapa atual já estourou. O atraso empurra a Data 1, e o motivo aparece ao lado.

## Carga semanal

Cada célula conta as esquadrias com prazo daquela etapa na semana (a semana atual soma as atrasadas).
**Chaparia a receber** inclui as que ainda nem foram pedidas; "s/ pedido" em vermelho mostra quantas estão sem pedido/OC.
**Clique num número** para abrir a lista só com aquelas esquadrias.
