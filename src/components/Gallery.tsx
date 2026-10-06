import React from "react";
import { Heart, X } from "lucide-react";
import { boardMembers } from "../data/boardMembers";
import { useCmsSection } from "../hooks/useCmsSection";
import { resolveCmsMedia } from "../lib/cms";

type GalleryTile = {
  id: string;
  src: string;
  alt: string;
  description: string;
  tags: string[];
  likes: number;
  ratio: string;
  termId: string;
};

const galleryMeta: Array<{
  description: string;
  tags: string[];
  likes: number;
  ratio: string;
}> = [
  {
    description: "Intercession at first light",
    tags: ["#intercession", "#dawn"],
    likes: 128,
    ratio: "4 / 5",
  },
  {
    description: "Praise rises in the sanctuary",
    tags: ["#praise", "#worship"],
    likes: 214,
    ratio: "3 / 4",
  },
  {
    description: "Bible study in focus",
    tags: ["#biblestudy", "#discipleship"],
    likes: 176,
    ratio: "1 / 1",
  },
  {
    description: "Healing prayer moment",
    tags: ["#healing", "#miraculous"],
    likes: 203,
    ratio: "2 / 3",
  },
  {
    description: "Hands lifted in surrender",
    tags: ["#worship", "#revival"],
    likes: 189,
    ratio: "3 / 4",
  },
  {
    description: "Intercession circle",
    tags: ["#prayer", "#intercession"],
    likes: 162,
    ratio: "4 / 5",
  },
  {
    description: "Scripture alive",
    tags: ["#word", "#bible"],
    likes: 147,
    ratio: "1 / 1",
  },
  {
    description: "Joyful praise",
    tags: ["#praise", "#community"],
    likes: 219,
    ratio: "3 / 5",
  },
];

const galleryTerms = [
  {
    id: "term-2-2026",
    title: "Term 2, 2026",
    theme: "Faith in Motion",
    tint: "rgba(255, 213, 0, 0.01)",
    border: "rgba(219, 179, 81, 0.2)",
  },
];

const buildGalleryTiles = (): GalleryTile[] => {
  const images = boardMembers.map((member, index) => {
    const meta = galleryMeta[index % galleryMeta.length];
    const term = galleryTerms[index % galleryTerms.length];

    return {
      id: `${member.id}-${index}`,
      src: member.imageSrc,
      alt: member.name,
      description: meta.description,
      tags: meta.tags,
      likes: meta.likes,
      ratio: meta.ratio,
      termId: term.id,
    };
  });

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
  tiles: GalleryTile[];
}

