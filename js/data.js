/**
 * Camada de dados do sistema de evolução de enfermagem.
 * Os cadastros vivem em um arquivo estático versionado (data/dados.json),
 * compartilhado por todos os usuários do site. A tela de administração
 * edita uma cópia em memória e publica de volta no GitHub via Contents API,
 * para que a mudança apareça para todo mundo depois do rebuild do Pages.
 */
(function (global) {
  const CAMINHO_DADOS = 'data/dados.json';

  let dbAtual = null;
  let ultimaFonte = null; // 'remoto' | 'embutido'

  function uid() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function seedData() {
    const medDipirona = uid();
    const medParacetamol = uid();
    const medSoro = uid();

    // Vias são uma lista compartilhada — o mesmo "IM" vale para qualquer
    // medicamento que o utilize, junto com os mesmos locais de aplicação.
    const viaIM = uid();
    const viaEV = uid();
    const viaSC = uid();
    const viaVO = uid();

    // Locais IM: distantes de vasos/nervos calibrosos — todos bilaterais (Direito/Esquerdo)
    const localDeltoide = uid();
    const localVentroGluteo = uid();
    const localDorsoGluteo = uid();
    const localVastoLateral = uid();

    // Locais SC: abdômen usa rodízio por quadrante (sem lado), braço/coxa são bilaterais
    const localAbdomen = uid();
    const localFaceExternaBraco = uid();
    const localFaceExternaCoxa = uid();

    // EV: acesso venoso periférico em membro superior — bilateral
    const localMembroSuperior = uid();

    // VO: sem lado/região aplicável
    const localViaOral = uid();

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
        { id: viaIM, nome: 'IM' },
        { id: viaEV, nome: 'EV' },
        { id: viaSC, nome: 'SC' },
        { id: viaVO, nome: 'VO' }
      ],
      // Define quais vias cada medicamento pode usar (muitos-para-muitos).
      medicamentoVias: [
        { id: uid(), medicamentoId: medDipirona, viaId: viaIM },
        { id: uid(), medicamentoId: medDipirona, viaId: viaEV },
        { id: uid(), medicamentoId: medDipirona, viaId: viaSC },
        { id: uid(), medicamentoId: medParacetamol, viaId: viaVO },
        { id: uid(), medicamentoId: medSoro, viaId: viaEV }
      ],
      locais: [
        { id: localDeltoide, viaId: viaIM, nome: 'Deltoide' },
        { id: localVentroGluteo, viaId: viaIM, nome: 'Ventroglúteo' },
        { id: localDorsoGluteo, viaId: viaIM, nome: 'Dorsoglúteo' },
        { id: localVastoLateral, viaId: viaIM, nome: 'Vasto Lateral da Coxa' },
        { id: localAbdomen, viaId: viaSC, nome: 'Abdômen' },
        { id: localFaceExternaBraco, viaId: viaSC, nome: 'Face Externa do Braço' },
        { id: localFaceExternaCoxa, viaId: viaSC, nome: 'Face Externa da Coxa' },
        { id: localMembroSuperior, viaId: viaEV, nome: 'Membro Superior' },
        { id: localViaOral, viaId: viaVO, nome: 'Via Oral' }
      ],
      regioes: [
        { id: uid(), localId: localDeltoide, nome: 'Direito' },
        { id: uid(), localId: localDeltoide, nome: 'Esquerdo' },
        { id: uid(), localId: localVentroGluteo, nome: 'Direito' },
        { id: uid(), localId: localVentroGluteo, nome: 'Esquerdo' },
        { id: uid(), localId: localDorsoGluteo, nome: 'Direito' },
        { id: uid(), localId: localDorsoGluteo, nome: 'Esquerdo' },
        { id: uid(), localId: localVastoLateral, nome: 'Direito' },
        { id: uid(), localId: localVastoLateral, nome: 'Esquerdo' },
        // Abdômen: rodízio por quadrante horário ao redor da cicatriz umbilical — não tem "lado"
        { id: uid(), localId: localAbdomen, nome: '3h' },
        { id: uid(), localId: localAbdomen, nome: '6h' },
        { id: uid(), localId: localAbdomen, nome: '9h' },
        { id: uid(), localId: localAbdomen, nome: '12h' },
        { id: uid(), localId: localFaceExternaBraco, nome: 'Direito' },
        { id: uid(), localId: localFaceExternaBraco, nome: 'Esquerdo' },
        { id: uid(), localId: localFaceExternaCoxa, nome: 'Direito' },
        { id: uid(), localId: localFaceExternaCoxa, nome: 'Esquerdo' },
        { id: uid(), localId: localMembroSuperior, nome: 'Direito' },
        { id: uid(), localId: localMembroSuperior, nome: 'Esquerdo' },
        // Via Oral: não há lado/região a escolher
        { id: uid(), localId: localViaOral, nome: 'Não aplicável' }
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

  /**
   * Carrega os dados compartilhados do arquivo estático (data/dados.json).
   * Em caso de falha (offline, JSON corrompido, etc.), cai para os
   * placeholders embutidos, para o site continuar funcionando.
   */
  async function carregarDb() {
    try {
      const resposta = await fetch(`${CAMINHO_DADOS}?t=${Date.now()}`, { cache: 'no-store' });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      dbAtual = await resposta.json();
      ultimaFonte = 'remoto';
    } catch (e) {
      console.error('Falha ao carregar data/dados.json, usando placeholders embutidos.', e);
      dbAtual = seedData();
      ultimaFonte = 'embutido';
    }
    return dbAtual;
  }

  function obterFonteDados() {
    return ultimaFonte;
  }

  function garantirDb() {
    if (!dbAtual) {
      throw new Error('Dados ainda não carregados — chame carregarDb() antes de usar EvolucaoDB.');
    }
    return dbAtual;
  }

  function getAll(entidade) {
    return garantirDb()[entidade] || [];
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
    const db = garantirDb();
    if (!db[entidade]) db[entidade] = [];
    const registro = Object.assign({ id: uid() }, dados);
    db[entidade].push(registro);
    return registro;
  }

  function update(entidade, id, dados) {
    const db = garantirDb();
    const lista = db[entidade] || [];
    const idx = lista.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    lista[idx] = Object.assign({}, lista[idx], dados, { id });
    return lista[idx];
  }

  function remove(entidade, id) {
    const db = garantirDb();
    const lista = db[entidade] || [];
    db[entidade] = lista.filter((item) => item.id !== id);
  }

  function resetParaPlaceholders() {
    dbAtual = seedData();
    return dbAtual;
  }

  function exportarJson() {
    return JSON.stringify(garantirDb(), null, 2) + '\n';
  }

  function base64Utf8(texto) {
    const bytes = new TextEncoder().encode(texto);
    let binario = '';
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario);
  }

  /**
   * Publica o estado atual em memória de volta no GitHub, via Contents API,
   * sobrescrevendo data/dados.json na branch informada. Requer um Personal
   * Access Token com permissão de escrita no repositório (o token nunca é
   * armazenado por esta função — é responsabilidade de quem chama).
   */
  async function publicarNoGithub({ owner, repo, branch, path, token, mensagemCommit }) {
    if (!owner || !repo || !branch || !path || !token) {
      throw new Error('Preencha owner, repo, branch, path e token antes de publicar.');
    }

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const cabecalhos = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    };

    const respostaAtual = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, {
      headers: cabecalhos
    });

    if (!respostaAtual.ok && respostaAtual.status !== 404) {
      throw new Error(
        interpretarErroGithub(respostaAtual.status, 'ao consultar o arquivo atual no GitHub')
      );
    }

    const shaAtual = respostaAtual.ok ? (await respostaAtual.json()).sha : undefined;

    const corpo = {
      message: mensagemCommit || 'Atualiza cadastros da evolução de enfermagem',
      content: base64Utf8(exportarJson()),
      branch
    };
    if (shaAtual) corpo.sha = shaAtual;

    const respostaPut = await fetch(endpoint, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, cabecalhos),
      body: JSON.stringify(corpo)
    });

    if (!respostaPut.ok) {
      throw new Error(interpretarErroGithub(respostaPut.status, 'ao publicar o arquivo no GitHub'));
    }

    return respostaPut.json();
  }

  function interpretarErroGithub(status, contexto) {
    if (status === 401) return `Token inválido ou expirado (${contexto}).`;
    if (status === 403) return `Token sem permissão suficiente neste repositório (${contexto}).`;
    if (status === 409) return `O arquivo mudou desde o último carregamento — clique em "Recarregar dados publicados" e tente de novo (${contexto}).`;
    if (status === 404) return `Repositório, branch ou caminho não encontrados (${contexto}).`;
    return `Erro HTTP ${status} ${contexto}.`;
  }

  global.EvolucaoDB = {
    carregarDb,
    obterFonteDados,
    getAll,
    getById,
    getFiltrado,
    create,
    update,
    remove,
    resetParaPlaceholders,
    exportarJson,
    publicarNoGithub
  };
})(window);
