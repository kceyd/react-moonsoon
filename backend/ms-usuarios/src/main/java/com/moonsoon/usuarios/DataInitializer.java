package com.moonsoon.usuarios;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Crea el administrador inicial (con clave hasheada) si todavía no existe. */
@Component
public class DataInitializer implements CommandLineRunner {
    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public DataInitializer(UsuarioRepository repo, PasswordEncoder encoder,
                           @Value("${admin.email}") String email, @Value("${admin.password}") String password) {
        this.repo = repo;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (repo.existsByEmailIgnoreCase(email)) return;
        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setEmail(email.toLowerCase());
        admin.setPassword(encoder.encode(password));
        admin.setRol(Rol.ADMIN);
        repo.save(admin);
    }
}
