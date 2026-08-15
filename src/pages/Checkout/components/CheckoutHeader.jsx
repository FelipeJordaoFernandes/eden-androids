function CheckoutHeader({ titleRef }) {
  return (
    <header className="checkout-header">
      <span className="eyebrow checkout-eyebrow">Checkout Eden</span>
      <h1 id="checkout-title" ref={titleRef} tabIndex={-1}>
        Prepare sua unidade Eden.
      </h1>
      <p>
        Selecione entrega e pagamento para concluir o pedido com sua conta local.
      </p>
      <ol className="checkout-progress" aria-label="Etapas do checkout">
        <li><span>01</span> Entrega</li>
        <li><span>02</span> Pagamento</li>
      </ol>
    </header>
  )
}

export default CheckoutHeader
