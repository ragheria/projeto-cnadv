const MEMBERS = {
  'Renata da Silva Penna': '6642354d61968e43b9480c53',
  'Miguel Gid Rolim de Moura Moreira': '68af16fc62cf60db6ffcc762',
  'Lucas Marcos Cardoso de Oliveira': '687e20529f04cede3dbd46bd',
  'Pedro Nascimento': '65d4d5a8d2e91b3b116105ea',
  'Paula Chrispim': '650cbb3bd26b9433fc7ea9fb',
  'Controladoria Jurídica':'69f8aea17c588ac2b1f59b25'
};
const LABELS = {
  'SOLIC - CJ': '664209da1dc51400ebd577e4',
  'EMITIR GUIA': '664209da1dc51400ebd577e5',
  'REUNIÃO': '664209da1dc51400ebd577e8',
  'CONCLUÍDO': '66420ac875170ace07bac993',
  'PRZ - PRAZO': '66420ac975170ace07bacadd',
  'DEFESA': '66420aca75170ace07bacf8c',
  'FAZER': '66420aca75170ace07bacfe5',
  'CANCELADO': '66420aca75170ace07bad017',
  'NOTIFICAÇÃO': '66420acb75170ace07bad28a',
  'PROV - PROVIDÊNCIAS': '66420af7e678eb6714cd920a',
  'PAT - PAUTA JULGAMENTO': '66420b06b6fe85b80bb5da80',
  'AÇÃO JUDICIAL': '66420b143b71fcec9bbd125e',
  'URGENTE': '66420b153b71fcec9bbd180c',
  'BLOQUEIO': '66420c025a3d6d29b804fc13',
  'GUILHERME': '66420c035a3d6d29b804fde2',
  'ACOMPANHAMENTO': '66423be843c3ca948514246e',
  'SEMANAL': '66423c0033a5b93d51c18486',
  'AUDIÊNCIA': '66475e9034cb06b7480d4655',
  'UNA': '66475ea8efed752eeda9f0a4',
  'VIRTUAL': '66475ebec4d8fc8c798a1295',
  'NEGOCIAÇÃO': '664bbbf100dfb1b8a4b74ef7',
  'SUSPENSO - AG. DOCS': '66571cccd9999f11ef6d9c17',
  'RETIRADO DE PAUTA': '665f19f3fa67ff3e0f07b0e0',
  'IMPORTANTE': '66636a850b7f05a943da214b',
  'EXCLUSIVO FS': '66684da0ebc97fd9754992ef',
  'SEM ASSINATURA': '668d7080d41f7e495c91588f',
  'SEM DOCUMENTOS': '668d70b3547f13e50c3e2fc0',
  'RELATÓRIO ESPECÍFICO': '66acb90bb36724c724a19e13',
  'PLANO EMPRESARIAL': '683d9c39267eb39cf023ff15',
  'CONTRATO': '688222c510c56bf34c41bc6f',
  'CONSULTA': '68822313cdcec529d0d86196',
  'SERVIÇO CONSULTIVO': '6882235d71b29969209f4283',
  'PERÍCIA': '68adefd44f1128d56c852ad6',
  'PRESENCIAL': '68b1cfddb69905f441bfc6b1',
  'LEILÃO': '68b85af7121994f4f3bbbd6c',
  'SUSPENSÃO RECESSO': '694430c2e17e1d90c59c7432',
  'EXEC. MIGUEL': '6978327eb0d0a0a4a1cd3d8e',
  'EXEC. RENATA': '6978328b96ac01ac3dc1971b',
  'DIL - DILIGÊNCIAS': '69b98edff12b9016381bbc9c',
};
return $input.all().map(item => {
  const a = item.json;
  const titulo = a.assunto || 'Sem assunto';

  const linhas = [];
  if (a.dataPrazoFatal)       linhas.push('**⏰ Prazo Fatal: ' + a.dataPrazoFatal + '**');
  if (a.relativoa === 'Processo') {
    if (a['processo.pasta'])        linhas.push('[📁 Processo: ' + a['processo.pasta'] + '](https://dj36.datajuri.com.br/app/#/lista/Processo/' + a.processoId + '?tab=detalhes&area=principal)');
    if (a['processo.cliente.nome']) linhas.push('👤 Cliente: ' + a['processo.cliente.nome']);
    if (a['processo.adverso.nome']) linhas.push('⚔️ Adverso: ' + a['processo.adverso.nome']);
    if (a['processo.tipoAcao'])     linhas.push('📋 Ação: ' + a['processo.tipoAcao']);
  } else if (a.relativoa === 'OrdemServico') {
    if (a['ordemServico.numero'])   linhas.push('[📋 OS: ' + a['ordemServico.numero'] + '](https://dj36.datajuri.com.br/app/#/lista/OrdemServico/' + a.ordemServicoId + '?tab=detalhes&area=principal)');
    if (a['pessoa.nome'])           linhas.push('👤 Cliente: ' + a['pessoa.nome']);
  } else {
    if (a['processo.pasta'])        linhas.push('[📁 Processo: ' + a['processo.pasta'] + '](https://dj36.datajuri.com.br/app/#/lista/Processo/' + a.processoId + '?tab=detalhes&area=principal)');
    if (a['processo.adverso.nome']) linhas.push('⚔️ Adverso: ' + a['processo.adverso.nome']);
    if (a['pessoa.nome'])           linhas.push('👤 Pessoa: ' + a['pessoa.nome']);
  }
  if (a['proprietario.nome']) linhas.push('👩‍💼 Responsável: ' + a['proprietario.nome']);
  if (a.r)                    linhas.push('👥 Revisor: ' + a.r);
  if (a.tipoAtividade)        linhas.push('🏷️ Tipo: ' + a.tipoAtividade);
  if (a.observacao) {
    linhas.push('');
    linhas.push('📝 Observação:');
    linhas.push(a.observacao.substring(0, 800));
  }
  if (a.relativoa === 'OrdemServico' && a.listaAndamentoOrdemServicoStr) {
    linhas.push('');
    linhas.push('📋 Histórico OS:');
    linhas.push(a.listaAndamentoOrdemServicoStr.substring(0, 600));
  }
  linhas.push('');
  linhas.push('---');
  linhas.push('[Source: DataJuri | Module: Atividade | ID: ' + a.id + '](https://dj36.datajuri.com.br/app/#/lista/Compromisso/' + a.id + '?tab=detalhes&area=principal)');

  const desc = linhas.join('\n');

  function parseBR(str) {
    const p = (str || '').split('/');
    if (p.length !== 3) return null;
    return new Date(Date.UTC(+p[2], +p[1] - 1, +p[0], 18, 0, 0));
  }
  function addBizDays(date, n) {
    const d = new Date(date);
    const dir = n >= 0 ? 1 : -1;
    let rem = Math.abs(n);
    while (rem > 0) {
      d.setUTCDate(d.getUTCDate() + dir);
      const dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) rem--;
    }
    return d;
  }

  const isPrazo = a.tipoAtividade === 'Compromisso (Prazo)';
  let due = null;
  let start = null;

  if (a.dataPrazoFatal) {
    const fatalDate = parseBR(a.dataPrazoFatal);
    if (fatalDate) {
      due = isPrazo
        ? addBizDays(fatalDate, -2).toISOString()
        : fatalDate.toISOString();
    }
  }
  if (isPrazo && a.observacao) {
    const m = a.observacao.match(/Data de disponibilização:\s*(\d{2}\/\d{2}\/\d{4})/);
    if (m) {
      const dispDate = parseBR(m[1]);
      if (dispDate) start = addBizDays(dispDate, 2).toISOString();
    }
  }

  const idLabels = (a.etiquetas || '')
    .split(',')
    .map(e => e.trim().toUpperCase())
    .filter(e => e)
    .map(e => LABELS[e])
    .filter(id => id)
    .join(',');
  const memberIds = [a['proprietario.nome'], a.r]
    .filter(n => n)
    .map(n => MEMBERS[n])
    .filter(id => id);
  const idMembers = [...new Set(memberIds)].join(',');
  return { json: { name: titulo, desc, due, start, idLabels, idMembers } };
});