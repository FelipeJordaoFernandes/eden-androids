import './About.css'

const companyMilestones = [
  {
    year: '2016',
    title: 'Fundação da Eden',
    description:
      'A empresa nasce em Londrina com a missão de aproximar robótica e vida cotidiana.',
  },
  {
    year: '2019',
    title: 'Primeiro protótipo',
    description: 'A arquitetura Eden alcança sua primeira versão humanoide funcional.',
  },
  {
    year: '2021',
    title: 'Eden Home H-01',
    description: 'O primeiro modelo de convivência é apresentado ao público.',
  },
  {
    year: '2023',
    title: 'Novas missões',
    description:
      'A plataforma avança para saúde, segurança, educação, indústria e empresas.',
  },
  {
    year: '2026',
    title: '24 modelos',
    description:
      'A Eden consolida um catálogo especializado sem abandonar seus princípios de origem.',
  },
]

const companyValues = [
  {
    title: 'Tecnologia responsável',
    description:
      'Inovação acompanhada de limites claros, supervisão e propósito humano.',
  },
  {
    title: 'Segurança por princípio',
    description:
      'Proteção de pessoas, ambientes e informações desde a primeira decisão de projeto.',
  },
  {
    title: 'Design para convivência',
    description:
      'Androides desenvolvidos para colaborar de forma compreensível, natural e respeitosa.',
  },
  {
    title: 'Progresso humano',
    description:
      'Tecnologia aplicada para ampliar autonomia, capacidade e qualidade de vida.',
  },
]

function About() {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <header className="about-hero">
        <span className="eyebrow about-eyebrow">Nossa história</span>
        <h1 id="about-title">Tecnologia criada para conviver.</h1>
        <p className="about-hero-copy">
          A Eden nasceu da ideia de que a robótica avançada deveria ampliar as
          capacidades humanas sem substituir aquilo que nos torna humanos.
        </p>

        <dl className="about-facts" aria-label="Informações sobre a Eden Androids">
          <div>
            <dt>Fundação</dt>
            <dd>2016</dd>
          </div>
          <div>
            <dt>Origem</dt>
            <dd>Londrina, Paraná</dd>
          </div>
          <div>
            <dt>Fundador</dt>
            <dd>Felipe Jordão Fernandes</dd>
          </div>
        </dl>
      </header>

      <div className="about-story" aria-label="Trajetória da Eden Androids">
        <article className="about-chapter about-chapter-text-first">
          <figure className="about-chapter-visual">
            <img
              src="/images/about/eden-founder-felipe-jordao.webp"
              alt="Felipe Jordão Fernandes ao lado de um protótipo no primeiro laboratório da Eden"
              width="1448"
              height="1086"
            />
          </figure>
          <div className="about-chapter-copy">
            <span className="eyebrow">2016 · Origem</span>
            <h2>Uma ideia além da automação</h2>
            <p>
              Em Londrina, Felipe Jordão Fernandes fundou a Eden a partir de
              uma convicção: a robótica não deveria permanecer restrita às
              linhas industriais. Ela poderia apoiar pessoas, compreender
              ambientes e assumir tarefas complexas com responsabilidade.
            </p>
            <div className="about-founder">
              <strong>Felipe Jordão Fernandes</strong>
              <span>Fundador e idealizador da Eden Androids</span>
            </div>
          </div>
        </article>

        <article className="about-chapter">
          <figure className="about-chapter-visual">
            <img
              src="/images/about/eden-first-prototype.webp"
              alt="Primeiro protótipo humanoide funcional sendo desenvolvido no laboratório da Eden"
              width="1448"
              height="1086"
              loading="lazy"
            />
          </figure>
          <div className="about-chapter-copy">
            <span className="eyebrow">2019 · Primeiro protótipo</span>
            <h2>O nascimento da tecnologia Eden</h2>
            <p>
              Depois de três anos de pesquisa, a equipe concluiu a primeira
              arquitetura humanoide funcional da Eden. Percepção ambiental,
              aprendizado adaptativo e protocolos éticos passaram a operar
              como partes de um único sistema preparado para conviver.
            </p>
          </div>
        </article>

        <article className="about-chapter about-chapter-text-first">
          <figure className="about-chapter-visual">
            <img
              src="/images/about/eden-platform-expansion.webp"
              alt="Três androides especializados em validação para diferentes ambientes"
              width="1448"
              height="1086"
              loading="lazy"
            />
          </figure>
          <div className="about-chapter-copy">
            <span className="eyebrow">2023 · Expansão</span>
            <h2>Uma plataforma, diferentes missões</h2>
            <p>
              A experiência iniciada com o Eden Home H-01 permitiu levar a
              plataforma para saúde, segurança, educação, indústria e
              ambientes corporativos. Cada modelo passou a nascer de sua
              função, compartilhando a mesma base de segurança e supervisão.
            </p>
          </div>
        </article>

        <article className="about-chapter">
          <figure className="about-chapter-visual">
            <img
              src="/images/about/eden-headquarters-londrina.webp"
              alt="Sede contemporânea da Eden Androids cercada por áreas verdes em Londrina"
              width="1448"
              height="1086"
              loading="lazy"
            />
          </figure>
          <div className="about-chapter-copy">
            <span className="eyebrow">2026 · Hoje</span>
            <h2>O próximo capítulo</h2>
            <p>
              Com 24 modelos especializados, a Eden continua pesquisando novas
              formas de cooperação entre pessoas e sistemas sintéticos. O
              objetivo permanece o mesmo desde o início: transformar
              tecnologia avançada em presença útil, segura e confiável.
            </p>
          </div>
        </article>
      </div>

      <section className="about-timeline" aria-labelledby="timeline-title">
        <div className="about-section-heading">
          <span className="eyebrow">Marcos</span>
          <h2 id="timeline-title">Uma trajetória construída por etapas.</h2>
        </div>
        <ol>
          {companyMilestones.map((milestone) => (
            <li key={milestone.year}>
              <time dateTime={milestone.year}>{milestone.year}</time>
              <div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-values" aria-labelledby="values-title">
        <div className="about-section-heading">
          <span className="eyebrow">Princípios Eden</span>
          <h2 id="values-title">Valores que acompanham cada avanço.</h2>
        </div>
        <div className="about-values-grid">
          {companyValues.map((value) => (
            <article key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default About
