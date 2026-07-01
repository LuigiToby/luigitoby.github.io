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
   Exposes window._gallery.open(index) so the cross-linker can
   trigger the lightbox from Img. N links in the article body.  */
function renderGallery(gallery) {
  const el = document.getElementById('project-gallery');
  if (!el) return;

  if (gallery.length === 0) {
    el.innerHTML = '<p class="section-empty">No images.</p>';
    return;
  }

  // Thumbnail grid
  const grid     = document.createElement('div');
  grid.className = 'gallery-grid';

  gallery.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'gallery-thumb';
    btn.setAttribute('aria-label', `View image ${item.id}: ${item.caption || ''}`);

    const img   = document.createElement('img');
    img.src     = item.file;
    img.alt     = item.caption || `Image ${item.id}`;
    img.loading = 'lazy';

    const cap       = document.createElement('span');
    cap.className   = 'gallery-cap';
    cap.textContent = `${item.id}.  ${item.caption || ''}`;

    btn.appendChild(img);
    btn.appendChild(cap);
    btn.addEventListener('click', () => openLightbox(i));
    grid.appendChild(btn);
  });

  el.appendChild(grid);

  // Lightbox overlay — appended once to <body>
  const lb     = document.createElement('div');
  lb.id        = 'lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.hidden    = true;

  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev"  aria-label="Previous image">‹</button>
    <button class="lb-next"  aria-label="Next image">›</button>
    <div class="lb-content">
      <img class="lb-img" src="" alt="" />
      <p   class="lb-cap"></p>
    </div>
  `;

  document.body.appendChild(lb);

  let cur = 0;

  function openLightbox(index) {
    cur = ((index % gallery.length) + gallery.length) % gallery.length;
    const item = gallery[cur];
    lb.querySelector('.lb-img').src         = item.file;
    lb.querySelector('.lb-img').alt         = item.caption || '';
    lb.querySelector('.lb-cap').textContent = `${item.id}.  ${item.caption || ''}`;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    lb.querySelector('.lb-close').focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click',  () => openLightbox(cur - 1));
  lb.querySelector('.lb-next').addEventListener('click',  () => openLightbox(cur + 1));

  // Click backdrop to close
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  // Keyboard: Esc, ←, →
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     { e.preventDefault(); closeLightbox(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); openLightbox(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); openLightbox(cur + 1); }
  });

  // Expose for cross-linker in autoLink()
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
