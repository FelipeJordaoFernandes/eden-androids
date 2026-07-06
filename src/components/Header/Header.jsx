import { NavLink } from 'react-router-dom'

const navigationLinks = [
  { path: '/', label: 'Home' },
  { path: '/catalog', label: 'Catálogo' },
  { path: '/about', label: 'Sobre' },
  { path: '/cart', label: 'Carrinho', isCart: true },
  { path: '/admin', label: 'Admin' },
]

function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <NavLink to="/" className="brand-logo" aria-label="Eden Androids Home">
          Eden Androids
        </NavLink>

        <nav className="main-nav" aria-label="Navegação principal">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}${
                  link.isCart ? ' cart-link' : ''
                }`
              }
            >
              <span>{link.label}</span>
              {link.isCart && <span className="cart-marker" aria-hidden="true" />}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
