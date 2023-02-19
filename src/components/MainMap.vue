<script setup>
import MotionRugs from "./MotionRugs.vue";
import SideBar from "./SideBar.vue";
import Settings from "./Settings.vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "tilelayer-canvas";
import "leaflet.motion/dist/leaflet.motion.min.js";
import { colors, FILE_COUNT } from "./Constants.js";
import "leaflet-fullscreen/dist/Leaflet.fullscreen.js";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-sidebar-v2/js/leaflet-sidebar.js";
import "leaflet-sidebar-v2/css/leaflet-sidebar.css";
import "leaflet-switch-basemap/src/L.switchBasemap.js";
import "leaflet-switch-basemap/src/L.switchBasemap.css";

const config = reactive({
    map: null,
    latLng: [39.92641, 116.38876],
    zoom: 12,
    maxZoom: 14,
    minZoom: 11,
    duration: 1000,
    icon: {
        UGV: L.icon({
            iconUrl: "/ugv.svg",
            iconSize: [16, 16],
        }),
        UAV: L.icon({
            iconUrl: "/uav.svg",
            iconSize: [16, 16],
        }),
    },
    sliderRange: [0, 50],
    opacityOne: 0.6,
    opacityTwo: 0.3,
});

const vehicles = reactive({ state: {}, move: {}, smear: {} });

// 初始化地图
const initMap = () => {
    const map = L.map("map", {
        preferCanvas: true,
        renderer: L.canvas(),
        attributionControl: false,
    }).setView(config.latLng, config.zoom);

    new L.basemapsSwitcher(
        [
            {
                layer: L.tileLayer
                    .canvas("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                        zoom: config.zoom,
                        maxZoom: config.maxZoom,
                        minZoom: config.minZoom,
                    })
                    .addTo(map), //DEFAULT MAP
                icon: "/todo.svg",
                name: "极简",
            },
            {
                layer: L.tileLayer.canvas(
                    "http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0",
                    {
                        zoom: config.zoom,
                        maxZoom: config.maxZoom,
                        minZoom: config.minZoom,
                    }
                ),
                icon: "/todo.svg",
                name: "导航",
            },
            {
                layer: L.tileLayer.canvas("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                    zoom: config.zoom,
                    maxZoom: config.maxZoom,
                    minZoom: config.minZoom,
                }),
                icon: "/todo.svg",
                name: "暗色",
            },
        ],
        { position: "bottomright" }
    ).addTo(map);

    config.map = map;
};

// 添加载具
const addVehicle = (id, initLatLng) => {
    vehicles.state[id] = {
        id: id,
        frame: 0,
        isRunning: true,
        displayTrajectory: false,
        vehicleType: id < FILE_COUNT / 2 ? "UGV" : "UAV",
    };
    vehicles.move[id] = {
        latLngList: [initLatLng],
        motion: null,
        timer: null,
        trajetory: null,
        motionOpacity: 1,
        icon: id < FILE_COUNT / 2 ? config.icon.UGV : config.icon.UAV,
    };
    vehicles.smear[id] = {
        displaySmear: true,
        smearList: [
            { line: null, opacity: 1 },
            { line: null, opacity: 1 },
        ],
        smearCount: 2,
        currSmear: 1,
        currOpacity: 0.7,
        opacityGap: 0.3,
    };
};

const handleSmear = (id) => {
    vehicles.smear[id].currSmear =
        vehicles.smear[id].currSmear == 0 ? vehicles.smear[id].smearCount - 1 : vehicles.smear[id].currSmear - 1;

    if (vehicles.smear[id].smearList.length < vehicles.smear[id].smearCount) {
        for (let i = vehicles.smear[id].smearList.length; i < vehicles.smear[id].smearCount; i++) {
            vehicles.smear[id].smearList.push({ line: null, opacity: 1 });
        }
    }

    for (let i = 0; i < vehicles.smear[id].smearList.length; i++) {
        if (i >= vehicles.smear[id].smearCount) {
            // 移除多余的线
            if (vehicles.smear[id].smearList[i].line) {
                vehicles.smear[id].smearList[i].line.remove();
            }
        } else if (i == vehicles.smear[id].currSmear) {
            // 末端移到最前成为最近的线
            if (vehicles.smear[id].smearList[i].line) {
                vehicles.smear[id].smearList[i].line.remove();
            }
            const currLatLng = vehicles.move[id].latLngList[vehicles.state[id].frame];
            vehicles.smear[id].smearList[i].opacity = vehicles.smear[id].currOpacity;
            vehicles.smear[id].smearList[i].line = L.polyline([vehicles.move[id].motion.getLatLngs()[0], currLatLng], {
                color: getColorById(id),
                opacity: vehicles.smear[id].currOpacity,
            }).addTo(config.map);
        } else {
            // 其他线透明度减少
            if (vehicles.smear[id].smearList[i].line) {
                const prevOpacity = vehicles.smear[id].smearList[i].opacity;
                vehicles.smear[id].smearList[i].line.setStyle({
                    opacity: prevOpacity - vehicles.smear[id].opacityGap,
                });
                vehicles.smear[id].smearList[i].opacity = prevOpacity - vehicles.smear[id].opacityGap;
            }
        }
    }
};

