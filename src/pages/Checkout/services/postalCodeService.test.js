import { describe, expect, it, vi } from 'vitest'
import { fetchAddressByPostalCode } from './postalCodeService.js'

describe('serviço de CEP', () => {
  it('mapeia a resposta simulada do ViaCEP', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    })

    await expect(fetchAddressByPostalCode('01001-000', request)).resolves.toEqual({
      postalCode: '01001-000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
    })
    expect(request).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/')
  })

  it('retorna nulo quando o CEP simulado não existe', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ erro: true }),
    })

    await expect(fetchAddressByPostalCode('99999-999', request)).resolves.toBeNull()
  })

  it('propaga falhas da consulta para permitir preenchimento manual', async () => {
    const request = vi.fn().mockResolvedValue({ ok: false })

    await expect(fetchAddressByPostalCode('01001-000', request)).rejects.toThrow(
      'postal-code-request-failed',
    )
  })
})
