<script setup>
import MotionRugs from "./MotionRugs.vue";
import SideBar from "./SideBar.vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive, computed } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "leaflet.chinatmsproviders";
import "tilelayer-canvas";
import "leaflet.motion/dist/leaflet.motion.min.js";
import { colors } from "./constant.js";

const config = reactive({
    map: null,
    latLng: [39.92641, 116.38876],
    zoom: 12,
    maxZoom: 18,
    minZoom: 5,
    duration: 1000,
    icon: L.icon({
        iconUrl: "/vehicle.svg",
        iconSize: [16, 16],
    }),
});

const vehicles = reactive({});
let vehicleStates = computed(() => {
    let result = [];
    for (let i in vehicles) {
        result.push({
            id: vehicles[i].id,
            frame: vehicles[i].frame,
        });
    }
    return result;
});

// 初始化地图
const initMap = () => {
    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView(config.latLng, config.zoom);

    L.tileLayer
        .chinaProvider("Tencent.Normal.Map", { zoom: config.zoom, maxZoom: config.maxZoom, minZoom: config.minZoom })
        .addTo(map);

    return map;
};

// 添加载具
const addVehicle = (id, initLatLng) => {
    vehicles[id] = {
        id: id,
        frame: 0,
        latLngList: [initLatLng],
        motion: null,
        timer: null,
    };
};

// 添加轨迹
const addLine = (id) => {
    const currLatLng = vehicles[id].latLngList[vehicles[id].frame];
    const nextLatLng = vehicles[id].latLngList[vehicles[id].frame + 1];

    if (vehicles[id].motion) {
        vehicles[id].motion.remove();
    }

    if (vehicles[id].latLngList.length - 1 > vehicles[id].frame) {
        vehicles[id].motion = L.motion
            .polyline(
                [currLatLng, nextLatLng],
                {
                    color: genColorById(id),
                },
                {
                    auto: true,
                    duration: config.duration,
                    // easing: L.Motion.Ease.easeInOutQuart,
                },
                {
                    removeOnEnd: false,
                    showMarker: true,
                    icon: config.icon,
                }
            )
            .addTo(config.map);
        vehicles[id].frame++;
    }

    vehicles[id].timer = setTimeout(() => {
        addLine(id);
    }, config.duration);
};

// 轨迹颜色
const genColorById = (id) => {
    return colors[id % colors.length];
};

onMounted(() => {
    config.map = initMap();

    GPSAdaptor.DataListener((dataGroupByTime) => {
        for (let i in dataGroupByTime) {
            for (let j in dataGroupByTime[i]) {
                const lat = dataGroupByTime[i][j]["latitude"];
                const lng = dataGroupByTime[i][j]["longitude"];
                const id = dataGroupByTime[i][j]["id"];
                if (!vehicles[id]) {
                    addVehicle(id, [lat, lng]);
                    addLine(id);
                } else {
                    vehicles[id].latLngList.push([lat, lng]);
                }
            }
        }
    });
});
</script>

<template>
    <el-container class="main-container">
        <el-container>
            <el-main>
                <div class="map_container">
                    <div id="map"></div>
                </div>
            </el-main>
            <el-aside width="300px">
                <SideBar :vstates="vehicles"></SideBar>
            </el-aside>
        </el-container>
        <el-footer>
            <MotionRugs></MotionRugs>
        </el-footer>
    </el-container>
</template>

<style scoped>
.map_container {
    width: 100%;
    height: 100%;
}
#map {
    width: 100%;
    height: 100%;
    /* margin-bottom: 10px; */
}
.main-container {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}
.el-container {
    height: 95%;
}
.el-main {
    padding: 0 0;
}
.el-footer {
    padding: 0 0;
}
</style>
