(function () {
  const shelfId = "obi-global-brand-shelf";

  if (document.getElementById(shelfId)) {
    return;
  }

  const assetRoot = "/assets/brand/system-marks";
  const marks = [
    {
      title: "Tiger Apex",
      subtitle: "voice-pressure mark",
      src: `${assetRoot}/net-tiger-apex-mark.png`,
      alt: "Neon tiger head mark in soul purple and imperial gold.",
    },
    {
      title: "Phoenix DNA",
      subtitle: "inheritance mark",
      src: `${assetRoot}/phoenix-dna-crest-mark.png`,
      alt: "Phoenix and DNA crest mark in gold and purple.",
    },
    {
      title: "Reality-C",
      subtitle: "wireframe phoenix",
      src: `${assetRoot}/phoenix-reality-wireframe-mark.png`,
      alt: "Wireframe phoenix mark glowing in purple and gold.",
    },
    {
      title: "Tesseract Crest",
      subtitle: "NET wing crest",
      src: `${assetRoot}/phoenix-tesseract-crest-mark.png`,
      alt: "Phoenix wing crest with a glowing tesseract core.",
    },
  ];

  const style = document.createElement("style");
  style.textContent = `
    #${shelfId} {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483000;
      width: min(348px, calc(100vw - 24px));
      font-family: Inter, system-ui, sans-serif;
      color: #f5f3ff;
      pointer-events: none;
    }
    #${shelfId} * {
      box-sizing: border-box;
    }
    #${shelfId} .obi-brand-shelf-panel {
      pointer-events: auto;
      border: 1px solid rgba(245, 158, 11, 0.28);
      border-radius: 20px;
      background: rgba(15, 15, 26, 0.86);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(18px);
      overflow: hidden;
    }
    #${shelfId} .obi-brand-shelf-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(245, 158, 11, 0.12));
    }
    #${shelfId} .obi-brand-shelf-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #${shelfId} .obi-brand-shelf-title strong {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    #${shelfId} .obi-brand-shelf-title span {
      font-size: 11px;
      color: rgba(226, 232, 240, 0.8);
    }
    #${shelfId} .obi-brand-shelf-toggle {
      border: 1px solid rgba(168, 85, 247, 0.28);
      border-radius: 999px;
      background: rgba(15, 15, 26, 0.72);
      color: #f8fafc;
      min-width: 38px;
      height: 38px;
      cursor: pointer;
      font-size: 18px;
    }
    #${shelfId} .obi-brand-shelf-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 14px;
    }
    #${shelfId} .obi-brand-shelf-card {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      padding: 10px;
      border-radius: 16px;
      border: 1px solid rgba(168, 85, 247, 0.18);
      background: rgba(255, 255, 255, 0.03);
      text-decoration: none;
      color: inherit;
    }
    #${shelfId} .obi-brand-shelf-card:hover {
      border-color: rgba(245, 158, 11, 0.38);
      transform: translateY(-1px);
    }
    #${shelfId} .obi-brand-shelf-card img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border-radius: 14px;
      background: radial-gradient(circle at top, rgba(168, 85, 247, 0.14), rgba(15, 15, 26, 0.92));
      padding: 6px;
    }
    #${shelfId} .obi-brand-shelf-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #${shelfId} .obi-brand-shelf-copy strong {
      font-size: 12px;
      line-height: 1.2;
    }
    #${shelfId} .obi-brand-shelf-copy span {
      font-size: 11px;
      color: rgba(226, 232, 240, 0.78);
      line-height: 1.3;
    }
    #${shelfId}[data-collapsed="true"] .obi-brand-shelf-grid {
      display: none;
    }
    @media (max-width: 640px) {
      #${shelfId} {
        right: 12px;
        bottom: 12px;
        width: min(320px, calc(100vw - 20px));
      }
      #${shelfId} .obi-brand-shelf-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.append(style);

  const shelf = document.createElement("aside");
  shelf.id = shelfId;
  shelf.dataset.collapsed = window.innerWidth < 640 ? "true" : "false";
  shelf.innerHTML = `
    <div class="obi-brand-shelf-panel">
      <div class="obi-brand-shelf-topbar">
        <div class="obi-brand-shelf-title">
          <strong>Named System Marks</strong>
          <span>Cloudflare-wide brand shelf</span>
        </div>
        <button class="obi-brand-shelf-toggle" type="button" aria-label="Toggle named system marks">${
          window.innerWidth < 640 ? "+" : "-"
        }</button>
      </div>
      <div class="obi-brand-shelf-grid"></div>
    </div>
  `;

  const grid = shelf.querySelector(".obi-brand-shelf-grid");
  const toggle = shelf.querySelector(".obi-brand-shelf-toggle");

  marks.forEach((mark) => {
    const card = document.createElement("a");
    card.className = "obi-brand-shelf-card";
    card.href = mark.src;
    card.target = "_blank";
    card.rel = "noreferrer";
    card.innerHTML = `
      <img src="${mark.src}" alt="${mark.alt}" loading="lazy" />
      <div class="obi-brand-shelf-copy">
        <strong>${mark.title}</strong>
        <span>${mark.subtitle}</span>
      </div>
    `;
    grid.append(card);
  });

  toggle.addEventListener("click", () => {
    const collapsed = shelf.dataset.collapsed === "true";
    shelf.dataset.collapsed = collapsed ? "false" : "true";
    toggle.textContent = collapsed ? "-" : "+";
  });

  document.body.append(shelf);
})();