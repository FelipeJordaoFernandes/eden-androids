function CheckoutSectionHeading({ description, number, title, titleId }) {
  return (
    <div className="checkout-panel-heading">
      <span aria-hidden="true">{number}</span>
      <div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default CheckoutSectionHeading
