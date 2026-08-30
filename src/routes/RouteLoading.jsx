function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-indicator" aria-hidden="true" />
      <span>Carregando página…</span>
    </div>
  )
}

export default RouteLoading
