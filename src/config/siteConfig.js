/**
 * Configuración central del sitio.
 *
 * Edita este archivo para personalizar el hotel: nombre, contacto,
 * imágenes, colores, mapa y redes sociales. La mayoría de los
 * componentes leen sus textos e imágenes desde aquí, así que casi
 * nunca deberías necesitar tocar un componente para cambiar
 * información del hotel.
 *
 * Los colores además deben reflejarse como variables CSS en
 * `src/index.css` (bloque :root) para que Tailwind los use.
 */

export const siteConfig = {
  hotel: {
    name: "Smart Love",
    slogan: "Descansa, desconecta y disfruta tu estadía",
    description:
      "Un hotel pensado para que tu descanso sea simple: habitaciones cómodas, atención cercana y una ubicación conveniente.",
    phone: "+51 999 999 999",
    // Solo dígitos, con código de país, sin signos ni espacios (formato wa.me)
    whatsapp: "51999999999",
    email: "reservas@hoteldemo.com",
    address: "Sector Alipio Ponce Mz F lote 6, 15058 San Juan de Miraflores, Perú",
    schedule: "Recepción disponible las 24 horas",
  },

  currency: {
    code: "PEN",
    symbol: "S/",
  },

  colors: {
    primary: "#0f766e",
    primaryDark: "#0b5a54",
    secondary: "#1e293b",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
  },

  images: {
    logo: "/images/branding/logo.svg",
    banner: "/images/hotel/hotel-home.jpg",
    about: "/images/hotel/about.svg",
    location: "/images/hotel/location.svg",
    placeholderRoom: "/images/rooms/placeholder.svg",
  },

  social: {
    facebook: "",
    instagram: "",
  },

  maps: {
    // Coordenadas de "Hostal cochera jacuzzi" (Smart Love), obtenidas
    // del enlace corto de Google Maps compartido para el hotel.
    embedUrl: "https://www.google.com/maps?q=-12.1710662,-76.9798348&z=17&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=-12.1710662,-76.9798348",
  },

  services: [
    { id: "wifi", label: "WiFi gratis", icon: "wifi" },
    { id: "parking", label: "Estacionamiento", icon: "parking" },
    { id: "hot-water", label: "Agua caliente", icon: "droplet" },
    { id: "tv", label: "TV por cable", icon: "tv" },
    { id: "breakfast", label: "Desayuno incluido", icon: "coffee" },
    { id: "reception", label: "Recepción 24 horas", icon: "concierge" },
  ],

  nav: [
    { label: "Inicio", href: "/" },
    { label: "Habitaciones", href: "/habitaciones" },
    { label: "Servicios", href: "/#servicios" },
    { label: "Ubicación", href: "/#ubicacion" },
    { label: "Contacto", href: "/#contacto" },
  ],
};

export default siteConfig;
