import { useState } from 'react'
import './ProductFilters.css'

function ProductFilters({
  searchTerm,
  selectedCategory,
  selectedType,
  categories,
  types,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`product-filters${isOpen ? ' product-filters-open' : ''}`}>
      <div className="filters-heading">
        <button
          className="filters-toggle"
          type="button"
          aria-label={isOpen ? 'Fechar filtros do catálogo' : 'Abrir filtros do catálogo'}
          aria-expanded={isOpen}
          aria-controls="catalog-filter-controls"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          Filtros
        </button>
        <span>Refine por função</span>
      </div>

      <div
        id="catalog-filter-controls"
        className="filters-controls"
        aria-label="Filtros do catálogo"
      >
        <label className="filter-field">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Nome, linha, categoria, tipo ou especialidade"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>Categoria</span>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Tipo</span>
          <select
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="all">Todos os tipos</option>
            {types.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default ProductFilters
