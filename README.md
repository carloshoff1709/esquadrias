# Esquadrias — Chaparia, Montagem e Pintura

Dashboard para apontar, por esquadria, as etapas **chaparia solicitada → chaparia recebida → montagem feita → enviada para pintura → pintura concluída → acessórios montados**. Os prazos são contados em dias úteis, para trás, a partir da **Data 1** (data em que a esquadria precisa estar pronta).

| Etapa | Janela com complemento (padrão) | Janela sem complemento |
|---|---|---|
| Pedir a chaparia | Data 1 − 27 du | Data 1 − 24 du |
| Receber a chaparia (fornecedor: 10) | Data 1 − 17 du | Data 1 − 14 du |
| Montar e enviar para pintura (montagem: 7) | Data 1 − 10 du | Data 1 − 7 du |
| Pintura pronta (pintura: 7) | Data 1 − 3 du | Data 1 |
| Acessórios montados (acessórios: 3) | Data 1 | — |

**Os dias de cada etapa se alteram no app**, na aba **⚙ Parâmetros** (só o usuário master). Veja "Parâmetros do fluxo".

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

Perfis: `apontador` e `admin` apontam; `master` faz tudo o que o admin faz e é o **único que pode retirar o aviso de alteração da programação**; `visualizador` só vê. Use um perfil só por usuário (ex.: `master`, não `admin, master`). **Todo acesso exige login** (a página abre na tela de login e o Apps Script só entrega dados para usuário válido).
As senhas ficam em texto na planilha — use senhas próprias deste sistema e restrinja quem edita a planilha.

### 3. GitHub Pages
1. Crie um repositório novo no GitHub e envie o `index.html` (e este README).
   A pasta `projetos` vai junto, mas o upload pela página do GitHub aceita até 100 arquivos por vez:
   envie primeiro `index.html` e `README.md`; depois **Add file → Upload files** e arraste a **pasta** `projetos` inteira (99 arquivos).
2. No `index.html`, troque `COLE_AQUI_A_URL_DO_APPS_SCRIPT` (const API_URL) pela URL do passo 1.4.
3. **Settings → Pages → Branch: main / (root) → Save**. O endereço aparece em alguns minutos.

## Abas da planilha

- **Programação de Esquadrias** — só leitura. O script procura o cabeçalho (Módulo, Esquadria, Data 1, Produção Interna, Produção Externa) nas 15 primeiras linhas. As esquadrias vêm das **listas suspensas** (veja "Listas suspensas"); a coluna Esquadria só é usada enquanto a lista da linha estiver vazia.
- **Status_Esquadrias** — apontamentos (criada sozinha). Não renomeie as colunas. A coluna **O** (`acessorios`) guarda a data de *Acessórios montados* e é criada sozinha.
- **Parametros** — dias de cada etapa. É criada na primeira vez que o master salva a aba ⚙ Parâmetros; sem ela, valem os padrões.
- **Usuarios** — logins.
- **Base_Programacao** — criada e ocultada sozinha. Guarda a programação já em andamento (linha a linha, com as chaves de cada esquadria). Não edite à mão.
- **Feriados** (opcional) — datas na coluna A, somadas aos feriados nacionais e ao 20/09 já previstos.

## Portas (fornecedor externo)

Portas (códigos que começam com P) são compradas prontas e têm outro fluxo. **Data 1 = prazo de entrega da porta.**

| Etapa | Prazo | Coluna na Status_Esquadrias |
|---|---|---|
| Solicitação de compra emitida | Data 1 − 35 du | solicitada |
| OC aprovada | Data 1 − 30 du (entrega do fornecedor: 30 du) | recebida |
| Recebimento previsto | data informada (vem da OC; vermelho se depois da Data 1) | montada |
| Porta recebida | Data 1 | env_pintura |

Prazos na aba **⚙ Parâmetros** (padrão: aprovação 5 du, entrega 30 du).
Ao importar uma OC, as portas recebem *OC aprovada* (data do pedido) e *Recebimento previsto* (data de entrega da OC);
uma *Solicitação de compra* marcada antes é mantida. Saldo de portas funciona igual ao das janelas.

