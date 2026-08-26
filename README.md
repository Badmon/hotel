# Hotel Demo — MVP de reservas

MVP funcional para un hotel pequeño/mediano: sitio público con buscador de disponibilidad y solicitud de reservas, y panel administrativo para gestionarlas. React + Vite + Tailwind + Supabase (Postgres, Auth, RLS) + Netlify Functions.

No incluye pasarela de pagos: el pago se realiza directamente en el hotel.

## Stack

- React 19 + Vite + JavaScript
- Tailwind CSS v4
- React Router v7
- Supabase (Postgres, Auth, Row Level Security)
- Netlify Functions (para la única operación que necesita privilegios de servidor: crear una reserva)

## Requisitos

- Node.js 20 o superior
- Una cuenta de [Supabase](https://supabase.com)
- Una cuenta de [Netlify](https://netlify.com) (para desplegar)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y complétalo:

```bash
cp .env.example .env
```

| Variable | Dónde se usa | Puede exponerse en el navegador |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Sí |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Sí (protegida por RLS) |
| `SUPABASE_URL` | Netlify Functions | No, solo servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify Functions | **Nunca**, solo servidor |

La `service_role` key nunca debe llevar el prefijo `VITE_` (Vite incluiría su valor en el bundle del navegador) y solo debe configurarse como variable de entorno en Netlify, nunca en un `.env` versionado.

## Ejecutar localmente

```bash
npm run dev
```

Las Netlify Functions (`netlify/functions/`) no corren con `npm run dev`; para probarlas localmente instala `netlify-cli` y usa `netlify dev`, o simplemente pruébalas ya desplegadas en un deploy preview de Netlify.

## Build de producción

```bash
npm run build
```

## Configurar Supabase

Ver la guía completa en [`supabase/README.md`](./supabase/README.md). Resumen:

1. Crea un proyecto en Supabase y copia sus claves a `.env`.
2. Ejecuta las migraciones de `supabase/migrations/` (en orden) desde el SQL Editor.
3. Ejecuta `supabase/seed.sql` para cargar datos de demostración.
4. Crea un usuario en Authentication → Users y súbelo a `role = 'admin'` en la tabla `profiles` (instrucciones en `supabase/README.md`).

## Desplegar en Netlify

Este repositorio está listo para desplegarse directamente desde GitHub:

1. Conecta el repositorio en Netlify (New site from Git).
2. Build command: `npm run build` · Publish directory: `dist` (ya configurado en `netlify.toml`, que también define el redirect SPA para que rutas como `/admin/reservations` no den 404 al refrescar, y la carpeta de funciones).
3. En **Site settings → Environment variables**, agrega las cuatro variables de la tabla de arriba.
4. Deploy.

## Personalizar el hotel

Casi toda la identidad del hotel se edita en dos lugares, sin tocar componentes:

### `src/config/siteConfig.js`

Nombre, slogan, teléfono, WhatsApp, correo, dirección, horario, moneda, colores, redes sociales, mapa (URL de embed y de "cómo llegar") y la lista de servicios que se muestra en la home.

### `src/index.css`

El bloque `:root` define las variables CSS de color (`--color-primary`, `--color-accent`, etc.) que usan los componentes vía Tailwind (`bg-[var(--color-primary)]`). Mantén estos valores sincronizados con `siteConfig.colors`.

### `public/images/`

```text
public/images/
  branding/logo.svg      Logo del navbar, sidebar admin y login
  hotel/hero.svg          Imagen de portada de la home
  hotel/about.svg         Disponible para usar en secciones futuras
  hotel/location.svg      Disponible para usar en secciones futuras
  rooms/*.svg              Imágenes de habitaciones (referenciadas desde room_images)
```

Reemplaza estos archivos por tus propias fotos (mismo nombre, o actualiza las rutas en `siteConfig.js` y en la tabla `room_images`). Los placeholders son SVG generados localmente, no dependen de ningún servicio externo.

### Contenido de habitaciones

Los tipos de habitación, habitaciones físicas e imágenes viven en la base de datos (`room_types`, `rooms`, `room_images`), editables desde el SQL Editor de Supabase o desde `/admin/rooms` (estado de habitación).

## Arquitectura

```text
src/
  components/
    common/     Button, Input, Modal, Card, Badge... (genéricos, sin lógica de negocio)
    public/     Navbar, Hero, RoomCard, ReservationForm... (sitio público)
    admin/      AdminSidebar, ReservationStatusBadge, ProtectedRoute... (panel admin)
  pages/
    public/     Una página por ruta pública
    admin/      Una página por ruta administrativa
  layouts/      PublicLayout (navbar+footer) y AdminLayout (sidebar+header, protegido)
  services/     Única capa que llama a Supabase (roomsService, reservationsService, authService)
  hooks/        useAuth, useRooms, useAvailability, useReservations
  context/      AuthContext: sesión y perfil de Supabase Auth
  config/       siteConfig.js — toda la identidad del hotel
  constants/    Estados de reserva/habitación y roles, con sus etiquetas y estilos
  utils/        Fechas, moneda, WhatsApp, validación — sin dependencias de Supabase ni de React

netlify/functions/   create-reservation: la única operación con privilegios de servidor
supabase/             migrations/, seed.sql y su propio README
```

Los componentes nunca llaman a Supabase directamente: siempre pasan por `services/`. Esto mantiene la UI desacoplada de cómo se obtienen los datos y facilita reemplazar o extender esa capa más adelante.

## Base de datos

Seis tablas: `profiles`, `room_types`, `rooms`, `room_images`, `reservations`, más las funciones SQL que centralizan las reglas de negocio. Detalle completo, incluyendo el modelo de RLS, en [`supabase/README.md`](./supabase/README.md).

Puntos clave:

- **`room_types` vs `rooms`**: el tipo comercial ("Matrimonial") es independiente de la habitación física ("101", "102"). Varias `rooms` pueden compartir un `room_type`.
- **Nunca se borran reservas**: solo cambian de estado. `created_at`, `confirmed_at`, `checked_in_at`, `checked_out_at` y `cancelled_at` quedan como historial.
- **La disponibilidad** se calcula con la regla `existing.check_in < requested.check_out AND existing.check_out > requested.check_in`, implementada una sola vez en SQL (`search_available_rooms`) y reutilizada desde `create_reservation_atomic` y `confirm_reservation`.

## Flujo de reservas

```text
Huésped elige fechas y huéspedes → busca disponibilidad (search_available_rooms)
  → elige un tipo de habitación → completa sus datos → confirma el resumen
  → POST a /.netlify/functions/create-reservation
  → la función llama a create_reservation_atomic (Postgres, con la service role key)
  → esa función revalida fechas/capacidad, bloquea una habitación física disponible
    (FOR UPDATE SKIP LOCKED) y crea la reserva con status = 'pending'
  → el huésped recibe su código (HT-2026-XXXXX) y un enlace de WhatsApp
  → el hotel ve la solicitud en /admin/reservations y decide: confirmar o rechazar
```

Ninguna reserva se inserta directamente desde el navegador: el frontend no tiene permiso de `INSERT` sobre `reservations` (ver RLS). Todo pasa por la Netlify Function o por las funciones RPC administrativas.

## Seguridad

- **Row Level Security activo en todas las tablas.** El público solo lee `room_types` activos, `rooms` y `room_images`; nunca lee `reservations` directamente.
- **La service role key vive únicamente en variables de entorno de Netlify**, nunca en el frontend ni en el repositorio.
- **Doble reserva imposible incluso ante condiciones de carrera**: además de la revalidación en `create_reservation_atomic`/`confirm_reservation`, existe un constraint `EXCLUDE USING gist` en Postgres que hace inviable, a nivel de base de datos, que dos reservas `confirmed`/`checked_in` se solapen para la misma habitación.
- **Cambios de rol protegidos**: un usuario puede editar su propio nombre/teléfono, pero no su propio `role` (evita que un customer se auto-asigne staff/admin).
- **Notas internas** (`internal_notes`) nunca se exponen a policies públicas ni a la Netlify Function de creación de reservas.

## Cómo ejecutar el flujo completo (checklist de aceptación)

1. `npm run dev`, abre la home, busca disponibilidad para un rango de fechas.
2. Selecciona una habitación disponible, completa el formulario, revisa el resumen y envía la solicitud.
3. Recibes el código de reserva (`HT-2026-XXXXX`) y el botón de WhatsApp.
4. Inicia sesión en `/admin/login` con el usuario que promoviste a `admin`.
5. La reserva aparece como **Pendiente** en `/admin/reservations`.
6. Ábrela y confírmala: la habitación deja de aparecer disponible para esas fechas.
7. El día de la llegada, realiza el check-in (pasa a **Hospedado**).
8. Realiza el check-out (pasa a **Completada**) y queda en el historial.

## Roadmap explícitamente fuera de este MVP

Cuentas de clientes con login (incluido Google), historial de reservas del huésped, pagos en línea, reseñas, cupones/promociones, tarifas por temporada, multi-hotel, multi-moneda, integración con WhatsApp Business API, facturación, housekeeping e integraciones OTA (Booking.com, Expedia). El esquema y las funciones actuales están pensados para no bloquear ninguna de estas ampliaciones (por ejemplo, `reservations.user_id` ya es nullable y `profiles.role` ya contempla `customer`).
