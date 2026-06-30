# Tirou Ganhou da Ponto Amigo - Local + Vercel + AvisaAPI

Sistema simples de cartas com usuários definidos no código e aviso via WhatsApp usando AvisaAPI.

## O que ele faz

- Usuários definidos em `api/_config.js`.
- Prêmios definidos em `api/_config.js`.
- Quantidade de cartas aumenta automaticamente conforme a quantidade de prêmios ativos.
- Logo da Ponto Amigo no topo e nas cartas.
- Ao entrar no jogo, envia WhatsApp para o número configurado.
- Ao tirar carta, envia WhatsApp com nome, código, contato, carta escolhida, prêmio e horário.
- Em teste local, salva quem já participou em `dados/participacoes.json`.
- No mesmo navegador, também bloqueia com `localStorage`.

## Como configurar para teste local

Abra o arquivo:

```txt
api/_config.js
```

Coloque seu token aqui:

```js
avisaApiToken: 'SEU_TOKEN_AQUI',
```

Confira o número que vai receber os avisos:

```js
adminWhatsapp: '81993093150',
```

Se a AvisaAPI exigir DDI, use:

```js
adminWhatsapp: '5581993093150',
```

Se quiser testar sem enviar WhatsApp, deixe:

```js
enviarWhatsapp: false,
```

Nesse modo, a mensagem aparece apenas no terminal.

## Como editar usuários

No mesmo arquivo `api/_config.js`, edite:

```js
const USUARIOS = [
  {
    codigo: 'PA-001',
    nome: 'Participante 1',
    contato: '81999999999',
    ativo: true,
  },
];
```

Entregue o `codigo` para cada pessoa.

## Como editar prêmios

No arquivo `api/_config.js`, edite:

```js
const PREMIOS = [
  { nome: 'PIX DE R$ 20,00', ativo: true },
  { nome: 'PIX DE R$ 10,00', ativo: true },
];
```

Para adicionar mais cartas, adicione mais prêmios. Para desativar algum, coloque `ativo: false`.

## Como rodar na sua máquina

Precisa ter Node.js instalado.

Dentro da pasta do projeto, rode:

```bash
npm start
```

Depois abra:

```txt
http://localhost:3000
```

Códigos de teste iniciais:

```txt
PA-001
PA-002
PA-003
PA-004
```

## Onde ver quem participou no teste local

O servidor local cria este arquivo:

```txt
dados/participacoes.json
```

Ali fica salvo quem entrou, quem tirou carta e qual prêmio ganhou.

Para zerar os testes locais, apague esse arquivo:

```txt
dados/participacoes.json
```

E limpe o `localStorage` do navegador pelo console:

```js
localStorage.clear()
```

## Subir na Vercel

O projeto já está no formato compatível com Vercel.

Atenção: se você colocar o token direto no código e subir para um GitHub público, qualquer pessoa pode ver seu token. Para produção, use Environment Variables na Vercel:

```txt
AVISAAPI_TOKEN=seu_token
ADMIN_WHATSAPP=5581993093150
SORTEIO_SECRET=um_texto_grande_aleatorio
```

Sem banco de dados, a Vercel não consegue garantir bloqueio global 100% permanente. Localmente ele salva em arquivo. Na Vercel, para bloquear globalmente de verdade, seria necessário algum armazenamento externo. Mesmo assim, o sistema mantém o prêmio embaralhado por usuário/carta e bloqueia no navegador.