## Complemento recebido (vidro / policarbonato / tela)

Os códigos que, pelo caderno R02, levam complemento comprado à parte mostram um selo abaixo de *Chaparia solicitada*.

- **Para apontar:** no Apontamento, clique no selo e escolha a data. Para várias de uma vez, selecione as esquadrias e escolha **Complemento recebido** na barra de baixo; as que não levam complemento são ignoradas.
- **Selo:** fica verde com ✓ e a data quando o complemento é recebido.
- **Etapas:** o complemento não altera as etapas nem os prazos. Fica na coluna `complemento` da Status_Esquadrias, criada sozinha na primeira listagem depois de publicar o Code.gs novo.
- **Montagem de acessórios (versão 2026-11-19.1):** o complemento é instalado na etapa **Acessórios montados**, depois da pintura. Ele não segura mais a montagem: no Programa de montagem, a janela fica **Liberada** só com a chaparia recebida.

## Parâmetros do fluxo (aba ⚙ Parâmetros) — versão 2026-11-19.1

A aba mostra os dias úteis de cada etapa e, ao lado, os prazos que resultam (com uma Data 1 de exemplo). A prévia atualiza enquanto você digita.

| Parâmetro | Padrão | O que é |
|---|---|---|
| Chaparia | 10 | Do pedido da chaparia até ela chegar na fábrica |
| Montagem | 7 | Da chaparia recebida até a montagem feita |
| Pintura | 7 | Do envio para a pintura até a pintura concluída |
| Montagem de acessórios | 3 | Vidro, policarbonato, tela… depois da pintura (só janelas com complemento no caderno) |
| Aprovação da OC (porta) | 5 | Da solicitação de compra até a OC aprovada |
| Entrega da porta | 30 | Da OC aprovada até a porta recebida |
| Atenção | 2 | A etapa fica amarela quando faltam até N du |
| Alerta de chaparia sem pedido | 3 | A chaparia sem pedido entra no alerta quando faltam até N du |

- **Quem altera:** só o usuário **master** (coluna D da aba Usuarios). Os outros perfis veem os valores, mas não editam.
- **Salvar:** grava na aba **Parametros** da planilha, então vale para todos, e recalcula todos os prazos na hora. Registra quem alterou e quando.
- **Voltar ao padrão:** preenche os valores padrão; é preciso clicar em Salvar para valer.
- **Etapa Acessórios montados:** existe só nas janelas cujo código leva complemento no caderno R02. A janela sem complemento termina na pintura (Data 1) e não ganha os dias de acessórios.
- **Ao publicar esta versão:** as janelas com complemento passam a ter todos os prazos 3 du mais cedo. É normal aparecerem mais atrasadas e atenção. As janelas já pintadas passam para "Falta montar acessórios" até alguém apontar a nova etapa (dá para apontar em lote: selecione e escolha *Acessórios montados* na barra de baixo).

## Lista do Apontamento

Cada **módulo** (módulo + Data 1) é um cartão com borda na cor da pior situação: vermelho = atrasado, amarelo = atenção, verde = em dia, azul = concluído. O cabeçalho mostra:

- **Nome e quantidade:** nome do módulo e quantas janelas/portas tem.
- **Data 1** com o dia da semana.
- **Trilha de etapas:** ✓ verde quando todas as esquadrias fizeram a etapa; "2/3" quando está parcial; vermelho ou amarelo quando a etapa está vencida ou vencendo.
- **Próximo prazo do módulo**, com etiqueta *x du atrasado*, *vence hoje* ou *faltam x du*.

Cada **esquadria** é uma linha com:
- um ponto na cor da sua situação;
- o código, o link do projeto e o selo do complemento;
- as etapas, cada uma com o nome dentro da caixa (clique para apontar);
- o próximo passo, com o término previsto e a OC.

A Data 1 não se repete nas linhas, porque já está no cabeçalho. Módulos concluídos ficam recolhidos; clique no cabeçalho para abrir ou fechar.

## Filtro Portas / Janelas