const displaySmearChangeHandler = (isDisplay) => {
    if (isDisplay) {
        for (let i in vehicles.smear) {
            vehicles.smear[i].displaySmear = true;
        }
    } else {
        for (let i in vehicles.smear) {
            vehicles.smear[i].displaySmear = false;
            if (!vehicles.state[i].isRunning) {
                for (let j = 0; j < vehicles.smear[i].smearList.length; j++) {
                    if (vehicles.smear[i].smearList[j].line) {
                        vehicles.smear[i].smearList[j].line.remove();
                    }
                }
                if (vehicles.move[i].motion) {
                    vehicles.move[i].motion.setStyle({ color: "transparent" });
                }
            }
        }
    }
};

const displaySmearLengthChangeHandler = (length) => {
    removeAllSmear();
    for (let i in vehicles.smear) {
        vehicles.smear[i].smearCount = length;
        vehicles.smear[i].currOpacity = 0.4 + length * 0.1;
        if (length == 5 || length == 4) {
            vehicles.smear[i].opacityGap = 0.2;
        } else if (length == 3 || length == 2) {
            vehicles.smear[i].opacityGap = 0.3;
        } else if (length == 1) {
            vehicles.smear[i].opacityGap = 0.4;
        }
    }
};

const removeAllSmear = () => {
    for (let i in vehicles.smear) {
        for (let j = 0; j < vehicles.smear[i].smearList.length; j++) {
            if (vehicles.smear[i].smearList[j].line) {
                vehicles.smear[i].smearList[j].line.remove();
            }
        }
    }
};

// 添加轨迹
const addDynamicLine = (id) => {
    if (vehicles.state[id].isRunning) {
        // 如果前面有运动，先清除
        if (vehicles.move[id].motion) {
            if (vehicles.smear[id].displaySmear) {
                handleSmear(id);
            } else {
                for (let i = 0; i < vehicles.smear[id].smearList.length; i++) {
                    if (vehicles.smear[id].smearList[i].line) {
                        vehicles.smear[id].smearList[i].line.remove();
                    }
                }
            }

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
                        color: vehicles.smear[id].displaySmear ? getColorById(id) : "transparent",
                    },
                    {
                        auto: true,
                        duration: config.duration,
                        easing: L.Motion.Ease.swing,
                    },
                    {
                        removeOnEnd: false,
                        showMarker: true,
                        icon: vehicles.move[id].icon,
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

const fullScreenChangeHandler = (value) => {
    const elem = document.getElementById("main-container");

    if (value) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE/Edge */
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
        }
    }
};

const findVehicleHandler = (id) => {
    const latLng = vehicles.move[id].latLngList[vehicles.state[id].frame];
    config.map.setView(latLng, config.map.getZoom());

    const aimIcon = L.icon({
        iconUrl: "/aim.svg",
        iconSize: [24, 24],
    });
    if (vehicles.move[id].motion) {
        vehicles.move[id].motion.getMarkers()[0].setIcon(aimIcon);
    }
    setTimeout(() => {
        if (vehicles.move[id].motion) {
            vehicles.move[id].motion.getMarkers()[0].setIcon(vehicles.move[id].icon);
        }
    }, 2000);
};

const iconChangeHandler = (id, iconName) => {
    const iconUrl = `/${iconName.toLowerCase()}.svg`;
    const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [16, 16],
    });
    vehicles.move[id].icon = icon;
    vehicles.state[id].vehicleType = iconName;
    if (vehicles.move[id].motion) {
        vehicles.move[id].motion.getMarkers()[0].setIcon(icon);
    }
};

onMounted(() => {
    initMap();
    config.map.zoomControl.setPosition("topright");
    L.control.sidebar({ container: "sidebar" }).addTo(config.map);
    L.control
        .fullscreen({
            position: "topright",
        })
        .addTo(config.map);

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
    <el-container id="main-container">
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
                                            <!-- <el-badge is-dot :value="12"> -->
                                            <img src="/shebeizhuangtai.svg" />
                                            <!-- </el-badge> -->
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#styleControl" role="tab">
                                            <img src="/kongzhi.svg" />
                                        </a>
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
                                            @findVehicle="findVehicleHandler"
                                            @iconChange="iconChangeHandler"
                                        ></SideBar>
                                    </div>
                                </div>

                                <div class="leaflet-sidebar-pane" id="styleControl">
                                    <h1 class="leaflet-sidebar-header">
                                        Style Control
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <Settings
                                            @displaySmearChange="displaySmearChangeHandler"
                                            @displaySmearLengthChange="displaySmearLengthChangeHandler"
                                        ></Settings>
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
                                        <!-- <user-descriptions></user-descriptions> -->
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
                <MotionRugs @changeRange="changeRangeHandler" @fullScreenChange="fullScreenChangeHandler"></MotionRugs>
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
#main-container {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}
.el-container {
    height: 90%;
}
.el-main {
    padding: 0 0;
}
.el-footer {
    padding: 0 0;
}
.leaflet-sidebar-close {
    top: 2px;
}
</style>
