import { useState } from 'react'
import PaymentCardForm from '../../components/PaymentCardForm/PaymentCardForm.jsx'
import useAuth from '../../hooks/useAuth.js'

function PaymentMethods() {
  const {
    addPaymentMethod,
    currentUser,
    removePaymentMethod,
    selectDefaultPaymentMethod,
  } = useAuth()
  const [notice, setNotice] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(currentUser.paymentMethods.length === 0)

  function handleSave(values) {
    const result = addPaymentMethod(values)

    if (!result.ok) return result

    setIsFormOpen(false)
    setNotice('Cartão fictício adicionado. Número completo e CVV não foram armazenados.')
    return result
  }

  function handleDelete(method) {
    if (!window.confirm(`Excluir o cartão “${method.label}”?`)) return

    const result = removePaymentMethod(method.id)

    if (result.ok) setNotice('Cartão fictício excluído.')
  }

  return (
    <div className="account-manager">
      <p className="account-demo-warning" role="note">
        Use somente dados fictícios. Nenhuma cobrança real é processada.
      </p>

      {currentUser.paymentMethods.length > 0 ? (
        <ul className="account-saved-list" aria-label="Cartões fictícios salvos">
          {currentUser.paymentMethods.map((method) => (
            <li key={method.id}>
              <div className="account-saved-list-heading">
                <div>
                  <strong>{method.label}</strong>
                  {method.isDefault ? <span className="badge badge-success">Principal</span> : null}
                </div>
                <label className="account-default-choice">
                  <input
                    type="radio"
                    name="default-payment"
                    checked={method.isDefault}
                    onChange={() => selectDefaultPaymentMethod(method.id)}
                  />
                  <span>Usar como principal</span>
                </label>
              </div>
              <p>{method.brand} •••• {method.lastFour} · validade {method.expiry}<br />{method.cardholder}</p>
              <button className="button button-ghost" type="button" onClick={() => handleDelete(method)}>
                Excluir cartão
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="account-manager-empty">
          <h3>Nenhum cartão fictício cadastrado.</h3>
          <p>Cadastre uma opção sanitizada para selecioná-la no checkout.</p>
        </div>
      )}

      {notice ? <p className="account-form-success" role="status">{notice}</p> : null}

      {!isFormOpen ? (
        <button className="button button-primary" type="button" onClick={() => { setIsFormOpen(true); setNotice('') }}>
          Adicionar cartão fictício
        </button>
      ) : (
        <div className="account-editor">
          <h3>Novo cartão fictício</h3>
          <PaymentCardForm
            formId="account-card"
            onSave={handleSave}
            onCancel={currentUser.paymentMethods.length > 0 ? () => setIsFormOpen(false) : undefined}
          />
        </div>
      )}
    </div>
  )
}

export default PaymentMethods