const GalleryModal: React.FC<GalleryModalProps> = ({ show, onClose, tiles }) => {
  const scrollRootRef = React.useRef<HTMLDivElement>(null);
  const [mobileActiveTiles, setMobileActiveTiles] = React.useState<Set<string>>(() => new Set());
  const [likeCounts, setLikeCounts] = React.useState<Record<string, number>>(
    () =>
      Object.fromEntries(tiles.map((tile) => [tile.id, tile.likes])),
  );
  const [likedTiles, setLikedTiles] = React.useState<Record<string, boolean>>({});

  const getColumnCount = React.useCallback(() => {
    if (typeof window === "undefined") {
      return 3;
    }

    const width = window.innerWidth;
    if (width < 640) {
      return 1;
    }
    if (width < 960) {
      return 2;
    }
    if (width < 1280) {
      return 3;
    }

    return 4;
  }, []);

  const [columnsCount, setColumnsCount] = React.useState(getColumnCount);

  React.useEffect(() => {
    const handleResize = () => {
      setColumnsCount(getColumnCount());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [getColumnCount]);

  const groupedTerms = React.useMemo(
    () =>
      galleryTerms
        .map((term) => ({
          ...term,
          tiles: tiles.filter((tile) => tile.termId === term.id),
        }))
        .filter((term) => term.tiles.length > 0),
    [tiles],
  );

  const buildColumns = React.useCallback(
    (termTiles: GalleryTile[]) => {
      const cols = Array.from({ length: columnsCount }, () => [] as GalleryTile[]);

      termTiles.forEach((tile, index) => {
        cols[index % columnsCount].push(tile);
      });

      return cols;
    },
    [columnsCount],
  );

  const handleLike = (tileId: string) => {
    const nextLiked = !likedTiles[tileId];

    setLikedTiles((prev) => {
      return {
        ...prev,
        [tileId]: nextLiked,
      };
    });
    setLikeCounts((counts) => ({
      ...counts,
      [tileId]: (counts[tileId] ?? 0) + (nextLiked ? 1 : -1),
    }));
  };

  const columnOffsets = [0, 28, 12, 42];

  React.useEffect(() => {
    const root = scrollRootRef.current;
    if (!show || !root || window.innerWidth >= 768) {
      setMobileActiveTiles(new Set());
      return;
    }

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-gallery-tile]"));
    const centerObserver = new IntersectionObserver((entries) => {
      setMobileActiveTiles((previous) => {
        const next = new Set(previous);
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.galleryTile;
          if (id && entry.isIntersecting) next.add(id);
        });
        return next;
      });
    }, { root, rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    const viewportObserver = new IntersectionObserver((entries) => {
      setMobileActiveTiles((previous) => {
        const next = new Set(previous);
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.galleryTile;
          if (id && !entry.isIntersecting) next.delete(id);
        });
        return next;
      });
    }, { root, threshold: 0 });

    nodes.forEach((node) => {
      centerObserver.observe(node);
      viewportObserver.observe(node);
    });

    return () => {
      centerObserver.disconnect();
      viewportObserver.disconnect();
    };
  }, [show, tiles]);

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(0,0,0,0.7)] transition-opacity duration-300 ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative flex h-[100dvh] w-screen flex-col overflow-hidden rounded-none border border-subtle bg-surface shadow-[0_24px_90px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:h-[90vh] lg:w-[90vw] lg:rounded-[36px] ${
          show ? "scale-100" : "scale-95 lg:scale-90"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-subtle bg-surface-elevated px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="text-overline font-semibold text-accent">
              Christian Leaders Gallery
            </p>
            <h3 className="text-heading-sm font-semibold text-ink">
              Moments, prayers, and stories
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-surface transition-colors hover:bg-surface-muted"
            aria-label="Close gallery modal"
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        <div ref={scrollRootRef} className="flex-1 min-h-0 w-full overflow-y-auto px-5 pb-10 pt-6 lg:px-8">
          <div className="flex flex-col gap-10">
            {groupedTerms.map((term) => {
              const columns = buildColumns(term.tiles);

              return (
                <section key={term.id}>
                  <div className="mb-5 text-center">
                    <h4 className="text-heading-sm font-semibold text-ink">
                      {term.title}
                    </h4>
                    <p className="mt-1 text-body-sm italic text-muted">
                      {term.theme}
                    </p>
                  </div>

                  <div
                    className="rounded-[26px] border p-4 sm:p-5"
                    style={{
                      backgroundColor: term.tint,
                      borderColor: term.border,
                    }}
                  >
                    <div className="flex w-full gap-4">
                      {columns.map((column, columnIndex) => (
                        <div
                          key={`${term.id}-gallery-col-${columnIndex}`}
                          className="flex min-w-0 flex-1 flex-col gap-4"
                          style={{
                            marginTop:
                              columnsCount > 1
                                ? `${columnOffsets[columnIndex % columnOffsets.length]}px`
                                : "0px",
                          }}
                        >
                          {column.map((tile) => {
                            const isLiked = likedTiles[tile.id] ?? false;

                            return (
                              <div
                                key={tile.id}
                                data-gallery-tile={tile.id}
                                className="group relative overflow-hidden rounded-[22px] border border-subtle bg-surface-muted shadow-[0_16px_32px_rgba(0,0,0,0.16)]"
                                style={{ aspectRatio: tile.ratio }}
                              >
                                <img
                                  src={tile.src}
                                  alt={tile.alt}
                                  loading="lazy"
                                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${mobileActiveTiles.has(tile.id) ? "scale-105" : ""}`}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300 ${mobileActiveTiles.has(tile.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                  <div className="absolute left-4 right-4 bottom-4 text-inverse">
                                    <p className="text-body-sm font-semibold">
                                      {tile.description}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-caption text-inverse opacity-80">
                                      {tile.tags.map((tag) => (
                                        <span key={`${tile.alt}-${tag}`}>{tag}</span>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleLike(tile.id)}
                                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-caption font-semibold backdrop-blur-sm transition-colors hover:bg-white/24"
                                      aria-pressed={isLiked}
                                      aria-label={`${isLiked ? "Unlike" : "Like"} ${tile.description}`}
                                    >
                                      <Heart
                                        className={`h-4 w-4 ${
                                          isLiked
                                            ? "fill-[color:var(--like)] text-like"
                                            : "text-inverse"
                                        }`}
                                      />
                                      <span>{likeCounts[tile.id] ?? tile.likes}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Gallery: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const galleryContent = useCmsSection("home.gallery");
  const seedTiles = React.useMemo(() => buildGalleryTiles(), []);
  const tiles = React.useMemo(() => [
    ...seedTiles,
    ...galleryContent.items.map((item) => ({
      id: item.id,
      src: resolveCmsMedia(item.image) ?? "",
      alt: item.title,
      description: item.description,
      tags: item.tags,
      likes: item.likes,
      ratio: item.ratio,
      termId: item.termId,
    })),
  ], [seedTiles, galleryContent.items]);
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
      <div className="section-fade-top"></div>
      <div className="section-fade-bottom"></div>
      {/* MOVING GALLERY GRID */}
      <div className="gallery-grid">
        {[
          "gallery-grid-row gallery-grid-row--slow",
          "gallery-grid-row gallery-grid-row--reverse",
          "gallery-grid-row gallery-grid-row--fast",
        ].map((rowClass, rowIndex) => (
          <div key={`gallery-row-${rowIndex}`} className={rowClass}>
            {Array.from({ length: 3 }).map((_, loopIndex) =>
              rowTiles.map((tile, index) => (
                <div
                  key={`${tile.key}-${loopIndex}-${index}`}
                  className="gallery-tile"
                >
                  <img src={tile.src} alt={tile.alt} />
                </div>
              )),
            )}
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
            Captured Moments
          </h2>
          <p className="mx-auto mt-4 text-body text-inverse opacity-80">
            Explore the stories, services, and faces that shape the Christian
            Leaders family.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-elevated px-5 py-2 text-body-sm font-semibold text-ink shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-contrast hover:text-inverse"
          >
            Open Gallery
          </button>
        </div>
      </div>

      {/* GALLERY MODAL (EMPTY STATE) */}
      <GalleryModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        tiles={tiles}
      />
    </section>
  );
};

export default Gallery;
