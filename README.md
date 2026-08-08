# Eden Androids

Eden Androids é um e-commerce fictício que simula uma plataforma premium de venda de androides humanoides para residências, empresas e operações especializadas. Desenvolvido com React e Vite, o projeto foi criado para estudo, experimentação e portfólio em desenvolvimento front-end.

## Funcionalidades atuais

- [x] Estrutura do projeto com React e Vite
- [x] Rotas com React Router DOM
- [x] Header e Footer reutilizáveis
- [x] Home em formato de landing page
- [x] Hero visual com painel de imagem e conteúdo responsivo
- [x] Catálogo com 24 androides fictícios
- [x] Dados locais centralizados em `src/data/products.js`
- [x] Organização por categorias, tipos/subcategorias e especialidades
- [x] Busca por nome, linha, categoria, tipo e especialidade
- [x] Filtros dinâmicos por categoria e tipo
- [x] Cards reutilizáveis para os produtos
- [x] Páginas de detalhes dinâmicas em `/product/:id`
- [x] Estado específico para produto não encontrado
- [x] Página de detalhes posicionada no topo a cada mudança de produto
- [x] Preservação nativa da posição do catálogo ao retornar pelo histórico do navegador
- [x] Layout responsivo para mobile, tablet e desktop
- [x] Navegação responsiva com drawer no mobile
- [x] Identidade visual e sistema de design baseados em variáveis CSS
- [x] Google Fonts: Space Grotesk e Inter
- [x] BrandLogo em SVG e favicon personalizado
- [x] Imagens próprias e otimizadas para os 24 produtos do catálogo
- [x] Acessibilidade básica de navegação, controle de foco e uso por teclado
- [x] Carrinho funcional com Context API, `useReducer`, hook `useCart` e persistência segura no `localStorage`
- [x] Integração entre detalhes e carrinho, com controle de quantidade, limite de estoque, remoção individual e limpeza completa
- [x] Garantias adicionais e cálculo de subtotal, garantias e total do pedido
- [x] Contador dinâmico no Header e no drawer, página de carrinho vazia ou preenchida e resumo responsivo e acessível
- [x] Checkout com dados do cliente, endereço, opções de entrega e pagamento
- [x] Parcelamento por cartão de 1x a 10x sem juros, recalculado pelo total do pedido
- [x] Validação de e-mail, telefone com DDD e CPF com dígitos verificadores
- [x] Consulta automática de CEP, preenchimento do endereço com ViaCEP e cálculo de frete após o endereço completo
- [x] Confirmação do pedido com resumo financeiro e número de identificação
- [x] Histórico local dos 20 pedidos mais recentes
- [x] Consulta do histórico em `/orders` e dos detalhes em `/orders/:orderNumber`
- [x] Página acessível de rota não encontrada para endereços inválidos
- [x] Testes automatizados para checkout, carrinho, pedidos, validações, cálculos e rotas
- [x] Versão pública implantada na Vercel

## Catálogo e dados dos produtos

Os 24 produtos são mantidos localmente em `src/data/products.js`. Cada item possui campos como:

- `id`
- `name`
- `line`
- `category`
- `type`
- `specialty`
- `modelCode`
- `price`
- `stock`
- `rating`
- `reviews`
- `autonomyLevel`
- `battery`
- `warranty`
- `image`
- `shortDescription`
- `description`
- `functions`
- `specs`
- `ethicalNotice`

Os campos `category`, `type`, `specialty` e `modelCode` permitem organizar e pesquisar o catálogo por diferentes características operacionais de cada androide:

- `category`: categoria principal, como Doméstico, Segurança ou Corporativo;
- `type`: tipo ou subcategoria, como Babá, Porteiro ou Assistente executivo;
- `specialty`: descrição da especialidade operacional do androide;
- `modelCode`: código fictício do modelo.

## Carrinho e persistência

