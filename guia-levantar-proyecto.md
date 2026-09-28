# Cómo levantar el proyecto (guía sin tecnicismos)

Esta guía explica, paso a paso y sin jerga técnica, cómo poner en marcha el sitio del hotel en tu computadora para hacer pruebas, conectado a los datos reales de Supabase (habitaciones, reservas, etc.).

No hace falta que entiendas qué es cada herramienta: solo sigue los pasos en orden.

## ¿Qué es Supabase, en una frase?

Es donde vive toda la información del hotel: las habitaciones, sus precios, las reservas, los usuarios. El proyecto que tienes en tu computadora es solo la "cara visible" (lo que se ve en el navegador); sin conectarlo a Supabase, la página se ve pero no puede mostrar ni guardar información real.

## Antes de empezar (solo la primera vez)

1. **Tener instalado Node.js.** Es un programa que permite que el proyecto funcione en tu computadora. Si nunca lo instalaste, avísame y te ayudo a instalarlo.
2. **Tener las "llaves" de Supabase.** Son cuatro códigos secretos que conectan el proyecto con la base de datos del hotel. Se consiguen así:
   - Entra a [supabase.com](https://supabase.com) e inicia sesión con la cuenta del hotel.
   - Abre el proyecto correspondiente.
   - Ve a **Project Settings → API**.
   - Ahí vas a encontrar dos datos que necesitas copiar: la **URL del proyecto** y la clave marcada como **anon public**.
   - Si además vas a probar la parte de "crear reservas" (no solo mirar), también necesitas la **URL** (sin el prefijo especial) y la clave marcada como **service_role** — esta última es más delicada, más abajo se explica por qué.

## Paso 1 — Guardar esas llaves en el proyecto

El proyecto necesita un archivo especial llamado `.env` (que no viene incluido por seguridad) donde se guardan esas llaves. Si es la primera vez:

1. Busca en la carpeta del proyecto un archivo llamado `.env.example`.
2. Haz una copia de ese archivo y ponle de nombre `.env` (sin `.example`).
3. Abre el nuevo archivo `.env` y completa cada línea con el dato que corresponde (la URL, la clave `anon`, etc.), pegando lo que copiaste de Supabase.

**Importante:** la clave `service_role` es como la llave maestra de todo el hotel — nunca se comparte, nunca se sube a internet ni se manda por chat. Si no la tienes o no estás seguro, dímelo y seguimos sin ella (la página funcionará igual para mirar habitaciones, solo no se podrán confirmar reservas nuevas de prueba).

## Paso 2 — Instalar las piezas necesarias

Esto se hace una sola vez (o cada vez que el proyecto cambie mucho). Es como "descargar todas las herramientas" que el proyecto necesita para armarse. Yo puedo hacer este paso por ti con un comando; solo dime "instala las dependencias" o simplemente pídeme que levante el proyecto y lo hago automáticamente si hace falta.

## Paso 3 — Encender el proyecto

Aquí es donde el proyecto realmente "se enciende" y queda listo para probarse, ya conectado a Supabase. Yo ejecuto esto por ti; el resultado es una dirección web local, algo como:

```
http://localhost:8888
```

Esa es la dirección que debes abrir en tu navegador (Chrome, Safari, etc.) para ver y usar el sitio como si fuera la versión real.

Hay dos formas de encenderlo, y la diferencia importa:

- **Modo simple:** muestra el sitio, pero la función de "crear una reserva" no funciona (porque esa parte necesita la llave maestra mencionada arriba).
- **Modo completo (recomendado para pruebas):** muestra el sitio *y* permite completar el flujo entero, incluida la creación de reservas. Este es el que normalmente vamos a usar.

Cuando me pidas "levanta el proyecto", yo por defecto uso el modo completo.

## Paso 4 — Probar

Con la página abierta en `http://localhost:8888`, ya puedes navegar como lo haría un huésped: buscar disponibilidad, ver habitaciones, hacer una reserva de prueba, y también entrar al panel de administración para revisar esas reservas.

Si en algún momento la página se ve vacía o dice "no hay habitaciones disponibles", generalmente es un tema de los *datos* dentro de Supabase (por ejemplo, que falten habitaciones cargadas), no del proyecto en sí — avísame y lo reviso.

## Paso 5 — Apagarlo

Cuando termines de probar, solo dime que lo apague, o si preferiste hacerlo tú mismo desde una terminal, basta con cerrarla.

## Resumen ultra corto

1. Copiar las llaves de Supabase al archivo `.env` (solo la primera vez).
2. Pedirme "levanta el proyecto para hacer pruebas".
3. Abrir `http://localhost:8888` en el navegador.
4. Probar.
5. Avisar cuando quieras que lo apague.
