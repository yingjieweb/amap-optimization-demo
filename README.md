# AMap Optimization Demo

English | [简体中文](./README.zh-CN.md)

Render 3,500+ markers with info labels on AMap (Gaode Maps) without freezing the page.

[Live demo](https://yingjieweb.github.io/amap-optimization-demo/) · [Write-up (Chinese, 18K+ reads)](https://blog.csdn.net/Marker__/article/details/124321573)

<img src="./src/assets/preview.gif" alt="Demo: zooming from mass markers into viewport-only labels" />

## The problem

A real-estate price map showed every listing as a dot when zoomed out, and as a label bubble (name + price) when zoomed in. With 3,500+ listings, adding all labels at once made the page nearly unusable:

- first screen took about 12 s, and the map itself still hadn't fully rendered
- under 10 FPS while panning or zooming
- 40,000+ DOM nodes, 90%+ CPU and 250 MB+ JS heap during interaction

AMap's docs say `LabelMarker` handles 10,000+ points well. In practice it fell apart at around 3,000.

## The fix

1. **Lazy-load labels.** The first screen only shows `MassMarks` dots (canvas, no DOM per point). Labels load when the map is zoomed in past level 15.
2. **Render only what's on screen.** On `zoomend` / `moveend`, filter the data to the current viewport (`map.getBounds()`) and render labels just for those points.
3. **Remove before re-adding.** Clear the previous label layer before rendering the new viewport, so layers don't pile up as the user pans.
4. **Move shared icons to `MassMarks`.** Each label's dot icon is drawn by a mass-marker layer instead of one `<img>` per label, which cuts DOM nodes.
5. **Separate layer for the selected label.** Clicking a label redraws only a small highlight layer instead of re-rendering every label in view.

## Results

Measured with Chrome DevTools on the original project (3,500+ points):

| Metric | Before | After |
| --- | --- | --- |
| First screen | ~12 s | ~3 s |
| Frame rate while interacting | < 10 FPS | ~30 FPS |
| DOM nodes | 40,000+ | < 6,000 |
| CPU during interaction | 90%+ | ~50% |
| JS heap | 250 MB+ | < 100 MB |
| DevTools Summary total | 12,956 ms | 4,306 ms |
| Rendering | 3,843 ms | 103 ms |
| Scripting | 5,122 ms | 2,118 ms |

## Run it locally

Built with Vue 3, uni-app and AMap JS API 2.0.

```bash
npm install
npm run dev:h5
```

The repo ships a demo-only AMap key in `src/config/index.js`; it may stop working at any time. For your own project, [apply for a key](https://lbs.amap.com/api/javascript-api-v2/prerequisites) and replace it there.

## License

[MIT](./LICENSE)
