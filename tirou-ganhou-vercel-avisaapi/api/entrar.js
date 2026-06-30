const {
  CONFIG,
  buscarUsuario,
  getPremiosAtivos,
  lerJson,
  responder,
  enviarAvisoWhatsApp,
  montarDadosPublicos,
  normalizarCodigo,
  dataBrasil,
} = require('./_config');

const { registrarEntrada } = require('./_storage');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return responder(res, 405, { ok: false, erro: 'Método não permitido.' });
  }

  try {
    const body = await lerJson(req);
    const codigo = normalizarCodigo(body.codigo);

    if (!codigo) {
      return responder(res, 400, { ok: false, erro: 'Informe o código de acesso.' });
    }

    const usuario = buscarUsuario(codigo);

    if (!usuario || usuario.ativo === false) {
      return responder(res, 403, { ok: false, erro: 'Código inválido ou inativo.' });
    }

    const premiosAtivos = getPremiosAtivos();
    const agora = dataBrasil();
    const { participacao, criadaAgora } = registrarEntrada(usuario, agora);

    if (criadaAgora) {
      await enviarAvisoWhatsApp(
        `👀 ${CONFIG.nomeCampanha}\n\n` +
          `Uma pessoa entrou no jogo.\n\n` +
          `Nome: ${usuario.nome}\n` +
          `Código: ${usuario.codigo}\n` +
          `Contato cadastrado: ${usuario.contato || 'Não informado'}\n` +
          `Data/hora: ${agora}`
      );
    }

    return responder(res, 200, {
      ok: true,
      usuario: montarDadosPublicos(usuario),
      quantidadeCartas: premiosAtivos.length,
      nomeCampanha: CONFIG.nomeCampanha,
      finalizado: Boolean(participacao.finalizado),
      premio: participacao.premio || null,
      cartaEscolhida: participacao.cartaEscolhida || null,
      entrouEm: participacao.entrouEm || null,
      sorteadoEm: participacao.sorteadoEm || null,
    });
  } catch (erro) {
    console.error(erro);
    return responder(res, 500, {
      ok: false,
      erro: 'Não foi possível registrar a entrada agora. Tente novamente.',
    });
  }
};
