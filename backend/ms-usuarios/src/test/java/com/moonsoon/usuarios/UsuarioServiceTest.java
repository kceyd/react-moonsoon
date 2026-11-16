package com.moonsoon.usuarios;

import com.moonsoon.usuarios.Dtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository repo;
    @Mock JwtUtil jwt;
    PasswordEncoder encoder = new BCryptPasswordEncoder();
    UsuarioService service;

    @BeforeEach
    void init() { service = new UsuarioService(repo, encoder, jwt); }

    private Usuario user(Long id, String email, Rol rol, boolean activo) {
        Usuario u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setNombre("Nombre");
        u.setEmail(email);
        u.setPassword(encoder.encode("Clave123"));
        u.setRol(rol);
        u.setActivo(activo);
        return u;
    }

    private HttpStatusCode estadoDe(Runnable r) {
        try { r.run(); } catch (ResponseStatusException e) { return e.getStatusCode(); }
        throw new AssertionError("No lanzó ResponseStatusException");
    }

    @Test
    void loginCorrectoEntregaTokenYUsuario() {
        Usuario u = user(1L, "a@a.cl", Rol.ADMIN, true);
        when(repo.findByEmailIgnoreCase("a@a.cl")).thenReturn(Optional.of(u));
        when(jwt.generar(u)).thenReturn("tok");
        AuthResponse r = service.login(new LoginRequest("a@a.cl", "Clave123"));
        assertEquals("tok", r.token());
        assertEquals(Rol.ADMIN, r.usuario().rol());
    }

    @Test
    void loginConClaveIncorrectaDa401() {
        when(repo.findByEmailIgnoreCase("a@a.cl")).thenReturn(Optional.of(user(1L, "a@a.cl", Rol.ADMIN, true)));
        assertEquals(HttpStatus.UNAUTHORIZED, estadoDe(() -> service.login(new LoginRequest("a@a.cl", "mala"))));
    }

    @Test
    void loginConUsuarioInexistenteDa401() {
        when(repo.findByEmailIgnoreCase("x@x.cl")).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, estadoDe(() -> service.login(new LoginRequest("x@x.cl", "Clave123"))));
    }

    @Test
    void loginDeUsuarioInactivoDa403() {
        when(repo.findByEmailIgnoreCase("a@a.cl")).thenReturn(Optional.of(user(1L, "a@a.cl", Rol.CLIENTE, false)));
        assertEquals(HttpStatus.FORBIDDEN, estadoDe(() -> service.login(new LoginRequest("a@a.cl", "Clave123"))));
    }

    @Test
    void registrarCreaClienteConClaveHasheada() {
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        UsuarioResponse r = service.registrar(new RegistroRequest(" Ana ", "Nuevo@X.cl", "secreto1"));
        ArgumentCaptor<Usuario> cap = ArgumentCaptor.forClass(Usuario.class);
        verify(repo).save(cap.capture());
        Usuario guardado = cap.getValue();
        assertEquals(Rol.CLIENTE, r.rol());
        assertEquals("nuevo@x.cl", guardado.getEmail());
        assertEquals("Ana", guardado.getNombre());
        assertNotEquals("secreto1", guardado.getPassword());
        assertTrue(encoder.matches("secreto1", guardado.getPassword()));
    }

    @Test
    void registrarConCorreoRepetidoDa400() {
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user(5L, "a@a.cl", Rol.CLIENTE, true)));
        assertEquals(HttpStatus.BAD_REQUEST,
                estadoDe(() -> service.registrar(new RegistroRequest("Ana", "a@a.cl", "secreto1"))));
    }

    @Test
    void crearSinClaveOConClaveCortaDa400() {
        assertEquals(HttpStatus.BAD_REQUEST,
                estadoDe(() -> service.crear(new UsuarioRequest("A", "a@a.cl", null, Rol.CLIENTE, true))));
        assertEquals(HttpStatus.BAD_REQUEST,
                estadoDe(() -> service.crear(new UsuarioRequest("A", "a@a.cl", "123", Rol.CLIENTE, true))));
    }

    @Test
    void crearUsuarioQuedaActivoPorDefectoYConClaveHasheada() {
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        UsuarioResponse r = service.crear(new UsuarioRequest("Ana", "ana@x.cl", "secreto1", Rol.ADMIN, null));
        ArgumentCaptor<Usuario> cap = ArgumentCaptor.forClass(Usuario.class);
        verify(repo).save(cap.capture());
        assertTrue(r.activo());
        assertEquals(Rol.ADMIN, r.rol());
        assertTrue(encoder.matches("secreto1", cap.getValue().getPassword()));
    }

    @Test
    void actualizarCambiaDatosYConservaLaClaveSiVieneVacia() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        String hashViejo = u.getPassword();
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(u));
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        UsuarioResponse r = service.actualizar(2L, new UsuarioRequest("Nuevo", "cli@x.cl", "", Rol.ADMIN, false), "admin@x.cl");
        assertEquals("Nuevo", r.nombre());
        assertEquals(Rol.ADMIN, r.rol());
        assertFalse(r.activo());
        assertEquals(hashViejo, u.getPassword());
    }

    @Test
    void actualizarConClaveNuevaCambiaElHash() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(u));
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        service.actualizar(2L, new UsuarioRequest("N", "cli@x.cl", "otraClave1", Rol.CLIENTE, true), "admin@x.cl");
        assertTrue(encoder.matches("otraClave1", u.getPassword()));
    }

    @Test
    void actualizarConClaveCortaDa400() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(u));
        assertEquals(HttpStatus.BAD_REQUEST, estadoDe(() ->
                service.actualizar(2L, new UsuarioRequest("N", "cli@x.cl", "123", Rol.CLIENTE, true), "admin@x.cl")));
    }

    @Test
    void adminNoPuedeQuitarseElRolEditandoseASiMismo() {
        Usuario admin = user(1L, "admin@x.cl", Rol.ADMIN, true);
        when(repo.findById(1L)).thenReturn(Optional.of(admin));
        when(repo.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(admin));
        assertEquals(HttpStatus.BAD_REQUEST, estadoDe(() ->
                service.actualizar(1L, new UsuarioRequest("A", "admin@x.cl", null, Rol.CLIENTE, true), "admin@x.cl")));
    }

    @Test
    void cambiarRolDeOtroUsuarioFunciona() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        when(repo.save(u)).thenReturn(u);
        assertEquals(Rol.ADMIN, service.cambiarRol(2L, Rol.ADMIN, "admin@x.cl").rol());
    }

    @Test
    void adminNoPuedeCambiarseElRolNiDesactivarseNiEliminarse() {
        Usuario admin = user(1L, "admin@x.cl", Rol.ADMIN, true);
        when(repo.findById(1L)).thenReturn(Optional.of(admin));
        assertEquals(HttpStatus.BAD_REQUEST, estadoDe(() -> service.cambiarRol(1L, Rol.CLIENTE, "admin@x.cl")));
        assertEquals(HttpStatus.BAD_REQUEST, estadoDe(() -> service.cambiarEstado(1L, false, "admin@x.cl")));
        assertEquals(HttpStatus.BAD_REQUEST, estadoDe(() -> service.eliminar(1L, "admin@x.cl")));
        verify(repo, never()).delete(any(Usuario.class));
    }

    @Test
    void cambiarEstadoDeOtroUsuarioFunciona() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        when(repo.save(u)).thenReturn(u);
        assertFalse(service.cambiarEstado(2L, false, "admin@x.cl").activo());
    }

    @Test
    void eliminarUsuarioInexistenteDa404() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, estadoDe(() -> service.eliminar(99L, "admin@x.cl")));
    }

    @Test
    void eliminarOtroUsuarioLoBorra() {
        Usuario u = user(2L, "cli@x.cl", Rol.CLIENTE, true);
        when(repo.findById(2L)).thenReturn(Optional.of(u));
        service.eliminar(2L, "admin@x.cl");
        verify(repo).delete(u);
    }

    @Test
    void listarYObtenerDevuelvenRespuestasSinClave() {
        Usuario a = user(1L, "a@x.cl", Rol.ADMIN, true);
        Usuario b = user(2L, "b@x.cl", Rol.CLIENTE, true);
        when(repo.findAll()).thenReturn(List.of(a, b));
        when(repo.findById(2L)).thenReturn(Optional.of(b));
        assertEquals(2, service.listar().size());
        assertEquals("b@x.cl", service.obtener(2L).email());
    }
}
