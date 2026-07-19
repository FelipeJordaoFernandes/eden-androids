import { Link } from 'react-router-dom'
import { products } from '../../data/products.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './Home.css'

const categories = [
  {
    name: 'Doméstico',
    description: 'Rotinas inteligentes para casas conectadas e famílias modernas.',
  },
  {
    name: 'Segurança',
    description: 'Monitoramento preventivo com protocolos de contenção não letal.',
  },
  {
    name: 'Assistência Médica',
    description: 'Apoio clínico supervisionado para cuidado, mobilidade e triagem.',
  },
  {
    name: 'Educação',
    description: 'Tutoria adaptativa para escolas, laboratórios e aprendizado pessoal.',
  },
  {
    name: 'Companhia',
    description: 'Interação social calibrada para presença, escuta e bem-estar.',
  },
  {
    name: 'Industrial',
    description: 'Força operacional para linhas produtivas e ambientes críticos.',
  },
  {
    name: 'Luxo',
    description: 'Androides premium com acabamento refinado e concierge avançado.',
  },
  {
    name: 'Corporativo',
    description: 'Automação de equipes, recepção, logística e operações internas.',
  },
]

const featuredProductNames = [
  'Eden Home H-01',
  'Eden Sentinel S-20',
  'Eden Luxe L-99',
]

const featuredModels = products.filter((product) =>
  featuredProductNames.includes(product.name),
)

const benefits = [
  {
    title: 'Tecnologia adaptativa',
    description: 'Sistemas neurais ajustam comportamento, linguagem e tarefas ao contexto.',
  },
  {
    title: 'Segurança e privacidade',
    description: 'Camadas de proteção de dados, rastreabilidade e permissões granulares.',
  },
  {
    title: 'Suporte técnico especializado',
    description: 'Manutenção assistida por especialistas em hardware sintético e IA aplicada.',
  },
]

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="eyebrow home-eyebrow">Androides premium para um novo cotidiano</span>
          <h1>Precisão sintética para casas, equipes e operações críticas.</h1>
          <p>
            A Eden Androids conecta design humano, engenharia avançada e
            protocolos éticos para entregar androides preparados para ambientes
            domésticos, profissionais e empresariais.
          </p>

          <div className="home-actions">
            <Link className="button button-primary" to="/catalog">
              Explorar androides
            </Link>
            <Link className="button button-secondary" to="/about">
              Conhecer a Eden
            </Link>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-image-frame">
            <img
              src="/images/backgrounds/home-hero.png"
              alt="Showroom tecnológico da Eden Androids com androide em plataforma de apresentação"
              width="1672"
              height="941"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <aside
            className="home-tech-panel"
            aria-label="Destaque tecnológico Eden Neural Core"
          >
            <div className="tech-panel-orbit" aria-hidden="true">
              <span />
            </div>
            <div className="tech-panel-header">
              <span>Eden Neural Core</span>
              <strong>v4.8</strong>
            </div>
            <div className="tech-panel-status">
              <strong>99.98%</strong>
              <span>sincronia operacional</span>
            </div>
            <div className="tech-panel-grid">
              <span>Autonomia avançada</span>
              <span>Protocolos éticos</span>
              <span>Privacidade local</span>
              <span>Resposta adaptativa</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="eyebrow home-eyebrow">Categorias</span>
          <h2>Androides para cada ambiente</h2>
          <p>
            A linha Eden foi pensada para diferentes níveis de cuidado,
            presença, produtividade e segurança.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <span className="badge card-index">{category.name.slice(0, 2)}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="eyebrow home-eyebrow">Modelos em destaque</span>
          <h2>Primeiras unidades Eden</h2>
          <p>
            Três modelos selecionados do catálogo para apresentar as linhas Eden.
          </p>
        </div>

        <div className="featured-grid">
          {featuredModels.map((model) => (
            <article className="featured-card" key={model.id}>
              <div className="featured-visual">
                {model.image ? (
                  <img
                    src={model.image}
                    alt={`${model.name} — ${model.type}`}
                    width="1122"
                    height="1402"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span aria-hidden="true">{model.modelCode}</span>
                )}
              </div>
              <div className="featured-card-body">
                <div className="featured-meta">
                  <span className="badge">{model.category}</span>
                  <span className="badge badge-neutral">{model.type}</span>
                </div>
                <h3>{model.name}</h3>
                <strong>{formatCurrency(model.price)}</strong>
                <p>{model.shortDescription}</p>
                <Link className="inline-link details-link" to={`/product/${model.id}`}>
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section institution-section">
        <div className="section-heading">
          <span className="eyebrow home-eyebrow">Institucional</span>
          <h2>Engenharia sintética com responsabilidade operacional</h2>
          <p>
            Trabalhamos com androides para residências, empresas e operações
            especializadas, combinando desempenho, rastreabilidade e suporte
            contínuo desde a implantação.
          </p>
        </div>

        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-item" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ethics-notice" aria-label="Aviso ético e legal">
        <span className="eyebrow home-eyebrow">Uso responsável</span>
        <h2>Protocolos éticos, segurança e rastreabilidade em primeiro lugar.</h2>
        <p>
          Todos os androides Eden seguem protocolos fictícios de segurança,
          privacidade, rastreabilidade e uso responsável. A operação de cada
          unidade deve respeitar limites legais, consentimento humano e auditoria
          técnica contínua.
        </p>
      </section>
    </div>
  )
}

export default Home
