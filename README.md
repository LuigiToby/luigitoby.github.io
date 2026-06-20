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
* [x] Finish Playground section
* [ ] My grilfriend says playground is not the right name for that section... maybe re-think that
* [ ] Add new domain (Well actually buy it lol)
* [ ] Add individual project pages
* [ ] Add individual playground pages
* [ ] Improve CV card interactions
* [x] Refine typography
* [x] Improve mobile layout
* [ ] Add project thumbnails

### CV

* [ ] Complete corporate profile, rn is a copy of academy
* [ ] Add project hyperlinks
* [ ] Add publication support
* [ ] Review French translations
* [ ] Review Spanish translations

### Content
* [ ] Basically complete the project pages lol
    * [ ] CCCD2026 project page
    * [ ] Experimental Rocketry page
    * [ ] CanSat page
    * [ ] Ion Thruster page
    * [ ] Reading Challenge page
    * [ ] Bookshelf page
    * [ ] Photography page

## License

MIT License.
