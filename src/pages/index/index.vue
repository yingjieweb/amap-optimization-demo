<template>
  <div class="container">
    <div id="map"></div>

    <div class="loading-wrapper" v-if="isLoading">
      <van-loading size="38px" text-size="18px" vertical color="#0094ff"
        >加载中...</van-loading
      >
    </div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import HouseListJson from "../../db/data.json";
import { AMapDeveloperKey } from "@/config/index";
import { ref } from "vue";

// data
let map = null; // 地图母版
let zoom = null; // 地图缩放等级
let center = null; // 地图中心点坐标
let geocoder = null; // 地图编码转换器
let massMarks = null; // 海量点标记
let layer = null; // 气泡层
let markers = null; // 气泡层圆点标记
let labels = []; // 气泡层海量标注
let selectedLabel = []; // 气泡层选中态到文本标注
const priceIconMap = {
  low: "https://t1.focus-img.cn/applet/2022-04-25/a7830c321d0842dea1ce772f622fce02.png",
  normal:
    "https://t1.focus-img.cn/applet/2022-04-25/721f4aee79ed4a3299fee8692b51c81c.png",
  high: "https://t1.focus-img.cn/applet/2022-04-25/37df30680cce4b41b361a6b681edb9b0.png",
};
const priceDotArr = [
  "https://t1.focus-img.cn/applet/2022-04-25/fb5c5879cec340af9ee9ee7453abbff6.png", // low
  "https://t1.focus-img.cn/applet/2022-04-25/f0f352851311438ebf69b130369d9e64.png", // normal
  "https://t1.focus-img.cn/applet/2022-04-25/b64526f72e59426f95922b19b2043a3b.png", // high
  "https://t1.focus-img.cn/applet/2022-04-14/db7245505a904ceba96fb92efb9157a0.jpg", // active
];
const priceClassArr = ["low", "normal", "high"];
const amapKey = ref();
const isLoading = ref(true);
const cityName = ref("深圳");
let houseList = [];
let screenHouseList = [];