Botões **Todas · Portas · Janelas** ao lado das abas. Vale para indicadores, alerta, lista, carga semanal e saldo, e fica lembrado no navegador.
O filtro **Próxima etapa** acompanha o tipo: em **Janelas** só as etapas de chaparia/montagem/pintura; em **Portas** só
*Falta emitir solicitação de compra · Falta OC aprovada · Falta recebimento previsto · Aguardando recebimento*; em **Todas**, os dois grupos
e *Falta pedido (chaparia ou SC de porta)*.
Nas portas, *Falta recebimento previsto* = OC aprovada ainda sem data prevista; *Aguardando recebimento* = já tem data prevista e a porta não chegou. Uma porta nunca aparece nos dois.
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

## Listas suspensas: Produção Interna e Produção Externa (versão 2026-11-16.2)

As esquadrias saem das colunas de lista suspensa:
- **Produção Interna** (AY a BD) = janelas.
- **Produção Externa** (BE a BI) = portas.

**Como as células são lidas:**
- Cada célula preenchida é **uma esquadria**. Duas unidades = escolher a tipologia em duas células.
- O valor é a tipologia do caderno R02: código + marco. Por exemplo, `PF151-e-M10` vira o código **PF151-e** com batente/marco **M10**.
- A tipologia sem marco (ex.: `PC161-d`) também é aceita.

**Como as colunas são encontradas:** pelo título mesclado "Produção Interna" / "Produção Externa" no cabeçalho. Se você acrescentar uma coluna e aumentar a mescla, o app passa a ler a coluna nova também.

**Marcações** como o "X" das colunas de data não são lidas.

**Transição:** em cada linha, janelas e portas são tratadas separadamente.
- Grupo com alguma lista suspensa preenchida: **vale a lista**.
- Grupo vazio: o app usa a coluna Esquadria para aquele grupo, como antes.

**Avisos da planilha durante a transição:**
- a lista suspensa e a coluna Esquadria dizem coisas diferentes na mesma linha;
- código de porta na Produção Interna, ou de janela na Produção Externa.

**Apontamentos:** a chave continua `MÓDULO|CÓDIGO|nº`, sem o marco. Uma linha que passa da coluna Esquadria para a lista suspensa com as **mesmas** esquadrias mantém todos os apontamentos e não gera alerta. Se a lista tiver esquadrias diferentes, o alerta "esquadrias trocadas" aparece (veja "Alterações na programação").

**Onde o marco aparece:**
- ao lado do código na lista do Apontamento, na janela de conferência e no Programa de montagem;
- em **todos os downloads em Excel**, o código sai como **tipologia**, escrito igual à lista suspensa (ex.: `JPF350-M10`, `PF151-e-M10`). Isso vale para:
  - itens sem pedido (compras): "Resumo por código" e "Por módulo";
  - Programa de montagem;
  - romaneio para pintura, incluindo o "Total por tipo";
  - sequência para o fornecedor, incluindo o "Por semana".

O mesmo código com marcos diferentes fica em linhas separadas (ex.: `JPF350-M10` e `JPF350-M12`). Sai só o código, sem marco, quando a linha ainda vem da coluna Esquadria antiga, que não informa o marco, e nas unidades de saldo da OC, porque a OC também não informa.

## Como a coluna Esquadria é lida

- **Separação:** esquadrias separadas por vírgula ou ponto e vírgula. Quantidade no fim: `- 2pç`, `2 PÇ`, `2un`, `2X`, `2 x` ou `x2`. Repetir o código também conta: `JPF352,JPF352` = 2.
- **Escrita padronizada:** `JPF 354` vira `JPF354` e `PF153-E` vira `PF153-e`.
- **Avisos da planilha:**
  - linha com trecho que não parece código de esquadria;
  - **módulo repetido com esquadrias diferentes** entre as linhas (cada linha é um lote, e o mesmo módulo deve ter as mesmas esquadrias em todos).
