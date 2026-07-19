import { Link } from 'react-router-dom'
import { warrantyEntries, warrantyOptions } from '../../context/cartConfig.js'
import useCart from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './CartItem.css'

function CartItem({ item, onAnnounce }) {
  const {
    decrementItem,
    incrementItem,
    removeItem,
    setQuantity,
    setWarranty,
  } = useCart()
  const quantityInputId = `cart-quantity-${item.id}`
  const warrantySelectId = `cart-warranty-${item.id}`
  const warrantyDescriptionId = `cart-warranty-description-${item.id}`

  function announceQuantity(quantity) {
    onAnnounce?.(
      `${item.name}: ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} no carrinho.`,
    )
  }

  function handleDecrement() {
    if (item.quantity <= 1) return

    decrementItem(item.id)
    announceQuantity(item.quantity - 1)
  }

  function handleIncrement() {
    if (item.quantity >= item.stock) return

    incrementItem(item.id)
    announceQuantity(item.quantity + 1)
  }

  function handleQuantityChange(event) {
    const quantity = event.currentTarget.valueAsNumber

    if (!Number.isInteger(quantity)) return

    const normalizedQuantity = Math.min(Math.max(quantity, 1), item.stock)
    setQuantity(item.id, normalizedQuantity)
    announceQuantity(normalizedQuantity)
  }

  function handleWarrantyChange(event) {
    const warranty = event.currentTarget.value
    const selectedWarranty = warrantyOptions[warranty]

    if (!selectedWarranty) return

    setWarranty(item.id, warranty)
    onAnnounce?.(`${item.name}: ${selectedWarranty.label} selecionada.`)
  }

  function handleRemove() {
    removeItem(item.id)
    onAnnounce?.(`${item.name} removido do carrinho.`)
  }

  return (
    <article className="cart-item">
      <Link
        className={`cart-item-visual${
          item.image ? ' cart-item-visual-has-image' : ''
        }`}
        to={`/product/${item.id}`}
        aria-label={`Ver detalhes de ${item.name}`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={`${item.name} — ${item.type}`}
            width="1122"
            height="1402"
            decoding="async"
          />
        ) : (
          <span aria-hidden="true">{item.modelCode}</span>
        )}
      </Link>

      <div className="cart-item-content">
        <div className="cart-item-heading">
          <div>
            <span className="cart-item-line">{item.line}</span>
            <h2>
              <Link to={`/product/${item.id}`}>{item.name}</Link>
            </h2>
          </div>
          <button
            className="cart-item-remove"
            type="button"
            onClick={handleRemove}
          >
            Remover
          </button>
        </div>

        <div className="cart-item-meta">
          <span className="badge">{item.category}</span>
          <span className="badge badge-neutral">{item.type}</span>
          <span className="badge badge-neutral">{item.modelCode}</span>
        </div>

        <div className="cart-item-controls">
          <div className="cart-item-control-group">
            <label htmlFor={quantityInputId}>Quantidade</label>
            <div className="quantity-control">
              <button
                type="button"
                aria-label={`Diminuir quantidade de ${item.name}`}
                disabled={item.quantity <= 1}
                onClick={handleDecrement}
              >
                <span aria-hidden="true">−</span>
              </button>
              <input
                id={quantityInputId}
                type="number"
                inputMode="numeric"
                min="1"
                max={item.stock}
                step="1"
                value={item.quantity}
                onChange={handleQuantityChange}
              />
              <button
                type="button"
                aria-label={`Aumentar quantidade de ${item.name}`}
                disabled={item.quantity >= item.stock}
                onClick={handleIncrement}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
            <small>{item.stock} unidades disponíveis</small>
          </div>

          <div className="cart-item-control-group cart-item-warranty">
            <label htmlFor={warrantySelectId}>Garantia adicional</label>
            <select
              id={warrantySelectId}
              value={item.warranty}
              aria-describedby={warrantyDescriptionId}
              onChange={handleWarrantyChange}
            >
              {warrantyEntries.map(([value, option]) => (
                <option value={value} key={value}>
                  {option.label}
                  {option.rate > 0 ? ` — +${option.rate * 100}%` : ' — inclusa'}
                </option>
              ))}
            </select>
            <small id={warrantyDescriptionId}>
              {item.warrantyDetails.description}. Garantia original:{' '}
              {item.includedWarranty}.
            </small>
          </div>
        </div>

        <dl className="cart-item-totals">
          <div>
            <dt>Preço unitário</dt>
            <dd>{formatCurrency(item.price)}</dd>
          </div>
          <div>
            <dt>Garantia</dt>
            <dd>
              {item.warrantyCost > 0
                ? `+ ${formatCurrency(item.warrantyCost)}`
                : 'Inclusa'}
            </dd>
          </div>
          <div className="cart-item-total">
            <dt>Total do item</dt>
            <dd>{formatCurrency(item.itemTotal)}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default CartItem
