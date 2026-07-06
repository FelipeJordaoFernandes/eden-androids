const footerLinks = [
  'Política de uso',
  'Garantia sintética',
  'Suporte técnico',
  'Ética e segurança',
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <strong>Eden Androids</strong>
          <p>
            Tecnologia sintética premium para ambientes domésticos,
            profissionais e empresariais.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Links institucionais">
          {footerLinks.map((link) => (
            <a href="#" key={link} className="footer-link">
              {link}
            </a>
          ))}
        </nav>

        <p className="footer-copy">
          Copyright 2026 Eden Androids. Todos os direitos fictícios reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