- **Migração do "2X" (versão 2026-11-12.1):** até a versão anterior, "2X" não era entendido (contava 1 unidade, com o código "PM152-d 2X"). Na primeira leitura depois de publicar o Code.gs novo, os apontamentos feitos nesses itens passam para a 1ª unidade do lote e um aviso informa quantos foram migrados. A 2ª unidade fica sem apontamento e precisa de pedido.

## Unidade de OC "perdida" (órfã)

Toda linha da Status_Esquadrias com OC é uma unidade física pedida. Se a chave dessa linha deixa de existir na programação, a unidade fica órfã. Isso acontece quando a linha do módulo é apagada ou alterada, a escrita muda (como no caso do "2X") ou a mesma chave aparece duas vezes.

Na leitura seguinte, o app trata a unidade órfã nesta ordem:
1. **Vincula** a uma esquadria do mesmo código que foi apontada **sem OC** e já recebida (de preferência do mesmo módulo), porque é a mesma peça física. Ela ganha a OC e mantém as próprias datas.
2. Se não houver, **devolve ao saldo da OC** com as etapas que já tinha. A unidade aparece na aba **Saldo de OCs** e é consumida pela próxima esquadria do mesmo código sem pedido.

Um aviso em "Avisos da planilha" informa a OC, o código, a chave de onde a unidade saiu e o destino dela.

Apontamentos sem OC não são mexidos.

## Alterações na programação já em andamento

A programação que já está na planilha é a **base** (aba oculta Base_Programacao). Ela é criada na primeira vez que o app abre depois de publicar o Code.gs da versão 2026-11-16.1, **sem alerta**: as linhas que existem naquele momento (hoje, 4 a 256) viram a referência.

| O que acontece na planilha | Resultado no app |
|---|---|
| Linha nova **abaixo** da última linha já programada | Normal, sem alerta. A linha entra no fluxo. |
| Linha nova **entre** linhas já programadas (ex.: inserir a linha 112) | Alerta vermelho no topo: *inserida no meio* |
| Linha apagada | Alerta: *apagada*, com quantas esquadrias da linha já tinham apontamento |
| Linha recortada e colada em outro lugar | Alerta: *mudou de posição* (mostra a linha antiga) |
| Esquadrias trocadas numa linha que já existia | Alerta: *esquadrias trocadas* (mostra como era antes) |
| **Data 1** mudou numa linha que já existia (versão 2026-11-16.4) | Alerta: *Data 1 alterada* (de → para) |
| **Código do módulo** mudou numa linha que já existia | Alerta: *módulo alterado* (de → para). As esquadrias do mesmo código continuam com os apontamentos. |
| **Marco** trocado numa esquadria (ex.: M10 → M12) | Alerta: *marco alterado*. O marco só passar a ser informado (coluna antiga → lista) não conta. |
| Mais de uma coisa na mesma linha | Um alerta só: *alterada: Data 1, esquadrias*… |
| Linha nova no fim, ajustada no **mesmo dia** em que entrou e ainda sem apontamento | Sem alerta (dá para terminar de preencher). A partir do dia seguinte, qualquer mudança gera alerta. |

**Os apontamentos ficam com a linha.** Cada linha guarda as chaves das suas esquadrias. Inserir, apagar ou mover linhas não troca apontamentos de lugar, e uma linha nova sempre recebe chaves novas.

Antes desta versão, a chave era `MÓDULO|CÓDIGO|nº`, numerada pela posição na planilha. Como o mesmo módulo aparece em vários lotes (por exemplo, MI-1-07 três vezes), inserir um lote desse módulo no meio passava o apontamento de um lote para outro sem aviso.

**O alerta fica até alguém dar ciente:**
- Clique no nome do módulo para conferir as esquadrias da linha.
- Só o usuário **master** vê o botão **✓ Ciente — aceitar a nova programação** e pode retirar o aviso. As alterações viram a nova base e o alerta sai. Os outros perfis veem o aviso, mas não conseguem tirá-lo.
- O ciente vale só para o que estava na tela. Uma alteração feita depois continua em alerta.

