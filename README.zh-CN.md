# 高德地图海量点优化 Demo

[English](./README.md) | 简体中文

在高德地图上渲染 3,500+ 个带信息气泡的标注，页面依然流畅。

[在线预览](https://yingjieweb.github.io/amap-optimization-demo/) · [CSDN 详解文章（1.8 万+ 阅读）](https://blog.csdn.net/Marker__/article/details/124321573)

<img src="./src/assets/preview.gif" alt="演示：从海量点标记放大到只渲染视口内的标注" />

## 问题

一个房价地图需求：地图缩小时，每个房源显示为一个圆点；放大后，显示带名称和价格的气泡标注。房源达到 3,500+ 时，一次性加载全部标注，页面几乎没法用：

- 首屏约 12 秒，而且地图本身还没完全渲染出来
- 拖动、缩放时帧率不到 10 FPS
- 交互时 DOM 节点 40,000+，CPU 占用 90%+，JS 内存 250 MB+

高德官方文档说 `LabelMarker` 在万级数据下也有较好性能，实际到 3,000 左右就已经卡得不行。

## 方案

1. **标注延迟加载**：首屏只显示 `MassMarks` 海量点（Canvas 绘制，不产生逐点 DOM），地图放大到 15 级以上才加载标注。
2. **只渲染视口内的点**：监听 `zoomend` / `moveend`，按当前视口（`map.getBounds()`）过滤数据，只为这些点渲染标注。
3. **先删后加**：渲染新视口前先移除旧的标注图层，避免拖动过程中图层越堆越多。
4. **公共图标交给 `MassMarks`**：每个标注的小圆点改用海量点图层绘制，不再是每个标注一个 `<img>`，减少 DOM 节点。
5. **选中态单独一层**：点击标注时只重绘一个很小的高亮图层，不再重新渲染视口内的所有标注。

## 效果

用 Chrome DevTools 在原项目中测得（3,500+ 个点）：

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 首屏时间 | 约 12 s | 约 3 s |
| 交互帧率 | < 10 FPS | 约 30 FPS |
| DOM 节点数 | 40,000+ | < 6,000 |
| 交互时 CPU 占用 | 90%+ | 约 50% |
| JS 内存 | 250 MB+ | < 100 MB |
| DevTools Summary 总计 | 12,956 ms | 4,306 ms |
| Rendering | 3,843 ms | 103 ms |
| Scripting | 5,122 ms | 2,118 ms |

## 本地运行

技术栈：Vue 3、uni-app、高德 JS API 2.0。

```bash
npm install
npm run dev:h5
```

仓库里的高德 Key 仅供本 Demo 演示，随时可能失效。正式项目请[自行申请 Key](https://lbs.amap.com/api/javascript-api-v2/prerequisites)，替换 `src/config/index.js` 里的值。

## License

[MIT](./LICENSE)
