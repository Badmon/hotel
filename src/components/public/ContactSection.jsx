import { siteConfig } from "../../config/siteConfig";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

export function ContactSection() {
  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Contacto</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ContactItem label="Teléfono" value={siteConfig.hotel.phone} href={`tel:${siteConfig.hotel.phone}`} />
        <ContactItem
          label="WhatsApp"
          value={siteConfig.hotel.phone}
          href={buildWhatsAppUrl("Hola, quisiera más información sobre el hotel.")}
        />
        <ContactItem label="Correo" value={siteConfig.hotel.email} href={`mailto:${siteConfig.hotel.email}`} />
        <ContactItem label="Horario" value={siteConfig.hotel.schedule} />
      </div>
    </section>
  );
}

function ContactItem({ label, value, href }) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-[var(--color-primary)]"
      >
        {content}
      </a>
    );
  }

  return <div className="rounded-xl border border-slate-200 p-4">{content}</div>;
}
