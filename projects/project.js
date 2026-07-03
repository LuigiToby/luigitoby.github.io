/* ============================================================
   project.js — Shared project page engine
   Luis Alejandro Rodríguez Arenas — Personal Website

   What this file does:
   1.  Handles dark/light theme toggle (replaces the inline script)
   2.  Loads metadata.json for the current project folder
   3.  Populates the article header (title + meta fields)
   4.  Renders the Gallery section with a lightbox
   5.  Renders the Documents section as downloadable links
   6.  Renders the References section as a numbered list
   7.  Auto-links "Img. N" → gallery lightbox at image N
       Auto-links "[N]"   → anchor at reference N

   To add a new project:
     1. Copy projects/cccd2026/ to projects/my-project/
     2. Edit metadata.json with project data
     3. Write the article body in index.html
     4. Drop assets into assets/ (flat — no subfolders)
     This file never needs to be modified.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Theme toggle ─────────────────────────────────────────
  // Centralised here so every project page can drop the inline script.
  const modeBtn = document.getElementById('mode-toggle');
  if (modeBtn) {
    const applyTheme = (isLight) => {
      document.body.classList.toggle('light-mode', isLight);
      modeBtn.textContent = isLight ? '●' : '○';
    };
    applyTheme(localStorage.getItem('mode') === 'light');
    modeBtn.addEventListener('click', () => {
      const nowLight = !document.body.classList.contains('light-mode');
      applyTheme(nowLight);
      localStorage.setItem('mode', nowLight ? 'light' : 'dark');
    });
  }

  // ── 2. Load metadata.json ────────────────────────────────────
  let meta;
  try {
    const res = await fetch('metadata.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    meta = await res.json();
  } catch (err) {
    console.error('[project.js] Could not load metadata.json:', err);
    const hdr = document.getElementById('project-header');
    if (hdr) hdr.innerHTML = '<p class="load-error">Could not load project metadata.</p>';
    return;
  }

  // ── 3. Populate article header ───────────────────────────────
  renderHeader(meta);

  if (meta.title) {
    document.title = `${meta.title} — Luis Rodríguez`;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.content = meta.description || meta.title;
  }

  // ── 4–6. Render auto-populated sections ─────────────────────
  renderGallery(meta.gallery     || []);
  renderDocuments(meta.documents  || []);
  renderReferences(meta.references || []);

  // ── 7. Auto-link cross-references ───────────────────────────
  // Must run after renderReferences so #ref-N anchors exist.
  autoLink();

});


/* ─── renderHeader ──────────────────────────────────────────────
   Injects <h1> + the meta-field row into #project-header.
   Fields with empty or missing values are silently omitted.  */
function renderHeader(meta) {
  const el = document.getElementById('project-header');
  if (!el) return;

  const h1       = document.createElement('h1');
  h1.className   = 'page-title';
  h1.textContent = meta.title || 'Untitled Project';
  el.appendChild(h1);

  const FIELDS = [
    ['Type',         meta.type],
    ['Domain',       meta.domain],
    ['Organization', meta.organization],
    ['Period',       meta.period],
    ['Role',         meta.role],
    ['Status',       meta.status],
  ];

  const row     = document.createElement('div');
  row.className = 'article-meta';

  FIELDS.forEach(([key, val]) => {
    if (!val) return;
    const item     = document.createElement('div');
    item.className = 'meta-item';
    const k        = document.createElement('span');
    k.className    = 'meta-key';
    k.textContent  = key;
    const v        = document.createElement('span');
    v.className    = 'meta-val';
    v.textContent  = val;
    item.appendChild(k);
    item.appendChild(v);
    row.appendChild(item);
  });

  el.appendChild(row);
}


/* ─── renderGallery ─────────────────────────────────────────────
   Builds a thumbnail grid and attaches a full-screen lightbox.
   Accepts either the legacy array format or the new object form:
     { "previewCount": 6, "items": [...] }
   Exposes window._gallery.open(index) so the cross-linker can
   trigger the lightbox from Img. N links in the article body.  */

// File extensions used to choose <img> vs <video>.
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'ogg']);

function getMediaType(file) {
  const ext = file.split('.').pop().toLowerCase();
  return VIDEO_EXT.has(ext) ? 'video' : 'image';
}

