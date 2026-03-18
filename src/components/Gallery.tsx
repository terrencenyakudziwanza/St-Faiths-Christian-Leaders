import React from "react";
import close from "../assets/icons/close.svg";
import { boardMembers } from "../data/boardMembers";

type GalleryTile = {
  src: string;
  alt: string;
};

const buildGalleryTiles = (): GalleryTile[] => {
  const images = boardMembers.map((member) => ({
    src: member.imageSrc,
    alt: member.name,
  }));

  if (!images.length) {
    return [];
  }

  const shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

interface GalleryModalProps {
  show: boolean;
  onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ show, onClose }) => (
  <div
    className={`fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(0,0,0,0.7)] transition-opacity duration-300 ${
      show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
    onClick={onClose}
  >
    <div
      className={`relative h-[70vh] w-[92vw] max-w-[960px] rounded-[32px] border border-subtle bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-transform duration-300 ${
        show ? "scale-100" : "scale-95"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-surface-elevated hover:bg-surface-muted transition-colors"
        aria-label="Close gallery modal"
      >
        <img src={close} alt="" className="icon-dk icon-adapt scale-110" />
      </button>

      {/* EMPTY MODAL BODY */}
      <div className="h-full w-full"></div>
    </div>
  </div>
);

const Gallery: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);

  const tiles = React.useMemo(() => buildGalleryTiles(), []);
  const rowTiles = React.useMemo(() => {
    if (!tiles.length) {
      return [];
    }

    const desired = 9;
    return Array.from({ length: desired }, (_, index) => {
      const tile = tiles[index % tiles.length];
      return {
        ...tile,
        key: `${tile.src}-${index}`,
      };
    });
  }, [tiles]);

  React.useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [modalOpen]);

  return (
    <section
      id="gallery-section"
      data-nav-theme="dark"
      className="relative min-h-screen w-full overflow-hidden bg-page"
    >
      {/* MOVING GALLERY GRID */}
      <div className="gallery-grid">
        {[
          "gallery-grid-row gallery-grid-row--slow",
          "gallery-grid-row gallery-grid-row--reverse",
          "gallery-grid-row gallery-grid-row--fast",
        ].map((rowClass, rowIndex) => (
          <div key={`gallery-row-${rowIndex}`} className={rowClass}>
            {rowTiles.map((tile, index) => (
              <div
                key={`${tile.key}-a-${index}`}
                className="gallery-tile"
              >
                <img src={tile.src} alt={tile.alt} />
              </div>
            ))}
            {rowTiles.map((tile, index) => (
              <div
                key={`${tile.key}-b-${index}`}
                className="gallery-tile"
              >
                <img src={tile.src} alt={tile.alt} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(8,8,12,0.92)_0%,rgba(8,8,12,0.68)_45%,rgba(8,8,12,0.2)_100%)]"></div>

      {/* CENTER COPY */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
        <div className="max-w-[620px]">
          <p className="text-overline font-semibold text-accent-strong">
            Christian Leaders Gallery
          </p>
          <h2 className="mt-4 text-display font-semibold text-inverse">
            A Gallery Preview
          </h2>
          <p className="mx-auto mt-4 text-body text-inverse opacity-80">
            Explore a curated look at the moments, leaders, and stories that
            shape the Christian Leaders family.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-elevated px-5 py-2 text-body-sm font-semibold text-ink shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-contrast hover:text-inverse"
          >
            Preview Gallery
          </button>
        </div>
      </div>

      {/* GALLERY MODAL (EMPTY STATE) */}
      <GalleryModal show={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};

export default Gallery;
