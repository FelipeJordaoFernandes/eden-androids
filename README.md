# Eden Androids

Eden Androids é uma plataforma fictícia de e-commerce especializada na venda de androides para uso doméstico, profissional e empresarial.

## Objetivo do Projeto

O projeto foi criado para estudo prático e portfólio, com foco em desenvolvimento front-end usando React. A proposta é evoluir gradualmente conceitos como componentização, rotas, layout responsivo, catálogo de produtos, filtros, página dinâmica de detalhes, carrinho fictício e, futuramente, integração com back-end.

## Status do Projeto

### Concluído

- [x] Criação do projeto com React + Vite
- [x] Configuração de rotas com React Router
- [x] Estrutura inicial de páginas
- [x] Header e Footer
- [x] Identidade visual inicial
- [x] Home/Landing page premium
- [x] Catálogo de produtos
- [x] Dados locais em `src/data/products.js`
- [x] Catálogo expandido com 24 androides fictícios
- [x] Categorias principais
- [x] Tipos/subcategorias
- [x] Especialidades por produto
- [x] ProductCard
- [x] Busca por nome, linha, categoria, tipo e especialidade
- [x] Filtros por categoria e tipo/subcategoria
- [x] Página dinâmica de detalhes via `/product/:id`
- [x] Tela de produto não encontrado

### Pendente

- [ ] Carrinho fictício
- [ ] Persistência com localStorage
- [ ] Checkout fictício
- [ ] Área do cliente
- [ ] Painel administrativo funcional
- [ ] Login/cadastro
- [ ] API
- [ ] Back-end
- [ ] Banco de dados

## Funcionalidades Atuais

- Navegação entre páginas com React Router.
- Layout base com Header e Footer.
- Home em formato de landing page premium.
- Catálogo com 24 androides fictícios.
- Produtos organizados por categoria principal, tipo/subcategoria e especialidade.
- Busca textual por nome, linha, categoria, tipo e especialidade.
- Filtro por categoria.
- Filtro dinâmico por tipo/subcategoria.
- Cards de produto com preço, categoria, tipo, especialidade, autonomia, bateria e avaliação.
- Página dinâmica de detalhes para cada produto.
- Estado visual para produto não encontrado.

## Estrutura de Dados dos Produtos

Os produtos ficam em `src/data/products.js` e usam dados locais em JavaScript. Cada item possui campos como:

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

Os campos `category`, `type`, `specialty` e `modelCode` permitem organizar o catálogo de forma mais rica:

- `category`: categoria principal, como Doméstico, Segurança ou Corporativo.
- `type`: tipo ou subcategoria, como Babá, Porteiro ou Assistente executivo.
- `specialty`: descrição da especialidade operacional do androide.
- `modelCode`: código fictício do modelo.

## Tecnologias Utilizadas

- React
- Vite
- JavaScript
- React Router DOM
- CSS

## Funcionalidades Planejadas por MVP

### MVP 1 — Front-end

- [x] Home
- [x] Catálogo
- [x] Página de detalhes
- [x] Busca e filtros iniciais
- [x] Layout responsivo inicial
- [ ] Carrinho fictício

### MVP 2 — Dados

- [x] Produtos vindos de arquivo local JavaScript
- [x] Catálogo expandido com categorias, tipos e especialidades
- [x] Busca por múltiplos campos
- [ ] Carrinho persistindo no localStorage
- [ ] Produtos vindos de JSON externo ou API

### MVP 3 — Back-end

- [ ] Node.js/Express ou Java Spring
- [ ] PostgreSQL
- [ ] Cadastro/login
- [ ] Pedidos
- [ ] Painel administrativo funcional

### MVP 4 — Funcionalidades avançadas

- [ ] Dashboard administrativo
- [ ] Upload de imagem
- [ ] Status de pedido
- [ ] Avaliações
- [ ] Recomendação de produto
- [ ] Simulação de financiamento/assinatura
- [ ] Chatbot de atendimento

## Próximas Etapas

- Criar carrinho fictício sem integração com pagamento real.
- Adicionar persistência do carrinho com localStorage.
- Criar checkout fictício.
- Melhorar a área de detalhes dos produtos com imagens reais ou geradas.
- Evoluir a área do cliente.
- Planejar o painel administrativo funcional.
- Futuramente estudar integração com API, back-end e banco de dados.

## Como Rodar o Projeto Localmente

```bash
git clone https://github.com/FelipeJordaoFernandes/eden-androids.git
cd eden-androids
npm install
npm run dev
```

Depois de iniciar o servidor de desenvolvimento, acesse a URL exibida no terminal.

## Estrutura Inicial de Pastas

```text
src/
├── components/
├── pages/
├── routes/
├── data/
└── utils/
```

## Aviso

Este projeto é fictício e foi criado para fins de estudo e portfólio. Ele não utiliza nomes, marcas ou personagens oficiais de franquias existentes.

## Autor

Desenvolvido por Felipe Jordão Fernandes.
