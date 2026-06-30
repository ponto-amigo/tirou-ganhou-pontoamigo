const painelLogin = document.getElementById('painelLogin');
const painelJogo = document.getElementById('painelJogo');
const formCodigo = document.getElementById('formCodigo');
const codigoUsuario = document.getElementById('codigoUsuario');
const btnEntrar = document.getElementById('btnEntrar');
const btnTrocarUsuario = document.getElementById('btnTrocarUsuario');
const erroLogin = document.getElementById('erroLogin');
const nomeParticipante = document.getElementById('nomeParticipante');
const tabuleiro = document.getElementById('tabuleiro');
const mensagem = document.getElementById('mensagem');
const carregando = document.getElementById('carregando');

let jogoAtivo = false;
let usuarioAtual = null;
let quantidadeCartas = 8;

function normalizarCodigo(codigo) {
  return String(codigo || '').trim().toUpperCase();
}

function chaveEstado(codigo) {
  return `ponto-amigo-jogo:${normalizarCodigo(codigo)}`;
}

function salvarEstado(codigo, dados) {
  const chave = chaveEstado(codigo);
  const atual = carregarEstado(codigo) || {};
  localStorage.setItem(chave, JSON.stringify({ ...atual, ...dados }));
  localStorage.setItem('ponto-amigo-ultimo-codigo', normalizarCodigo(codigo));
}

function carregarEstado(codigo) {
  try {
    const raw = localStorage.getItem(chaveEstado(codigo));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function mostrarCarregando(texto = 'Registrando...') {
  carregando.querySelector('p').innerText = texto;
  carregando.classList.remove('escondido');
}

function esconderCarregando() {
  carregando.classList.add('escondido');
}

function embaralharNumeros(total, semente) {
  const numeros = Array.from({ length: total }, (_, index) => index + 1);
  let seed = 0;

  for (let i = 0; i < semente.length; i++) {
    seed = (seed * 31 + semente.charCodeAt(i)) >>> 0;
  }

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  for (let i = numeros.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
  }

  return numeros;
}

function criarCartas(total) {
  tabuleiro.innerHTML = '';
  mensagem.innerText = '';
  tabuleiro.classList.remove('bloqueado');

  const ordem = embaralharNumeros(total, `${usuarioAtual.codigo}-${Date.now()}`);

  ordem.forEach((numeroVisual, indice) => {
    const carta = document.createElement('div');
    carta.className = 'carta';
    carta.dataset.carta = String(indice + 1);

    carta.innerHTML = `
      <div class="carta-inner">
        <div class="carta-face carta-verso">
          <img src="logo-ponto-amigo.png" class="logo-carta" alt="Ponto Amigo" />
          <div class="numero-carta">?</div>
          <div class="texto-carta">Carta ${numeroVisual}</div>
        </div>
        <div class="carta-face carta-frente">
          <div class="premio-label">Seu prêmio</div>
          <div class="premio-texto">Aguarde...</div>
        </div>
      </div>
    `;

    carta.addEventListener('click', () => virarCarta(carta));
    tabuleiro.appendChild(carta);
  });
}

function abrirJogo(usuario, totalCartas) {
  usuarioAtual = usuario;
  quantidadeCartas = Number(totalCartas || 8);

  nomeParticipante.innerText = usuario.nome || usuario.codigo;
  painelLogin.classList.add('escondido');
  painelJogo.classList.remove('escondido');

  const estado = carregarEstado(usuario.codigo);

  if (estado && estado.finalizado && estado.premio) {
    jogoAtivo = false;
    criarCartas(estado.quantidadeCartas || quantidadeCartas);
    tabuleiro.classList.add('bloqueado');
    mensagem.innerText = `Você já participou. Seu prêmio foi: ${estado.premio}`;
    return;
  }

  jogoAtivo = true;
  criarCartas(quantidadeCartas);
}

async function chamarApi(url, dados) {
  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const json = await resposta.json().catch(() => ({}));

  if (!resposta.ok || !json.ok) {
    throw new Error(json.erro || 'Erro inesperado.');
  }

  return json;
}

formCodigo.addEventListener('submit', async (event) => {
  event.preventDefault();

  const codigo = normalizarCodigo(codigoUsuario.value);
  erroLogin.innerText = '';

  if (!codigo) {
    erroLogin.innerText = 'Digite seu código para entrar.';
    return;
  }

  const estadoSalvo = carregarEstado(codigo);

  if (estadoSalvo && estadoSalvo.usuario) {
    abrirJogo(estadoSalvo.usuario, estadoSalvo.quantidadeCartas || quantidadeCartas);
    return;
  }

  try {
    btnEntrar.disabled = true;
    mostrarCarregando('Entrando no jogo...');

    const dados = await chamarApi('/api/entrar', { codigo });

    salvarEstado(codigo, {
      usuario: dados.usuario,
      quantidadeCartas: dados.quantidadeCartas,
      entrouEm: dados.entrouEm || new Date().toISOString(),
      finalizado: dados.finalizado || false,
      premio: dados.premio || undefined,
      cartaEscolhida: dados.cartaEscolhida || undefined,
      sorteadoEm: dados.sorteadoEm || undefined,
    });

    abrirJogo(dados.usuario, dados.quantidadeCartas);
  } catch (erro) {
    erroLogin.innerText = erro.message;
  } finally {
    btnEntrar.disabled = false;
    esconderCarregando();
  }
});

async function virarCarta(cartaClicada) {
  if (!jogoAtivo || !usuarioAtual || cartaClicada.classList.contains('virada')) return;

  jogoAtivo = false;
  tabuleiro.classList.add('bloqueado');
  cartaClicada.classList.add('virada');

  const textoPremio = cartaClicada.querySelector('.premio-texto');
  textoPremio.innerText = 'Registrando...';
  mensagem.innerText = '';

  try {
    mostrarCarregando('Registrando sua carta...');

    const dados = await chamarApi('/api/sortear', {
      codigo: usuarioAtual.codigo,
      cartaEscolhida: cartaClicada.dataset.carta,
    });

    textoPremio.innerText = dados.premio;
    mensagem.innerText = `Parabéns, ${dados.usuario.nome}! Você ganhou: ${dados.premio}`;

    salvarEstado(usuarioAtual.codigo, {
      usuario: dados.usuario,
      quantidadeCartas,
      finalizado: true,
      premio: dados.premio,
      cartaEscolhida: cartaClicada.dataset.carta,
      sorteadoEm: new Date().toISOString(),
    });
  } catch (erro) {
    textoPremio.innerText = 'Erro ao registrar';
    mensagem.innerText = erro.message;
  } finally {
    esconderCarregando();
  }
}

btnTrocarUsuario.addEventListener('click', () => {
  usuarioAtual = null;
  jogoAtivo = false;
  codigoUsuario.value = '';
  erroLogin.innerText = '';
  mensagem.innerText = '';
  tabuleiro.innerHTML = '';
  painelJogo.classList.add('escondido');
  painelLogin.classList.remove('escondido');
  codigoUsuario.focus();
});

window.addEventListener('load', () => {
  const ultimoCodigo = localStorage.getItem('ponto-amigo-ultimo-codigo');
  const estado = ultimoCodigo ? carregarEstado(ultimoCodigo) : null;

  if (estado && estado.usuario) {
    abrirJogo(estado.usuario, estado.quantidadeCartas || quantidadeCartas);
  }
});
