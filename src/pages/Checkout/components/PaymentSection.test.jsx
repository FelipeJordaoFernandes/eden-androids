import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { formatCurrency } from '../../../utils/formatCurrency.js'
import PaymentSection from './PaymentSection.jsx'

const cardFormData = {
  paymentMethod: 'card',
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  installments: '7',
}

describe('PaymentSection', () => {
  it('preserva Pix, Boleto e Cartão de crédito como modalidades', () => {
    render(
      <PaymentSection
        formData={{ ...cardFormData, paymentMethod: 'pix' }}
        grandTotal={10000}
        onFieldChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: /Pix/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Boleto/ })).toBeVisible()
    expect(
      screen.getByRole('radio', { name: /Cartão de crédito/ }),
    ).toBeVisible()
  })

  it('oferece parcelas de 1x a 10x sem juros e atualiza os valores', () => {
    const { rerender } = render(
      <PaymentSection
        formData={cardFormData}
        grandTotal={10000}
        onFieldChange={vi.fn()}
      />,
    )
    const installments = screen.getByRole('combobox', {
      name: 'Parcelamento',
    })
    const options = within(installments).getAllByRole('option')

    expect(options).toHaveLength(10)
    expect(options.map((option) => option.value)).toEqual(
      Array.from({ length: 10 }, (_, index) => String(index + 1)),
    )
    expect(options.map((option) => option.textContent)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) =>
          `${index + 1}x de ${formatCurrency(10000 / (index + 1))} sem juros`,
      ),
    )
    expect(installments).toHaveValue('7')

    rerender(
      <PaymentSection
        formData={cardFormData}
        grandTotal={11890}
        onFieldChange={vi.fn()}
      />,
    )

    expect(installments).toHaveValue('7')
    expect(
      within(installments).getAllByRole('option')[6].textContent,
    ).toBe(`7x de ${formatCurrency(11890 / 7)} sem juros`)
  })
})
