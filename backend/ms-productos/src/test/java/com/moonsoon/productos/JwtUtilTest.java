package com.moonsoon.productos;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    private static final String SECRET = "secreto-de-prueba-de-al-menos-32-caracteres-123";

    @Test
    void leeUnTokenValidoEmitidoConElMismoSecreto() {
        String token = Jwts.builder().subject("a@a.cl").claim("rol", "ADMIN")
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();
        var claims = new JwtUtil(SECRET).leer(token);
        assertEquals("a@a.cl", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol", String.class));
    }

    @Test
    void rechazaTokenInvalido() {
        assertThrows(JwtException.class, () -> new JwtUtil(SECRET).leer("no.es.token"));
    }
}
