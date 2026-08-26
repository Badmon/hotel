import { useState } from "react";
import { Input } from "../common/Input";
import { Textarea } from "../common/Textarea";
import { Button } from "../common/Button";
import { slugify } from "../../utils/slugify";

const emptyImage = () => ({ image_url: "", alt_text: "" });

/**
 * Formulario de alta/edición de un tipo de habitación. No llama a
 * Supabase directamente: delega en onSubmit(roomType, images), que en
 * la página admin decide si crea o actualiza.
 */
export function RoomTypeForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const isEditing = Boolean(initialValues?.id);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [shortDescription, setShortDescription] = useState(initialValues?.short_description ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [capacity, setCapacity] = useState(initialValues?.capacity ?? 2);
  const [basePrice, setBasePrice] = useState(initialValues?.base_price ?? "");
  const [allowsHourly, setAllowsHourly] = useState(initialValues?.allows_hourly ?? false);
  const [hourlyPrice, setHourlyPrice] = useState(initialValues?.hourly_price ?? "");
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [active, setActive] = useState(initialValues?.active ?? true);
  const [images, setImages] = useState(
    initialValues?.room_images?.length ? initialValues.room_images.map((img) => ({ ...img })) : [emptyImage()]
  );
  const [errors, setErrors] = useState({});

  function handleNameChange(value) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleImageChange(index, field, value) {
    setImages((current) => current.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }

  function addImageRow() {
    setImages((current) => [...current, emptyImage()]);
  }

  function removeImageRow(index) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function validate() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!slug.trim()) newErrors.slug = "El slug es obligatorio.";
    if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      newErrors.slug = "Solo minúsculas, números y guiones.";
    }
    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      newErrors.capacity = "La capacidad debe ser al menos 1.";
    }
    if (basePrice === "" || Number.isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      newErrors.basePrice = "Ingresa un precio por noche válido.";
    }
    if (allowsHourly) {
      if (hourlyPrice === "" || Number.isNaN(Number(hourlyPrice)) || Number(hourlyPrice) <= 0) {
        newErrors.hourlyPrice = "Ingresa un precio por hora válido.";
      }
    }
    return newErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const roomType = {
      name: name.trim(),
      slug: slug.trim(),
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      capacity: Number(capacity),
      base_price: Number(basePrice),
      allows_hourly: allowsHourly,
      hourly_price: allowsHourly ? Number(hourlyPrice) : null,
      featured,
      active,
    };

    const cleanImages = images
      .map((img) => ({ image_url: img.image_url.trim(), alt_text: img.alt_text?.trim() || "" }))
      .filter((img) => img.image_url);

    onSubmit(roomType, cleanImages);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="room-type-name"
          label="Nombre"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          id="room-type-slug"
          label="Slug (usado en la URL)"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          error={errors.slug}
          hint="Solo minúsculas, números y guiones, ej: matrimonial"
          required
        />
      </div>

      <Input
        id="room-type-short-description"
        label="Descripción breve (se muestra en el card)"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
      />

      <Textarea
        id="room-type-description"
        label="Descripción completa"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="room-type-capacity"
          type="number"
          min={1}
          label="Capacidad (huéspedes)"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          error={errors.capacity}
          required
        />
        <Input
          id="room-type-base-price"
          type="number"
          min={0}
          step="0.01"
          label="Precio por noche"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          error={errors.basePrice}
          required
        />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={allowsHourly}
            onChange={(e) => setAllowsHourly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Admite reserva por horas
        </label>

        {allowsHourly && (
          <Input
            id="room-type-hourly-price"
            type="number"
            min={0}
            step="0.01"
            label="Precio por hora"
            value={hourlyPrice}
            onChange={(e) => setHourlyPrice(e.target.value)}
            error={errors.hourlyPrice}
            className="mt-3 max-w-xs"
            required
          />
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Destacada en la home
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Visible en el sitio (activa)
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Imágenes</p>
        <div className="space-y-2">
          {images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                id={`image-url-${index}`}
                placeholder="/images/rooms/ejemplo.jpg"
                value={image.image_url}
                onChange={(e) => handleImageChange(index, "image_url", e.target.value)}
                className="flex-[2]"
              />
              <Input
                id={`image-alt-${index}`}
                placeholder="Texto alternativo"
                value={image.alt_text}
                onChange={(e) => handleImageChange(index, "alt_text", e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImageRow(index)}>
                Quitar
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addImageRow} className="mt-2">
          + Agregar imagen
        </Button>
        <p className="mt-1 text-xs text-slate-500">
          Usa rutas de public/images/rooms/ (ej: /images/rooms/matrimonial-1.svg) o URLs completas.
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear habitación"}
        </Button>
      </div>
    </form>
  );
}
