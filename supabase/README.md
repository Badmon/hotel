# Supabase

Esta carpeta contiene todo lo necesario para levantar la base de datos del proyecto.

```text
supabase/
  migrations/   Esquema, RLS y funciones, en orden numerado
  seed.sql      Datos de demostración (tipos de habitación, habitaciones, imágenes)
  README.md     Este archivo
```

## 1. Crear el proyecto

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca al frontend!)

## 2. Ejecutar las migraciones

Opción A — SQL Editor del dashboard (más simple para un MVP):

Abre **SQL Editor** en el dashboard y ejecuta, en orden, cada archivo de `migrations/`:

```text
0001_extensions.sql
0002_profiles.sql
0003_room_types.sql
0004_rooms.sql
0005_room_images.sql
0006_reservations.sql
0007_functions.sql
0008_updated_at_triggers.sql
0009_reservation_rejected_at.sql
0010_hourly_bookings.sql
0011_promotions.sql
0012_find_reservation.sql
0013_fix_timezone_date_check.sql
0014_find_reservations_by_contact.sql
0015_room_images_storage.sql
0016_sequential_room_ids.sql
```

Opción B — Supabase CLI:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## 3. Cargar datos de demostración

Ejecuta `seed.sql` en el SQL Editor (o `supabase db execute -f supabase/seed.sql`). Es seguro volver a ejecutarlo.

## 4. Configurar Authentication

En **Authentication → Providers**, deja habilitado *Email*. No hace falta nada más para este MVP: el login administrativo usa correo y contraseña.

## 5. Crear el primer administrador

1. En **Authentication → Users**, crea un usuario manualmente (o pide que se registre).
2. En el SQL Editor, ejecútalo reemplazando el correo:

   ```sql
   update public.profiles
   set role = 'admin'
   from auth.users
   where profiles.id = auth.users.id
     and auth.users.email = 'admin@hoteldemo.com';
   ```

3. Ese usuario ya puede iniciar sesión en `/admin/login`.

Para dar de alta más personal, repite el paso 2 con `role = 'staff'` (o `'admin'` si necesita permisos completos).

## Notas de arquitectura

- **RLS está activo en todas las tablas.** El público solo puede leer `room_types`, `rooms` y `room_images` (y solo tipos/activos). La tabla `reservations` no tiene ninguna policy pública: se lee y escribe exclusivamente vía funciones o con la service role key.
- **La creación de reservas** ocurre en `create_reservation_atomic`, una función `SECURITY DEFINER` a la que solo puede llamar `service_role` (la Netlify Function `create-reservation`). Nunca se inserta directamente desde el navegador.
- **Los cambios de estado administrativos** (confirmar, check-in, check-out, etc.) son funciones RPC (`confirm_reservation`, `checkin_reservation`, ...) que validan el rol del usuario y la transición de estado permitida.
- **La integridad de disponibilidad** está protegida en tres capas: la consulta de disponibilidad (`search_available_rooms`), la selección de habitación con `FOR UPDATE SKIP LOCKED` dentro de `create_reservation_atomic`/`confirm_reservation`, y finalmente el constraint `reservations_no_overlap` (`EXCLUDE USING gist`), que hace imposible a nivel de base de datos que dos reservas `confirmed`/`checked_in` se solapen para la misma habitación.
- **Reservas "por noche" y "por horas"** conviven en la misma tabla (`reservations.booking_mode`). `check_in_date`/`check_out_date` (día de calendario) se siguen llenando para ambos modos —para una reserva por horas se derivan del instante preciso— así que el dashboard, el calendario y el listado admin filtran igual sin importar el modo. La función `reservation_occupancy()` (0010_hourly_bookings.sql) unifica ambos modos en un único rango de tiempo (`tstzrange`), que es lo que realmente se usa para decidir solapamientos: eso es lo que permite que dos reservas por horas el mismo día, en horarios distintos, no se bloqueen entre sí.
