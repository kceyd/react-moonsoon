package com.moonsoon.usuarios;

import jakarta.validation.constraints.*;

public final class Dtos {
    private Dtos() {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record RegistroRequest(
            @NotBlank @Size(max = 100) String nombre,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password) {}

    public record UsuarioRequest(
            @NotBlank @Size(max = 100) String nombre,
            @NotBlank @Email String email,
            String password, // obligatoria al crear; opcional al editar
            @NotNull Rol rol,
            Boolean activo) {}

    public record RolRequest(@NotNull Rol rol) {}

    public record EstadoRequest(@NotNull Boolean activo) {}

    public record UsuarioResponse(Long id, String nombre, String email, Rol rol, boolean activo) {
        public static UsuarioResponse de(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.isActivo());
        }
    }

    public record AuthResponse(String token, UsuarioResponse usuario) {}
}
