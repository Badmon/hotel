import { useRef, useState } from "react";
import { Input } from "../common/Input";
import { DateInput } from "../common/DateInput";
import { Textarea } from "../common/Textarea";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { slugify } from "../../utils/slugify";
import { uploadRoomImage, deleteRoomImageFiles } from "../../services/roomsService";

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
  const [onPromotion, setOnPromotion] = useState(initialValues?.on_promotion ?? false);
  const [promoPrice, setPromoPrice] = useState(initialValues?.promo_price ?? "");
  const [promoStartsAt, setPromoStartsAt] = useState(initialValues?.promo_starts_at ?? "");
  const [promoEndsAt, setPromoEndsAt] = useState(initialValues?.promo_ends_at ?? "");
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [active, setActive] = useState(initialValues?.active ?? true);
  const [images, setImages] = useState(
    initialValues?.room_images?.length ? initialValues.room_images.map((img) => ({ ...img })) : [emptyImage()]
  );
  const [errors, setErrors] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Archivos subidos al bucket durante esta sesión de edición, para
  // poder limpiarlos si se reemplazan antes de guardar o si se
  // cancela el formulario — de lo contrario quedarían huérfanos en
  // Storage sin que ninguna fila los referencie nunca.
  const sessionUploadedUrls = useRef([]);

  function handleNameChange(value) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleImageChange(index, field, value) {
    setImages((current) => current.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }

  async function handleFileSelect(index, file) {
    if (!file) return;
    setUploadError(null);
    setUploadingIndex(index);
    try {
      const url = await uploadRoomImage(file);
      sessionUploadedUrls.current.push(url);
      handleImageChange(index, "image_url", url);
    } catch (err) {
      setUploadError(err.message || "No fue posible subir la imagen.");
    } finally {
      setUploadingIndex(null);
    }
  }

  function addImageRow() {
    setImages((current) => [...current, emptyImage()]);
  }

  function removeImageRow(index) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function handleCancel() {
    // Nada de lo subido en esta sesión llegó a guardarse: se limpia
    // del bucket para no dejar archivos huérfanos.
    if (sessionUploadedUrls.current.length > 0) {
      deleteRoomImageFiles(sessionUploadedUrls.current);
    }
    onCancel();
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
    if (onPromotion) {
      if (promoPrice === "" || Number.isNaN(Number(promoPrice)) || Number(promoPrice) <= 0) {
        newErrors.promoPrice = "Ingresa un precio de oferta válido.";
      } else if (basePrice !== "" && Number(promoPrice) >= Number(basePrice)) {
        newErrors.promoPrice = "El precio de oferta debe ser menor al precio por noche.";
      }
      if (promoStartsAt && promoEndsAt && promoEndsAt < promoStartsAt) {
        newErrors.promoEndsAt = "La fecha de fin debe ser posterior a la de inicio.";
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
      on_promotion: onPromotion,
      promo_price: onPromotion ? Number(promoPrice) : null,
      promo_starts_at: onPromotion && promoStartsAt ? promoStartsAt : null,
      promo_ends_at: onPromotion && promoEndsAt ? promoEndsAt : null,
      featured,
      active,
    };

    const cleanImages = images
      .map((img) => ({ image_url: img.image_url.trim(), alt_text: img.alt_text?.trim() || "" }))
      .filter((img) => img.image_url);

    // Un archivo subido en esta sesión y luego reemplazado por otro
    // antes de guardar nunca llega a quedar en cleanImages: se limpia
    // del bucket para no dejarlo huérfano.
    const keptUrls = new Set(cleanImages.map((img) => img.image_url));
    const orphanedUploads = sessionUploadedUrls.current.filter((url) => !keptUrls.has(url));
    if (orphanedUploads.length > 0) {
      deleteRoomImageFiles(orphanedUploads);
    }

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

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onPromotion}
            onChange={(e) => setOnPromotion(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          En promoción
        </label>

        {onPromotion && (
          <div className="mt-3 space-y-3">
            <Input
              id="room-type-promo-price"
              type="number"
              min={0}
              step="0.01"
              label="Precio de oferta"
              value={promoPrice}
              onChange={(e) => setPromoPrice(e.target.value)}
              error={errors.promoPrice}
              hint="Debe ser menor al precio por noche."
              className="max-w-xs"
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
              <DateInput
                id="room-type-promo-starts"
                label="Desde (opcional)"
                value={promoStartsAt}
                onChange={(e) => setPromoStartsAt(e.target.value)}
                hint="Vacío = ya empezó"
              />
              <DateInput
                id="room-type-promo-ends"
                label="Hasta (opcional)"
                value={promoEndsAt}
                min={promoStartsAt || undefined}
                onChange={(e) => setPromoEndsAt(e.target.value)}
                error={errors.promoEndsAt}
                hint="Vacío = no vence"
              />
            </div>
          </div>
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
        {uploadError && <ErrorMessage message={uploadError} className="mb-2" />}
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex flex-wrap items-start gap-3 rounded-lg border border-slate-200 p-3">
              {image.image_url && (
                <img src={image.image_url} alt="" className="h-14 w-14 flex-shrink-0 rounded object-cover" />
              )}
              <div className="min-w-[200px] flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    {uploadingIndex === index ? "Subiendo..." : "Subir imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIndex !== null}
                      onChange={(e) => handleFileSelect(index, e.target.files?.[0])}
                    />
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeImageRow(index)}>
                    Quitar
                  </Button>
                </div>
                <Input
                  id={`image-url-${index}`}
                  placeholder="O pega una URL / ruta de public/images/rooms/"
                  value={image.image_url}
                  onChange={(e) => handleImageChange(index, "image_url", e.target.value)}
                />
                <Input
                  id={`image-alt-${index}`}
                  placeholder="Texto alternativo"
                  value={image.alt_text}
                  onChange={(e) => handleImageChange(index, "alt_text", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addImageRow} className="mt-2">
          + Agregar imagen
        </Button>
        <p className="mt-1 text-xs text-slate-500">Máximo 5MB por imagen.</p>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear habitación"}
        </Button>
      </div>
    </form>
  );
}
