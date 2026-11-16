package com.moonsoon.usuarios;

import com.moonsoon.usuarios.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    // ---------- Auth ----------
    public AuthResponse login(LoginRequest r) {
        Usuario u = repo.findByEmailIgnoreCase(r.email())
                .filter(x -> encoder.matches(r.password(), x.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o clave incorrectos"));
        if (!u.isActivo()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario desactivado");
        return new AuthResponse(jwt.generar(u), UsuarioResponse.de(u));
    }

    public UsuarioResponse registrar(RegistroRequest r) {
        validarEmailLibre(r.email(), null);
        Usuario u = new Usuario();
        u.setNombre(r.nombre().trim());
        u.setEmail(r.email().trim().toLowerCase());
        u.setPassword(encoder.encode(r.password()));
        u.setRol(Rol.CLIENTE); // el registro público siempre crea CLIENTE
        return UsuarioResponse.de(repo.save(u));
    }

    // ---------- CRUD (solo ADMIN, protegido en SecurityConfig) ----------
    public List<UsuarioResponse> listar() {
        return repo.findAll().stream().map(UsuarioResponse::de).toList();
    }

    public UsuarioResponse obtener(Long id) { return UsuarioResponse.de(buscar(id)); }

    public UsuarioResponse crear(UsuarioRequest r) {
        if (r.password() == null || r.password().length() < 6)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La clave debe tener al menos 6 caracteres");
        validarEmailLibre(r.email(), null);
        Usuario u = new Usuario();
        aplicar(u, r);
        u.setPassword(encoder.encode(r.password()));
        return UsuarioResponse.de(repo.save(u));
    }

    public UsuarioResponse actualizar(Long id, UsuarioRequest r, String emailActual) {
        Usuario u = buscar(id);
        validarEmailLibre(r.email(), id);
        if (esMismo(u, emailActual) && (r.rol() != Rol.ADMIN || Boolean.FALSE.equals(r.activo())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes quitarte el rol admin ni desactivarte");
        aplicar(u, r);
        if (r.password() != null && !r.password().isBlank()) {
            if (r.password().length() < 6)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La clave debe tener al menos 6 caracteres");
            u.setPassword(encoder.encode(r.password()));
        }
        return UsuarioResponse.de(repo.save(u));
    }

    public UsuarioResponse cambiarRol(Long id, Rol rol, String emailActual) {
        Usuario u = buscar(id);
        if (esMismo(u, emailActual) && rol != Rol.ADMIN)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes quitarte el rol admin");
        u.setRol(rol);
        return UsuarioResponse.de(repo.save(u));
    }

    public UsuarioResponse cambiarEstado(Long id, boolean activo, String emailActual) {
        Usuario u = buscar(id);
        if (esMismo(u, emailActual) && !activo)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivarte a ti mismo");
        u.setActivo(activo);
        return UsuarioResponse.de(repo.save(u));
    }

    public void eliminar(Long id, String emailActual) {
        Usuario u = buscar(id);
        if (esMismo(u, emailActual))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminarte a ti mismo");
        repo.delete(u);
    }

    // ---------- helpers ----------
    private Usuario buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private boolean esMismo(Usuario u, String emailActual) {
        return u.getEmail().equalsIgnoreCase(emailActual);
    }

    private void validarEmailLibre(String email, Long idActual) {
        repo.findByEmailIgnoreCase(email.trim()).ifPresent(x -> {
            if (!x.getId().equals(idActual))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo ya está registrado");
        });
    }

    private void aplicar(Usuario u, UsuarioRequest r) {
        u.setNombre(r.nombre().trim());
        u.setEmail(r.email().trim().toLowerCase());
        u.setRol(r.rol());
        u.setActivo(r.activo() == null || r.activo());
    }
}
