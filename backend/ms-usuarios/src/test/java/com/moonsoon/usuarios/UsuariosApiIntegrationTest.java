package com.moonsoon.usuarios;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Prueba la API completa: seguridad, roles, validaciones y persistencia (H2 en modo MySQL). */
@SpringBootTest
@AutoConfigureMockMvc
class UsuariosApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    private String json(Object o) throws Exception { return om.writeValueAsString(o); }

    private JsonNode login(String email, String clave) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", email, "password", clave))))
                .andExpect(status().isOk()).andReturn();
        return om.readTree(r.getResponse().getContentAsString());
    }

    private String tokenAdmin() throws Exception {
        return "Bearer " + login("admin@moonsoon.cl", "Admin123!").get("token").asText();
    }

    private String tokenCliente() throws Exception {
        String email = "cli" + System.nanoTime() + "@test.cl";
        mvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "Cli", "email", email, "password", "clave123"))))
                .andExpect(status().isCreated());
        return "Bearer " + login(email, "clave123").get("token").asText();
    }

    @Test
    void loginDelAdminEntregaTokenYRol() throws Exception {
        JsonNode r = login("admin@moonsoon.cl", "Admin123!");
        assertFalse(r.get("token").asText().isBlank());
        assertEquals("ADMIN", r.get("usuario").get("rol").asText());
    }

    @Test
    void loginConClaveIncorrectaDa401() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", "admin@moonsoon.cl", "password", "mala"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginSinCamposDa400() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registroCreaClienteYNoDevuelveLaClave() throws Exception {
        String body = json(Map.of("nombre", "Ana", "email", "ana@test.cl", "password", "clave123"));
        mvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listarUsuariosSinTokenODeTokenInvalidoDa401() throws Exception {
        mvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/usuarios").header("Authorization", "Bearer basura")).andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNoPuedeUsarElCrudDeUsuarios() throws Exception {
        String t = tokenCliente();
        mvc.perform(get("/api/usuarios").header("Authorization", t)).andExpect(status().isForbidden());
        mvc.perform(post("/api/usuarios").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "X", "email", "x@x.cl", "password", "clave123", "rol", "ADMIN"))))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/usuarios/1").header("Authorization", t)).andExpect(status().isForbidden());
    }

    @Test
    void adminListaUsuariosSinExponerClaves() throws Exception {
        mvc.perform(get("/api/usuarios").header("Authorization", tokenAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").exists())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void adminHaceElCrudCompleto() throws Exception {
        String t = tokenAdmin();
        MvcResult r = mvc.perform(post("/api/usuarios").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "Nuevo", "email", "nuevo@test.cl", "password", "clave123", "rol", "CLIENTE", "activo", true))))
                .andExpect(status().isCreated()).andReturn();
        long id = om.readTree(r.getResponse().getContentAsString()).get("id").asLong();

        mvc.perform(get("/api/usuarios/" + id).header("Authorization", t))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nombre").value("Nuevo"));
        mvc.perform(put("/api/usuarios/" + id).header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "Editado", "email", "nuevo@test.cl", "rol", "CLIENTE", "activo", true))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nombre").value("Editado"));
        mvc.perform(patch("/api/usuarios/" + id + "/rol").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("rol", "ADMIN"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("ADMIN"));
        mvc.perform(patch("/api/usuarios/" + id + "/estado").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("activo", false))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activo").value(false));
        mvc.perform(delete("/api/usuarios/" + id).header("Authorization", t)).andExpect(status().isOk());
        mvc.perform(get("/api/usuarios/" + id).header("Authorization", t)).andExpect(status().isNotFound());
    }

    @Test
    void crearUsuarioConDatosInvalidosDa400() throws Exception {
        String t = tokenAdmin();
        mvc.perform(post("/api/usuarios").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "", "email", "no-es-correo", "password", "clave123", "rol", "CLIENTE"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").exists());
        mvc.perform(post("/api/usuarios").header("Authorization", t).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"A\",\"email\":\"a@a.cl\",\"password\":\"clave123\",\"rol\":\"SUPERMAN\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminNoPuedeEliminarseASiMismo() throws Exception {
        JsonNode login = login("admin@moonsoon.cl", "Admin123!");
        long id = login.get("usuario").get("id").asLong();
        mvc.perform(delete("/api/usuarios/" + id).header("Authorization", "Bearer " + login.get("token").asText()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void usuarioDesactivadoNoPuedeIniciarSesion() throws Exception {
        mvc.perform(post("/api/usuarios").header("Authorization", tokenAdmin()).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("nombre", "Baja", "email", "baja@test.cl", "password", "clave123", "rol", "CLIENTE", "activo", false))))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", "baja@test.cl", "password", "clave123"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void swaggerYDocumentacionSonPublicos() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }
}