function renderGallery(galleryData) {
  const el = document.getElementById('project-gallery');
  if (!el) return;

  // Support both legacy array and new {previewCount, items} formats.
  let items, previewCount;
  if (Array.isArray(galleryData)) {
    items        = galleryData;
    previewCount = Infinity;
  } else {
    items        = galleryData.items        || [];
    previewCount = galleryData.previewCount ?? Infinity;
  }

  if (items.length === 0) {
    el.innerHTML = '<p class="section-empty">No media.</p>';
    return;
  }

  const visibleItems = items.slice(0, previewCount);
  const hiddenCount  = items.length - visibleItems.length;

  // ── Thumbnail grid ───────────────────────────────────────────
  const grid     = document.createElement('div');
  grid.className = 'gallery-grid';

  visibleItems.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'gallery-thumb';
    btn.setAttribute('aria-label', `View item ${item.id}: ${item.caption || ''}`);

    const type = getMediaType(item.file);

    if (type === 'video') {
      // <video preload="metadata" muted> — first frame becomes the thumbnail.
      // Adding #t=0.001 forces most browsers to decode and display frame 0.
      const vid        = document.createElement('video');
      vid.className    = 'gallery-media';
      vid.src          = item.file + '#t=0.001';
      vid.preload      = 'metadata';
      vid.muted        = true;
      vid.setAttribute('playsinline', '');
      btn.appendChild(vid);

      // Play-icon overlay so users can tell this is a video at a glance.
      const play       = document.createElement('span');
      play.className   = 'gallery-play';
      play.setAttribute('aria-hidden', 'true');
      play.textContent = '▶';
      btn.appendChild(play);
    } else {
      const img   = document.createElement('img');
      img.className = 'gallery-media';
      img.src     = item.file;
      img.alt     = item.caption || `Image ${item.id}`;
      img.loading = 'lazy';
      btn.appendChild(img);
    }

    const cap       = document.createElement('span');
    cap.className   = 'gallery-cap';
    cap.textContent = `${item.id}.  ${item.caption || ''}`;
    btn.appendChild(cap);

    btn.addEventListener('click', () => openLightbox(i));
    grid.appendChild(btn);
  });

  // ── Overflow tile ────────────────────────────────────────────
  // If there are more items than previewCount, the last slot becomes
  // a "+N" tile that opens the lightbox at the first hidden item.
  if (hiddenCount > 0) {
    const overflow       = document.createElement('button');
    overflow.className   = 'gallery-thumb gallery-overflow';
    overflow.setAttribute('aria-label', `View ${hiddenCount} more items`);
    overflow.innerHTML   = `<span class="gallery-overflow-count">+${hiddenCount}</span>`;
    overflow.addEventListener('click', () => openLightbox(previewCount));
    grid.appendChild(overflow);
  }

  el.appendChild(grid);

  // ── Lightbox ─────────────────────────────────────────────────
  // Uses a .lb-media container whose content is replaced on each
  // open so that images and videos share the same layout.
  const lb     = document.createElement('div');
  lb.id        = 'lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Media viewer');
  lb.hidden    = true;

  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev"  aria-label="Previous">‹</button>
    <button class="lb-next"  aria-label="Next">›</button>
    <div class="lb-content">
      <div class="lb-media"></div>
      <p   class="lb-cap"></p>
    </div>
  `;

  document.body.appendChild(lb);

  let cur = 0;

  function openLightbox(index) {
    // Pause any video that may already be playing in the lightbox.
    const prev = lb.querySelector('.lb-media video');
    if (prev) prev.pause();

    cur = ((index % items.length) + items.length) % items.length;
    const item      = items[cur];
    const mediaWrap = lb.querySelector('.lb-media');
    mediaWrap.innerHTML = '';   // clear previous media element

    const type = getMediaType(item.file);
    let mediaEl;

    if (type === 'video') {
      mediaEl          = document.createElement('video');
      mediaEl.className = 'lb-img';   // reuses existing size/position rules
      mediaEl.src      = item.file;
      mediaEl.controls = true;
      mediaEl.autoplay = true;
    } else {
      mediaEl           = document.createElement('img');
      mediaEl.className = 'lb-img';
      mediaEl.src       = item.file;
      mediaEl.alt       = item.caption || '';
    }

    mediaWrap.appendChild(mediaEl);
    lb.querySelector('.lb-cap').textContent = `${item.id}.  ${item.caption || ''}`;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    lb.querySelector('.lb-close').focus();
  }

  function closeLightbox() {
    const vid = lb.querySelector('.lb-media video');
    if (vid) vid.pause();
    lb.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click',  () => openLightbox(cur - 1));
  lb.querySelector('.lb-next').addEventListener('click',  () => openLightbox(cur + 1));

  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     { e.preventDefault(); closeLightbox(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); openLightbox(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); openLightbox(cur + 1); }
  });

  window._gallery = { open: openLightbox };
}


/* ─── renderDocuments ───────────────────────────────────────────
   Renders metadata.documents[] as downloadable links.
   Extension label ([PDF], [MP4], etc.) is inferred from the
   filename — no manual labels needed in metadata.json.       */
function renderDocuments(docs) {
  const el = document.getElementById('project-documents');
  if (!el) return;

  if (docs.length === 0) {
    el.innerHTML = '<p class="section-empty">No documents available.</p>';
    return;
  }

  const list     = document.createElement('div');
  list.className = 'doc-list';

  docs.forEach(doc => {
    const a       = document.createElement('a');
    a.className   = 'doc-item';
    a.href        = doc.file;
    a.download    = '';

    const ext     = (doc.file.split('.').pop() || 'FILE').toUpperCase().slice(0, 5);

    const code    = document.createElement('span');
    code.className   = 'doc-code';
    code.textContent = `[${ext}]`;

    const title   = document.createElement('span');
    title.className   = 'doc-title';
    title.textContent = doc.title;

    const arrow   = document.createElement('span');
    arrow.className   = 'doc-arrow';
    arrow.textContent = '↓';

    a.appendChild(code);
    a.appendChild(title);
    a.appendChild(arrow);
    list.appendChild(a);
  });

  el.appendChild(list);
}


/* ─── renderReferences ──────────────────────────────────────────
   Renders metadata.references[] as a numbered list.
   Each item gets id="ref-N" so [N] cross-links can anchor it. */
function renderReferences(refs) {
  const el = document.getElementById('project-references');
  if (!el) return;

  if (refs.length === 0) {
    el.innerHTML = '<li class="section-empty">No references.</li>';
    return;
  }

  refs.forEach(ref => {
    const li       = document.createElement('li');
    li.id          = `ref-${ref.id}`;
    li.className   = 'ref-item';
    li.textContent = ref.citation;
    el.appendChild(li);
  });
}


/* ─── autoLink ──────────────────────────────────────────────────
   Scans every text node inside .article-body for two patterns:

     "Img. N"  → <a class="xref"> that scrolls to #gallery
                  and opens the lightbox at image N (1-indexed)
     "[N]"     → <a class="xref"> that scrolls to #ref-N

   Text nodes are collected before any DOM modifications to avoid
   TreeWalker invalidation. Non-matching nodes are skipped.   */
function autoLink() {
  const body = document.querySelector('.article-body');
  if (!body) return;

  const nodes  = [];
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  // Group 1 = image number, group 2 = reference number
  const RE = /Img\.\s*(\d+)|\[(\d+)\]/g;

  nodes.forEach(textNode => {
    const text = textNode.textContent;

    RE.lastIndex = 0;
    if (!RE.test(text)) return;   // fast skip if nothing matches
    RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let   last = 0;
    let   m;

    while ((m = RE.exec(text)) !== null) {
      // Text before the match
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      }

      const a       = document.createElement('a');
      a.className   = 'xref';

      if (m[1] !== undefined) {
        // ── Img. N ─ gallery cross-reference ────────────────────
        const zeroIdx = parseInt(m[1], 10) - 1;   // 1-indexed → 0-indexed
        a.textContent = m[0];
        a.href        = '#gallery';

        a.addEventListener('click', (e) => {
          e.preventDefault();
          const sec = document.getElementById('gallery');
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
          // Small delay so scroll starts before the overlay appears
          setTimeout(() => { if (window._gallery) window._gallery.open(zeroIdx); }, 120);
        });

      } else {
        // ── [N] ─ reference cross-reference ─────────────────────
        const id  = m[2];
        a.textContent = m[0];
        a.href        = `#ref-${id}`;

        a.addEventListener('click', (e) => {
          e.preventDefault();
          const refEl = document.getElementById(`ref-${id}`);
          if (refEl) refEl.scrollIntoView({ behavior: 'smooth' });
        });
      }

      frag.appendChild(a);
      last = m.index + m[0].length;
    }

    // Text after the last match
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  });
}
