import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Productos() {
  const { productos } = useProducts();

  return (
    <main className="catalogo">
      <div className="contenedor">
        <h2>Productos</h2>
        <p className="catalogo__intro">Todo nuestro catálogo en un solo lugar.</p>
        {productos.length === 0 ? (
          <p className="catalogo__intro">Aún no hay productos disponibles.</p>
        ) : (
          <div className="grilla-productos">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
