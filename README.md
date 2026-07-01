# luisarodrigueza.com

Personal website and CV system of Luis Alejandro Rodríguez Arenas.

The website is built around a simple philosophy:

> Document what I build and what I explore.

## Structure

```text
/
├── index.html
├── style.css
├── assets/
└── cv/
```

### Website

The website contains:

* Bio
* CV downloads
* Technical projects
* Personal explorations
* External links

The site is fully static and hosted on GitHub Pages.

### CV System

The CV is built in LaTeX and supports:

* Multiple profiles
* Multiple languages
* Automatic PDF generation

Current languages:

* English
* Spanish
* French

Current profiles:

* Academic
* Corporate

Generated PDFs are stored in:

```text
cv/output/
```

## Build

Generate all CVs:

```bash
python batch.py
```

Output:

```text
academic_en.pdf
academic_es.pdf
academic_fr.pdf

corporate_en.pdf
corporate_es.pdf
corporate_fr.pdf
```

## Design Principles

* KISS (Keep It Simple, Stupid)
* Static first
* No frameworks
* Long-term maintainability
* Single-source multilingual content
* Professional and personal content clearly separated

## TODO
### Website
* [x] Finish Projects section
* [x] Finish Booshelf section
* [x] My grilfriend says playground is not the right name for that section... maybe re-think that. Changed to Bookshelf
* [x] Add new domain (Well actually buy it lol)
* [x] Add individual project pages
* [x] Add individual bookshelf pages
* [x] Improve CV card interactions
* [x] Refine typography
* [x] Improve mobile layout
* [-] Add project thumbnails > Discarted because it's not KISS
### CV
* [ ] Complete corporate profile, rn is a copy of academy
* [ ] Add languajes hiperlinks for certifications
* [ ] Add L1 certification an in-general document certifications to the CV via links to website
* [ ] Add project hyperlinks > Waiting to finish project pages
* [ ] Add publication support > No publications still
* [x] Review French translations
* [x] Review Spanish translations
### Content
* [ ] CCCD2026 page
* [ ] CCCD2025 page 
* [ ] MuldialdeCansat2026 page
* [ ] Reading challenge 2026 page 

## License

MIT License.
