<script setup>
import MotionRugs from "./MotionRugs.vue";
import SideBar from "./SideBar.vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "leaflet.chinatmsproviders";
import "tilelayer-canvas";
import "leaflet.motion/dist/leaflet.motion.min.js";
import { colors } from "./Constants.js";

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
    sliderRange: [0, 50],
});

const vehicles = reactive({ state: {}, move: {} });

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
    vehicles.state[id] = {
        id: id,
        frame: 0,
        isRunning: true,
        displayTrajectory: false,
    };
    vehicles.move[id] = {
        latLngList: [initLatLng],
        motion: null,
        timer: null,
        trajetory: null,
    };
};

// 添加轨迹
const addDynamicLine = (id) => {
    if (vehicles.state[id].isRunning) {
        if (vehicles.move[id].motion) {
            vehicles.move[id].motion.remove();
            vehicles.state[id].isRunning = false;
        }

        if (vehicles.move[id].latLngList.length - 1 > vehicles.state[id].frame) {
            vehicles.state[id].isRunning = true;
            const currLatLng = vehicles.move[id].latLngList[vehicles.state[id].frame];
            const nextLatLng = vehicles.move[id].latLngList[vehicles.state[id].frame + 1];
            vehicles.move[id].motion = L.motion
                .polyline(
                    [currLatLng, nextLatLng],
                    {
                        color: getColorById(id),
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
            vehicles.state[id].frame++;
        }
    }
    vehicles.move[id].timer = setTimeout(() => {
        addDynamicLine(id);
    }, config.duration);
};

// 轨迹颜色
const getColorById = (id) => {
    return colors[id % colors.length];
};

const toggleHandler = (id) => {
    if (id == "all") {
        for (let i in vehicles.state) {
            vehicles.state[i].isRunning = !vehicles.state[i].isRunning;
            vehicles.move[i].motion.motionToggle();
        }
    } else {
        vehicles.state[id].isRunning = !vehicles.state[id].isRunning;
        vehicles.move[id].motion.motionToggle();
    }
};

const changeRangeHandler = (range) => {
    config.sliderRange = range;
    const start = config.sliderRange[0];
    const end = config.sliderRange[1];

    // 对于每一个载具
    for (let i in vehicles.state) {
        // 清除该载具的轨迹
        if (vehicles.move[i].trajetory) {
            vehicles.move[i].trajetory.remove();
        }
        if (vehicles.state[i].displayTrajectory) {
            // 对于该载具的range内每一条轨迹
            const realEnd = Math.min(end, vehicles.move[i].latLngList.length - 1);
            const realLatLngList = vehicles.move[i].latLngList.slice(start, realEnd);
            console.log(`display trajectory of vehicle ${i} in range ${start} to ${realEnd}`);

            vehicles.move[i].trajetory = L.polyline(realLatLngList, { color: getColorById(vehicles.state[i].id) });
            vehicles.move[i].trajetory.addTo(config.map);
        }
    }
};

const displayTrajectoryChangeHandler = (id) => {
    vehicles.state[id].displayTrajectory = !vehicles.state[id].displayTrajectory;
    if (!vehicles.state[id].displayTrajectory && vehicles.move[id].trajetory) {
        vehicles.move[id].trajetory.remove();
    } else {
        const start = config.sliderRange[0];
        const end = config.sliderRange[1];
        const realEnd = Math.min(end, vehicles.move[id].latLngList.length - 1);
        const realLatLngList = vehicles.move[id].latLngList.slice(start, realEnd);
        console.log(`display trajectory of vehicle ${id} in range ${start} to ${realEnd}`);

        vehicles.move[id].trajetory = L.polyline(realLatLngList, { color: getColorById(vehicles.state[id].id) });
        vehicles.move[id].trajetory.addTo(config.map);
    }
};

const addStaticLine = () => {
    // do something
};

onMounted(() => {
    config.map = initMap();

    GPSAdaptor.DataListener((dataGroupByTime) => {
        for (let i in dataGroupByTime) {
            for (let j in dataGroupByTime[i]) {
                const lat = dataGroupByTime[i][j]["latitude"];
                const lng = dataGroupByTime[i][j]["longitude"];
                const id = dataGroupByTime[i][j]["id"];
                if (!vehicles.move[id] || !vehicles.state[id]) {
                    addVehicle(id, [lat, lng]);
                    addDynamicLine(id);
                } else {
                    vehicles.move[id].latLngList.push([lat, lng]);
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
                <SideBar
                    :vstates="vehicles.state"
                    @toggle="toggleHandler"
                    @displayTrajectoryChange="displayTrajectoryChangeHandler"
                ></SideBar>
            </el-aside>
        </el-container>
        <el-footer>
            <MotionRugs @changeRange="changeRangeHandler"></MotionRugs>
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
