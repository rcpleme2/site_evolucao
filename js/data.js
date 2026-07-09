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

    const viaDipironaIM = uid();
    const viaDipironaEV = uid();
    const viaDipironaSC = uid();
    const viaParacetamolVO = uid();
    const viaSoroEV = uid();

    // Locais IM: distantes de vasos/nervos calibrosos — todos bilaterais (Direito/Esquerdo)
    const localDipironaDeltoide = uid();
    const localDipironaVentroGluteo = uid();
    const localDipironaDorsoGluteo = uid();
    const localDipironaVastoLateral = uid();

    // Locais SC: abdômen usa rodízio por quadrante (sem lado), braço/coxa são bilaterais
    const localDipironaAbdomen = uid();
    const localDipironaFaceExternaBraco = uid();
    const localDipironaFaceExternaCoxa = uid();

    // EV: acesso venoso periférico em membro superior — bilateral
    const localDipironaMembroSuperior = uid();
    const localSoroMembroSuperior = uid();

    // VO: sem lado/região aplicável
    const localParacetamolVO = uid();

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
        { id: localDipironaDeltoide, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Deltoide' },
        { id: localDipironaVentroGluteo, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Ventroglúteo' },
        { id: localDipironaDorsoGluteo, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Dorsoglúteo' },
        { id: localDipironaVastoLateral, medicamentoId: medDipirona, viaId: viaDipironaIM, nome: 'Vasto Lateral da Coxa' },
        { id: localDipironaAbdomen, medicamentoId: medDipirona, viaId: viaDipironaSC, nome: 'Abdômen' },
        { id: localDipironaFaceExternaBraco, medicamentoId: medDipirona, viaId: viaDipironaSC, nome: 'Face Externa do Braço' },
        { id: localDipironaFaceExternaCoxa, medicamentoId: medDipirona, viaId: viaDipironaSC, nome: 'Face Externa da Coxa' },
        { id: localDipironaMembroSuperior, medicamentoId: medDipirona, viaId: viaDipironaEV, nome: 'Membro Superior' },
        { id: localParacetamolVO, medicamentoId: medParacetamol, viaId: viaParacetamolVO, nome: 'Via Oral' },
        { id: localSoroMembroSuperior, medicamentoId: medSoro, viaId: viaSoroEV, nome: 'Membro Superior' }
      ],
      regioes: [
        { id: uid(), localId: localDipironaDeltoide, nome: 'Direito' },
        { id: uid(), localId: localDipironaDeltoide, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaVentroGluteo, nome: 'Direito' },
        { id: uid(), localId: localDipironaVentroGluteo, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaDorsoGluteo, nome: 'Direito' },
        { id: uid(), localId: localDipironaDorsoGluteo, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaVastoLateral, nome: 'Direito' },
        { id: uid(), localId: localDipironaVastoLateral, nome: 'Esquerdo' },
        // Abdômen: rodízio por quadrante horário ao redor da cicatriz umbilical — não tem "lado"
        { id: uid(), localId: localDipironaAbdomen, nome: '3h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '6h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '9h' },
        { id: uid(), localId: localDipironaAbdomen, nome: '12h' },
        { id: uid(), localId: localDipironaFaceExternaBraco, nome: 'Direito' },
        { id: uid(), localId: localDipironaFaceExternaBraco, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaFaceExternaCoxa, nome: 'Direito' },
        { id: uid(), localId: localDipironaFaceExternaCoxa, nome: 'Esquerdo' },
        { id: uid(), localId: localDipironaMembroSuperior, nome: 'Direito' },
        { id: uid(), localId: localDipironaMembroSuperior, nome: 'Esquerdo' },
        { id: uid(), localId: localSoroMembroSuperior, nome: 'Direito' },
        { id: uid(), localId: localSoroMembroSuperior, nome: 'Esquerdo' },
        // Via Oral: não há lado/região a escolher
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
