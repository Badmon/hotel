import { useEffect, useState } from "react";

export function RoomImageGallery({ images, roomName }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;
  const activeImage = isOpen ? images[activeIndex] : null;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, images.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="group relative col-span-4 overflow-hidden rounded-xl text-left sm:col-span-3"
          aria-label={`Ver foto 1 de ${images.length} de ${roomName}`}
        >
          <img src={images[0].image_url} alt={images[0].alt_text || roomName} className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-96" />
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-white">
            Ver fotos {images.length > 1 && `(${images.length})`}
          </span>
        </button>
        {images.length > 1 && (
          <div className="hidden grid-cols-1 gap-3 sm:col-span-1 sm:grid">
            {images.slice(1, 4).map((image, index) => (
              <button
                key={image.id ?? image.image_url}
                type="button"
                onClick={() => setActiveIndex(index + 1)}
                className="overflow-hidden rounded-xl"
                aria-label={`Ver foto ${index + 2} de ${images.length} de ${roomName}`}
              >
                <img src={image.image_url} alt={image.alt_text || roomName} className="h-[7.5rem] w-full object-cover transition hover:scale-[1.03]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-4" role="dialog" aria-modal="true" aria-label={`Fotos de ${roomName}`}>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between text-white">
            <p className="text-sm font-medium">{activeIndex + 1} de {images.length}</p>
            <button type="button" onClick={() => setActiveIndex(null)} className="rounded-full p-2 hover:bg-white/15" aria-label="Cerrar galería">
              <CloseIcon />
            </button>
          </div>

          <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center">
            {images.length > 1 && <CarouselButton direction="previous" onClick={showPrevious} />}
            <img src={activeImage.image_url} alt={activeImage.alt_text || roomName} className="max-h-full max-w-full rounded-lg object-contain" />
            {images.length > 1 && <CarouselButton direction="next" onClick={showNext} />}
          </div>

          {images.length > 1 && (
            <div className="mx-auto mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button key={image.id ?? image.image_url} type="button" onClick={() => setActiveIndex(index)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${index === activeIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`} aria-label={`Mostrar foto ${index + 1}`}>
                  <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CarouselButton({ direction, onClick }) {
  const isPrevious = direction === "previous";
  return (
    <button type="button" onClick={onClick} className={`absolute z-10 rounded-full bg-slate-900/70 p-3 text-white hover:bg-slate-800 ${isPrevious ? "left-0 sm:left-3" : "right-0 sm:right-3"}`} aria-label={isPrevious ? "Foto anterior" : "Foto siguiente"}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={isPrevious ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
