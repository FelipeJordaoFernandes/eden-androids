import Footer from './components/Footer/Footer.jsx'
import Header from './components/Header/Header.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import RouteMetadata from './routes/RouteMetadata.jsx'

function App() {
  return (
    <div className="app-shell">
      <RouteMetadata />
      <Header />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
}

export default App