**Enquanto não houver ciente, nada muda nos apontamentos (versão 2026-11-16.3):**
- **Esquadrias que saíram da linha ficam guardadas nela**, com apontamentos e OC. Elas não viram órfãs, e a OC não volta para o saldo.
- **Se a planilha for corrigida, o alerta da linha some sozinho** e as esquadrias voltam com tudo o que tinham.
- **Esquadrias novas da linha** (marcadas "sem ciente" no Apontamento) não pegam unidade de saldo de OC.
- **No alerta**, cada linha mostra quantas esquadrias estão guardadas fora da lista e quantas são novas.

**Correção do que a versão 16.2 fez:** na 16.2, uma linha com "esquadrias trocadas" perdia na hora as esquadrias que saíram da lista, e as que tinham OC iam para o saldo (podendo ir para outra esquadria). Na primeira leitura da 16.3, isso é desfeito para as linhas ainda sem ciente:
- a esquadria nova que pegou saldo naquela leitura devolve a unidade;
- a unidade que ainda estava no saldo volta para a linha;
- a unidade que tinha passado para outra esquadria e não foi mexida depois também volta, e a outra esquadria fica sem pedido, como estava antes.

O que não dá para desfazer aparece em "Avisos da planilha".

**Linha apagada:** enquanto ninguém der ciente, as esquadrias com OC dessa linha **não** voltam para o saldo. Se a linha for colada de volta, o alerta some sozinho e os apontamentos voltam. Depois do ciente, as unidades com OC seguem a regra de "Unidade de OC perdida": vínculo com uma esquadria sem OC ou volta ao saldo.

Uma linha inserida no meio e apagada antes do ciente simplesmente some do alerta.

## Observações

- O apontamento fica ligado à **linha da programação** (veja "Alterações na programação já em andamento"). Inserir, apagar ou mover linhas não troca apontamentos de lugar. Trocar o nome do módulo conta como linha apagada + linha nova (alerta), e a linha nova aparece sem apontamentos.
- Marcar uma etapa preenche as anteriores vazias com a mesma data; desfazer uma etapa limpa as seguintes.
- Datas sem ano digitadas na planilha podem ficar com o ano errado — o dashboard avisa quando a Data 1 cai muito no passado.
- Ao mudar o `Code.gs`: **Implantar → Gerenciar implantações → lápis → Nova versão**. A URL continua a mesma.

## Visão geral (aba inicial)

Painel no estilo BI, sem biblioteca externa (SVG/HTML no próprio `index.html`):

- **Anéis:** esquadrias por situação; módulos por situação (cada módulo/lote assume a pior situação entre as suas esquadrias); avanço das etapas (% apontado, com medidores de janelas e portas).
- **Janelas por status / Portas por status:** gráficos de colunas com os mesmos status do filtro "Próxima etapa", e o número de cada coluna é o mesmo que o filtro mostra no Apontamento.
  - **Janelas:** Falta pedir chaparia → Já pedida, falta receber chaparia → Falta montar → Falta enviar p/ pintura → Na pintura → Falta montar acessórios → Prontas.
  - **Portas:** Falta emitir SC → Falta OC aprovada → Falta recebimento previsto → Aguardando recebimento da porta → Recebidas.
  - **Leitura:** cada coluna é dividida em atrasadas, atenção e em dia, e a coluna com mais atrasadas recebe o selo **gargalo**. Clique no número ou num segmento para abrir a janela de conferência.
- **Data 1 por semana:** colunas pela semana da Data 1 (8 semanas), coloridas pela situação atual. "Venc." agrupa as pendentes com Data 1 já passada.
- **Carga semanal de prazos:** etapas pendentes pela semana do prazo, pela mesma regra da aba Carga semanal. Há um botão **Tabela** para ver os números.
- **Tabelas:** prazos de etapa (vencidas e próximos 10 du), módulos em risco (barra de du após a Data 1) e entregas de fornecedor atrasadas.

### Programa de montagem (na Visão geral)

O cartão lista as **janelas ainda não montadas** com prazo de montagem (Data 1 − 10 du nas janelas com complemento, com os parâmetros padrão) vencido ou dentro do período. A sequência segue a **Data 1** (entrega); empates vão pelo prazo de montagem e depois pelo módulo.

