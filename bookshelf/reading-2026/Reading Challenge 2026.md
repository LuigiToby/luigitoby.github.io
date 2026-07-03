```dataviewjs
const CONFIG = {
  title: "reading",
  folder: "msp/daily",
  habit: "reading",
  year: 2026,         // leave null for current year
  cellSize: 15,
  gap: 5,
  radius: "0px",
  color: "gray",
  emptyColor: "#161b22"
};

await app.vault.adapter
  .read("templates/widgets/heatmap_year.js")
  .then(code => {
    eval(code);
    window.renderYearHeatmap(dv, dv.container, CONFIG);
  });

```

```dataviewjs
const CONFIG = {
  year: 2026,
  goalPages: 10800,
  color: "purple",
  scale: 1.5,
  showTable: true
};

await app.vault.adapter
  .read("templates/widgets/reading_challenge.js")
  .then(code => {
    eval(code);
    window.renderReadingChallenge(
      dv,
      dv.container,
      CONFIG
    );
  });
```
