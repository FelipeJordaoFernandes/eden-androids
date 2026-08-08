const orderDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export function formatOrderDate(dateValue) {
  return orderDateFormatter.format(new Date(dateValue))
}

export function formatOrderItemCount(items) {
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return `${totalItems} ${totalItems === 1 ? 'unidade' : 'unidades'}`
}
