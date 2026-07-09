/**
 * Tela de administração: CRUD de medicamentos, doses, locais,
 * laboratórios e profissionais, e vínculo de cada entidade dependente
 * ao seu medicamento.
 */
(function () {
  const db = window.PrescricaoDB;
  db.seedIfEmpty();

  const tabelaMedicamentos = document.getElementById('tabelaMedicamentos');
  const tabelaDoses = document.getElementById('tabelaDoses');
  const tabelaLocais = document.getElementById('tabelaLocais');
  const tabelaLaboratorios = document.getElementById('tabelaLaboratorios');
  const tabelaProfissionais = document.getElementById('tabelaProfissionais');

  const doseMedicamento = document.getElementById('doseMedicamento');
  const localMedicamento = document.getElementById('localMedicamento');
  const laboratorioMedicamento = document.getElementById('laboratorioMedicamento');

  function nomeMedicamento(medicamentoId) {
    const m = db.getById('medicamentos', medicamentoId);
    return m ? m.nome : '(medicamento removido)';
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
    popularSelectMedicamentos(localMedicamento);
    popularSelectMedicamentos(laboratorioMedicamento);
  }

  function renderizarVinculados(entidade, tabela, campoNome) {
    tabela.innerHTML = '';
    db.getAll(entidade).forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdValor = document.createElement('td');
      tdValor.textContent = item[campoNome];
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoExcluir(entidade, item.id, () => {
          renderizarEntidade(entidade);
        })
      );
      tr.appendChild(tdMed);
      tr.appendChild(tdValor);
      tr.appendChild(tdAcoes);
      tabela.appendChild(tr);
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
      tdAcoes.appendChild(
        criarBotaoExcluir('profissionais', p.id, () => {
          renderizarProfissionais();
        })
      );
      tr.appendChild(tdNome);
      tr.appendChild(tdRegistro);
      tr.appendChild(tdAcoes);
      tabelaProfissionais.appendChild(tr);
    });
  }

  function renderizarEntidade(entidade) {
    if (entidade === 'doses') renderizarVinculados('doses', tabelaDoses, 'valor');
    if (entidade === 'locais') renderizarVinculados('locais', tabelaLocais, 'nome');
    if (entidade === 'laboratorios') renderizarVinculados('laboratorios', tabelaLaboratorios, 'nome');
  }

  function renderizarTudo() {
    renderizarMedicamentos();
    renderizarEntidade('doses');
    renderizarEntidade('locais');
    renderizarEntidade('laboratorios');
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
    renderizarEntidade('doses');
  });

  document.getElementById('btnAddLocal').addEventListener('click', () => {
    const medicamentoId = localMedicamento.value;
    const input = document.getElementById('novoLocalNome');
    const nome = input.value.trim();
    if (!medicamentoId || !nome) return;
    db.create('locais', { medicamentoId, nome });
    input.value = '';
    renderizarEntidade('locais');
  });

  document.getElementById('btnAddLaboratorio').addEventListener('click', () => {
    const medicamentoId = laboratorioMedicamento.value;
    const input = document.getElementById('novoLaboratorioNome');
    const nome = input.value.trim();
    if (!medicamentoId || !nome) return;
    db.create('laboratorios', { medicamentoId, nome });
    input.value = '';
    renderizarEntidade('laboratorios');
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
