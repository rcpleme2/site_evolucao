/**
 * Tela de administração: CRUD de medicamentos, doses, vias, locais,
 * regiões, laboratórios e profissionais, e vínculo de cada entidade
 * dependente à sua entidade "pai" (medicamento > via > local > região).
 */
(function () {
  const db = window.PrescricaoDB;
  db.seedIfEmpty();

  const tabelaMedicamentos = document.getElementById('tabelaMedicamentos');
  const tabelaDoses = document.getElementById('tabelaDoses');
  const tabelaVias = document.getElementById('tabelaVias');
  const tabelaLocais = document.getElementById('tabelaLocais');
  const tabelaRegioes = document.getElementById('tabelaRegioes');
  const tabelaLaboratorios = document.getElementById('tabelaLaboratorios');
  const tabelaProfissionais = document.getElementById('tabelaProfissionais');

  const doseMedicamento = document.getElementById('doseMedicamento');
  const viaMedicamento = document.getElementById('viaMedicamento');
  const localMedicamento = document.getElementById('localMedicamento');
  const localVia = document.getElementById('localVia');
  const regiaoLocal = document.getElementById('regiaoLocal');

  function nomeMedicamento(medicamentoId) {
    const m = db.getById('medicamentos', medicamentoId);
    return m ? m.nome : '(medicamento removido)';
  }

  function nomeVia(viaId) {
    const v = db.getById('vias', viaId);
    return v ? v.nome : '(via removida)';
  }

  function nomeLocal(localId) {
    const l = db.getById('locais', localId);
    return l ? l.nome : '(local removido)';
  }

  function popularSelectMedicamentos(select) {
    const medicamentos = db.getAll('medicamentos');
    const atual = select.value;
    select.innerHTML = '';
    medicamentos.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nome;
      select.appendChild(opt);
    });
    if (atual) select.value = atual;
  }

  function popularSelectVias(select, medicamentoId) {
    const atual = select.value;
    const vias = medicamentoId ? db.getFiltrado('vias', { medicamentoId }) : [];
    select.innerHTML = '';
    vias.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.nome;
      select.appendChild(opt);
    });
    if (atual) select.value = atual;
  }

  function popularSelectLocaisParaRegiao(select) {
    const atual = select.value;
    select.innerHTML = '';
    db.getAll('locais').forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = `${nomeMedicamento(l.medicamentoId)} — ${nomeVia(l.viaId)} — ${l.nome}`;
      select.appendChild(opt);
    });
    if (atual) select.value = atual;
  }

  function criarBotaoExcluir(entidade, id, aoExcluir) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'perigo';
    btn.textContent = 'Excluir';
    btn.addEventListener('click', () => {
      if (!confirm('Confirma a exclusão deste registro?')) return;
      db.remove(entidade, id);
      aoExcluir();
    });
    return btn;
  }

  function renderizarMedicamentos() {
    tabelaMedicamentos.innerHTML = '';
    db.getAll('medicamentos').forEach((m) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = m.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoExcluir('medicamentos', m.id, () => {
          renderizarTudo();
        })
      );
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaMedicamentos.appendChild(tr);
    });
    popularSelectMedicamentos(doseMedicamento);
    popularSelectMedicamentos(viaMedicamento);
    popularSelectMedicamentos(localMedicamento);
  }

  function renderizarDoses() {
    tabelaDoses.innerHTML = '';
    db.getAll('doses').forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdValor = document.createElement('td');
      tdValor.textContent = item.valor;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(criarBotaoExcluir('doses', item.id, renderizarDoses));
      tr.appendChild(tdMed);
      tr.appendChild(tdValor);
      tr.appendChild(tdAcoes);
      tabelaDoses.appendChild(tr);
    });
  }

  function renderizarVias() {
    tabelaVias.innerHTML = '';
    db.getAll('vias').forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoExcluir('vias', item.id, () => {
          renderizarVias();
          popularSelectVias(localVia, localMedicamento.value);
          renderizarLocais();
        })
      );
      tr.appendChild(tdMed);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaVias.appendChild(tr);
    });
    popularSelectVias(localVia, localMedicamento.value);
  }

  function renderizarLocais() {
    tabelaLocais.innerHTML = '';
    db.getAll('locais').forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdVia = document.createElement('td');
      tdVia.textContent = nomeVia(item.viaId);
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoExcluir('locais', item.id, () => {
          renderizarLocais();
          popularSelectLocaisParaRegiao(regiaoLocal);
          renderizarRegioes();
        })
      );
      tr.appendChild(tdMed);
      tr.appendChild(tdVia);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaLocais.appendChild(tr);
    });
    popularSelectLocaisParaRegiao(regiaoLocal);
  }

  function renderizarRegioes() {
    tabelaRegioes.innerHTML = '';
    db.getAll('regioes').forEach((item) => {
      const tr = document.createElement('tr');
      const tdLocal = document.createElement('td');
      const local = db.getById('locais', item.localId);
      tdLocal.textContent = local
        ? `${nomeMedicamento(local.medicamentoId)} — ${nomeVia(local.viaId)} — ${local.nome}`
        : '(local removido)';
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(criarBotaoExcluir('regioes', item.id, renderizarRegioes));
      tr.appendChild(tdLocal);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaRegioes.appendChild(tr);
    });
  }

  function renderizarLaboratorios() {
    tabelaLaboratorios.innerHTML = '';
    db.getAll('laboratorios').forEach((item) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(criarBotaoExcluir('laboratorios', item.id, renderizarLaboratorios));
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaLaboratorios.appendChild(tr);
    });
  }

  function renderizarProfissionais() {
    tabelaProfissionais.innerHTML = '';
    db.getAll('profissionais').forEach((p) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = p.nome;
      const tdRegistro = document.createElement('td');
      tdRegistro.textContent = p.registro;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(criarBotaoExcluir('profissionais', p.id, renderizarProfissionais));
      tr.appendChild(tdNome);
      tr.appendChild(tdRegistro);
      tr.appendChild(tdAcoes);
      tabelaProfissionais.appendChild(tr);
    });
  }

  function renderizarTudo() {
    renderizarMedicamentos();
    renderizarDoses();
    renderizarVias();
    renderizarLocais();
    renderizarRegioes();
    renderizarLaboratorios();
    renderizarProfissionais();
  }

  document.getElementById('btnAddMedicamento').addEventListener('click', () => {
    const input = document.getElementById('novoMedicamentoNome');
    const nome = input.value.trim();
    if (!nome) return;
    db.create('medicamentos', { nome });
    input.value = '';
    renderizarTudo();
  });

  document.getElementById('btnAddDose').addEventListener('click', () => {
    const medicamentoId = doseMedicamento.value;
    const input = document.getElementById('novaDoseValor');
    const valor = input.value.trim();
    if (!medicamentoId || !valor) return;
    db.create('doses', { medicamentoId, valor });
    input.value = '';
    renderizarDoses();
  });

  document.getElementById('btnAddVia').addEventListener('click', () => {
    const medicamentoId = viaMedicamento.value;
    const input = document.getElementById('novaViaNome');
    const nome = input.value.trim();
    if (!medicamentoId || !nome) return;
    db.create('vias', { medicamentoId, nome });
    input.value = '';
    renderizarVias();
  });

  localMedicamento.addEventListener('change', () => {
    popularSelectVias(localVia, localMedicamento.value);
  });

  document.getElementById('btnAddLocal').addEventListener('click', () => {
    const medicamentoId = localMedicamento.value;
    const viaId = localVia.value;
    const input = document.getElementById('novoLocalNome');
    const nome = input.value.trim();
    if (!medicamentoId || !viaId || !nome) return;
    db.create('locais', { medicamentoId, viaId, nome });
    input.value = '';
    renderizarLocais();
  });

  document.getElementById('btnAddRegiao').addEventListener('click', () => {
    const localId = regiaoLocal.value;
    const input = document.getElementById('novaRegiaoNome');
    const nome = input.value.trim();
    if (!localId || !nome) return;
    db.create('regioes', { localId, nome });
    input.value = '';
    renderizarRegioes();
  });

  document.getElementById('btnAddLaboratorio').addEventListener('click', () => {
    const input = document.getElementById('novoLaboratorioNome');
    const nome = input.value.trim();
    if (!nome) return;
    db.create('laboratorios', { nome });
    input.value = '';
    renderizarLaboratorios();
  });

  document.getElementById('btnAddProfissional').addEventListener('click', () => {
    const inputNome = document.getElementById('novoProfissionalNome');
    const inputRegistro = document.getElementById('novoProfissionalRegistro');
    const nome = inputNome.value.trim();
    const registro = inputRegistro.value.trim();
    if (!nome || !registro) return;
    db.create('profissionais', { nome, registro });
    inputNome.value = '';
    inputRegistro.value = '';
    renderizarProfissionais();
  });

  document.getElementById('btnResetar').addEventListener('click', () => {
    if (!confirm('Isso vai apagar todos os cadastros atuais e voltar aos valores placeholder. Confirma?')) return;
    db.resetParaPlaceholders();
    renderizarTudo();
  });

  renderizarTudo();
})();
