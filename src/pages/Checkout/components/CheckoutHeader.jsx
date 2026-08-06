function CheckoutHeader({ titleRef }) {
  return (
    <header className="checkout-header">
      <span className="eyebrow checkout-eyebrow">Checkout demonstrativo</span>
      <h1 id="checkout-title" ref={titleRef} tabIndex={-1}>
        Prepare sua unidade Eden.
      </h1>
      <p>
        Complete os dados abaixo para simular a entrega e a ativação dos
        androides selecionados.
      </p>
      <ol className="checkout-progress" aria-label="Etapas do checkout">
        <li><span>01</span> Identificação</li>
        <li><span>02</span> Entrega</li>
        <li><span>03</span> Pagamento</li>
      </ol>
    </header>
  )
}

export default CheckoutHeader
