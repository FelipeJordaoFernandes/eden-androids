import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  const titleRef = useRef(null)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <span className="eyebrow not-found-eyebrow">Erro 404</span>
      <span className="not-found-code" aria-hidden="true">404</span>
      <h1 id="not-found-title" ref={titleRef} tabIndex={-1}>
        Página não encontrada.
      </h1>
      <p>
        O endereço informado não corresponde a uma área disponível da Eden
        Androids.
      </p>
      <div className="not-found-actions">
        <Link className="button button-primary" to="/">
          Voltar para a home
        </Link>
        <Link className="button button-ghost" to="/catalog">
          Explorar catálogo
        </Link>
      </div>
    </section>
  )
}

export default NotFound
