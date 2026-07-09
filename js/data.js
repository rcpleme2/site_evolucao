/**
 * Camada de dados do sistema de prescrições.
 * Persiste tudo em localStorage e expõe funções genéricas de CRUD,
 * para que novas entidades e vínculos possam ser adicionados no futuro
 * sem alterar a lógica das telas.
 */
(function (global) {
  const STORAGE_KEY = 'prescricao_db_v2';

  function uid() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function seedData() {
    const medDipirona = uid();
    const medParacetamol = uid();
    const medSoro = uid();

    const viaDipironaIM = uid();
    const viaDipironaEV = uid();
    const viaDipironaSC = uid();
    const viaParacetamolVO = uid();
    const viaSoroEV = uid();

    const localDipironaDorsoGluteo = uid();
    const localDipironaDeltoide = uid();
    const localDipironaMembroSuperior = uid();
    const localDipironaAbdomen = uid();
    const localParacetamolVO = uid();
    const localSoroMembroSuperior = uid();

    const profA = uid();
    const profB = uid();

    return {
      medicamentos: [
        { id: medDipirona, nome: 'Dipirona Sódica' },
        { id: medParacetamol, nome: 'Paracetamol' },
        { id: medSoro, nome: 'Soro Fisiológico 0,9%' }
      ],
      doses: [
        { id: uid(), medicamentoId: medDipirona, valor: '500mg' },
        { id: uid(), medicamentoId: medDipirona, valor: '1g' },
        { id: uid(), medicamentoId: medParacetamol, valor: '500mg' },
        { id: uid(), medicamentoId: medParacetamol, valor: '750mg' },
        { id: uid(), medicamentoId: medSoro, valor: '100ml' },
        { id: uid(), medicamentoId: medSoro, valor: '500ml' }
      ],
      vias: [
        { id: viaDipironaIM, medicamentoId: medDipirona, nome: 'IM' },
        { id: viaDipironaEV, medicamentoId: medDipirona, nome: 'EV' },
        { id: viaDipironaSC, medicamentoId: medDipirona, nome: 'SC' },
        { id: viaParacetamolVO, medicamentoId: medParacetamol, nome: 'VO' },
        { id: viaSoroEV, medicamentoId: medSoro, nome: 'EV' }
      ],
      locais: [
        { id: localDipironaDorsoGluteo, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Dorso-glúteo' },
        { id: localDipironaDeltoide, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Deltoide' },
        { id: localDipironaMembroSuperior, medicamentoId: medDipirona, viaId: viaDipironaEV, nome: 'Membro superior' },
        { id: localDipironaAbdomen, medicamentoId: medDipirona, viaId: viaDipironaSC, nome: 'Abdômen' },
        { id: localParacetamolVO, medicamentoId: medParacetamol, viaId: viaParacetamolVO, nome: 'Via oral' },
        { id: localSoroMembroSuperior, medicamentoId: medSoro, viaId: viaSoroEV, nome: 'Membro superior' }
      ],
      regioes: [
        { id: uid(), localId: localDipironaDorsoGluteo, nome: 'Direito' },
        { id: uid(), localId: localDipironaDorsoGluteo, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaDeltoide, nome: 'Direito' },
        { id: uid(), localId: localDipironaDeltoide, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaMembroSuperior, nome: 'Direito' },
        { id: uid(), localId: localDipironaMembroSuperior, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaAbdomen, nome: '3h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '6h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '9h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '12h' },
        { id: uid(), localId: localSoroMembroSuperior, nome: 'Direito' },
        { id: uid(), localId: localSoroMembroSuperior, nome: 'Esquerdo' },
        { id: uid(), localId: localParacetamolVO, nome: 'Não aplicável' }
      ],
      laboratorios: [
        { id: uid(), nome: 'Essentia Pharma' },
        { id: uid(), nome: 'Biomeds' },
        { id: uid(), nome: 'Health Tech' }
      ],
      profissionais: [
        { id: profA, nome: 'Tarcila Disner - Técnica em Enfermagem', registro: 'COREN 1221186' },
        { id: profB, nome: 'Eliane Carvalho - Técnica em Enfermagem', registro: 'COREN 1190230' }
      ]
    };
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Falha ao ler dados salvos, reiniciando com placeholders.', e);
      return null;
    }
  }

  function save(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function seedIfEmpty() {
    let db = load();
    if (!db) {
      db = seedData();
      save(db);
    }
    return db;
  }

  function getDb() {
    return load() || seedIfEmpty();
  }

  function getAll(entidade) {
    const db = getDb();
    return db[entidade] || [];
  }

  function getById(entidade, id) {
    return getAll(entidade).find((item) => item.id === id) || null;
  }

  /**
   * Filtra registros de uma entidade por uma ou mais chaves de vínculo,
   * ex: getFiltrado('doses', { medicamentoId: 'xyz' })
   */
  function getFiltrado(entidade, filtros) {
    const chaves = Object.keys(filtros || {});
    return getAll(entidade).filter((item) =>
      chaves.every((chave) => item[chave] === filtros[chave])
    );
  }

  function create(entidade, dados) {
    const db = getDb();
    if (!db[entidade]) db[entidade] = [];
    const registro = Object.assign({ id: uid() }, dados);
    db[entidade].push(registro);
    save(db);
    return registro;
  }

  function update(entidade, id, dados) {
    const db = getDb();
    const lista = db[entidade] || [];
    const idx = lista.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    lista[idx] = Object.assign({}, lista[idx], dados, { id });
    save(db);
    return lista[idx];
  }

  function remove(entidade, id) {
    const db = getDb();
    const lista = db[entidade] || [];
    db[entidade] = lista.filter((item) => item.id !== id);
    save(db);
  }

  function resetParaPlaceholders() {
    const db = seedData();
    save(db);
    return db;
  }

  global.PrescricaoDB = {
    seedIfEmpty,
    getAll,
    getById,
    getFiltrado,
    create,
    update,
    remove,
    resetParaPlaceholders
  };
})(window);
