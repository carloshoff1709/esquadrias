/* ============================================================
   ESQUADRIAS — Chaparia / Montagem / Pintura  (projeto independente)

   Onde colar: abra a planilha da programação de esquadrias →
   Extensões → Apps Script → apague o conteúdo de Code.gs e cole
   este arquivo inteiro → Salvar.
   Publicar: Implantar → Nova implantação → Tipo "App da Web" →
   Executar como: EU · Quem pode acessar: QUALQUER PESSOA → Implantar.
   Copie a URL que termina em /exec e cole no index.html (const URL).
   Ao alterar este código: Implantar → Gerenciar implantações →
   lápis → Versão: Nova versão → Implantar (a URL não muda).

   Abas usadas na planilha:
   - "Programação de Esquadrias": só leitura (Módulo, Esquadria, Data 1)
   - "Status_Esquadrias": apontamentos (criada sozinha)
   - "Usuarios": A usuario | B senha | C nome | D perfil (apontador, visualizador ou admin)
                 (criada sozinha com o cabeçalho; preencha os usuários)
   - "Feriados": opcional, datas na coluna A
   - "Saldo_OC": resumo por OC e código (pedida / consumida / saldo). Criada sozinha.
     Cada unidade de saldo também existe em Status_Esquadrias com chave "SALDO|OC|código|n",
     e pode ser apontada (recebida, montada, pintura...) mesmo sem módulo.
     Ao abrir o dashboard, esquadrias novas sem pedido herdam uma unidade de saldo do mesmo
     código (a mais adiantada primeiro; OC mais antiga), na ordem da Data 1.
   Todas as consultas exigem usuário e senha válidos (qualquer perfil vê; apontador/admin apontam).
   ============================================================ */

function doPost(e){
  try{
    if (e && e.postData && e.postData.contents){
      e.parameter = e.parameter || {};
      e.postData.contents.split("&").forEach(function(par){
        var i = par.indexOf("="); if (i < 0) return;
        e.parameter[decodeURIComponent(par.slice(0,i))] = decodeURIComponent(par.slice(i+1).replace(/\+/g," "));
      });
    }
  }catch(err){}
  return doGet(e);
}

function doGet(e){
  var a = e && e.parameter && e.parameter.action;
  if (a === "esq_listar")  return esqListar(e);
  if (a === "esq_apontar") return esqApontar(e);
  if (a === "login")       return esqLogin(e);
  if (a === "esq_oc")      return esqOC(e);
  return saida({ok:true, app:"Esquadrias", versao:ESQ_VERSAO}, e);
}

