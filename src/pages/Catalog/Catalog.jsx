import { useMemo, useState } from 'react'
import ProductFilters from '../../components/ProductFilters/ProductFilters.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import { products } from '../../data/products.js'
import './Catalog.css'

function Catalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [],
  )

  const availableTypes = useMemo(() => {
    const filteredByCategory =
      selectedCategory === 'all'
        ? products
        : products.filter((product) => product.category === selectedCategory)

    return [...new Set(filteredByCategory.map((product) => product.type))]
  }, [selectedCategory])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory
      const matchesType = selectedType === 'all' || product.type === selectedType

      const searchableText =
        `${product.name} ${product.line} ${product.category} ${product.type} ${product.specialty}`.toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 || searchableText.includes(normalizedSearch)

      return matchesCategory && matchesType && matchesSearch
    })
  }, [searchTerm, selectedCategory, selectedType])

  function handleCategoryChange(category) {
    setSelectedCategory(category)
    setSelectedType('all')
  }

  const resultLabel = `${filteredProducts.length} ${
    filteredProducts.length === 1
      ? 'produto encontrado'
      : 'produtos encontrados'
  }`

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <span className="eyebrow catalog-eyebrow">Catálogo Eden</span>
        <h1>Androides para cada missão.</h1>
        <p>
          Explore modelos desenvolvidos para residências, empresas e operações
          especializadas, com diferentes níveis de autonomia, suporte e
          protocolos éticos.
        </p>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        categories={categories}
        types={availableTypes}
        onSearchChange={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        onTypeChange={setSelectedType}
      />

      <div
        className="catalog-summary"
        role="status"
        aria-label={resultLabel}
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>{filteredProducts.length}</strong>
        <span>
          {filteredProducts.length === 1
            ? 'produto encontrado'
            : 'produtos encontrados'}
        </span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="catalog-grid" aria-labelledby="catalog-results-title">
          <h2 id="catalog-results-title" className="visually-hidden">
            Resultados do catálogo
          </h2>
          {filteredProducts.map((product, index) => (
            <ProductCard
              product={product}
              imagePriority={index < 8}
              key={product.id}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <h2>Nenhum androide encontrado</h2>
          <p>
            Ajuste a busca ou selecione outra categoria para ver mais modelos da
            linha Eden.
          </p>
        </div>
      )}
    </section>
  )
}

export default Catalog