O estado global do carrinho é gerenciado com Context API e `useReducer`, enquanto o hook personalizado `useCart` centraliza o acesso às operações e aos valores calculados.

Os dados são persistidos no `localStorage` com a chave `eden-androids:cart:v1`. Apenas `productId`, `quantity` e `warranty` são armazenados; nomes, preços, imagens, estoque e demais informações continuam vindo de `src/data/products.js`.

A recuperação dos dados valida o formato armazenado, descarta registros inválidos e produtos inexistentes e limita quantidades ao estoque atual. Se o `localStorage` estiver indisponível, o carrinho continua funcionando em memória durante a sessão.

As opções de garantia são:

- padrão, sem custo adicional;
- +12 meses, com acréscimo de 6%;
- +24 meses, com acréscimo de 10%.

Atualmente, o usuário pode explorar o catálogo, abrir os detalhes de um produto, adicionar androides ao carrinho, alterar quantidades, selecionar garantias e visualizar o resumo financeiro. O carrinho permanece salvo no navegador. No checkout, é possível preencher dados do cliente e da entrega, calcular o frete, escolher uma forma de pagamento, parcelar o cartão de 1x a 10x sem juros e gerar um número de pedido. Os valores das parcelas acompanham o total atual do pedido. Nenhum pagamento real é processado.

## Organização do checkout

O checkout é organizado por responsabilidade dentro de `src/pages/Checkout`:

- `components/`: cabeçalho, dados do cliente, entrega, pagamento, resumo e estados vazio/confirmado;
- `hooks/`: controlador do fluxo, estado do formulário, foco e coordenação das etapas;
- `services/`: integração isolada com o ViaCEP;
- `utils/`: máscaras, validações e criação/cálculo do pedido;
- `checkoutConfig.js`: opções e campos compartilhados;
- arquivos CSS separados para formulário, resumo e estados finais.

As regras puras do carrinho ficam em `src/context/cartState.js`, enquanto o `CartContext.jsx` permanece responsável por integrar essas regras ao React e ao `localStorage`.

## Histórico local de pedidos

Ao concluir o checkout, a aplicação salva uma fotografia dos dados essenciais do pedido antes de limpar o carrinho. A leitura, validação, gravação e busca ficam centralizadas em `src/services/orderStorage.js`, usando a chave versionada `eden-androids:orders:v1`.

O histórico mantém no máximo os 20 pedidos mais recentes e está disponível em `/orders`. Cada pedido pode ser aberto diretamente em `/orders/:orderNumber`, inclusive depois de recarregar a página. A confirmação também pode ser recuperada por sua URL enquanto o registro continuar salvo. Números repetidos não geram novos registros, e conteúdo ausente, corrompido ou de versão incompatível é ignorado sem interromper a aplicação.

São persistidos somente número e data do pedido, itens, garantia, totais, entrega, forma genérica de pagamento e, quando disponível, cidade e estado. CPF, telefone, e-mail, dados de cartão e endereço completo não são armazenados. Os registros existem apenas no `localStorage` do navegador e dispositivo atuais; limpar os dados do site remove o histórico.

## Identidade visual

A interface adota uma estética futurista premium, com foco em tecnologia avançada e proximidade social:

- fundo azul-marinho quase preto;
- detalhes em ciano, azul e verde;
- Space Grotesk nos títulos;
- Inter nos textos e elementos de interface;
- androides humanoides realistas e socialmente acolhedores;
- componentes, cores, espaçamentos, superfícies e estados definidos por variáveis CSS.

## Tecnologias utilizadas

- React, incluindo Context API e `useReducer`
- Vite
- JavaScript
- React Router DOM
- CSS
- Web Storage API (`localStorage`)
- Vitest, jsdom e React Testing Library
- Google Fonts
- Git e GitHub
- Vercel

## Estrutura de pastas

