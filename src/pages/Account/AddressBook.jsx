import { useState } from 'react'
import AddressForm from '../../components/AddressForm/AddressForm.jsx'
import useAuth from '../../hooks/useAuth.js'

function AddressBook() {
  const {
    addAddress,
    currentUser,
    editAddress,
    removeAddress,
    selectDefaultAddress,
  } = useAuth()
  const [editingAddress, setEditingAddress] = useState(null)
  const [isAdding, setIsAdding] = useState(currentUser.addresses.length === 0)
  const [notice, setNotice] = useState('')

  function handleSave(values) {
    const result = editingAddress
      ? editAddress(editingAddress.id, values)
      : addAddress(values)

    if (result.ok) {
      setEditingAddress(null)
      setIsAdding(false)
      setNotice(
        editingAddress
          ? 'Endereço atualizado neste dispositivo.'
          : 'Endereço adicionado neste dispositivo.',
      )
    }

    return result
  }

  function handleDelete(address) {
    if (!window.confirm(`Excluir o endereço “${address.label}”?`)) return

    const result = removeAddress(address.id)

    if (result.ok) setNotice('Endereço excluído.')
  }

  function openCreateForm() {
    setEditingAddress(null)
    setIsAdding(true)
    setNotice('')
  }

  return (
    <div className="account-manager">
      {currentUser.addresses.length > 0 ? (
        <ul className="account-saved-list" aria-label="Endereços salvos">
          {currentUser.addresses.map((address) => (
            <li key={address.id}>
              <div className="account-saved-list-heading">
                <div>
                  <strong>{address.label}</strong>
                  {address.isDefault ? <span className="badge badge-success">Principal</span> : null}
                </div>
                <label className="account-default-choice">
                  <input
                    type="radio"
                    name="default-address"
                    checked={address.isDefault}
                    onChange={() => selectDefaultAddress(address.id)}
                  />
                  <span>Usar como principal</span>
                </label>
              </div>
              <p>
                {address.street}, {address.addressNumber}
                {address.addressComplement ? ` — ${address.addressComplement}` : ''}
                <br />
                {address.neighborhood}, {address.city} — {address.state}
                <br />
                CEP {address.postalCode}
              </p>
              <div className="account-saved-actions">
                <button className="button button-secondary" type="button" onClick={() => { setEditingAddress(address); setIsAdding(false); setNotice('') }}>
                  Editar
                </button>
                <button className="button button-ghost" type="button" onClick={() => handleDelete(address)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="account-manager-empty">
          <h3>Nenhum endereço cadastrado.</h3>
          <p>Adicione um endereço para selecioná-lo durante o checkout.</p>
        </div>
      )}

      {notice ? <p className="account-form-success" role="status">{notice}</p> : null}

      {!isAdding && !editingAddress ? (
        <button className="button button-primary" type="button" onClick={openCreateForm}>
          Adicionar endereço
        </button>
      ) : (
        <div className="account-editor">
          <h3>{editingAddress ? `Editar ${editingAddress.label}` : 'Novo endereço'}</h3>
          <AddressForm
            key={editingAddress?.id ?? 'new-address'}
            formId="account-address"
            initialAddress={editingAddress}
            submitLabel={editingAddress ? 'Atualizar endereço' : 'Adicionar endereço'}
            onSave={handleSave}
            onCancel={
              currentUser.addresses.length > 0
                ? () => { setEditingAddress(null); setIsAdding(false) }
                : undefined
            }
          />
        </div>
      )}
    </div>
  )
}

export default AddressBook
