/**
 * Lógica do formulário progressivo de evolução de enfermagem.
 * Cada campo depende do valor escolhido no(s) campo(s) anterior(es).
 * Quando um campo tem apenas uma opção disponível, ela é selecionada
 * automaticamente e o campo seguinte já é aberto, sem exigir clique.
 *
 * O profissional responsável e a marcação de intercorrências valem
 * para toda a evolução (não por item), por isso ficam fora da cascata
 * de campos do item e são lidos direto na hora de montar o texto final.
 */
(function () {
  const db = window.EvolucaoDB;

  const avisoCarregamento = document.getElementById('avisoCarregamento');
  const avisoInstrucao = document.getElementById('avisoInstrucao');

  const selMedicamento = document.getElementById('medicamento');
  const selDose = document.getElementById('dose');
  const selVia = document.getElementById('via');
  const selLocal = document.getElementById('local');
  const selRegiao = document.getElementById('regiao');
  const selLaboratorio = document.getElementById('laboratorio');
  const btnAdicionar = document.getElementById('btnAdicionar');
  const btnLimparCampos = document.getElementById('btnLimparCampos');
  const btnLimparTudo = document.getElementById('btnLimparTudo');
  const listaItens = document.getElementById('listaItens');
  const textoFinal = document.getElementById('textoFinal');
  const btnCopiar = document.getElementById('btnCopiar');
  const copiaStatus = document.getElementById('copiaStatus');

  const selProfissional = document.getElementById('profissional');
  const btnIntercorrenciaNao = document.getElementById('btnIntercorrenciaNao');
  const btnIntercorrenciaSim = document.getElementById('btnIntercorrenciaSim');
  const campoIntercorrencia = document.getElementById('campoIntercorrencia');

  let itensEvolucao = [];
  let houveIntercorrencia = false;

  /**
   * Popula um select. Se houver exatamente uma opção, ela é selecionada
   * automaticamente e `aoAvancar` é chamado para abrir o campo seguinte,
   * simulando a escolha do usuário.
   */
  function popularEAvancar(select, opcoes, labelPadrao, mensagemVazio, valorFn, textoFn, aoAvancar) {
    if (opcoes.length === 0) {
      select.innerHTML = `<option value="">${mensagemVazio}</option>`;
      select.disabled = true;
      return;
    }

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
    select.disabled = false;

    if (opcoes.length === 1) {
      select.value = valorFn(opcoes[0]);
      if (aoAvancar) aoAvancar();
    }
  }

  function resetarSelect(select, texto) {
    select.innerHTML = `<option value="">${texto}</option>`;
    select.disabled = true;
  }

  function carregarMedicamentos() {
    const medicamentos = db.ordenarPor(db.getAll('medicamentos'), 'nome');
    popularEAvancar(
      selMedicamento,
      medicamentos,
      'Selecione o medicamento…',
      'Nenhum medicamento cadastrado',
      (m) => m.id,
      (m) => m.nome,
      aoMudarMedicamento
    );
  }

  function carregarProfissionais() {
    const profissionais = db.ordenarPor(db.getAll('profissionais'), 'nome');
    popularEAvancar(
      selProfissional,
      profissionais,
      'Selecione o profissional…',
      'Nenhum profissional cadastrado',
      (p) => p.id,
      (p) => p.nome,
      renderizarTextoFinal
    );
  }

  function aoMudarMedicamento() {
    const medicamentoId = selMedicamento.value;
    resetarSelect(selVia, 'Selecione a dose primeiro…');
    resetarSelect(selLocal, 'Selecione a via primeiro…');
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');

    if (!medicamentoId) {
      resetarSelect(selDose, 'Selecione o medicamento primeiro…');
      atualizarBotaoAdicionar();
      return;
    }

    const doses = db.ordenarPor(db.getFiltrado('doses', { medicamentoId }), 'valor');
    popularEAvancar(
      selDose,
      doses,
      'Selecione a dose…',
      'Nenhuma dose cadastrada para este medicamento',
      (d) => d.id,
      (d) => d.valor,
      aoMudarDose
    );
    atualizarBotaoAdicionar();
  }

  function aoMudarDose() {
    const medicamentoId = selMedicamento.value;
    resetarSelect(selLocal, 'Selecione a via primeiro…');
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');

    if (!selDose.value || !medicamentoId) {
      resetarSelect(selVia, 'Selecione a dose primeiro…');
      atualizarBotaoAdicionar();
      return;
    }

    const vias = db.ordenarPor(
      db
        .getFiltrado('medicamentoVias', { medicamentoId })
        .map((vinculo) => db.getById('vias', vinculo.viaId))
        .filter(Boolean),
      'nome'
    );
    popularEAvancar(
      selVia,
      vias,
      'Selecione a via de administração…',
      'Nenhuma via cadastrada para este medicamento',
      (v) => v.id,
      (v) => v.nome,
      aoMudarVia
    );
    atualizarBotaoAdicionar();
  }

  function aoMudarVia() {
    const viaId = selVia.value;
    resetarSelect(selRegiao, 'Selecione o local primeiro…');
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');

    if (!viaId) {
      resetarSelect(selLocal, 'Selecione a via primeiro…');
      atualizarBotaoAdicionar();
      return;
    }

    const locais = db.ordenarPor(db.getFiltrado('locais', { viaId }), 'nome');
    popularEAvancar(
      selLocal,
      locais,
      'Selecione o local de aplicação…',
      'Nenhum local cadastrado para esta via',
      (l) => l.id,
      (l) => l.nome,
      aoMudarLocal
    );
    atualizarBotaoAdicionar();
  }

  function aoMudarLocal() {
    const localId = selLocal.value;
    resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');

    if (!localId) {
      resetarSelect(selRegiao, 'Selecione o local primeiro…');
      atualizarBotaoAdicionar();
      return;
    }

    const regioes = db.ordenarPor(db.getFiltrado('regioes', { localId }), 'nome');
    popularEAvancar(
      selRegiao,
      regioes,
      'Selecione a região/lado…',
      'Nenhuma região cadastrada para este local',
      (r) => r.id,
      (r) => r.nome,
      aoMudarRegiao
    );
    atualizarBotaoAdicionar();
  }

  function aoMudarRegiao() {
    if (!selRegiao.value) {
      resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
      atualizarBotaoAdicionar();
      return;
    }

    const laboratorios = db.ordenarPor(db.getAll('laboratorios'), 'nome');
    popularEAvancar(
      selLaboratorio,
      laboratorios,
      'Selecione o laboratório…',
      'Nenhum laboratório cadastrado',
      (l) => l.id,
      (l) => l.nome,
      atualizarBotaoAdicionar
    );
    atualizarBotaoAdicionar();
  }

  function atualizarBotaoAdicionar() {
    const completo =
      selMedicamento.value &&
      selDose.value &&
      selVia.value &&
      selLocal.value &&
      selRegiao.value &&
      selLaboratorio.value;
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

    if (!medicamento || !dose || !via || !local || !regiao || !laboratorio) return;

    itensEvolucao.push({ medicamento, dose, via, local, regiao, laboratorio });
    renderizarItens();
    renderizarTextoFinal();
    limparCampos();
  }

  function removerItem(indice) {
    itensEvolucao.splice(indice, 1);
    renderizarItens();
    renderizarTextoFinal();
  }

  function fraseEvolucao(item) {
    const regiaoTexto = item.regiao.nome === 'Não aplicável' ? '' : ` ${item.regiao.nome}`;
    return `Realizada aplicação via ${item.via.nome} de ${item.medicamento.nome} ${item.dose.valor} em ${item.local.nome}${regiaoTexto} - Laboratório ${item.laboratorio.nome}`;
  }

  function renderizarItens() {
    listaItens.innerHTML = '';
    if (itensEvolucao.length === 0) {
      listaItens.innerHTML = '<li style="justify-content:center; color:#6b7a89;">Nenhum item adicionado ainda.</li>';
      return;
    }
    itensEvolucao.forEach((item, indice) => {
      const li = document.createElement('li');
      const texto = document.createElement('span');
      texto.textContent = fraseEvolucao(item);
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

  function definirIntercorrencia(houve) {
    houveIntercorrencia = houve;
    btnIntercorrenciaNao.classList.toggle('ativo', !houve);
    btnIntercorrenciaSim.classList.toggle('ativo', houve);
    campoIntercorrencia.style.display = houve ? '' : 'none';
    renderizarTextoFinal();
  }

  function linhaIntercorrencia() {
    if (!houveIntercorrencia) return 'Sem intercorrências';
    return `Intercorrências: ${campoIntercorrencia.value.trim()}`;
  }

  function renderizarTextoFinal() {
    if (itensEvolucao.length === 0) {
      textoFinal.value = '';
      return;
    }

    const profissional = db.getById('profissionais', selProfissional.value);
    const linhas = [];
    linhas.push(`EVOLUÇÃO DE ENFERMAGEM — ${formatarData(new Date())}`);
    linhas.push('');
    itensEvolucao.forEach((item, indice) => {
      linhas.push(`${indice + 1}. ${fraseEvolucao(item)}`);
    });
    linhas.push('');
    linhas.push(linhaIntercorrencia());
    linhas.push('');
    if (profissional) {
      linhas.push(`${profissional.nome} - ${profissional.registro}`);
    }

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
  selLaboratorio.addEventListener('change', atualizarBotaoAdicionar);
  selProfissional.addEventListener('change', renderizarTextoFinal);

  btnAdicionar.addEventListener('click', adicionarItem);
  btnLimparCampos.addEventListener('click', limparCampos);
  btnLimparTudo.addEventListener('click', () => {
    itensEvolucao = [];
    renderizarItens();
    renderizarTextoFinal();
  });
  btnCopiar.addEventListener('click', copiarTexto);

  btnIntercorrenciaNao.addEventListener('click', () => definirIntercorrencia(false));
  btnIntercorrenciaSim.addEventListener('click', () => definirIntercorrencia(true));
  campoIntercorrencia.addEventListener('input', renderizarTextoFinal);

  resetarSelect(selDose, 'Selecione o medicamento primeiro…');
  resetarSelect(selVia, 'Selecione a dose primeiro…');
  resetarSelect(selLocal, 'Selecione a via primeiro…');
  resetarSelect(selRegiao, 'Selecione o local primeiro…');
  resetarSelect(selLaboratorio, 'Selecione a região/lado primeiro…');
  renderizarItens();
  renderizarTextoFinal();

  async function iniciar() {
    await db.carregarDb();
    if (db.obterFonteDados() === 'embutido') {
      avisoCarregamento.textContent =
        'Não foi possível carregar os dados publicados; usando valores padrão locais. Recarregue a página para tentar de novo.';
      avisoCarregamento.className = 'aviso erro';
    } else {
      avisoCarregamento.style.display = 'none';
      avisoInstrucao.style.display = '';
    }
    carregarMedicamentos();
    carregarProfissionais();
  }

  iniciar();
})();