```text
src/
├── components/
│   ├── BrandLogo/
│   ├── CartItem/
│   ├── Footer/
│   ├── Header/
│   ├── ProductCard/
│   └── ProductFilters/
├── context/
│   ├── CartContext.jsx
│   ├── cartContext.js
│   ├── cartConfig.js
│   └── cartState.js
├── hooks/
│   └── useCart.js
├── data/
├── pages/
│   ├── Checkout/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── NotFound/
│   └── Orders/
├── routes/
├── services/
├── test/
├── utils/
├── App.jsx
├── main.jsx
└── index.css

public/
├── images/
│   ├── backgrounds/
│   ├── products/
│   └── brand/
└── favicon.svg
```

## Roadmap

### MVP 1 — Front-end

- [x] Home
- [x] Catálogo
- [x] Páginas de detalhes
- [x] Busca
- [x] Filtros por categoria e tipo
- [x] Responsividade para mobile, tablet e desktop
- [x] Carrinho funcional
- [x] Checkout local

### MVP 2 — Dados e experiência local

- [x] Produtos mantidos em arquivo JavaScript local
- [x] Catálogo com 24 produtos, categorias, tipos e especialidades
- [ ] Filtros avançados — parcialmente concluídos com busca e filtros dinâmicos atuais
- [x] Persistência segura do carrinho com `localStorage`
- [x] Persistência e histórico local de pedidos
- [ ] Imagens para os demais produtos

### MVP 3 — Back-end

- [ ] Back-end — tecnologia ainda a definir entre as opções planejadas, como Node.js/Express ou Java Spring
- [ ] API
- [ ] Banco de dados — PostgreSQL permanece como opção planejada
- [ ] Login e cadastro funcionais
- [ ] Pedidos integrados
- [ ] Painel administrativo funcional

### MVP 4 — Funcionalidades avançadas

- [ ] Favoritos
- [ ] Área do cliente
- [ ] Avaliações
- [ ] Dashboard administrativo
- [ ] Upload de imagens
- [ ] Acompanhamento de pedidos
- [ ] Recomendações de produtos
- [ ] Simulação de financiamento ou assinatura
- [ ] Chatbot de atendimento

### Publicação

- [x] Deploy na Vercel

O projeto possui uma versão pública implantada na Vercel e recebe atualizações conforme a aplicação evolui.

## Próximas etapas

- [x] Checkout funcional
- [x] Formulário de dados do cliente
- [x] Endereço de entrega
- [x] Cálculo de frete
- [x] Forma de pagamento
- [x] Geração de número de pedido
- [x] Histórico e detalhes locais de pedidos
- [ ] Imagens para os demais androides
- [ ] Favoritos
- [ ] Login e cadastro
- [ ] Área do cliente
- [ ] Painel administrativo funcional
- [ ] API
- [ ] Back-end
- [ ] Banco de dados

## Como rodar o projeto localmente

```bash
git clone https://github.com/FelipeJordaoFernandes/eden-androids.git
cd eden-androids
npm install
npm run dev
```

Depois de iniciar o servidor de desenvolvimento, acesse a URL exibida no terminal.

## Testes automatizados

Para executar toda a suíte uma vez:

```bash
npm test
```

Para manter o Vitest observando alterações durante o desenvolvimento:

```bash
npm run test:watch
```

Os testes cobrem máscaras e validações, regras e persistência do carrinho, cálculos financeiros, parcelamento de 1x a 10x, integração simulada com o ViaCEP, estados essenciais do checkout, armazenamento seguro dos pedidos, histórico, detalhes e rotas públicas. As consultas de CEP são simuladas e não dependem de acesso à internet.

Para executar a validação completa do projeto:

```bash
npm test
npm run lint
npm run build
git diff --check
```

## Aviso legal

Este é um projeto fictício, criado exclusivamente para estudo e portfólio. A Eden Androids não representa uma empresa real e não utiliza nomes, personagens ou marcas oficiais de franquias existentes. Todos os produtos, preços e processos de compra apresentados são simulações e não envolvem transações reais.

## Autor

Felipe Jordão Fernandes
