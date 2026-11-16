package com.moonsoon.productos;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductosApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;
    @Value("${jwt.secret}") String secret;

    private String token(String rol) {
        return "Bearer " + Jwts.builder().subject("x@test.cl").claim("rol", rol)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).compact();
    }

    private String producto(String nombre, Object precio, Object stock) throws Exception {
        return om.writeValueAsString(Map.of("nombre", nombre, "descripcion", "desc", "precio", precio,
                "stock", stock, "categoria", "ropa"));
    }

    private long crear(String nombre) throws Exception {
        MvcResult r = mvc.perform(post("/api/productos").header("Authorization", token("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON).content(producto(nombre, 9990, 5)))
                .andExpect(status().isCreated()).andReturn();
        return om.readTree(r.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    void listarYVerDetalleSonPublicos() throws Exception {
        long id = crear("Polera publica");
        mvc.perform(get("/api/productos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].nombre").exists());
        mvc.perform(get("/api/productos/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Polera publica"));
    }

    @Test
    void detalleInexistenteDa404() throws Exception {
        mvc.perform(get("/api/productos/999999")).andExpect(status().isNotFound());
    }

    @Test
    void crearSinTokenODeTokenInvalidoDa401() throws Exception {
        mvc.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON).content(producto("X", 100, 1)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/productos").header("Authorization", "Bearer basura")
                .contentType(MediaType.APPLICATION_JSON).content(producto("X", 100, 1)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNoPuedeCrearEditarNiEliminar() throws Exception {
        long id = crear("Protegido");
        String c = token("CLIENTE");
        mvc.perform(post("/api/productos").header("Authorization", c).contentType(MediaType.APPLICATION_JSON)
                .content(producto("X", 100, 1))).andExpect(status().isForbidden());
        mvc.perform(put("/api/productos/" + id).header("Authorization", c).contentType(MediaType.APPLICATION_JSON)
                .content(producto("X", 100, 1))).andExpect(status().isForbidden());
        mvc.perform(delete("/api/productos/" + id).header("Authorization", c)).andExpect(status().isForbidden());
    }

    @Test
    void crearConDatosInvalidosDa400() throws Exception {
        String a = token("ADMIN");
        mvc.perform(post("/api/productos").header("Authorization", a).contentType(MediaType.APPLICATION_JSON)
                .content(producto("Polera", 0, 5))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/productos").header("Authorization", a).contentType(MediaType.APPLICATION_JSON)
                .content(producto("Polera", 100, -1))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/productos").header("Authorization", a).contentType(MediaType.APPLICATION_JSON)
                .content(producto("", 100, 1))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    @Test
    void adminActualizaYEliminaProducto() throws Exception {
        long id = crear("Para editar");
        String a = token("ADMIN");
        mvc.perform(put("/api/productos/" + id).header("Authorization", a).contentType(MediaType.APPLICATION_JSON)
                .content(producto("Editado", 15000, 3)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nombre").value("Editado"))
                .andExpect(jsonPath("$.stock").value(3));
        mvc.perform(delete("/api/productos/" + id).header("Authorization", a)).andExpect(status().isOk());
        mvc.perform(get("/api/productos/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void actualizarYEliminarInexistenteDa404() throws Exception {
        String a = token("ADMIN");
        mvc.perform(put("/api/productos/999999").header("Authorization", a).contentType(MediaType.APPLICATION_JSON)
                .content(producto("X", 100, 1))).andExpect(status().isNotFound());
        mvc.perform(delete("/api/productos/999999").header("Authorization", a)).andExpect(status().isNotFound());
    }

    @Test
    void swaggerYDocumentacionSonPublicos() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }
}
