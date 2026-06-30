const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = Number(process.env.PORT || 3000);
const raiz = __dirname;

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

function criarRespostaVercelLike(res) {
  return {
    setHeader: (...args) => res.setHeader(...args),
    status: (codigo) => {
      res.statusCode = codigo;
      return {
        json: (payload) => {
          if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify(payload));
        },
      };
    },
    end: (...args) => res.end(...args),
    get statusCode() {
      return res.statusCode;
    },
    set statusCode(valor) {
      res.statusCode = valor;
    },
  };
}

async function chamarApi(req, res, nomeArquivo) {
  try {
    const handler = require(path.join(raiz, 'api', nomeArquivo));
    await handler(req, criarRespostaVercelLike(res));
  } catch (erro) {
    console.error(erro);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, erro: 'Erro interno no servidor local.' }));
  }
}

function servirArquivo(res, caminhoArquivo) {
  fs.readFile(caminhoArquivo, (erro, conteudo) => {
    if (erro) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Arquivo não encontrado.');
      return;
    }

    const ext = path.extname(caminhoArquivo).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', tipos[ext] || 'application/octet-stream');
    res.end(conteudo);
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${porta}`);

  if (url.pathname === '/api/entrar') {
    return chamarApi(req, res, 'entrar.js');
  }

  if (url.pathname === '/api/sortear') {
    return chamarApi(req, res, 'sortear.js');
  }

  let caminhoRelativo = decodeURIComponent(url.pathname);

  if (caminhoRelativo === '/') caminhoRelativo = '/index.html';

  const caminhoFinal = path.normalize(path.join(raiz, caminhoRelativo));

  if (!caminhoFinal.startsWith(raiz) || caminhoFinal.includes(`${path.sep}api${path.sep}`)) {
    res.statusCode = 403;
    res.end('Acesso negado.');
    return;
  }

  servirArquivo(res, caminhoFinal);
});

servidor.listen(porta, () => {
  console.log('=================================================');
  console.log('TIROU GANHOU DA PONTO AMIGO - SERVIDOR LOCAL');
  console.log(`Acesse: http://localhost:${porta}`);
  console.log('Para parar: CTRL + C');
  console.log('=================================================');
});
