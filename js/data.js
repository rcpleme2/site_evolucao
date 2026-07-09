/**
 * Camada de dados do sistema de prescrições.
 * Persiste tudo em localStorage e expõe funções genéricas de CRUD,
 * para que novas entidades e vínculos possam ser adicionados no futuro
 * sem alterar a lógica das telas.
 */
(function (global) {
  const STORAGE_KEY = 'prescricao_db_v1';

  function uid() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function seedData() {
    const medDipirona = uid();
    const medParacetamol = uid();
    const medSoro = uid();

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
      locais: [
        { id: uid(), medicamentoId: medDipirona, nome: 'Intramuscular (IM)' },
        { id: uid(), medicamentoId: medDipirona, nome: 'Endovenoso (EV)' },
        { id: uid(), medicamentoId: medParacetamol, nome: 'Via Oral (VO)' },
        { id: uid(), medicamentoId: medSoro, nome: 'Endovenoso (EV)' }
      ],
      laboratorios: [
        { id: uid(), medicamentoId: medDipirona, nome: 'Hipolabor' },
        { id: uid(), medicamentoId: medDipirona, nome: 'EMS' },
        { id: uid(), medicamentoId: medParacetamol, nome: 'EMS' },
        { id: uid(), medicamentoId: medParacetamol, nome: 'Neo Química' },
        { id: uid(), medicamentoId: medSoro, nome: 'Equiplex' }
      ],
      profissionais: [
        { id: profA, nome: 'Dra. Ana Souza', registro: 'COREN 123456' },
        { id: profB, nome: 'Téc. Enf. Carlos Lima', registro: 'COREN 654321' }
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
