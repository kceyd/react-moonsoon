package com.moonsoon.usuarios;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    private static final String SECRET = "secreto-de-prueba-de-al-menos-32-caracteres-123";

    private Usuario usuario() {
        Usuario u = new Usuario();
        ReflectionTestUtils.setField(u, "id", 7L);
        u.setEmail("a@a.cl");
        u.setRol(Rol.ADMIN);
        return u;
    }

    @Test
    void tokenGeneradoContieneCorreoRolEId() {
        JwtUtil jwt = new JwtUtil(SECRET, 60000);
        Claims c = jwt.leer(jwt.generar(usuario()));
        assertEquals("a@a.cl", c.getSubject());
        assertEquals("ADMIN", c.get("rol", String.class));
        assertEquals(7, c.get("id", Integer.class));
    }

    @Test
    void tokenAdulteradoSeRechaza() {
        JwtUtil jwt = new JwtUtil(SECRET, 60000);
        assertThrows(JwtException.class, () -> jwt.leer("abc.def.ghi"));
    }

    @Test
    void tokenFirmadoConOtroSecretoSeRechaza() {
        String token = new JwtUtil("otro-secreto-distinto-de-32-caracteres-xyz", 60000).generar(usuario());
        assertThrows(JwtException.class, () -> new JwtUtil(SECRET, 60000).leer(token));
    }

    @Test
    void tokenVencidoSeRechaza() {
        JwtUtil jwt = new JwtUtil(SECRET, -1000);
        String token = jwt.generar(usuario());
        assertThrows(JwtException.class, () -> jwt.leer(token));
    }
}
