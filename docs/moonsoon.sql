-- moonsoon: script de base de datos (MySQL 8)
-- Dos bases, una por microservicio. Hibernate (ddl-auto=update) también crea las tablas solo;
-- este script sirve para levantar la BD manualmente o restaurarla.
-- El usuario ADMIN lo crea ms-usuarios al arrancar (DataInitializer) con la clave hasheada en BCrypt.
-- Para un respaldo real con tus datos:  mysqldump -u USUARIO -p --databases moonsoon_usuarios moonsoon_productos > respaldo.sql

CREATE DATABASE IF NOT EXISTS moonsoon_usuarios  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS moonsoon_productos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ ms-usuarios ============
USE moonsoon_usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id       BIGINT       NOT NULL AUTO_INCREMENT,
  nombre   VARCHAR(100) NOT NULL,
  email    VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'hash BCrypt, nunca texto plano',
  rol      ENUM('ADMIN','CLIENTE') NOT NULL DEFAULT 'CLIENTE',
  activo   BIT(1)       NOT NULL DEFAULT b'1',
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB;

-- ============ ms-productos ============
USE moonsoon_productos;

CREATE TABLE IF NOT EXISTS productos (
  id          BIGINT         NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(120)   NOT NULL,
  descripcion VARCHAR(1000),
  precio      DECIMAL(12,2)  NOT NULL,
  stock       INT            NOT NULL,
  categoria   VARCHAR(80),
  imagen      VARCHAR(500),
  PRIMARY KEY (id),
  CONSTRAINT chk_precio CHECK (precio > 0),
  CONSTRAINT chk_stock  CHECK (stock >= 0)
) ENGINE=InnoDB;

-- Datos de ejemplo (borra o cambia por los de tu tienda)
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES
('Producto de ejemplo 1', 'Descripción de ejemplo', 9990.00, 10, 'General', ''),
('Producto de ejemplo 2', 'Descripción de ejemplo', 14990.00, 5, 'General', '');
