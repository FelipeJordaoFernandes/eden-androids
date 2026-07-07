import { Link } from 'react-router-dom'
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

const featuredModels = [
  {
    id: 1,
    name: 'Eden H-01',
    category: 'Doméstico',
    price: 'R$ 48.900',
    description: 'Assistente residencial para organização, conforto e rotina familiar.',
  },
  {
    id: 2,
    name: 'Eden S-20',
    category: 'Segurança',
    price: 'R$ 92.500',
    description: 'Unidade tática preventiva para ambientes privados e empresariais.',
  },
  {
    id: 3,
    name: 'Eden L-99',
    category: 'Luxo',
    price: 'R$ 186.000',
    description: 'Modelo executivo com interação social refinada e acabamento premium.',
  },
]

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
          <span className="home-eyebrow">Androides premium para um novo cotidiano</span>
          <h1>Precisão sintética para casas, equipes e operações críticas.</h1>
          <p>
            A Eden Androids conecta design humano, engenharia avançada e
            protocolos éticos para entregar androides preparados para ambientes
            domésticos, profissionais e empresariais.
          </p>

          <div className="home-actions">
            <Link className="home-button home-button-primary" to="/catalog">
              Explorar androides
            </Link>
            <Link className="home-button home-button-secondary" to="/about">
              Conhecer a Eden
            </Link>
          </div>
        </div>

        <aside className="home-tech-panel" aria-label="Destaque tecnológico Eden Neural Core">
          <div className="tech-panel-orbit">
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
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="home-eyebrow">Categorias</span>
          <h2>Androides para cada ambiente</h2>
          <p>
            A linha Eden foi pensada para diferentes níveis de cuidado,
            presença, produtividade e segurança.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <span className="card-index">{category.name.slice(0, 2)}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="home-eyebrow">Modelos em destaque</span>
          <h2>Primeiras unidades Eden</h2>
          <p>
            Três modelos estáticos para iniciar a experiência visual do catálogo.
          </p>
        </div>

        <div className="featured-grid">
          {featuredModels.map((model) => (
            <article className="featured-card" key={model.id}>
              <span className="model-category">{model.category}</span>
              <h3>{model.name}</h3>
              <strong>{model.price}</strong>
              <p>{model.description}</p>
              <Link className="details-link" to={`/product/${model.id}`}>
                Ver detalhes
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section institution-section">
        <div className="section-heading">
          <span className="home-eyebrow">Institucional</span>
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
        <span className="home-eyebrow">Uso responsável</span>
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
