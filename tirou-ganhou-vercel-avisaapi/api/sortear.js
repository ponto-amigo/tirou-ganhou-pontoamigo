const {
  CONFIG,
  buscarUsuario,
  escolherPremio,
  getPremiosAtivos,
  lerJson,
  responder,
  enviarAvisoWhatsApp,
  montarDadosPublicos,
  normalizarCodigo,
  dataBrasil,
} = require('./_config');

const { registrarSorteio } = require('./_storage');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return responder(res, 405, { ok: false, erro: 'Método não permitido.' });
  }

  try {
    const body = await lerJson(req);
    const codigo = normalizarCodigo(body.codigo);
    const cartaEscolhida = Number(body.cartaEscolhida || 0);
    const totalCartas = getPremiosAtivos().length;

    if (!codigo) {
      return responder(res, 400, { ok: false, erro: 'Informe o código de acesso.' });
    }

    if (!cartaEscolhida || cartaEscolhida < 1 || cartaEscolhida > totalCartas) {
      return responder(res, 400, { ok: false, erro: 'Carta inválida.' });
    }

    const usuario = buscarUsuario(codigo);

    if (!usuario || usuario.ativo === false) {
      return responder(res, 403, { ok: false, erro: 'Código inválido ou inativo.' });
    }

    const premio = escolherPremio(usuario, cartaEscolhida);
    const agora = dataBrasil();
    const { participacao, criadoAgora } = registrarSorteio(usuario, cartaEscolhida, premio, agora);

    if (criadoAgora) {
      await enviarAvisoWhatsApp(
        `🎁 ${CONFIG.nomeCampanha}\n\n` +
          `Pessoa tirou uma carta.\n\n` +
          `Nome: ${usuario.nome}\n` +
          `Código: ${usuario.codigo}\n` +
          `Contato cadastrado: ${usuario.contato || 'Não informado'}\n` +
          `Carta escolhida: ${cartaEscolhida}\n` +
          `Prêmio: ${premio}\n` +
          `Data/hora: ${agora}`
      );
    }

    return responder(res, 200, {
      ok: true,
      usuario: montarDadosPublicos(usuario),
      premio: participacao.premio,
      cartaEscolhida: participacao.cartaEscolhida,
      finalizado: true,
      jaParticipou: !criadoAgora,
    });
  } catch (erro) {
    console.error(erro);
    return responder(res, 500, {
      ok: false,
      erro: 'Não foi possível sortear agora. Tente novamente.',
    });
  }
};
