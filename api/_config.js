

const CONFIG_LOCAL = {

  avisaApiBaseUrl: 'https://www.avisaapi.com.br/api',


  avisaApiToken: 'VTIo3VZqOmCM2uE0vDHqpfmgy3AZPX8C2fMT8Hcjhp5p4lGvWjyDRKlp4lM2',


  adminWhatsapp: '81992991173',


  sorteioSecret: 'ponto-amigo-teste-local-2026',

  nomeCampanha: 'TIROU GANHOU DA TOTAL CASH',

  enviarWhatsapp: true,
};

const CONFIG = {
  avisaApiBaseUrl: process.env.AVISAAPI_BASE_URL || CONFIG_LOCAL.avisaApiBaseUrl,
  avisaApiToken: process.env.AVISAAPI_TOKEN || CONFIG_LOCAL.avisaApiToken,
  adminWhatsapp: process.env.ADMIN_WHATSAPP || CONFIG_LOCAL.adminWhatsapp,
  sorteioSecret: process.env.SORTEIO_SECRET || CONFIG_LOCAL.sorteioSecret,
  nomeCampanha: process.env.NOME_CAMPANHA || CONFIG_LOCAL.nomeCampanha,
  enviarWhatsapp: process.env.ENVIAR_WHATSAPP
    ? process.env.ENVIAR_WHATSAPP !== 'false'
    : CONFIG_LOCAL.enviarWhatsapp,
};

// ============================================================
// USUÁRIOS PERMITIDOS
// ============================================================

const USUARIOS = [
  {
    codigo: '1234567',
    nome: 'TESTEE',
    contato: '',
    ativo: true,
  },

];


const PREMIOS = [
  { nome: 'PIX DE R$ 800,00', ativo: true },
  { nome: 'PIX DE R$ 400,00', ativo: true },
  { nome: 'PIX DE R$ 300,00', ativo: true },
  { nome: 'PIX DE R$ 200,00', ativo: true },
  { nome: 'PIX DE R$ 100,00', ativo: true },

  { nome: 'PIX DE R$ 50,00', ativo: true },
  { nome: 'PIX DE R$ 50,00', ativo: true },
  { nome: 'PIX DE R$ 50,00', ativo: true },
  { nome: 'PIX DE R$ 50,00', ativo: true },
  { nome: 'PIX DE R$ 50,00', ativo: true },

  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },
  { nome: 'PIX DE R$ 25,00', ativo: true },

  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 20,00', ativo: true },
];


function normalizarCodigo(codigo) {
  return String(codigo || '').trim().toUpperCase();
}

function buscarUsuario(codigo) {
  const codigoNormalizado = normalizarCodigo(codigo);
  return USUARIOS.find((usuario) => normalizarCodigo(usuario.codigo) === codigoNormalizado);
}

function getPremiosAtivos() {
  return PREMIOS.filter((premio) => premio && premio.ativo !== false && premio.nome);
}

function hashString(texto) {
  let hash = 2166136261;

  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function criarRandomComSeed(semente) {
  let seed = hashString(semente) || 123456789;

  return function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function embaralharPremiosParaUsuario(usuario) {
  const premios = getPremiosAtivos().map((premio) => premio.nome);

  if (!premios.length) {
    throw new Error('Nenhum prêmio ativo configurado.');
  }

  const random = criarRandomComSeed(
    `${normalizarCodigo(usuario.codigo)}|${CONFIG.sorteioSecret}|${premios.length}`
  );

  for (let i = premios.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [premios[i], premios[j]] = [premios[j], premios[i]];
  }

  return premios;
}

function escolherPremio(usuario, cartaEscolhida) {
  const premiosAtivos = getPremiosAtivos();

  if (!premiosAtivos.length) {
    throw new Error('Nenhum prêmio ativo configurado.');
  }

  if (usuario.premioFixo) {
    return usuario.premioFixo;
  }

  const numeroCarta = Number(cartaEscolhida || 1);
  const indice = Math.max(0, Math.min(premiosAtivos.length - 1, numeroCarta - 1));
  const premiosEmbaralhados = embaralharPremiosParaUsuario(usuario);

  return premiosEmbaralhados[indice];
}

async function lerJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function responder(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (typeof res.status === 'function') {
    return res.status(status).json(payload);
  }

  res.statusCode = status;
  return res.end(JSON.stringify(payload));
}

async function enviarAvisoWhatsApp(mensagem) {
  console.log('\n================ AVISO WHATSAPP ================');
  console.log(mensagem);
  console.log('=================================================\n');

  if (!CONFIG.enviarWhatsapp) {
    return { enviado: false, motivo: 'Envio desativado no CONFIG_LOCAL' };
  }

  if (!CONFIG.avisaApiToken) {
    console.warn('AVISAAPI_TOKEN não configurado. Mensagem não enviada pela API.');
    return { enviado: false, motivo: 'Token não configurado' };
  }

  const resposta = await fetch(`${CONFIG.avisaApiBaseUrl}/actions/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CONFIG.avisaApiToken}`,
    },
    body: JSON.stringify({
      number: CONFIG.adminWhatsapp,
      message: mensagem,
    }),
  });

  const textoResposta = await resposta.text();

  if (!resposta.ok) {
    throw new Error(`Erro AvisaAPI ${resposta.status}: ${textoResposta}`);
  }

  return { enviado: true, resposta: textoResposta };
}

function montarDadosPublicos(usuario) {
  return {
    codigo: usuario.codigo,
    nome: usuario.nome,
    contato: usuario.contato || '',
  };
}

function dataBrasil() {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Recife',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());
}

module.exports = {
  CONFIG,
  USUARIOS,
  PREMIOS,
  buscarUsuario,
  escolherPremio,
  getPremiosAtivos,
  lerJson,
  responder,
  enviarAvisoWhatsApp,
  montarDadosPublicos,
  normalizarCodigo,
  dataBrasil,
};
