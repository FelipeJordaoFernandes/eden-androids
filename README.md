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
- [x] Imagens para Eden Home H-01, Eden Sentinel S-20 e Eden Luxury L-99
- [x] Placeholders para produtos que ainda não possuem imagem
- [x] Acessibilidade básica de navegação, controle de foco e uso por teclado

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

## Identidade visual

A interface adota uma estética futurista premium, com foco em tecnologia avançada e proximidade social:

- fundo azul-marinho quase preto;
- detalhes em ciano, azul e verde;
- Space Grotesk nos títulos;
- Inter nos textos e elementos de interface;
- androides humanoides realistas e socialmente acolhedores;
- componentes, cores, espaçamentos, superfícies e estados definidos por variáveis CSS.

## Tecnologias utilizadas

- React
- Vite
- JavaScript
- React Router DOM
- CSS
- Google Fonts
- Git e GitHub

## Estrutura de pastas

```text
src/
├── components/
│   ├── BrandLogo/
│   ├── Header/
│   ├── Footer/
│   ├── ProductCard/
│   └── ProductFilters/
├── data/
├── pages/
├── routes/
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
- [ ] Carrinho funcional
- [ ] Checkout fictício

### MVP 2 — Dados e experiência local

- [x] Produtos mantidos em arquivo JavaScript local
- [x] Catálogo com 24 produtos, categorias, tipos e especialidades
- [ ] Filtros avançados — parcialmente concluídos com busca e filtros dinâmicos atuais
- [ ] Persistência com `localStorage`
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

- [ ] Deploy na Vercel

## Como rodar o projeto localmente

```bash
git clone https://github.com/FelipeJordaoFernandes/eden-androids.git
cd eden-androids
npm install
npm run dev
```

Depois de iniciar o servidor de desenvolvimento, acesse a URL exibida no terminal.

Para gerar a versão de produção e verificar a qualidade do código:

```bash
npm run build
npm run lint
```

## Aviso legal

Este é um projeto fictício, criado exclusivamente para estudo e portfólio. A Eden Androids não representa uma empresa real e não utiliza nomes, personagens ou marcas oficiais de franquias existentes. Todos os produtos, preços e processos de compra apresentados são simulações e não envolvem transações reais.

## Autor

Felipe Jordão Fernandes
