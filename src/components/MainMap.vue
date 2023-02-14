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
import "leaflet-fullscreen/dist/Leaflet.fullscreen.js";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-sidebar-v2/js/leaflet-sidebar.js";
import "leaflet-sidebar-v2/css/leaflet-sidebar.css";

const config = reactive({
    map: null,
    mapSource: "Tencent.Normal.Map",
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
    opacityOne: 0.6,
    opacityTwo: 0.3,
});

const vehicles = reactive({ state: {}, move: {} });

// 初始化地图
const initMap = () => {
    const map = L.map("map", {
        preferCanvas: true,
        renderer: L.canvas(),
        fullscreenControl: true,
        attributionControl: false,
    }).setView(config.latLng, config.zoom);

    L.tileLayer
        .chinaProvider(config.mapSource, {
            zoom: config.zoom,
            maxZoom: config.maxZoom,
            minZoom: config.minZoom,
        })
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
        lastOne: null,
        lastTwo: null,
        recentLine: 1,
        listener: null,
    };
};

const handlelastLines = (id) => {
    /**
     * 线路1是最近的，本次运动之后线路1会变成次近，此时线路2是多余的
     * 移除线路2，修改标识符
     * 修改线路1透明度
     * 设置线路2为新的最近
     */
    const currFrame = vehicles.state[id].frame;
    const currLatLng = vehicles.move[id].latLngList[currFrame];
    if (vehicles.move[id].recentLine === 1) {
        if (vehicles.move[id].lastTwo) {
            vehicles.move[id].lastTwo.remove();
        }
        vehicles.move[id].recentLine = 2;
        if (vehicles.move[id].lastOne) {
            vehicles.move[id].lastOne.setStyle({ opacity: config.opacityTwo });
        }
        vehicles.move[id].lastTwo = L.polyline([vehicles.move[id].motion.getLatLngs()[0], currLatLng], {
            color: getColorById(id),
            opacity: config.opacityOne,
        }).addTo(config.map);
    } else {
        if (vehicles.move[id].lastOne) {
            vehicles.move[id].lastOne.remove();
        }
        vehicles.move[id].recentLine = 1;
        if (vehicles.move[id].lastTwo) {
            vehicles.move[id].lastTwo.setStyle({ opacity: config.opacityTwo });
        }
        vehicles.move[id].lastOne = L.polyline([vehicles.move[id].motion.getLatLngs()[0], currLatLng], {
            color: getColorById(id),
            opacity: config.opacityOne,
        }).addTo(config.map);
    }
};

// 添加轨迹
const addDynamicLine = (id) => {
    if (vehicles.state[id].isRunning) {
        // 如果前面有运动，先清除
        if (vehicles.move[id].motion) {
            // 处理最近的两条线
            handlelastLines(id);

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
                        easing: L.Motion.Ease.swing,
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

onMounted(() => {
    config.map = initMap();
    config.map.zoomControl.setPosition("topright");
    const sidebar = L.control.sidebar({ container: "sidebar" }).addTo(config.map);
    // const panelContent = {
    //     id: "userinfo", // UID, used to access the panel
    //     tab: "<div>123</div>", // content can be passed as HTML string,
    //     pane: document.getElementById("panel").innerHTML, // DOM elements can be passed, too
    //     // title: "Your Profile", // an optional pane header
    //     position: "top", // optional vertical alignment, defaults to 'top'
    // };
    // sidebar.addPanel(panelContent);
    // sidebar.open("userinfo");

    GPSAdaptor.DataListener((dataGroupByTime) => {
        for (let i in dataGroupByTime) {
            for (let j in dataGroupByTime[i]) {
                const lat = dataGroupByTime[i][j]["latitude"];
                const lng = dataGroupByTime[i][j]["longitude"];
                const id = dataGroupByTime[i][j]["id"];
                if (!vehicles.move[id] || !vehicles.state[id]) {
                    addVehicle(id, L.latLng(lat, lng));
                } else {
                    if (vehicles.move[id].latLngList.length === 2) {
                        vehicles.move[id].timer = setInterval(addDynamicLine, config.duration, id);
                    }
                    vehicles.move[id].latLngList.push(L.latLng(lat, lng));
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
                    <div id="map">
                        <div id="sidebar" class="leaflet-sidebar collapsed">
                            <div class="leaflet-sidebar-tabs">
                                <!-- 靠上图标 -->
                                <ul role="tablist">
                                    <li>
                                        <a href="#vehicleStatus" role="tab">
                                            <img src="/shebeizhuangtai.svg" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#todo-1" role="tab">todo1</a>
                                    </li>
                                    <li>
                                        <a href="#todo-2" role="tab">todo2</a>
                                    </li>
                                </ul>

                                <!-- 靠下图标 -->
                                <ul role="tablist">
                                    <li>
                                        <a href="#todo-97" role="tab">todo</a>
                                    </li>
                                    <li>
                                        <a href="#todo-98" role="tab">todo</a>
                                    </li>
                                    <li>
                                        <a href="#todo-99" role="tab">todo</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="leaflet-sidebar-content">
                                <div class="leaflet-sidebar-pane" id="vehicleStatus">
                                    <h1 class="leaflet-sidebar-header">
                                        Vehicle Status
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <SideBar
                                            :vstates="vehicles.state"
                                            @toggle="toggleHandler"
                                            @displayTrajectoryChange="displayTrajectoryChangeHandler"
                                        ></SideBar>
                                    </div>
                                </div>

                                <div class="leaflet-sidebar-pane" id="todo-1">
                                    <h1 class="leaflet-sidebar-header">
                                        todo-1
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 20px">
                                        <el-empty description="todo something... 1"></el-empty>
                                    </div>
                                </div>

                                <div class="leaflet-sidebar-pane" id="todo-2">
                                    <h1 class="leaflet-sidebar-header">
                                        todo-2
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <el-empty description="todo something... 2"></el-empty>
                                    </div>
                                </div>
                                <div class="leaflet-sidebar-pane" id="todo-97">
                                    <h1 class="leaflet-sidebar-header">
                                        todo-97
                                        <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
                                    </h1>
                                </div>
                                <div class="leaflet-sidebar-pane" id="todo-98">
                                    <h1 class="leaflet-sidebar-header">
                                        todo-98
                                        <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <user-descriptions></user-descriptions>
                                    </div>
                                </div>
                                <div class="leaflet-sidebar-pane" id="todo-99">
                                    <h1 class="leaflet-sidebar-header">
                                        todo-99
                                        <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-main>
            <el-footer>
                <MotionRugs @changeRange="changeRangeHandler"></MotionRugs>
            </el-footer>
        </el-container>
        <!-- <el-aside width="300px"> -->
        <!-- <SideBar
                :vstates="vehicles.state"
                @toggle="toggleHandler"
                @displayTrajectoryChange="displayTrajectoryChangeHandler"
            ></SideBar> -->
        <!-- </el-aside> -->
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

/* #sidebar { */
/* width: 300px; */
/* height: 100%; */
/* } */

.leaflet-sidebar-close {
    top: 2px;
}
</style>
