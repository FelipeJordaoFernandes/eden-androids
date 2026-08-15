import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { loadOrders } from '../../services/orderStorage.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import {
  formatOrderDate,
  formatOrderItemCount,
} from '../Orders/orderFormatting.js'
import AddressBook from './AddressBook.jsx'
import PaymentMethods from './PaymentMethods.jsx'
import PersonalDataForm from './PersonalDataForm.jsx'
import './Account.css'

const accountTabs = Object.freeze([
  { id: 'personal', label: 'Dados pessoais' },
  { id: 'addresses', label: 'Endereços de entrega' },
  { id: 'payments', label: 'Formas de pagamento' },
])

function Account() {
  const titleRef = useRef(null)
  const tabRefs = useRef([])
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, logout } = useAuth()
  const [orders] = useState(loadOrders)
  const recentOrders = orders.slice(0, 3)
  const requestedTab = searchParams.get('tab')
  const activeTab = accountTabs.some((tab) => tab.id === requestedTab)
    ? requestedTab
    : 'personal'

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  function selectTab(tabId, shouldFocus = false) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tabId)
    setSearchParams(nextParams, { replace: true })

    if (shouldFocus) {
      const index = accountTabs.findIndex((tab) => tab.id === tabId)
      tabRefs.current[index]?.focus()
    }
  }

  function handleTabKeyDown(event, index) {
    let nextIndex

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % accountTabs.length
    else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + accountTabs.length) % accountTabs.length
    } else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = accountTabs.length - 1
    else return

    event.preventDefault()
    selectTab(accountTabs[nextIndex].id, true)
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="account-page" aria-labelledby="account-title">
      <header className="account-header">
        <div>
          <span className="eyebrow account-eyebrow">Área do cliente</span>
          <h1 id="account-title" ref={titleRef} tabIndex={-1}>
            Olá, {currentUser.name.split(' ')[0]}.
          </h1>
          <p>Gerencie seus dados locais e consulte os pedidos deste dispositivo.</p>
        </div>
        <button className="button button-ghost" type="button" onClick={handleLogout}>
          Sair da conta
        </button>
      </header>

      <section className="account-profile-panel" aria-labelledby="account-settings-title">
        <div className="account-panel-heading">
          <span className="eyebrow">Conta local</span>
          <h2 id="account-settings-title">Dados da sua conta</h2>
        </div>

        <div className="account-tabs" role="tablist" aria-label="Dados da conta">
          {accountTabs.map((tab, index) => (
            <button
              id={`account-tab-${tab.id}`}
              ref={(element) => { tabRefs.current[index] = element }}
              className="account-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`account-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              key={tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`account-panel-${activeTab}`}
          className="account-tab-panel"
          role="tabpanel"
          aria-labelledby={`account-tab-${activeTab}`}
        >
          {activeTab === 'personal' ? <PersonalDataForm /> : null}
          {activeTab === 'addresses' ? <AddressBook /> : null}
          {activeTab === 'payments' ? <PaymentMethods /> : null}
        </div>
      </section>

      <section className="account-panel account-orders-panel" aria-labelledby="account-orders-title">
        <div className="account-panel-heading account-orders-heading">
          <div>
            <span className="eyebrow">Histórico local</span>
            <h2 id="account-orders-title">Pedidos neste dispositivo</h2>
          </div>
          {orders.length > 0 ? (
            <span className="account-order-count">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          ) : null}
        </div>

        {recentOrders.length > 0 ? (
          <>
            <ol className="account-order-list">
              {recentOrders.map((order) => (
                <li key={order.number}>
                  <Link to={`/orders/${encodeURIComponent(order.number)}`}>
                    <div>
                      <strong>{order.number}</strong>
                      <span>{formatOrderDate(order.createdAt)}</span>
                    </div>
                    <div className="account-order-summary">
                      <span>{formatOrderItemCount(order.items)}</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className="button button-secondary" to="/orders">
              Ver histórico completo
            </Link>
          </>
        ) : (
          <div className="account-orders-empty">
            <h3>Nenhum pedido salvo.</h3>
            <p>Os pedidos concluídos neste navegador aparecerão aqui.</p>
            <Link className="button button-primary" to="/catalog">
              Explorar androides
            </Link>
          </div>
        )}
      </section>

      <aside className="account-local-notice">
        <strong>Armazenamento local</strong>
        <p>
          Conta, endereços e cartões fictícios ficam somente neste navegador. O
          histórico de pedidos continua compartilhado no dispositivo e não recebe
          CPF, telefone, e-mail, endereço completo ou dados do cartão.
        </p>
      </aside>
    </section>
  )
}

export default Account
