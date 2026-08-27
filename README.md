# Abyss

Community optical schemes for [Loomrume](https://www.loomrume.com).

This repository is the **Abyss**: merged schemes live under `entries/`. Submit from Studio (**Share → Abyss**) or open a pull request by hand. Support, bugs, and feature ideas belong in [loomrume/lantern](https://github.com/loomrume/lantern), not here.

## Layout

```
entries/<slug>/
  scene.json     Loomrume OpticalScene
  preview.jpg    Board capture
  meta.json      Title, description, kinds, stats, GitHub login
```

Each merged entry is a public scheme. Opening one in Studio fetches this JSON; Loomrume does not host a copy.

## Search

- Description and title in `meta.json` (GitHub code search)
- Labels `kind:lens`, `kind:prism`, … on the pull request

## License

Schemes you submit are offered under [CC BY 4.0](LICENSE). Keep secrets out of `scene.json`.

## Issues

Issues are disabled on this repository. Product support, bugs, and features live in [loomrume/lantern](https://github.com/loomrume/lantern). (Repo Settings → Features → Issues, unchecked.)
