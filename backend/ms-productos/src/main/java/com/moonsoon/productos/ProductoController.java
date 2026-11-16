package com.moonsoon.productos;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** GET es público; POST/PUT/DELETE exigen rol ADMIN (regla en SecurityConfig). */
@RestController
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoRepository repo;

    public ProductoController(ProductoRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Producto> listar() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) { return buscar(id); }

    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody Producto p) {
        p.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody Producto p) {
        Producto actual = buscar(id);
        actual.setNombre(p.getNombre());
        actual.setDescripcion(p.getDescripcion());
        actual.setPrecio(p.getPrecio());
        actual.setStock(p.getStock());
        actual.setCategoria(p.getCategoria());
        actual.setImagen(p.getImagen());
        return repo.save(actual);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.delete(buscar(id));
        return ResponseEntity.ok().build();
    }

    private Producto buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }
}