function saida(obj, e){
  var json = JSON.stringify(obj);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) return ContentService.createTextOutput(cb+"("+json+")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- usuários (aba "Usuarios") ---------- */
var ESQ_ABA_USR = "Usuarios";
function esqUsuario_(usuario, senha){
  var ss = SpreadsheetApp.openById(ESQ_SS_ID);
  var sh = esqAba_(ss, ESQ_ABA_USR);
  if (!sh){
    sh = ss.insertSheet(ESQ_ABA_USR);
    sh.getRange(1,1,1,4).setValues([["usuario","senha","nome","perfil"]]).setFontWeight("bold");
    sh.setFrozenRows(1);
    return null;
  }
  var v = sh.getDataRange().getDisplayValues();
  var u = String(usuario||"").trim().toLowerCase(), s = String(senha||"").trim();
  for (var i=1;i<v.length;i++){
    if (String(v[i][0]).trim().toLowerCase() === u && u && String(v[i][1]).trim() === s && s)
      return {usuario:String(v[i][0]).trim(), nome:String(v[i][2]||v[i][0]).trim(), perfil:String(v[i][3]||"visualizador").trim().toLowerCase()};
  }
  return null;
}
function esqPodeApontar_(perfil){ return ["apontador","admin","administrador","master"].indexOf(String(perfil||"").toLowerCase()) > -1; }
function esqLogin(e){
  var p = e.parameter || {};
  var u = esqUsuario_(p.usuario, p.senha);
  if (!u) return saida({ok:false, erro:"Usuário ou senha inválidos."}, e);
  return saida({ok:true, usuario:u.usuario, nome:u.nome, perfil:u.perfil}, e);
}

var ESQ_SS_ID      = "1JM5WHWmEax-xBwETzLRK3KoZT8shjk8vlyEgWbsb1CQ";
var ESQ_ABA        = "Programação de Esquadrias";
var ESQ_ABA_STATUS = "Status_Esquadrias";
var ESQ_ABA_FER    = "Feriados";
var ESQ_VERSAO     = "2026-11-11.1";   // aaaa-mm-dd.n (aumentar a cada publicação)
var ESQ_ABA_SALDO  = "Saldo_OC";
var ESQ_CAB_SALDO  = ["oc","codigo","descricao","qtd_pedida","consumido","saldo","data_pedido","entrega","atualizado_em"];
var ESQ_ETAPAS     = ["solicitada","recebida","montada","env_pintura","pintada"];
/* PORTAS (códigos que começam com P: PF, PC, PGF, POF, PM) têm outro fluxo, gravado nas mesmas colunas:
   solicitada = Solicitação de compra emitida | recebida = OC aprovada | montada = Recebimento previsto (data informada)
   env_pintura = Porta recebida | pintada = (não usada). */
function esqEhPorta_(cod){ return /^P/.test(String(cod||"").toUpperCase().replace(/[^A-Z0-9]/g,"")); }
function esqColPedido_(cod){ return esqEhPorta_(cod) ? 4 : 3; }   // coluna que marca "tem pedido/OC"
var ESQ_CAB_STATUS = ["chave","modulo","esquadria","solicitada","recebida","montada","env_pintura","pintada","obs","atualizado_em","atualizado_por","oc","entrega_prev","complemento"];   // complemento = data em que vidro/policarbonato/tela chegou

function esqNorm_(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim(); }

function esqAba_(ss, nome){
  var alvo = esqNorm_(nome);
  var sh = ss.getSheetByName(nome);
  if (sh) return sh;
  var todas = ss.getSheets();
  for (var i=0;i<todas.length;i++) if (esqNorm_(todas[i].getName()) === alvo) return todas[i];
  return null;
}

// Data de célula -> "yyyy-MM-dd" (aceita Date, "dd/mm", "dd/mm/aa(aa)", serial)
function esqData_(v){
  var tz = "America/Sao_Paulo";
  if (v instanceof Date && v.getFullYear() > 1971) return Utilities.formatDate(v, tz, "yyyy-MM-dd");
  if (typeof v === "number" && v > 20000 && v < 80000){
    var d = new Date(Date.UTC(1899,11,30) + v*86400000);
    return Utilities.formatDate(d, "UTC", "yyyy-MM-dd");
  }
  var s = String(v||"").trim();
  var m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (!m) return "";
  var dia = +m[1], mes = +m[2], ano;
  if (m[3]) { ano = +m[3]; if (ano < 100) ano += 2000; }
  else {   // sem ano: escolhe o ano que deixa a data mais perto de hoje
    var hoje = new Date(), melhor = null;
    [hoje.getFullYear()-1, hoje.getFullYear(), hoje.getFullYear()+1].forEach(function(a){
      var dd = Math.abs(new Date(a, mes-1, dia) - hoje);
      if (melhor === null || dd < melhor.d) melhor = {a:a, d:dd};
    });
    ano = melhor.a;
  }
  return ano + "-" + ("0"+mes).slice(-2) + "-" + ("0"+dia).slice(-2);
}

// "VPF452 - 2pç, PF151-e, GLF462 2pç" -> [{codigo, qtd}]
function esqItens_(txt){
  return String(txt||"").split(/[,;\n]/).map(function(p){
    p = p.trim(); if (!p) return null;
    var q = 1, mq = p.match(/[-\s]\s*(\d+)\s*(p[cç]s?|un|unid)\.?\s*$/i);
    if (mq) { q = +mq[1]; p = p.slice(0, mq.index).replace(/[-\s]+$/,"").trim(); }
    if (!p) return null;
    return {codigo: p, qtd: q};
  }).filter(function(x){ return x; });
}

function esqStatusSheet_(ss){
  var sh = esqAba_(ss, ESQ_ABA_STATUS);
  if (!sh) {
    sh = ss.insertSheet(ESQ_ABA_STATUS);
    sh.getRange(1,1,1,ESQ_CAB_STATUS.length).setValues([ESQ_CAB_STATUS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  } else {
    var cab = sh.getRange(1,1,1,ESQ_CAB_STATUS.length).getValues()[0];
    if (cab.join("|") !== ESQ_CAB_STATUS.join("|")) sh.getRange(1,1,1,ESQ_CAB_STATUS.length).setValues([ESQ_CAB_STATUS]).setFontWeight("bold");
  }
  return sh;
}

/* ---------- LISTAR: programação + status ---------- */
function esqListar(e){
  var pp = e.parameter || {};
  if (!esqUsuario_(pp.usuario, pp.senha)) return saida({ok:false, login:true, erro:"Faça login para ver os dados."}, e);
  var ss = SpreadsheetApp.openById(ESQ_SS_ID);
  var sh = esqAba_(ss, ESQ_ABA);
  if (!sh) return saida({ok:false, erro:'Aba "'+ESQ_ABA+'" não encontrada na planilha de esquadrias.'}, e);

  var vals = sh.getDataRange().getValues();
  var disp = sh.getDataRange().getDisplayValues();

  // localiza o cabeçalho nas 15 primeiras linhas
  var hr = -1, cMod = -1, cEsq = -1, cD1 = -1;
  for (var r=0; r<Math.min(15, disp.length) && hr<0; r++){
    var cm=-1, ce=-1, cd=-1;
    for (var c=0; c<disp[r].length; c++){
      var t = esqNorm_(disp[r][c]);
      if (cm<0 && (t==="modulo" || t==="modulos")) cm=c;
      else if (ce<0 && t.indexOf("esquadria")===0) ce=c;
      else if (cd<0 && /^data\s*0?1$/.test(t)) cd=c;
    }
    if (cm>=0 && ce>=0) { hr=r; cMod=cm; cEsq=ce; cD1=cd; }
  }
  if (hr < 0) return saida({ok:false, erro:'Cabeçalho com "Módulo" e "Esquadria" não encontrado nas 15 primeiras linhas.'}, e);
  if (cD1 < 0) { for (var c2=0;c2<disp[hr].length;c2++){ if (esqNorm_(disp[hr][c2]).indexOf("data")===0){ cD1=c2; break; } } }

  // status já apontados
  var st = esqStatusSheet_(ss);
  var sv = st.getDataRange().getValues();
  var status = {};
  for (var i=1;i<sv.length;i++){
    if (!sv[i][0]) continue;
    var o = {obs:String(sv[i][8]||""), atualizado_em:esqData_(sv[i][9]), por:String(sv[i][10]||""),
             oc:String(sv[i][11]||""), entrega_prev:esqData_(sv[i][12]), complemento:esqData_(sv[i][13])};
    ESQ_ETAPAS.forEach(function(et,k){ o[et] = esqData_(sv[i][3+k]); });
    status[String(sv[i][0])] = o;
  }

  var itens = [], avisos = [], cont = {};
  for (var r2=hr+1; r2<vals.length; r2++){
    var mod = String(disp[r2][cMod]||"").trim();
    if (!mod) continue;
    var d1 = cD1>=0 ? (esqData_(vals[r2][cD1]) || esqData_(disp[r2][cD1])) : "";
    var lista = esqItens_(disp[r2][cEsq]);
    if (!lista.length){ avisos.push("Linha "+(r2+1)+" ("+mod+"): sem esquadria."); continue; }
    if (!d1) avisos.push("Linha "+(r2+1)+" ("+mod+"): sem Data 1.");
    else if (new Date(d1) < new Date(Date.now() - 120*86400000)) avisos.push("Linha "+(r2+1)+" ("+mod+"): Data 1 "+d1.split("-").reverse().join("/")+" está no passado — confira o ano.");
    lista.forEach(function(it){
      for (var q=0;q<it.qtd;q++){
        var base = mod.toUpperCase()+"|"+it.codigo.toUpperCase().replace(/\s+/g,"");
        cont[base] = (cont[base]||0)+1;
        var chave = base+"|"+cont[base];
        itens.push({chave:chave, modulo:mod, codigo:it.codigo, un:cont[base], d1:d1, linha:r2+1, status:status[chave]||{}});
      }
    });
  }

  var feriados = [];
  var fs = esqAba_(ss, ESQ_ABA_FER);
  if (fs) fs.getDataRange().getValues().forEach(function(l){ var d=esqData_(l[0]); if (d) feriados.push(d); });

  var cons = esqConsumirSaldo_(ss, itens);

  return saida({ok:true, versao:ESQ_VERSAO, aba:sh.getName(), cabecalho:hr+1, itens:itens.concat(cons.unidades), feriados:feriados, avisos:avisos,
                saldos:cons.saldos, consumidos_auto:cons.consumidos,
                lido_em:Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm")}, e);
}

/* ---------- APONTAR: uma etapa para uma ou várias esquadrias ----------
   params: chaves (JSON array), etapa (uma das ESQ_ETAPAS, "obs" ou "complemento"), data (yyyy-MM-dd; vazio = desfazer),
           itens (JSON {chave:{modulo,codigo}}), usuario, senha, obs (opcional)
   Ao marcar uma etapa, as anteriores vazias recebem a mesma data.
   Ao desfazer uma etapa, as posteriores também são limpas. */
function esqApontar(e){
  var p = e.parameter || {};
  var chaves = []; try { chaves = JSON.parse(p.chaves||"[]"); } catch(err) {}
  var info = {};   try { info = JSON.parse(p.itens||"{}"); } catch(err) {}
  var etapa = String(p.etapa||"");
  var k = ESQ_ETAPAS.indexOf(etapa);
  if (!chaves.length || (k<0 && etapa!=="obs" && etapa!=="complemento")) return saida({ok:false, erro:"parâmetros inválidos"}, e);
  var data = String(p.data||"");
  var dataCel = data ? (function(){ var a=data.split("-"); return new Date(+a[0], +a[1]-1, +a[2]); })() : "";

  var quem = esqUsuario_(p.usuario, p.senha);
  if (!quem || !esqPodeApontar_(quem.perfil)) return saida({ok:false, erro:"Sem permissão para apontar. Entre de novo com um usuário apontador."}, e);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch(err) { return saida({ok:false, erro:"sistema ocupado"}, e); }
  try {
    var ss = SpreadsheetApp.openById(ESQ_SS_ID);
    var st = esqStatusSheet_(ss);
    var sv = st.getDataRange().getValues();
    var linhaDe = {};
    for (var i=1;i<sv.length;i++) if (sv[i][0]) linhaDe[String(sv[i][0])] = i;   // índice em sv
    var novos = [];
    chaves.forEach(function(ch){
      var idx = linhaDe[ch], row;
      if (idx === undefined){
        row = new Array(ESQ_CAB_STATUS.length).fill("");
        row[0] = ch; row[1] = (info[ch]||{}).modulo||ch.split("|")[0]; row[2] = (info[ch]||{}).codigo||ch.split("|")[1];
        sv.push(row); idx = sv.length-1; linhaDe[ch] = idx; novos.push(idx);
      }
      row = sv[idx];
      if (!dataCel && k >= 0 && String(ch).indexOf("SALDO|") === 0 && k <= (esqEhPorta_(String(ch).split("|")[2]) ? 1 : 0)) return;   // unidade de saldo sempre tem pedido/OC
      while (row.length < ESQ_CAB_STATUS.length) row.push("");
      if (etapa === "obs") row[8] = String(p.obs||"");
      else if (etapa === "complemento") row[13] = dataCel || "";           // independente das etapas (sem cascata)
      else if (dataCel){
        row[3+k] = dataCel;
        for (var j=0;j<k;j++) if (!row[3+j]) row[3+j] = dataCel;      // anteriores
      } else {
        for (var j2=k;j2<ESQ_ETAPAS.length;j2++) row[3+j2] = "";       // desfaz esta e as seguintes
        if (k === 0 || (k === 1 && esqEhPorta_(row[2]))) { row[11] = ""; row[12] = ""; }   // sem pedido/OC aprovada: sem OC
      }
      row[9] = new Date(); row[10] = quem.nome;
    });
    // grava tudo de uma vez
    var corpo = sv.slice(1);
    if (corpo.length){
      st.getRange(2,1,corpo.length,ESQ_CAB_STATUS.length).setValues(corpo.map(function(r){
        var x = r.slice(0,ESQ_CAB_STATUS.length); while (x.length<ESQ_CAB_STATUS.length) x.push(""); return x;
      }));
      st.getRange(2,4,corpo.length,5).setNumberFormat("dd/MM/yyyy");
      st.getRange(2,10,corpo.length,1).setNumberFormat("dd/MM/yyyy HH:mm");
      st.getRange(2,13,corpo.length,2).setNumberFormat("dd/MM/yyyy");
    }
    return saida({ok:true, apontadas:chaves.length, novas:novos.length}, e);
  } finally { lock.releaseLock(); }
}

/* ---------- IMPORTAR ORDEM DE COMPRA (só admin) ----------
   O PDF é lido no navegador; aqui chegam só as esquadrias já distribuídas.
   params: usuario, senha, oc, data (yyyy-MM-dd do pedido), entrega (yyyy-MM-dd),
           alocacoes (JSON [{chave, modulo, codigo}]), saldos (JSON [{codigo, descricao, qtd_pedida, saldo}]),
           vinculos (JSON [chave] marcadas à mão a vincular), forcar=1 para reimportar a mesma OC */
function esqOC(e){
  var p = e.parameter || {};
  var quem = esqUsuario_(p.usuario, p.senha);
  if (!quem || ["admin","administrador","master"].indexOf(quem.perfil) < 0)
    return saida({ok:false, erro:"Sem permissão: só admin importa ordem de compra."}, e);
  var oc = String(p.oc||"").trim();
  var aloc = []; try { aloc = JSON.parse(p.alocacoes||"[]"); } catch(err) {}
  var saldos = []; try { saldos = JSON.parse(p.saldos||"[]"); } catch(err) {}
  var vinculos = []; try { vinculos = JSON.parse(p.vinculos||"[]"); } catch(err) {}
  if (!oc || !p.data || (!aloc.length && !saldos.length && !vinculos.length)) return saida({ok:false, erro:"OC sem número, data ou itens."}, e);
  var dt = function(s){ var a=String(s).split("-"); return a.length===3 ? new Date(+a[0],+a[1]-1,+a[2]) : ""; };
  var dPed = dt(p.data), dEnt = p.entrega ? dt(p.entrega) : "";

  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch(err) { return saida({ok:false, erro:"sistema ocupado"}, e); }
  try {
    var ss = SpreadsheetApp.openById(ESQ_SS_ID);
    var st = esqStatusSheet_(ss);
    var sv = st.getDataRange().getValues();
    if (p.forcar !== "1"){
      // procura a OC nos apontamentos E no saldo (OC que virou só saldo também conta)
      var ja = 0;
      for (var i=1;i<sv.length;i++) if (String(sv[i][11]||"") === oc) ja++;
      var shS = esqAba_(ss, ESQ_ABA_SALDO), emSaldo = false;
      if (shS) shS.getDataRange().getValues().forEach(function(l,ix){ if (ix>0 && String(l[0]) === oc) emSaldo = true; });
      if (ja || emSaldo)
        return saida({ok:false, duplicada:true, erro:"A OC "+oc+" já foi importada ("+ja+" esquadria(s) com esta OC"+(emSaldo?", saldo registrado":"")+"). Nada foi gravado."}, e);
    }
    var linhaDe = {}; for (var j=1;j<sv.length;j++) if (sv[j][0]) linhaDe[String(sv[j][0])] = j;
    var gravadas = 0, puladas = 0;
    aloc.forEach(function(a){
      var idx = linhaDe[a.chave], row;
      if (idx === undefined){
        row = new Array(ESQ_CAB_STATUS.length).fill(""); row[0]=a.chave; row[1]=a.modulo||""; row[2]=a.codigo||"";
        sv.push(row); idx = sv.length-1; linhaDe[a.chave] = idx;
      }
      row = sv[idx]; while (row.length < ESQ_CAB_STATUS.length) row.push("");
      var porta = esqEhPorta_(a.codigo || row[2]);
      if (row[esqColPedido_(a.codigo || row[2])]) { puladas++; return; }   // já tinha pedido/OC: não sobrescreve
      if (porta){ if (!row[3]) row[3] = dPed; row[4] = dPed; if (!row[5]) row[5] = dEnt; }   // SC (se vazia), OC aprovada, recebimento previsto
      else row[3] = dPed;
      row[11] = oc; row[12] = dEnt; row[9] = new Date(); row[10] = quem.nome + " (OC)";
      gravadas++;
    });
    // marcadas à mão (sem OC) que o admin escolheu vincular: mantêm a data, recebem OC e entrega
    var vinculadas = 0;
    vinculos.forEach(function(ch){
      var idx = linhaDe[ch]; if (idx === undefined) return;
      var row = sv[idx]; while (row.length < ESQ_CAB_STATUS.length) row.push("");
      if (!row[esqColPedido_(row[2])] || row[11]) return;
      if (esqEhPorta_(row[2]) && !row[5]) row[5] = dEnt;
      row[11] = oc; row[12] = dEnt; row[9] = new Date(); row[10] = quem.nome + " (vínculo OC)"; vinculadas++;
    });
    esqSincronizarUnidades_(sv, oc, saldos, dPed, dEnt, quem.nome);
    esqGravarStatus_(st, sv);
    // saldo desta OC: substitui o que havia (reimportação recalcula)
    var sh2 = esqSaldoSheet_(ss), v2 = sh2.getDataRange().getValues(), manter = [v2[0]];
    for (var r2=1;r2<v2.length;r2++) if (String(v2[r2][0]) !== oc) manter.push(v2[r2]);
    saldos.forEach(function(s){
      var ped = +s.qtd_pedida||0, sal = Math.max(0, +s.saldo||0);
      manter.push([oc, String(s.codigo||"").toUpperCase(), String(s.descricao||""), ped, ped-sal, sal, dPed, dEnt, new Date()]);
    });
    sh2.clearContents();
    sh2.getRange(1,1,manter.length,ESQ_CAB_SALDO.length).setValues(manter.map(function(r){ var x=r.slice(0,ESQ_CAB_SALDO.length); while(x.length<ESQ_CAB_SALDO.length) x.push(""); return x; }));
    var totSaldo = saldos.reduce(function(t,s){ return t + Math.max(0,+s.saldo||0); }, 0);
    return saida({ok:true, oc:oc, gravadas:gravadas, puladas:puladas, vinculadas:vinculadas, saldo:totSaldo}, e);
  } finally { lock.releaseLock(); }
}

/* ---------- helpers de status e saldo ---------- */
function esqGravarStatus_(st, sv){
  var corpo = sv.slice(1).filter(function(r){ return !r._remover; })
                .map(function(r){ var x=r.slice(0,ESQ_CAB_STATUS.length); while(x.length<ESQ_CAB_STATUS.length) x.push(""); return x; });
  var antes = Math.max(0, st.getLastRow()-1);
  if (antes > corpo.length) st.getRange(corpo.length+2, 1, antes-corpo.length, ESQ_CAB_STATUS.length).clearContent();
  if (!corpo.length) return;
  st.getRange(2,1,corpo.length,ESQ_CAB_STATUS.length).setValues(corpo);
  st.getRange(2,4,corpo.length,5).setNumberFormat("dd/MM/yyyy");
  st.getRange(2,10,corpo.length,1).setNumberFormat("dd/MM/yyyy HH:mm");
  st.getRange(2,13,corpo.length,2).setNumberFormat("dd/MM/yyyy");
}
function esqSaldoSheet_(ss){
  var sh = esqAba_(ss, ESQ_ABA_SALDO);
  if (!sh){
    sh = ss.insertSheet(ESQ_ABA_SALDO);
    sh.getRange(1,1,1,ESQ_CAB_SALDO.length).setValues([ESQ_CAB_SALDO]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}
// "PF151-e" -> PF151E ; "JPF-350 200 x 60" -> JPF350
function esqCod_(t){
  var m = String(t||"").toUpperCase().match(/([A-Z]{1,5})\s?-?\s?(\d{2,3})(?:\s?-?\s?([DE]))?(?![A-Z0-9])/);
  return m ? m[1]+m[2]+(m[3]||"") : "";
}
// código da OC sem lado vale para qualquer lado; com lado, só o mesmo lado
function esqCombina_(codOC, codItem){
  if (!codOC || !codItem) return false;
  if (codOC === codItem) return true;
  return !/\d[DE]$/.test(codOC) && codItem.replace(/[DE]$/,"") === codOC;
}
/* ---------- unidades de saldo ---------- */
function esqEhUnidade_(ch){ return String(ch||"").indexOf("SALDO|") === 0; }
function esqProgresso_(row){ var n=0; for (var k=0;k<ESQ_ETAPAS.length;k++) if (row[3+k]) n=k+1; return n; }
// cria/remove unidades de saldo da OC para bater com saldos [{codigo, saldo}] (remove só as que não avançaram além do pedido)
function esqSincronizarUnidades_(sv, oc, saldos, dPed, dEnt, nome){
  var alvo = {}; saldos.forEach(function(s){ alvo[String(s.codigo).toUpperCase()] = Math.max(0, +s.saldo||0); });
  var porCod = {};
  for (var i=1;i<sv.length;i++){ var ch=String(sv[i][0]||""); if (!esqEhUnidade_(ch) || sv[i]._remover) continue;
    var p=ch.split("|"); if (p[1] !== oc) continue; (porCod[p[2]] = porCod[p[2]] || []).push(i); }
  Object.keys(porCod).forEach(function(c){ if (!(c in alvo)) alvo[c] = 0; });
  Object.keys(alvo).forEach(function(c){
    var lst = porCod[c] || [], falta = alvo[c] - lst.length;
    if (falta > 0){
      var maxN = lst.reduce(function(m,ix){ return Math.max(m, +String(sv[ix][0]).split("|")[3]||0); }, 0);
      for (var n=1;n<=falta;n++){
        var row = new Array(ESQ_CAB_STATUS.length).fill("");
        row[0]="SALDO|"+oc+"|"+c+"|"+(maxN+n); row[1]="Saldo OC "+oc; row[2]=c; row[3]=dPed; row[11]=oc; row[12]=dEnt; row[9]=new Date(); row[10]=nome+" (saldo OC)";
        if (esqEhPorta_(c)){ row[4]=dPed; row[5]=dEnt; }
        sv.push(row);
      }
    } else if (falta < 0){
      lst.filter(function(ix){ return esqProgresso_(sv[ix]) <= (esqEhPorta_(c) ? 3 : 1); })
         .sort(function(a,b){ return (+String(sv[b][0]).split("|")[3]) - (+String(sv[a][0]).split("|")[3]); })
         .slice(0, -falta).forEach(function(ix){ sv[ix]._remover = true; });
    }
  });
}
/* Consome unidades de saldo nas esquadrias novas sem pedido (Data 1 mais próxima primeiro).
   A unidade mais adiantada (ex.: já pintada) vai primeiro; empate = OC mais antiga.
   A esquadria herda as datas de todas as etapas, a OC e a entrega da unidade. */
function esqConsumirSaldo_(ss, itens){
  var res = {saldos:[], consumidos:[], unidades:[]};
  var shS = esqAba_(ss, ESQ_ABA_SALDO);
  if (!shS) return res;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return res;
  try {
    var v = shS.getDataRange().getValues();
    var st = esqStatusSheet_(ss), sv = st.getDataRange().getValues(), mudou = false;
    // migração: OCs importadas antes das unidades existirem
    var dataOC = {};
    for (var i=1;i<v.length;i++) if (v[i][0]){
      var oc=String(v[i][0]), c=String(v[i][1]).toUpperCase(); dataOC[oc] = v[i][6];
      var tem = 0; for (var j=1;j<sv.length;j++){ var p=String(sv[j][0]).split("|"); if (p[0]==="SALDO" && p[1]===oc && p[2]===c) tem++; }
      if (tem === 0 && (+v[i][5]||0) > 0){ esqSincronizarUnidades_(sv, oc, [{codigo:c, saldo:+v[i][5]}], v[i][6], v[i][7], "migração"); mudou = true; }
    }
    // consumo
    var linhaDe = {}; for (var a=1;a<sv.length;a++) if (sv[a][0]) linhaDe[String(sv[a][0])] = a;
    var unid = [];
    for (var b=1;b<sv.length;b++) if (esqEhUnidade_(sv[b][0]) && !sv[b]._remover){
      var pp=String(sv[b][0]).split("|"); unid.push({ix:b, oc:pp[1], cod:pp[2], prog:esqProgresso_(sv[b]), data:dataOC[pp[1]]||sv[b][3]||0, usada:false});
    }
    unid.sort(function(x,y){ return y.prog-x.prog || (x.data||0)-(y.data||0) || x.ix-y.ix; });
    itens.filter(function(it){ var st0=it.status||{}; return it.d1 && !(esqEhPorta_(it.codigo) ? st0.recebida : st0.solicitada); })
      .sort(function(x,y){ return x.d1<y.d1?-1:x.d1>y.d1?1:(x.modulo<y.modulo?-1:x.modulo>y.modulo?1:x.un-y.un); })
      .forEach(function(it){
        var c = esqCod_(it.codigo);
        var u = unid.filter(function(z){ return !z.usada && esqCombina_(z.cod, c); })[0];
        if (!u) return;
        var src = sv[u.ix], idx = linhaDe[it.chave], row;
        if (idx === undefined){ row = new Array(ESQ_CAB_STATUS.length).fill(""); row[0]=it.chave; row[1]=it.modulo; row[2]=it.codigo; sv.push(row); idx=sv.length-1; linhaDe[it.chave]=idx; }
        row = sv[idx]; while (row.length < ESQ_CAB_STATUS.length) row.push("");
        if (row[esqColPedido_(it.codigo)]) return;
        for (var k=0;k<ESQ_ETAPAS.length;k++) if (src[3+k] || !row[3+k]) row[3+k] = src[3+k];   // mantém SC manual da porta
        row[8] = src[8]; row[11] = src[11]; row[12] = src[12]; if (src[13]) row[13] = src[13]; row[9] = new Date(); row[10] = "Saldo da OC " + u.oc;
        src._remover = true; u.usada = true; mudou = true;
        it.status = it.status || {};
        ESQ_ETAPAS.forEach(function(et,k2){ it.status[et] = esqData_(src[3+k2]); });
        it.status.oc = u.oc; it.status.entrega_prev = esqData_(src[12]); if (src[13]) it.status.complemento = esqData_(src[13]);
        res.consumidos.push({chave:it.chave, modulo:it.modulo, codigo:it.codigo, oc:u.oc});
      });
    if (mudou) esqGravarStatus_(st, sv);
    // resumo Saldo_OC = unidades restantes
    var resta = {};
    for (var d=1;d<sv.length;d++) if (esqEhUnidade_(sv[d][0]) && !sv[d]._remover){ var q=String(sv[d][0]).split("|"); var key=q[1]+"|"+q[2]; resta[key]=(resta[key]||0)+1;
      var o = {obs:String(sv[d][8]||""), oc:q[1], entrega_prev:esqData_(sv[d][12]), complemento:esqData_(sv[d][13])}; ESQ_ETAPAS.forEach(function(et,k3){ o[et]=esqData_(sv[d][3+k3]); });
      res.unidades.push({chave:String(sv[d][0]), modulo:"Saldo OC "+q[1], codigo:q[2], un:+q[3]||1, d1:"", linha:0, saldo:true, oc:q[1], status:o}); }
    for (var f=1;f<v.length;f++) if (v[f][0]){
      var key2 = String(v[f][0])+"|"+String(v[f][1]).toUpperCase(), s = resta[key2]||0, ped = +v[f][3]||0;
      if ((+v[f][5]||0) !== s){ v[f][5] = s; v[f][4] = ped - s; v[f][8] = new Date(); shS.getRange(f+1,1,1,ESQ_CAB_SALDO.length).setValues([v[f].slice(0,ESQ_CAB_SALDO.length)]); }
      res.saldos.push({oc:String(v[f][0]), codigo:String(v[f][1]), descricao:String(v[f][2]||""), pedida:ped, consumido:ped-s, saldo:s, data:esqData_(v[f][6]), entrega:esqData_(v[f][7])});
    }
  } finally { lock.releaseLock(); }
  return res;
}
