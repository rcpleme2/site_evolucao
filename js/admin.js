/**
 * Tela de administração: CRUD (criar/editar/excluir) de medicamentos,
 * doses, vias, vínculos medicamento-via, locais, regiões, laboratórios
 * e profissionais.
 *
 * Vias são uma lista compartilhada (não pertencem a um medicamento);
 * "medicamentoVias" define quais vias cada medicamento pode usar.
 * Local depende só da via; região depende só do local.
 *
 * Edição reaproveita o próprio formulário de "Adicionar": ao clicar em
 * "Editar" numa linha, os campos são preenchidos com os valores atuais
 * e o botão vira "Salvar Alterações" até salvar ou cancelar.
 */
(function () {
  const db = window.EvolucaoDB;

  const avisoCarregamento = document.getElementById('avisoCarregamento');
  const avisoInstrucao = document.getElementById('avisoInstrucao');

  const tabelaMedicamentos = document.getElementById('tabelaMedicamentos');
  const tabelaDoses = document.getElementById('tabelaDoses');
  const tabelaVias = document.getElementById('tabelaVias');
  const tabelaMedicamentoVias = document.getElementById('tabelaMedicamentoVias');
  const tabelaLocais = document.getElementById('tabelaLocais');
  const tabelaRegioes = document.getElementById('tabelaRegioes');
  const tabelaLaboratorios = document.getElementById('tabelaLaboratorios');
  const tabelaProfissionais = document.getElementById('tabelaProfissionais');

  const doseMedicamento = document.getElementById('doseMedicamento');
  const mvMedicamento = document.getElementById('mvMedicamento');
  const mvVia = document.getElementById('mvVia');
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

  function rotuloLocal(localId) {
    const l = db.getById('locais', localId);
    return l ? `${nomeVia(l.viaId)} — ${l.nome}` : '(local removido)';
  }

  /**
   * Gerencia a troca entre modo "criar" e modo "editar" de uma seção:
   * troca o texto do botão principal, mostra/esconde o botão Cancelar,
   * e guarda o id do registro em edição (null quando não está editando).
   */
  function configurarEdicao(botaoSalvar, botaoCancelar, aoLimparFormulario) {
    let idEditando = null;

    function iniciar(id) {
      idEditando = id;
      botaoSalvar.textContent = 'Salvar Alterações';
      botaoCancelar.style.display = '';
    }

    function encerrar() {
      idEditando = null;
      botaoSalvar.textContent = 'Adicionar';
      botaoCancelar.style.display = 'none';
      aoLimparFormulario();
    }

    botaoCancelar.addEventListener('click', encerrar);

    return {
      iniciar,
      encerrar,
      obterIdEditando: () => idEditando
    };
  }

  function criarBotaoEditar(aoEditar) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'secundario';
    btn.textContent = 'Editar';
    btn.addEventListener('click', aoEditar);
    return btn;
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

  function popularSelectMedicamentos(select) {
    const medicamentos = db.ordenarPor(db.getAll('medicamentos'), 'nome');
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

  function popularSelectTodasVias(select) {
    const atual = select.value;
    select.innerHTML = '';
    db.ordenarPor(db.getAll('vias'), 'nome').forEach((v) => {
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
    db.ordenarPor(db.getAll('locais'), (l) => rotuloLocal(l.id)).forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = rotuloLocal(l.id);
      select.appendChild(opt);
    });
    if (atual) select.value = atual;
  }

  // ---------- Medicamentos ----------

  const edicaoMedicamento = configurarEdicao(
    document.getElementById('btnAddMedicamento'),
    document.getElementById('btnCancelarMedicamento'),
    () => {
      document.getElementById('novoMedicamentoNome').value = '';
    }
  );

  function renderizarMedicamentos() {
    tabelaMedicamentos.innerHTML = '';
    db.ordenarPor(db.getAll('medicamentos'), 'nome').forEach((m) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = m.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          document.getElementById('novoMedicamentoNome').value = m.nome;
          edicaoMedicamento.iniciar(m.id);
        })
      );
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
    popularSelectMedicamentos(mvMedicamento);
  }

  document.getElementById('btnAddMedicamento').addEventListener('click', () => {
    const input = document.getElementById('novoMedicamentoNome');
    const nome = input.value.trim();
    if (!nome) return;
    const idEditando = edicaoMedicamento.obterIdEditando();
    if (idEditando) {
      db.update('medicamentos', idEditando, { nome });
    } else {
      db.create('medicamentos', { nome });
    }
    edicaoMedicamento.encerrar();
    renderizarTudo();
  });

  // ---------- Doses ----------

  const edicaoDose = configurarEdicao(
    document.getElementById('btnAddDose'),
    document.getElementById('btnCancelarDose'),
    () => {
      document.getElementById('novaDoseValor').value = '';
    }
  );

  function renderizarDoses() {
    tabelaDoses.innerHTML = '';
    db.ordenarPor(db.getAll('doses'), (d) => `${nomeMedicamento(d.medicamentoId)} ${d.valor}`).forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdValor = document.createElement('td');
      tdValor.textContent = item.valor;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          doseMedicamento.value = item.medicamentoId;
          document.getElementById('novaDoseValor').value = item.valor;
          edicaoDose.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(criarBotaoExcluir('doses', item.id, renderizarDoses));
      tr.appendChild(tdMed);
      tr.appendChild(tdValor);
      tr.appendChild(tdAcoes);
      tabelaDoses.appendChild(tr);
    });
  }

  document.getElementById('btnAddDose').addEventListener('click', () => {
    const medicamentoId = doseMedicamento.value;
    const input = document.getElementById('novaDoseValor');
    const valor = input.value.trim();
    if (!medicamentoId || !valor) return;
    const idEditando = edicaoDose.obterIdEditando();
    if (idEditando) {
      db.update('doses', idEditando, { medicamentoId, valor });
    } else {
      db.create('doses', { medicamentoId, valor });
    }
    edicaoDose.encerrar();
    renderizarDoses();
  });

  // ---------- Vias ----------

  const edicaoVia = configurarEdicao(
    document.getElementById('btnAddVia'),
    document.getElementById('btnCancelarVia'),
    () => {
      document.getElementById('novaViaNome').value = '';
    }
  );

  function renderizarVias() {
    tabelaVias.innerHTML = '';
    db.ordenarPor(db.getAll('vias'), 'nome').forEach((item) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          document.getElementById('novaViaNome').value = item.nome;
          edicaoVia.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(
        criarBotaoExcluir('vias', item.id, () => {
          renderizarVias();
          renderizarMedicamentoVias();
          renderizarLocais();
        })
      );
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaVias.appendChild(tr);
    });
    popularSelectTodasVias(mvVia);
    popularSelectTodasVias(localVia);
  }

  document.getElementById('btnAddVia').addEventListener('click', () => {
    const input = document.getElementById('novaViaNome');
    const nome = input.value.trim();
    if (!nome) return;
    const idEditando = edicaoVia.obterIdEditando();
    if (idEditando) {
      db.update('vias', idEditando, { nome });
    } else {
      db.create('vias', { nome });
    }
    edicaoVia.encerrar();
    renderizarVias();
  });

  // ---------- Vias por Medicamento ----------

  const edicaoMedicamentoVia = configurarEdicao(
    document.getElementById('btnAddMedicamentoVia'),
    document.getElementById('btnCancelarMedicamentoVia'),
    () => {}
  );

  function renderizarMedicamentoVias() {
    tabelaMedicamentoVias.innerHTML = '';
    db.ordenarPor(
      db.getAll('medicamentoVias'),
      (mv) => `${nomeMedicamento(mv.medicamentoId)} ${nomeVia(mv.viaId)}`
    ).forEach((item) => {
      const tr = document.createElement('tr');
      const tdMed = document.createElement('td');
      tdMed.textContent = nomeMedicamento(item.medicamentoId);
      const tdVia = document.createElement('td');
      tdVia.textContent = nomeVia(item.viaId);
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          mvMedicamento.value = item.medicamentoId;
          mvVia.value = item.viaId;
          edicaoMedicamentoVia.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(criarBotaoExcluir('medicamentoVias', item.id, renderizarMedicamentoVias));
      tr.appendChild(tdMed);
      tr.appendChild(tdVia);
      tr.appendChild(tdAcoes);
      tabelaMedicamentoVias.appendChild(tr);
    });
  }

  document.getElementById('btnAddMedicamentoVia').addEventListener('click', () => {
    const medicamentoId = mvMedicamento.value;
    const viaId = mvVia.value;
    if (!medicamentoId || !viaId) return;
    const idEditando = edicaoMedicamentoVia.obterIdEditando();
    const jaExiste = db
      .getFiltrado('medicamentoVias', { medicamentoId })
      .some((mv) => mv.viaId === viaId && mv.id !== idEditando);
    if (jaExiste) return;
    if (idEditando) {
      db.update('medicamentoVias', idEditando, { medicamentoId, viaId });
    } else {
      db.create('medicamentoVias', { medicamentoId, viaId });
    }
    edicaoMedicamentoVia.encerrar();
    renderizarMedicamentoVias();
  });

  // ---------- Locais ----------

  const edicaoLocal = configurarEdicao(
    document.getElementById('btnAddLocal'),
    document.getElementById('btnCancelarLocal'),
    () => {
      document.getElementById('novoLocalNome').value = '';
    }
  );

  function renderizarLocais() {
    tabelaLocais.innerHTML = '';
    db.ordenarPor(db.getAll('locais'), (l) => `${nomeVia(l.viaId)} ${l.nome}`).forEach((item) => {
      const tr = document.createElement('tr');
      const tdVia = document.createElement('td');
      tdVia.textContent = nomeVia(item.viaId);
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          localVia.value = item.viaId;
          document.getElementById('novoLocalNome').value = item.nome;
          edicaoLocal.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(
        criarBotaoExcluir('locais', item.id, () => {
          renderizarLocais();
          popularSelectLocaisParaRegiao(regiaoLocal);
          renderizarRegioes();
        })
      );
      tr.appendChild(tdVia);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaLocais.appendChild(tr);
    });
    popularSelectLocaisParaRegiao(regiaoLocal);
  }

  document.getElementById('btnAddLocal').addEventListener('click', () => {
    const viaId = localVia.value;
    const input = document.getElementById('novoLocalNome');
    const nome = input.value.trim();
    if (!viaId || !nome) return;
    const idEditando = edicaoLocal.obterIdEditando();
    if (idEditando) {
      db.update('locais', idEditando, { viaId, nome });
    } else {
      db.create('locais', { viaId, nome });
    }
    edicaoLocal.encerrar();
    renderizarLocais();
  });

  // ---------- Região/Lado ----------

  const edicaoRegiao = configurarEdicao(
    document.getElementById('btnAddRegiao'),
    document.getElementById('btnCancelarRegiao'),
    () => {
      document.getElementById('novaRegiaoNome').value = '';
    }
  );

  function renderizarRegioes() {
    tabelaRegioes.innerHTML = '';
    db.ordenarPor(db.getAll('regioes'), (r) => `${rotuloLocal(r.localId)} ${r.nome}`).forEach((item) => {
      const tr = document.createElement('tr');
      const tdLocal = document.createElement('td');
      tdLocal.textContent = rotuloLocal(item.localId);
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          regiaoLocal.value = item.localId;
          document.getElementById('novaRegiaoNome').value = item.nome;
          edicaoRegiao.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(criarBotaoExcluir('regioes', item.id, renderizarRegioes));
      tr.appendChild(tdLocal);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaRegioes.appendChild(tr);
    });
  }

  document.getElementById('btnAddRegiao').addEventListener('click', () => {
    const localId = regiaoLocal.value;
    const input = document.getElementById('novaRegiaoNome');
    const nome = input.value.trim();
    if (!localId || !nome) return;
    const idEditando = edicaoRegiao.obterIdEditando();
    if (idEditando) {
      db.update('regioes', idEditando, { localId, nome });
    } else {
      db.create('regioes', { localId, nome });
    }
    edicaoRegiao.encerrar();
    renderizarRegioes();
  });

  // ---------- Laboratórios ----------

  const edicaoLaboratorio = configurarEdicao(
    document.getElementById('btnAddLaboratorio'),
    document.getElementById('btnCancelarLaboratorio'),
    () => {
      document.getElementById('novoLaboratorioNome').value = '';
    }
  );

  function renderizarLaboratorios() {
    tabelaLaboratorios.innerHTML = '';
    db.ordenarPor(db.getAll('laboratorios'), 'nome').forEach((item) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          document.getElementById('novoLaboratorioNome').value = item.nome;
          edicaoLaboratorio.iniciar(item.id);
        })
      );
      tdAcoes.appendChild(criarBotaoExcluir('laboratorios', item.id, renderizarLaboratorios));
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);
      tabelaLaboratorios.appendChild(tr);
    });
  }

  document.getElementById('btnAddLaboratorio').addEventListener('click', () => {
    const input = document.getElementById('novoLaboratorioNome');
    const nome = input.value.trim();
    if (!nome) return;
    const idEditando = edicaoLaboratorio.obterIdEditando();
    if (idEditando) {
      db.update('laboratorios', idEditando, { nome });
    } else {
      db.create('laboratorios', { nome });
    }
    edicaoLaboratorio.encerrar();
    renderizarLaboratorios();
  });

  // ---------- Profissionais ----------

  const edicaoProfissional = configurarEdicao(
    document.getElementById('btnAddProfissional'),
    document.getElementById('btnCancelarProfissional'),
    () => {
      document.getElementById('novoProfissionalNome').value = '';
      document.getElementById('novoProfissionalRegistro').value = '';
    }
  );

  function renderizarProfissionais() {
    tabelaProfissionais.innerHTML = '';
    db.ordenarPor(db.getAll('profissionais'), 'nome').forEach((p) => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = p.nome;
      const tdRegistro = document.createElement('td');
      tdRegistro.textContent = p.registro;
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';
      tdAcoes.appendChild(
        criarBotaoEditar(() => {
          document.getElementById('novoProfissionalNome').value = p.nome;
          document.getElementById('novoProfissionalRegistro').value = p.registro;
          edicaoProfissional.iniciar(p.id);
        })
      );
      tdAcoes.appendChild(criarBotaoExcluir('profissionais', p.id, renderizarProfissionais));
      tr.appendChild(tdNome);
      tr.appendChild(tdRegistro);
      tr.appendChild(tdAcoes);
      tabelaProfissionais.appendChild(tr);
    });
  }

  document.getElementById('btnAddProfissional').addEventListener('click', () => {
    const inputNome = document.getElementById('novoProfissionalNome');
    const inputRegistro = document.getElementById('novoProfissionalRegistro');
    const nome = inputNome.value.trim();
    const registro = inputRegistro.value.trim();
    if (!nome || !registro) return;
    const idEditando = edicaoProfissional.obterIdEditando();
    if (idEditando) {
      db.update('profissionais', idEditando, { nome, registro });
    } else {
      db.create('profissionais', { nome, registro });
    }
    edicaoProfissional.encerrar();
    renderizarProfissionais();
  });

  // ---------- Geral ----------

  function renderizarTudo() {
    renderizarMedicamentos();
    renderizarDoses();
    renderizarVias();
    renderizarMedicamentoVias();
    renderizarLocais();
    renderizarRegioes();
    renderizarLaboratorios();
    renderizarProfissionais();
  }

  document.getElementById('btnResetar').addEventListener('click', () => {
    if (!confirm('Isso vai apagar todos os cadastros atuais e voltar aos valores placeholder. Confirma?')) return;
    db.resetParaPlaceholders();
    renderizarTudo();
  });

  const TOKEN_SESSION_KEY = 'evolucao_admin_gh_token';
  const campoOwner = document.getElementById('pubOwner');
  const campoRepo = document.getElementById('pubRepo');
  const campoBranch = document.getElementById('pubBranch');
  const campoPath = document.getElementById('pubPath');
  const campoToken = document.getElementById('pubToken');
  const statusPublicacao = document.getElementById('statusPublicacao');

  const tokenSalvo = sessionStorage.getItem(TOKEN_SESSION_KEY);
  if (tokenSalvo) campoToken.value = tokenSalvo;
  campoToken.addEventListener('input', () => {
    sessionStorage.setItem(TOKEN_SESSION_KEY, campoToken.value);
  });

  function mostrarStatusPublicacao(mensagem, classe) {
    statusPublicacao.textContent = mensagem;
    statusPublicacao.className = `aviso ${classe}`;
    statusPublicacao.style.display = '';
  }

  document.getElementById('btnPublicar').addEventListener('click', async () => {
    const botao = document.getElementById('btnPublicar');
    botao.disabled = true;
    mostrarStatusPublicacao('Publicando…', 'aviso');
    try {
      await db.publicarNoGithub({
        owner: campoOwner.value.trim(),
        repo: campoRepo.value.trim(),
        branch: campoBranch.value.trim(),
        path: campoPath.value.trim(),
        token: campoToken.value.trim(),
        mensagemCommit: 'Atualiza cadastros da evolução de enfermagem via painel admin'
      });
      mostrarStatusPublicacao(
        'Publicado com sucesso! O GitHub Pages leva cerca de 1 minuto para atualizar o site para todos.',
        'sucesso'
      );
    } catch (e) {
      mostrarStatusPublicacao(e.message || 'Falha ao publicar.', 'erro');
    } finally {
      botao.disabled = false;
    }
  });

  document.getElementById('btnRecarregarPublicado').addEventListener('click', async () => {
    if (!confirm('Isso descarta as alterações não publicadas nesta tela. Confirma?')) return;
    await db.carregarDb();
    statusPublicacao.style.display = 'none';
    renderizarTudo();
  });

  async function iniciar() {
    await db.carregarDb();
    avisoCarregamento.style.display = 'none';
    avisoInstrucao.style.display = '';
    renderizarTudo();
  }

  iniciar();
})();
