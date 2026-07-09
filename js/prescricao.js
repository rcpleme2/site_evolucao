/**
 * Lógica do formulário progressivo de prescrição.
 * Cada campo depende do valor escolhido no(s) campo(s) anterior(es).
 */
(function () {
  const db = window.PrescricaoDB;
  db.seedIfEmpty();

  const selMedicamento = document.getElementById('medicamento');
  const selDose = document.getElementById('dose');
  const selVia = document.getElementById('via');
  const selLocal = document.getElementById('local');
  const selRegiao = document.getElementById('regiao');
  const selLaboratorio = document.getElementById('laboratorio');
  const selProfissional = document.getElementById('profissional');
  const btnAdicionar = document.getElementById('btnAdicionar');
  const btnLimparCampos = document.getElementById('btnLimparCampos');
  const btnLimparTudo = document.getElementById('btnLimparTudo');
  const listaItens = document.getElementById('listaItens');
  const textoFinal = document.getElementById('textoFinal');
  const btnCopiar = document.getElementById('btnCopiar');
  const copiaStatus = document.getElementById('copiaStatus');

  let itensPrescricao = [];

  function popularSelect(select, opcoes, labelPadrao, valorFn, textoFn) {
    select.innerHTML = '';
    const optPadrao = document.createElement('option');
    optPadrao.value = '';
    optPadrao.textContent = labelPadrao;
    select.appendChild(optPadrao);
    opcoes.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = valorFn(item);
      opt.textContent = textoFn(item);
      select.appendChild(opt);
    });
  }

  function resetarSelect(select, texto) {
    select.innerHTML = `<option value="">${texto}</option>`;
    select.disabled = true;
  }

  function carregarMedicamentos() {
    const medicamentos = db.getAll('medicamentos');
    popularSelect(
      selMedicamento,
      medicamentos,
      'Selecione o medicamento…',
      (m) => m.id,
      (m) => m.nome
    );
  }

  function aoMudarMedicamento() {
    const medicamentoId = selMedicamento.value;
    resetarSelect(selLocal, 'Selecione a via primeiro…');
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
    resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
    atualizarBotaoAdicionar();

    if (!medicamentoId) {
      resetarSelect(selDose, 'Selecione o medicamento primeiro…');
      resetarSelect(selVia, 'Selecione a dose primeiro…');
      return;
    }

    const doses = db.getFiltrado('doses', { medicamentoId });
    popularSelect(selDose, doses, 'Selecione a dose…', (d) => d.id, (d) => d.valor);
    selDose.disabled = doses.length === 0;
    if (doses.length === 0) selDose.innerHTML = '<option value="">Nenhuma dose cadastrada para este medicamento</option>';

    resetarSelect(selVia, 'Selecione a dose primeiro…');
  }

  function aoMudarDose() {
    const medicamentoId = selMedicamento.value;
    resetarSelect(selLocal, 'Selecione a via primeiro…');
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
    resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
    atualizarBotaoAdicionar();

    if (!selDose.value || !medicamentoId) {
      resetarSelect(selVia, 'Selecione a dose primeiro…');
      return;
    }

    const vias = db.getFiltrado('vias', { medicamentoId });
    popularSelect(selVia, vias, 'Selecione a via de administração…', (v) => v.id, (v) => v.nome);
    selVia.disabled = vias.length === 0;
    if (vias.length === 0) selVia.innerHTML = '<option value="">Nenhuma via cadastrada para este medicamento</option>';
  }

  function aoMudarVia() {
    const medicamentoId = selMedicamento.value;
    const viaId = selVia.value;
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
    resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
    atualizarBotaoAdicionar();

    if (!viaId || !medicamentoId) {
      resetarSelect(selLocal, 'Selecione a via primeiro…');
      return;
    }

    const locais = db.getFiltrado('locais', { medicamentoId, viaId });
    popularSelect(selLocal, locais, 'Selecione o local de aplicação…', (l) => l.id, (l) => l.nome);
    selLocal.disabled = locais.length === 0;
    if (locais.length === 0) selLocal.innerHTML = '<option value="">Nenhum local cadastrado para esta via</option>';
  }

  function aoMudarLocal() {
    const localId = selLocal.value;
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
    resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
    atualizarBotaoAdicionar();

    if (!localId) {
      resetarSelect(selRegiao, 'Selecione o local primeiro…');
      return;
    }

    const regioes = db.getFiltrado('regioes', { localId });
    popularSelect(selRegiao, regioes, 'Selecione a região/lado…', (r) => r.id, (r) => r.nome);
    selRegiao.disabled = regioes.length === 0;
    if (regioes.length === 0) selRegiao.innerHTML = '<option value="">Nenhuma região cadastrada para este local</option>';
  }

  function aoMudarRegiao() {
    atualizarBotaoAdicionar();

    if (!selRegiao.value) {
      resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
      return;
    }

    const laboratorios = db.getAll('laboratorios');
    popularSelect(selLaboratorio, laboratorios, 'Selecione o laboratório…', (l) => l.id, (l) => l.nome);
    selLaboratorio.disabled = laboratorios.length === 0;
    if (laboratorios.length === 0) selLaboratorio.innerHTML = '<option value="">Nenhum laboratório cadastrado</option>';
  }

  function aoMudarLaboratorio() {
    atualizarBotaoAdicionar();

    if (!selLaboratorio.value) {
      resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
      return;
    }

    const profissionais = db.getAll('profissionais');
    popularSelect(selProfissional, profissionais, 'Selecione o profissional…', (p) => p.id, (p) => p.nome);
    selProfissional.disabled = profissionais.length === 0;
    if (profissionais.length === 0) selProfissional.innerHTML = '<option value="">Nenhum profissional cadastrado</option>';
  }

  function atualizarBotaoAdicionar() {
    const completo =
      selMedicamento.value &&
      selDose.value &&
      selVia.value &&
      selLocal.value &&
      selRegiao.value &&
      selLaboratorio.value &&
      selProfissional.value;
    btnAdicionar.disabled = !completo;
  }

  function limparCampos() {
    selMedicamento.value = '';
    aoMudarMedicamento();
  }

  function adicionarItem() {
    const medicamento = db.getById('medicamentos', selMedicamento.value);
    const dose = db.getById('doses', selDose.value);
    const via = db.getById('vias', selVia.value);
    const local = db.getById('locais', selLocal.value);
    const regiao = db.getById('regioes', selRegiao.value);
    const laboratorio = db.getById('laboratorios', selLaboratorio.value);
    const profissional = db.getById('profissionais', selProfissional.value);

    if (!medicamento || !dose || !via || !local || !regiao || !laboratorio || !profissional) return;

    itensPrescricao.push({ medicamento, dose, via, local, regiao, laboratorio, profissional });
    renderizarItens();
    renderizarTextoFinal();
    limparCampos();
  }

  function removerItem(indice) {
    itensPrescricao.splice(indice, 1);
    renderizarItens();
    renderizarTextoFinal();
  }

  function frasePrescricao(item) {
    const regiaoTexto = item.regiao.nome === 'Não aplicável' ? '' : ` ${item.regiao.nome}`;
    return `Realizada aplicação via ${item.via.nome} de ${item.medicamento.nome} ${item.dose.valor} em ${item.local.nome}${regiaoTexto} - Laboratório ${item.laboratorio.nome}`;
  }

  function renderizarItens() {
    listaItens.innerHTML = '';
    if (itensPrescricao.length === 0) {
      listaItens.innerHTML = '<li style="justify-content:center; color:#6b7a89;">Nenhum item adicionado ainda.</li>';
      return;
    }
    itensPrescricao.forEach((item, indice) => {
      const li = document.createElement('li');
      const texto = document.createElement('span');
      texto.textContent = frasePrescricao(item);
      const btnRemover = document.createElement('button');
      btnRemover.type = 'button';
      btnRemover.className = 'perigo';
      btnRemover.textContent = 'Remover';
      btnRemover.addEventListener('click', () => removerItem(indice));
      li.appendChild(texto);
      li.appendChild(btnRemover);
      listaItens.appendChild(li);
    });
  }

  function formatarData(data) {
    return data.toLocaleDateString('pt-BR');
  }

  function renderizarTextoFinal() {
    if (itensPrescricao.length === 0) {
      textoFinal.value = '';
      return;
    }

    const profissional = itensPrescricao[itensPrescricao.length - 1].profissional;
    const linhas = [];
    linhas.push(`PRESCRIÇÃO DE ENFERMAGEM — ${formatarData(new Date())}`);
    linhas.push('');
    itensPrescricao.forEach((item, indice) => {
      linhas.push(`${indice + 1}. ${frasePrescricao(item)}`);
    });
    linhas.push('');
    linhas.push(`${profissional.nome} - ${profissional.registro}`);

    textoFinal.value = linhas.join('\n');
  }

  async function copiarTexto() {
    if (!textoFinal.value) {
      copiaStatus.textContent = 'Nada para copiar ainda.';
      return;
    }
    try {
      await navigator.clipboard.writeText(textoFinal.value);
      copiaStatus.textContent = 'Copiado!';
    } catch (e) {
      textoFinal.select();
      document.execCommand('copy');
      copiaStatus.textContent = 'Copiado!';
    }
    setTimeout(() => (copiaStatus.textContent = ''), 2500);
  }

  selMedicamento.addEventListener('change', aoMudarMedicamento);
  selDose.addEventListener('change', aoMudarDose);
  selVia.addEventListener('change', aoMudarVia);
  selLocal.addEventListener('change', aoMudarLocal);
  selRegiao.addEventListener('change', aoMudarRegiao);
  selLaboratorio.addEventListener('change', aoMudarLaboratorio);
  selProfissional.addEventListener('change', atualizarBotaoAdicionar);

  btnAdicionar.addEventListener('click', adicionarItem);
  btnLimparCampos.addEventListener('click', limparCampos);
  btnLimparTudo.addEventListener('click', () => {
    itensPrescricao = [];
    renderizarItens();
    renderizarTextoFinal();
  });
  btnCopiar.addEventListener('click', copiarTexto);

  carregarMedicamentos();
  resetarSelect(selDose, 'Selecione o medicamento primeiro…');
  resetarSelect(selVia, 'Selecione a dose primeiro…');
  resetarSelect(selLocal, 'Selecione a via primeiro…');
  resetarSelect(selRegiao, 'Selecione o local primeiro…');
  resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
  resetarSelect(selProfissional, 'Selecione o laboratório primeiro…');
  renderizarItens();
  renderizarTextoFinal();
})();
