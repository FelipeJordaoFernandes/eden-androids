import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import useCart from '../../hooks/useCart.js'
import BrandLogo from '../BrandLogo/BrandLogo.jsx'
import './Header.css'

const navigationLinks = [
  { path: '/', label: 'Home' },
  { path: '/catalog', label: 'Catálogo' },
  { path: '/about', label: 'Sobre' },
  { path: '/cart', label: 'Carrinho', isCart: true },
  { path: '/admin', label: 'Admin' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const menuButtonRef = useRef(null)
  const { totalItems } = useCart()
  const visibleCartCount = totalItems > 99 ? '99+' : String(totalItems)
  const cartAriaLabel = `Carrinho, ${totalItems} ${
    totalItems === 1 ? 'item' : 'itens'
  }`

  function closeMenu() {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia('(min-width: 901px)')

    function handleDesktopChange(event) {
      if (event.matches) closeMenu()
    }

    desktopMediaQuery.addEventListener('change', handleDesktopChange)

    return () => {
      desktopMediaQuery.removeEventListener('change', handleDesktopChange)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const body = document.body
    const root = document.documentElement
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const previousRootOverflow = root.style.overflow
    const previouslyFocusedElement = document.activeElement
    const menuButton = menuButtonRef.current
    const scrollPosition = {
      left: window.scrollX,
      top: window.scrollY,
    }
    const scrollbarWidth = window.innerWidth - root.clientWidth
    const currentPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
    const hasStableScrollbarGutter =
      window.CSS?.supports?.('scrollbar-gutter: stable') &&
      window.getComputedStyle(root).scrollbarGutter.includes('stable')

    if (!hasStableScrollbarGutter && scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }

    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMenu()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        document.querySelectorAll(
          '#mobile-navigation-drawer button:not([disabled]), #mobile-navigation-drawer a[href]',
        ),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      root.style.overflow = previousRootOverflow
      document.removeEventListener('keydown', handleKeyDown)

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus({ preventScroll: true })
      } else {
        menuButton?.focus({ preventScroll: true })
      }

      window.scrollTo(scrollPosition.left, scrollPosition.top)
    }
  }, [isMenuOpen])

  return (
    <header className="site-header">
      <div className="header-container">
        <NavLink
          to="/"
          className="brand-home-link"
          aria-label="Eden Androids — início"
          onClick={closeMenu}
        >
          <BrandLogo size="lg" />
        </NavLink>

        <nav className="main-nav desktop-nav" aria-label="Navegação principal">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              aria-label={link.isCart ? cartAriaLabel : undefined}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}${
                  link.isCart ? ' cart-link' : ''
                }`
              }
            >
              <span>{link.label}</span>
              {link.isCart && totalItems > 0 && (
                <span className="cart-count" aria-hidden="true">
                  {visibleCartCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-label="Abrir menu principal"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setIsMenuOpen(true)}
        >
          <span className="menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <button
        className={`drawer-overlay${isMenuOpen ? ' drawer-overlay-open' : ''}`}
        type="button"
        aria-label="Fechar menu principal"
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <aside
        id="mobile-navigation-drawer"
        className={`mobile-drawer${isMenuOpen ? ' mobile-drawer-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!isMenuOpen}
      >
        <div className="drawer-header">
          <BrandLogo size="md" />
          <button
            ref={closeButtonRef}
            className="drawer-close"
            type="button"
            aria-label="Fechar menu principal"
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <span aria-hidden="true" />
          </button>
        </div>

        <nav className="drawer-nav" aria-label="Navegação móvel principal">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              aria-label={link.isCart ? cartAriaLabel : undefined}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}${
                  link.isCart ? ' cart-link' : ''
                }`
              }
            >
              <span>{link.label}</span>
              {link.isCart && totalItems > 0 && (
                <span className="cart-count" aria-hidden="true">
                  {visibleCartCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </header>
  )
}

export default Header
