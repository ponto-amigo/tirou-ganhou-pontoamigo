const fs = require('fs');
const path = require('path');

const ehVercel = Boolean(process.env.VERCEL);
const pastaDados = path.join(process.cwd(), 'dados');
const arquivoDados = path.join(pastaDados, 'participacoes.json');

let memoria = null;

function carregarTudo() {
  if (memoria) return memoria;

  memoria = { participacoes: {} };

  if (!ehVercel && fs.existsSync(arquivoDados)) {
    try {
      const raw = fs.readFileSync(arquivoDados, 'utf8');
      const json = JSON.parse(raw);
      if (json && typeof json === 'object') memoria = json;
    } catch (erro) {
      console.warn('Não foi possível ler dados locais:', erro.message);
    }
  }

  if (!memoria.participacoes) memoria.participacoes = {};
  return memoria;
}

function salvarTudo() {
  if (ehVercel) return;

  try {
    fs.mkdirSync(pastaDados, { recursive: true });
    fs.writeFileSync(arquivoDados, JSON.stringify(memoria, null, 2), 'utf8');
  } catch (erro) {
    console.warn('Não foi possível salvar dados locais:', erro.message);
  }
}

function obterParticipacao(codigo) {
  const dados = carregarTudo();
  return dados.participacoes[codigo] || null;
}

function registrarEntrada(usuario, dataHora) {
  const dados = carregarTudo();
  const codigo = usuario.codigo;
  const existente = dados.participacoes[codigo];

  if (existente) {
    return { participacao: existente, criadaAgora: false };
  }

  const participacao = {
    codigo: usuario.codigo,
    nome: usuario.nome,
    contato: usuario.contato || '',
    entrouEm: dataHora,
    finalizado: false,
  };

  dados.participacoes[codigo] = participacao;
  salvarTudo();

  return { participacao, criadaAgora: true };
}

function registrarSorteio(usuario, cartaEscolhida, premio, dataHora) {
  const dados = carregarTudo();
  const codigo = usuario.codigo;
  const existente = dados.participacoes[codigo];

  if (existente && existente.finalizado) {
    return { participacao: existente, criadoAgora: false };
  }

  const participacao = {
    ...(existente || {}),
    codigo: usuario.codigo,
    nome: usuario.nome,
    contato: usuario.contato || '',
    entrouEm: existente?.entrouEm || dataHora,
    cartaEscolhida,
    premio,
    sorteadoEm: dataHora,
    finalizado: true,
  };

  dados.participacoes[codigo] = participacao;
  salvarTudo();

  return { participacao, criadoAgora: true };
}

module.exports = {
  obterParticipacao,
  registrarEntrada,
  registrarSorteio,
};
