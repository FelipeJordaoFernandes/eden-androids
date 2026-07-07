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

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <span className="catalog-eyebrow">Catálogo Eden</span>
        <h1>Androides para cada missão.</h1>
        <p>
          Explore modelos fictícios desenvolvidos para residências, empresas e
          operações especializadas, com diferentes níveis de autonomia, suporte
          e protocolos éticos.
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

      <div className="catalog-summary">
        <strong>{filteredProducts.length}</strong>
        <span>
          {filteredProducts.length === 1
            ? 'produto encontrado'
            : 'produtos encontrados'}
        </span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="catalog-grid">
          {filteredProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
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