- **Períodos:** *Hoje* (atrasadas + prazo hoje), *Esta semana* (atrasadas + prazo até sexta) e *Próxima semana* (só o prazo da semana seguinte).
- **Blocos por dia:** atrasadas e cada dia útil, com quantas estão liberadas. Feriados ficam de fora.
- **Situação de cada linha:** **● Liberada** quando a chaparia foi recebida; caso contrário, **○ Falta chaparia**. O complemento entra depois, na montagem de acessórios. "Só liberadas" esconde as demais.
- **Corte de capacidade:** se a capacidade de montagem estiver preenchida na aba Carga semanal, aparece uma linha de corte. Por semana vale a capacidade semanal; por dia, cerca de 1/5 dela.
- **Ações:** *Abrir no Apontamento* (para marcar "montada" em lote), *Excel* (com a coluna "Montada ✓") e *Imprimir* (A4 deitado, com caixa de seleção).

Passar o mouse mostra os números. Clicar em qualquer fatia, segmento, coluna, bloco ou número sublinhado abre uma **janela de conferência** sobre a tela, sem trocar de aba. Ela mostra cada esquadria com o estado das etapas, o próximo passo, a OC e a situação; fecha com ✕, Esc ou clique fora.
**Apontar direto pela janela** (perfis apontador e admin):
- **Uma esquadria:** clique na etapa (Pedido, Recebida, Montada…) para abrir o apontamento dela.
- **Várias de uma vez:** marque as caixas (ou "selecionar todas"), escolha a etapa e a data no rodapé e clique em **Apontar** ou **Desfazer**. A etapa já vem sugerida pelo próximo passo mais comum da lista; "Complemento recebido" também está disponível.

A janela continua aberta mostrando o novo status, e o painel atrás se atualiza. Perfil visualizador vê a janela só para leitura.
Todo o painel respeita o filtro Todas/Portas/Janelas.

### Como a situação de cada esquadria é calculada

Cada etapa tem um prazo = Data 1 menos os dias úteis das etapas seguintes. Exemplo de janela: montagem até D1−7, chaparia recebida até D1−14.
Olha-se só a **próxima etapa pendente**:

- **Atrasada** — o prazo dessa etapa já passou, **ou** a data do fornecedor (entrega prevista da OC de chaparia; recebimento previsto da porta) cai depois desse prazo.
- **Atenção** — o prazo vence nos próximos 2 dias úteis (pedido de chaparia: 3).
- **Em dia** — ainda dentro do prazo da etapa. Por exemplo, uma janela com chaparia recebida e montagem até 18/11 está em dia hoje (11/11), mesmo que montagem e pintura somem 14 du.
- **Previsão de término** — Data 1 mais os dias úteis que a etapa atual já estourou. O atraso empurra a Data 1, e o motivo aparece ao lado.

## Romaneio para pintura (Excel)

Botão **🎨 Romaneio p/ pintura** no Programa de montagem (Visão geral) e na aba Carga semanal. A janela lista as janelas com **Montagem feita** e ainda sem **Enviada p/ pintura**, por módulo e na ordem do prazo de envio, com quantidade, área e peso.

- **Seleção e data:** desmarque os módulos que não vão nesta carga e escolha a data de envio.
- **Marcar como enviadas** (apontador/admin): opcional. Grava *Enviada p/ pintura* nas selecionadas, com a data escolhida, logo depois de gerar o Excel.
- **Aba "Romaneio" do Excel:**
  - **Cabeçalho:** data de envio, quantidade, área total, peso estimado e a especificação de pintura do caderno R02 (primer W-POXI CVP 315 · acabamento PU HPA 501 RAL 7033).
  - **Tabela por módulo e código:** Data 1, *pintura pronta até* (= prazo da pintura: Data 1 menos os dias de acessórios), descrição, medidas, área, peso, data da montagem, complemento e uma coluna *Conferido (✓)*.
- **Aba "Total por tipo":** soma por tipo de esquadria (janela, grade fixa, visor, tela). Dentro de cada tipo, a quantidade, a área e o peso por código, com subtotal por tipo e total geral.
- **Medidas e peso:** vêm do caderno R02 por código. O peso é a média do caderno para o código e varia com a espessura do marco, por isso aparece como estimado.

