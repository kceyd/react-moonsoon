import { Link } from 'react-router-dom';
import Carrusel from '../components/Carrusel.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Home() {
  const { productos } = useProducts();

  return (
    <main>
      <section className="portada">
        <div className="contenedor portada__grid">
          <div>
            <p className="portada__eyebrow">Tecnología del día a día</p>
            <h1>Gadgets pensados para tu rutina, no para tu vitrina</h1>
            <p>
              En moonsoon elegimos cada producto por lo útil que es, no por lo que promete. Audífonos,
              notebooks, accesorios gamer y más, listos para llegar a tu casa esta semana.
            </p>
            <Link to="/productos" className="boton boton-primario">Ver productos</Link>
          </div>
          <div className="portada__imagen" aria-label="Fotografía ilustrativa de la tienda moonsoon">
            moonsoon
          </div>
        </div>
      </section>

      <section className="catalogo" id="catalogo">
        <div className="contenedor">
          <h2>Catálogo</h2>
          <p className="catalogo__intro">
            {productos.length} productos, disponibles para retiro en tienda o despacho a domicilio.
          </p>
          <Carrusel productos={productos} />
        </div>
      </section>

      <section className="video-seccion">
        <div className="contenedor">
          <h2>Conoce moonsoon en un minuto</h2>
          <div className="video-seccion__marco">
            <video controls preload="metadata">
              <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        </div>
      </section>
    </main>
  );
}
