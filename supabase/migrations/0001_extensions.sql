-- Extensiones necesarias.
--
-- pgcrypto: gen_random_uuid() para las llaves primarias UUID.
-- btree_gist: permite usar el operador de igualdad (=) sobre columnas
--   escalares (como uuid) dentro de un EXCLUDE USING gist, que es lo
--   que usamos en reservations para impedir reservas dobles a nivel
--   de base de datos (ver 0006_reservations.sql).
create extension if not exists pgcrypto;
create extension if not exists btree_gist;