// methods
const getCityLngLat = (cityId) => {
  AMapLoader.load({
    key: amapKey.value, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Geocoder"], // 需要使用的的插件列表，如比例尺'AMap.Scale'、'AMap.CitySearch'等
  })
    .then((AMap) => {
      // 准备地图编码器 geocoder
      geocoder = new AMap.Geocoder({
        city: cityId, // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
      });
      geocoder.getLocation(cityName.value, function (status, result) {
        if (status === "complete" && result.info === "OK") {
          let location = [
            result.geocodes[0].location.lng,
            result.geocodes[0].location.lat,
          ];
          map = new AMap.Map("map", {
            resizeEnable: true, //是否监控地图容器尺寸变化
            zoom: 10, //初始化地图层级
            center: location, //初始化地图中心点
          }); // 展示地图 map
          map.on("complete", () => {
            isLoading.value = false;
          });

          setMassMarks(); // 设置海量点标记 marker
          setMapListener(); // 监听地图 缩放/移动 事件
        }
      });
    })
    .catch((e) => {
      console.log(e);
    });
};
const setMassMarks = () => {
  const lowPriceIconStyle = {
    url: priceIconMap.low,
    size: new AMap.Size(30, 30),
    anchor: "center",
  };
  const normalIconStyle = {
    url: priceIconMap.normal,
    size: new AMap.Size(30, 30),
    anchor: "center",
  };
  const highPriceIconStyle = {
    url: priceIconMap.high,
    size: new AMap.Size(30, 30),
    anchor: "center",
  };
  const styleObjectArr = [
    lowPriceIconStyle,
    normalIconStyle,
    highPriceIconStyle,
  ];
  const markerList = houseList.map((item) => ({
    lnglat: item.location.split(","),
    name: item.projName,
    id: item.id,
    style: item.level - 1,
  }));
  massMarks = new AMap.MassMarks(markerList, {
    zIndex: 500, // 海量点图层叠加的顺序
    zooms: [3, 15], // 在指定地图缩放级别范围内展示海量点图层
    style: styleObjectArr, // 设置样式数组
  });
  massMarks.setMap(map);
};
const setMapListener = () => {
  map.on("zoomend", () => {
    // 监听地图缩放事件 -> 执行条件渲染
    zoom = map.getZoom();
    if (zoom >= 15) {
      executeConditionRender();
    }
  });
  map.on("moveend", () => {
    // 监听地图移动事件 -> 执行条件渲染
    if (zoom >= 15) {
      executeConditionRender();
    }
  });
};
const executeConditionRender = () => {
  let screenCoordinateRange = map.getBounds();
  let northEast = [
    screenCoordinateRange.northEast.lng,
    screenCoordinateRange.northEast.lat,
  ];
  let southEast = [
    screenCoordinateRange.southWest.lng,
    screenCoordinateRange.northEast.lat,
  ];
  let southWest = [
    screenCoordinateRange.southWest.lng,
    screenCoordinateRange.southWest.lat,
  ];
  let northWest = [
    screenCoordinateRange.northEast.lng,
    screenCoordinateRange.southWest.lat,
  ];

  screenHouseList = houseList.filter((item) => {
    return AMap.GeometryUtil.isPointInRing(item.location.split(","), [
      northEast,
      southEast,
      southWest,
      northWest,
    ]);
  });
  map.removeLayer(layer); // 删除原来气泡层（包含圆点标记）
  map.remove(labels); // 删除原来气泡层的海量标注
  setLabelsLayer(); // 设置海量标注
};
const setLabelsLayer = () => {
  layer = new AMap.LabelsLayer({
    zooms: [15, 20],
    allowCollision: true, // 让标注避让用户的标注
  });
  markers = [];
  labels = [];
  screenHouseList.map((item) => {
    // 圆点图标识部分 ⬇️
    const labelMarker = new AMap.LabelMarker({
      icon: {
        type: "image",
        size: [12, 12],
        anchor: "center",
        image: priceDotArr[item.level - 1],
      },
      zooms: [15, 20],
      position: item.location.split(","),
    });
    markers.push(labelMarker);

    // 气泡文案部分 ⬇️
    const normalMarker = new AMap.Marker({
      zooms: [15, 20],
      offset: new AMap.Pixel(0, -15),
      extData: item,
    });
    normalMarker.setContent(
      `<div class="amap-info-window__${priceClassArr[item.level - 1]}">
              <div class="amap-info-title">${item.projName}</div>
              <div class="amap-info-price">${item.price}元/平方米</div>
          </div>`
    );
    normalMarker.setPosition(item.location.split(","));
    normalMarker.on("click", function (e) {
      setNormalMarkerSelected(e.target.getExtData().id);
    });
    labels.push(normalMarker);
  });
  layer.add(markers);
  map.add(layer);
  map.add(labels);
};
const setNormalMarkerSelected = (selectedId) => {
  map.remove(selectedLabel); // 删除原来的 selectedLabel 标注
  selectedLabel = [];
  screenHouseList.map((item) => {
    if (item.id !== selectedId) return;

    // 气泡文案部分 ⬇️
    const normalMarker = new AMap.Marker({
      zooms: [15, 20],
      offset: new AMap.Pixel(0, -15),
      extData: item,
    });
    normalMarker.setContent(
      `<div class="amap-info-window__selected">
              <div class="amap-info-title">${item.projName}</div>
              <div class="amap-info-price">${item.price}元/平方米</div>
          </div>`
    );
    normalMarker.setPosition(item.location.split(","));
    normalMarker.on("click", function (e) {
      setNormalMarkerSelected(e.target.getExtData().id);
    });
    selectedLabel.push(normalMarker);
  });
  map.add(selectedLabel);
};

// created
amapKey.value = AMapDeveloperKey;
houseList = HouseListJson;
if (amapKey.value) {
  getCityLngLat(197);
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  #map {
    width: 100%;
    height: 100%;
  }
  .loading-wrapper {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
