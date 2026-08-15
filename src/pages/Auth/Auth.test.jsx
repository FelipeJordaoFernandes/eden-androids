import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../../context/AuthContext.jsx'
import ProtectedRoute from '../../routes/ProtectedRoute.jsx'
import {
  ACCOUNT_STORAGE_KEY,
  clearSession,
  registerAccount,
} from '../../services/authStorage.js'
import { saveOrder } from '../../services/orderStorage.js'
import { fetchAddressByPostalCode } from '../../services/postalCodeService.js'
import Account from '../Account/Account.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

vi.mock('../../services/postalCodeService.js', () => ({
  fetchAddressByPostalCode: vi.fn(),
}))

function renderAuth(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function createLocalAccount() {
  return registerAccount({
    name: 'Felipe Jordão',
    email: 'felipe@exemplo.com',
    password: 'eden2026',
  })
}

async function completeRegisterForm(user) {
  await user.type(screen.getByLabelText('Nome'), 'Felipe Jordão')
  await user.type(screen.getByLabelText('E-mail'), 'FELIPE@EXEMPLO.COM')
  await user.type(screen.getByLabelText('Senha'), 'eden2026')
  await user.type(screen.getByLabelText('Confirmar senha'), 'eden2026')
}

function saveTestOrder() {
  saveOrder({
    number: 'EDN-260815-1234',
    createdAt: '2026-08-15T12:30:00.000Z',
    items: [
      {
        id: 1,
        name: 'Eden Home H-01',
        modelCode: 'EN-H01',
        image: '/images/products/eden-home-h01.png',
        quantity: 1,
        unitPrice: 48900,
        warranty: { label: 'Garantia padrão', value: 0 },
      },
    ],
    subtotal: 48900,
    warrantyTotal: 0,
    shipping: {
      method: 'Entrega agendada',
      estimate: '12 a 18 dias úteis',
      price: 0,
    },
    total: 48900,
    paymentMethod: 'Pix',
  })
}

describe('cadastro, login e área do cliente', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(fetchAddressByPostalCode).mockReset()
    vi.mocked(fetchAddressByPostalCode).mockResolvedValue({
      postalCode: '01001-000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
    })
  })

  it('valida o cadastro e focaliza o primeiro campo inválido', async () => {
    const user = userEvent.setup()

    renderAuth('/register')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(screen.getByText(/nome com pelo menos 2 caracteres/i)).toBeVisible()
    expect(screen.getByText(/e-mail válido/i)).toBeVisible()
    expect(screen.getByText('Use pelo menos 8 caracteres.')).toBeVisible()
  })

  it('cria a conta, inicia a sessão e abre a área do cliente', async () => {
    const user = userEvent.setup()

    renderAuth('/register')
    await completeRegisterForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByRole('heading', { name: 'Olá, Felipe.' }),
    ).toHaveFocus()
    expect(screen.getByLabelText('E-mail')).toHaveValue('felipe@exemplo.com')
    expect(screen.getByText('Nenhum pedido salvo.')).toBeVisible()
    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).not.toContain(
      'eden2026',
    )
  })

  it('informa e-mail duplicado sem apagar os demais dados', async () => {
    await createLocalAccount()
    clearSession()
    const user = userEvent.setup()

    renderAuth('/register')
    await completeRegisterForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByText('Já existe uma conta local com este e-mail.'),
    ).toBeVisible()
    expect(screen.getByLabelText('Nome')).toHaveValue('Felipe Jordão')
    expect(screen.getByLabelText('E-mail')).toHaveFocus()
  })

  it('protege a área, preserva o destino e aceita login válido', async () => {
    await createLocalAccount()
    clearSession()
    const user = userEvent.setup()

    renderAuth('/account')

    expect(
      screen.getByRole('heading', { name: 'Entre na sua conta.' }),
    ).toHaveFocus()

    await user.type(screen.getByLabelText('E-mail'), 'felipe@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'eden2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('heading', { name: 'Olá, Felipe.' }),
    ).toBeVisible()
  })

  it('usa mensagem genérica e limpa a senha quando o login falha', async () => {
    await createLocalAccount()
    clearSession()
    const user = userEvent.setup()

    renderAuth('/login')
    await user.type(screen.getByLabelText('E-mail'), 'felipe@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senhaerrada1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    )
    expect(screen.getByLabelText('Senha')).toHaveValue('')
  })

  it('restaura a sessão e exibe os pedidos locais após nova montagem', async () => {
    await createLocalAccount()
    saveTestOrder()

    const firstView = renderAuth('/account')

    expect(screen.getByText('EDN-260815-1234')).toBeVisible()
    expect(
      screen.getByRole('link', { name: /EDN-260815-1234/ }),
    ).toHaveAttribute('href', '/orders/EDN-260815-1234')

    firstView.unmount()
    renderAuth('/account')

    expect(
      screen.getByRole('heading', { name: 'Olá, Felipe.' }),
    ).toBeVisible()
    expect(screen.getByText('EDN-260815-1234')).toBeVisible()
  })

  it('encerra a sessão e retorna ao login sem apagar a conta', async () => {
    await createLocalAccount()
    const user = userEvent.setup()

    renderAuth('/account')
    await user.click(screen.getByRole('button', { name: 'Sair da conta' }))

    expect(
      await screen.findByRole('heading', { name: 'Entre na sua conta.' }),
    ).toBeVisible()
    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).not.toBeNull()
  })

  it('valida, salva e restaura os dados pessoais da conta', async () => {
    await createLocalAccount()
    const user = userEvent.setup()
    const firstView = renderAuth('/account')

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Felipe Jordão')
    expect(screen.getByLabelText('E-mail')).toHaveValue('felipe@exemplo.com')

    await user.click(
      screen.getByRole('button', { name: 'Salvar dados pessoais' }),
    )
    expect(screen.getByLabelText('Telefone')).toHaveFocus()

    await user.type(screen.getByLabelText('Telefone'), '11912345678')
    await user.type(screen.getByLabelText('CPF'), '52998224725')
    await user.click(
      screen.getByRole('button', { name: 'Salvar dados pessoais' }),
    )

    expect(
      screen.getByText('Seus dados pessoais foram salvos neste dispositivo.'),
    ).toBeVisible()

    firstView.unmount()
    renderAuth('/account')

    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 91234-5678')
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25')
  })

  it('navega pelas abas com teclado', async () => {
    await createLocalAccount()
    const user = userEvent.setup()

    renderAuth('/account')
    const personalTab = screen.getByRole('tab', { name: 'Dados pessoais' })
    personalTab.focus()
    await user.keyboard('{ArrowRight}')

    expect(
      screen.getByRole('tab', { name: 'Endereços de entrega' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('heading', { name: 'Novo endereço' }),
    ).toBeVisible()

    await user.keyboard('{End}')
    expect(
      screen.getByRole('tab', { name: 'Formas de pagamento' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('heading', { name: 'Novo cartão fictício' }),
    ).toBeVisible()
  })

  it('consulta, salva e restaura um endereço nomeado após nova montagem', async () => {
    await createLocalAccount()
    const user = userEvent.setup()
    const firstView = renderAuth('/account')

    await user.click(
      screen.getByRole('tab', { name: 'Endereços de entrega' }),
    )
    await user.type(screen.getByLabelText('Nome do endereço'), 'Casa')
    await user.type(screen.getByLabelText('CEP'), '01001000')

    expect(await screen.findByDisplayValue('Praça da Sé')).toBeVisible()
    expect(fetchAddressByPostalCode).toHaveBeenCalledWith('01001-000')

    await user.type(screen.getByLabelText('Número'), '100')
    await user.click(screen.getByRole('button', { name: 'Adicionar endereço' }))

    expect(
      screen.getByText('Endereço adicionado neste dispositivo.'),
    ).toBeVisible()

    firstView.unmount()
    renderAuth('/account?tab=addresses')

    expect(screen.getByText('Casa')).toBeVisible()
    expect(screen.getByText(/Praça da Sé, 100/)).toBeVisible()
    expect(screen.getByText(/CEP 01001-000/)).toBeVisible()
    expect(screen.getByText('Principal')).toBeVisible()
  })

  it('valida e salva cartão fictício sem persistir número completo ou CVV', async () => {
    await createLocalAccount()
    const user = userEvent.setup()

    renderAuth('/account?tab=payments')
    await user.click(
      screen.getByRole('button', { name: 'Salvar cartão fictício' }),
    )

    expect(screen.getByLabelText('Nome impresso no cartão')).toHaveFocus()
    expect(screen.getByText('Informe os 16 dígitos do cartão.')).toBeVisible()

    await user.type(screen.getByLabelText(/Nome do cartão/), 'Principal')
    await user.type(
      screen.getByLabelText('Nome impresso no cartão'),
      'FELIPE JORDAO',
    )
    await user.type(
      screen.getByLabelText('Número do cartão'),
      '4111111111111111',
    )
    await user.type(screen.getByLabelText('Validade'), '1230')
    await user.type(screen.getByLabelText('CVV'), '123')
    await user.click(
      screen.getByRole('button', { name: 'Salvar cartão fictício' }),
    )

    expect(screen.getByText(/Visa •••• 1111/)).toBeVisible()
    expect(
      screen.getByText(/Número completo e CVV não foram armazenados/),
    ).toBeVisible()
    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).not.toContain(
      '4111111111111111',
    )
    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).not.toContain(
      '"cvv"',
    )
  })
})