## Sequência de produção para o fornecedor de chaparia

**Onde fica:** o botão **🏭 Sequência p/ fornecedor** aparece na janela de conferência sempre que a lista tem janelas com chaparia pedida e não recebida. A sequência gerada traz **sempre todas** as chaparias pedidas e não recebidas (atrasadas, atenção e falta receber), mesmo quando aberta por um segmento do gráfico. Por exemplo, ao clicar em *Já pedida, falta receber chaparia* no gráfico Janelas por status. O mesmo botão também está na aba Carga semanal, que traz todas as janelas pendentes, inclusive as unidades de saldo das OCs.

**Como usar:**
1. Marque as OCs do fornecedor.
2. Confira a prévia.
3. Gere o **Excel** ou **Imprima / PDF**.

**Três situações, nesta ordem:** o relatório é dividido em blocos, cada um com título e total de peças:
1. **Atrasadas:** prazo de recebimento vencido, ou entrega prevista na OC depois do prazo.
2. **Atenção:** prazo vence nos próximos dias.
3. **Falta receber:** pedida e dentro do prazo.

Os três blocos aparecem sempre; um bloco sem peças mostra *Nenhuma peça nesta situação*. As unidades de saldo da OC (sem módulo) vêm num bloco final, só quando existem.

**Ordem dentro de cada bloco:** pelo prazo de recebimento da chaparia na fábrica (Data 1 − 17 du nas janelas com complemento, com os parâmetros padrão), com desempate pela Data 1 e pelo módulo. A numeração (Seq.) é corrida do primeiro ao último bloco. Prazos vencidos aparecem como *PRAZO VENCIDO — prioridade*.

**Aba "Sequência" do Excel:** o cabeçalho traz o total de peças e quantas são atrasadas, atenção, falta receber e saldo; cada bloco começa com uma linha de título. A tabela tem Seq., *Entregar na Visia até*, semana, módulo, esquadria, descrição do caderno, quantidade, medidas, OC, entrega prevista na OC, **situação**, observação e uma coluna *Produzido (✓)*.

**Aba "Por semana":** quantidade por código em cada semana de entrega, com subtotais, para o fornecedor montar os lotes de produção.

## Complementos a comprar (Excel)

**Onde fica:** aba **Carga semanal**, botão **🔷 Complementos a comprar (Excel)**, ao lado de "Baixar itens sem pedido". O botão respeita o filtro Todas / Portas / Janelas.

**O que entra:** toda esquadria com complemento no caderno R02 (vidro, policarbonato, tela, vidro blindado) que ainda **não** tem "complemento recebido" apontado.

**Ordem e prazo:** o arquivo vem na ordem da data em que o complemento precisa chegar.
- **Janela:** fim da pintura, quando começa a montagem de acessórios (Data 1 − 3 du, com os parâmetros padrão).
- **Porta:** prazo de recebimento da porta (Data 1).

**Abas do Excel:**
1. **Resumo por material:** quantidade de peças por material, especificação do caderno, área de referência, tipologias (`JPF350-M10 ×12`…), data mais cedo e quantas já estão com o prazo vencido.
2. **Por tipologia:** material × tipologia, com a medida da esquadria, a quantidade e os módulos.
3. **Por módulo:** uma linha por módulo, tipologia e material, com prazo, situação (vencido / faltam X du), situação da chaparia (ou da porta) e observação.

**Atenção à área de referência:** ela é largura × altura da **janela** no caderno, e não a medida da chapa de vidro ou policarbonato. Nas portas (visor), fica em branco. Confirme o recorte no projeto antes de comprar.

## Carga semanal

Cada célula conta as esquadrias com prazo daquela etapa na semana (a semana atual soma as atrasadas).
**Chaparia a receber** inclui as que ainda nem foram pedidas; "s/ pedido" em vermelho mostra quantas estão sem pedido/OC.
**Clique num número** para abrir a lista só com aquelas esquadrias.
