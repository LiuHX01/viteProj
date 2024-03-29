<script setup>
import MotionRugs from "./MotionRugs.vue";
import SideBar from "./SideBar.vue";
import Settings from "./Settings.vue";
import Log from "./Log.vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import { sendLog } from "./Methods.js";
import "leaflet.motion/dist/leaflet.motion.min.js";
import { colors, FILE_COUNT, tileLayerSources, numIcons } from "./Constants.js";
import "leaflet-fullscreen/dist/Leaflet.fullscreen.js";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-sidebar-v2/js/leaflet-sidebar.js";
import "leaflet-sidebar-v2/css/leaflet-sidebar.css";
import "leaflet-switch-basemap/src/L.switchBasemap.js";
import "leaflet-switch-basemap/src/L.switchBasemap.css";

let map = null;

const mapConfig = {
    createOpt: { preferCanvas: true, renderer: L.canvas(), attributionControl: false },
    sourceName: "baseMaps",
    initLatLng: [39.92641, 116.38876],
    zoom: 12,
    maxZoom: 14,
    minZoom: 11,
    duration: 1000,
};

const vehicleConfig = {
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
};

const config = reactive({
    sliderRangeX: [0, 50],
    sliderRangeY: [1, FILE_COUNT],

    trackedVehicle: null,
    trackedLines: [],
    trackMarkers: [],
});

const curr = reactive({
    view: {
        lat: 39.92641,
        lng: 116.38876,
    },
});

const vehicles = reactive({ state: {}, move: {}, smear: {} });

// 初始化地图
const initMap = (sourceName) => {
    map = L.map("map", mapConfig.createOpt).setView(mapConfig.initLatLng, mapConfig.zoom);

    const { light, dark, voyager } = tileLayerSources[sourceName];
    new L.basemapsSwitcher(
        [
            {
                layer: L.tileLayer(light, {
                    zoom: mapConfig.zoom,
                    maxZoom: mapConfig.maxZoom,
                    minZoom: mapConfig.minZoom,
                }).addTo(map),
                icon: "/light.png",
                name: "Light",
            },
            {
                layer: L.tileLayer(dark, {
                    zoom: mapConfig.zoom,
                    maxZoom: mapConfig.maxZoom,
                    minZoom: mapConfig.minZoom,
                }),
                icon: "/dark.png",
                name: "Dark",
            },
            {
                layer: L.tileLayer(voyager, {
                    zoom: mapConfig.zoom,
                    maxZoom: mapConfig.maxZoom,
                    minZoom: mapConfig.minZoom,
                }),
                icon: "/voyager.png",
                name: "Voyager",
            },
        ],
        { position: "bottomright" }
    ).addTo(map);

    map.on("drag", () => {
        curr.view = map.getCenter();
    });

    setInterval(() => {
        curr.view = map.getCenter();
    }, 1000);

    map.on("click", (e) => {
        if (config.trackedVehicle) {
            config.trackedLines.push(e.latlng);
            config.trackMarkers.push(
                L.marker(e.latlng, {
                    icon: L.divIcon({
                        className: "my-div-icon",
                        html: numIcons[config.trackMarkers.length > numIcons.length - 1 ? numIcons.length - 1 : config.trackMarkers.length - 1],
                    }),
                }).addTo(map)
            );
        }
    });

    sendLog(null, "Map initialized.");
};

// 添加载具
const addVehicle = (id, initLatLng) => {
    vehicles.state[id] = {
        id: id,
        frame: 0,
        isRunning: true,
        displayTrajectory: false,
        vehicleType: id < FILE_COUNT / 2 ? "UGV" : "UAV",
        vehicleIconURL: id < FILE_COUNT / 2 ? "/ugv.svg" : "/uav.svg",
        locked: false,
        currLatLng: [-1, -1],
        setPathing: false,
    };
    vehicles.move[id] = {
        latLngList: [initLatLng],
        motion: null,
        timer: null,
        trajetory: null,
        motionOpacity: 1,
        icon: id < FILE_COUNT / 2 ? vehicleConfig.icon.UGV : vehicleConfig.icon.UAV,
        lockTimer: { lat: -1, lng: -1 },
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
    vehicles.smear[id].currSmear = vehicles.smear[id].currSmear == 0 ? vehicles.smear[id].smearCount - 1 : vehicles.smear[id].currSmear - 1;

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
            }).addTo(map);
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
    sendLog(null, "Display smear: " + isDisplay);
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
    sendLog(null, "Display smear length: " + length);
};

const removeAllSmear = () => {
    for (let i in vehicles.smear) {
        for (let j = 0; j < vehicles.smear[i].smearList.length; j++) {
            if (vehicles.smear[i].smearList[j].line) {
                vehicles.smear[i].smearList[j].line.remove();
            }
        }
    }
    sendLog(null, "All smear removed.");
};

const motionRender = (id) => {
    addDynamicLine(id);

    vehicles.move[id].motion.on("motion-ended", () => {
        motionRender(id);
    });
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
            vehicles.move[id].motion.off("motion-ended");
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
                        duration: mapConfig.duration,
                        easing: L.Motion.Ease.swing,
                    },
                    {
                        removeOnEnd: false,
                        showMarker: true,
                        icon: vehicles.state[id].locked ? L.icon({ iconUrl: "/aim.svg", iconSize: [24, 24] }) : vehicles.move[id].icon,
                    }
                )
                .addTo(map);

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
        sendLog(id, `Vehicle ${id} is ${vehicles.state[id].isRunning ? "running" : "stopped"}.`);
    }
};

const changeRangeXHandler = (range, highlightValue) => {
    config.sliderRangeX = range;

    showTrajectoryInRangeFrame(config.sliderRangeX);
    // setTimeout(() => {
    //     removeAllTrajectory();
    // }, 2000);

    sendLog(null, `Change range x to ${range}, highlight value is ${highlightValue}.`);
};

const changeRangeYHandler = (range, highlightValue) => {
    config.sliderRangeY = range;

    for (let id in vehicles.state) {
        if (id >= config.sliderRangeY[0] && id <= config.sliderRangeY[1] && highlightValue) {
            vehicles.state[id].displayTrajectory = true;
        } else {
            vehicles.state[id].displayTrajectory = false;
        }
    }

    showTrajectoryInRangeFrame(config.sliderRangeX);
    // setTimeout(() => {
    //     removeAllTrajectory();
    // }, 2000);

    sendLog(null, `Change range y to ${range}, highlight value is ${highlightValue}.`);
};

const displayTrajectoryChangeHandler = (id) => {
    vehicles.state[id].displayTrajectory = !vehicles.state[id].displayTrajectory;
    if (!vehicles.state[id].displayTrajectory && vehicles.move[id].trajetory) {
        vehicles.move[id].trajetory.remove();
    } else {
        const start = config.sliderRangeX[0];
        const end = config.sliderRangeX[1];
        const realEnd = Math.min(end, vehicles.move[id].latLngList.length - 1);
        const realLatLngList = vehicles.move[id].latLngList.slice(start, realEnd);

        vehicles.move[id].trajetory = L.polyline(realLatLngList, { color: getColorById(vehicles.state[id].id) });
        vehicles.move[id].trajetory.addTo(map);
    }
};

const showTrajectoryInRangeFrame = (range) => {
    for (let id in vehicles.state) {
        if (vehicles.move[id].trajetory) {
            vehicles.move[id].trajetory.remove();
        }
        if (vehicles.state[id].displayTrajectory) {
            const realEnd = Math.min(range[1], vehicles.move[id].latLngList.length - 1);
            const realLatLngList = vehicles.move[id].latLngList.slice(range[0], realEnd);

            vehicles.move[id].trajetory = L.polyline(realLatLngList, { color: getColorById(vehicles.state[id].id) });
            vehicles.move[id].trajetory.addTo(map);
        }
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

    sendLog(null, `Full screen is ${value ? "on" : "off"}.`);
};

const findVehicleHandler = (id) => {
    const latLng = vehicles.move[id].latLngList[vehicles.state[id].frame];
    curr.view = latLng;
    map.setView(latLng, map.getZoom());

    const aimIcon = L.icon({
        iconUrl: "/aim.svg",
        iconSize: [24, 24],
    });

    if (vehicles.move[id].motion) {
        // if 这个车不在lock，清除其他车的lock，处理这个车
        if (!vehicles.state[id].locked) {
            for (let i in vehicles.state) {
                vehicles.state[i].locked = false;
                if (vehicles.move[i].lockTimer) {
                    clearInterval(vehicles.move[i].lockTimer);
                }
                vehicles.move[i].motion.getMarkers()[0].setIcon(vehicles.move[i].icon);
            }
            vehicles.move[id].motion.getMarkers()[0].setIcon(aimIcon);
            setTimeout(() => {
                if (!vehicles.state[id].locked) {
                    vehicles.move[id].motion.getMarkers()[0].setIcon(vehicles.move[id].icon);
                }
            }, 2000);
        }
    }

    sendLog(null, `Find vehicle ${id}.`);
};

const lockVehicleHandler = (id) => {
    for (let i in vehicles.state) {
        if (i != id) {
            vehicles.state[i].locked = false;
            if (vehicles.move[i].lockTimer) {
                clearInterval(vehicles.move[i].lockTimer);
            }
        } else {
            vehicles.state[i].locked = !vehicles.state[i].locked;
            if (vehicles.state[i].locked) {
                vehicles.move[i].lockTimer = setInterval(() => {
                    if (vehicles.move[i].motion) {
                        const latLng = vehicles.move[i].motion.getMarkers()[0].getLatLng();
                        curr.view = latLng;
                        map.setView(latLng, map.getZoom());
                    }
                }, 200);
                const lockIcon = L.icon({
                    iconUrl: "/aim.svg",
                    iconSize: [24, 24],
                });
                vehicles.move[id].motion.getMarkers()[0].setIcon(lockIcon);
            } else {
                vehicles.move[id].motion.getMarkers()[0].setIcon(vehicles.move[id].icon);
                clearInterval(vehicles.move[i].lockTimer);
            }
        }
    }

    sendLog(null, `Lock vehicle ${id} is ${vehicles.state[id].locked ? "on" : "off"}.`);
};

const iconChangeHandler = (id, iconName) => {
    const iconUrl = `/${iconName.toLowerCase()}.svg`;
    const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [16, 16],
    });
    vehicles.move[id].icon = icon;
    vehicles.state[id].vehicleType = iconName;
    if (vehicles.move[id].motion && !vehicles.state[id].locked) {
        vehicles.move[id].motion.getMarkers()[0].setIcon(icon);
    }
};

const removeAllTrajectory = () => {
    for (let id in vehicles.state) {
        if (vehicles.move[id].trajetory) {
            vehicles.move[id].trajetory.remove();
        }
    }

    sendLog(null, `Remove all trajectory.`);
};

const pixelHighlightChangeHandler = (value) => {
    if (value) {
        changeRangeYHandler(config.sliderRangeY, value);
    } else {
        for (let i in vehicles.state) {
            vehicles.state[i].displayTrajectory = false;
        }
        removeAllTrajectory();
    }

    sendLog(null, `Pixel highlight is ${value ? "on" : "off"}.`);
};

const latChangeHandler = (newLat) => {
    for (let i in vehicles.state) {
        vehicles.state[i].locked = false;
        if (vehicles.move[i].lockTimer) {
            clearInterval(vehicles.move[i].lockTimer);
        }
        vehicles.move[i].motion.getMarkers()[0].setIcon(vehicles.move[i].icon);
    }
    curr.view.lat = newLat;
    map.setView(curr.view, map.getZoom());
};

const lngChangeHandler = (newLng) => {
    for (let i in vehicles.state) {
        vehicles.state[i].locked = false;
        if (vehicles.move[i].lockTimer) {
            clearInterval(vehicles.move[i].lockTimer);
        }
        vehicles.move[i].motion.getMarkers()[0].setIcon(vehicles.move[i].icon);
    }
    curr.view.lng = newLng;
    map.setView(curr.view, map.getZoom());
};

const resetViewHandler = () => {
    for (let i in vehicles.state) {
        vehicles.state[i].locked = false;
        if (vehicles.move[i].lockTimer) {
            clearInterval(vehicles.move[i].lockTimer);
        }
        vehicles.move[i].motion.getMarkers()[0].setIcon(vehicles.move[i].icon);
    }
    curr.view = { lat: 39.92641, lng: 116.38876 };
    map.setView(curr.view, map.getZoom());
};

const setPathStartHandler = (id) => {
    if (!config.trackedVehicle) {
        config.trackedVehicle = id;
        vehicles.state[id].setPathing = true;
    }
};

const setPathEndHandler = (id) => {
    if (config.trackedVehicle == id) {
        config.trackMarkers.forEach((marker) => {
            marker.remove();
        });
        config.trackMarkers = [];

        vehicles.move[id].latLngList.splice(vehicles.state[id].frame, 0, ...config.trackedLines);
        config.trackedLines = [];
        config.trackedVehicle = null;
        vehicles.state[id].setPathing = false;
    }
};

const deletePathHandler = (id) => {
    config.trackMarkers.forEach((marker) => {
        marker.remove();
    });
    config.trackMarkers = [];
    config.trackedLines = [];
    config.trackedVehicle = null;
    for (let i in vehicles.state) {
        vehicles.state[i].setPathing = false;
    }
};

onMounted(() => {
    initMap(mapConfig.sourceName);
    map.zoomControl.setPosition("topright");
    L.control.sidebar({ container: "sidebar" }).addTo(map);
    L.control
        .fullscreen({
            position: "topright",
        })
        .addTo(map);

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
                        // vehicles.move[id].timer = setInterval(addDynamicLine, mapConfig.duration, id);
                        motionRender(id);
                        setInterval(() => {
                            if (vehicles.move[id].motion) {
                                vehicles.state[id].currLatLng = vehicles.move[id].motion.getMarkers()[0].getLatLng();
                            }
                        }, 200);
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
                                            <img src="/shebeizhuangtai.svg" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#styleControl" role="tab">
                                            <img src="/kongzhi.svg" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#log" role="tab">
                                            <img src="/log.svg" />
                                        </a>
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
                                            @findVehicle="findVehicleHandler"
                                            @iconChange="iconChangeHandler"
                                            @lockVehicle="lockVehicleHandler"
                                            @setPathStart="setPathStartHandler"
                                            @setPathEnd="setPathEndHandler"
                                            @deletePath="deletePathHandler"
                                        ></SideBar>
                                    </div>
                                </div>

                                <div class="leaflet-sidebar-pane" id="styleControl">
                                    <h1 class="leaflet-sidebar-header">
                                        Global Settings
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <Settings
                                            :latlng="curr.view"
                                            @displaySmearChange="displaySmearChangeHandler"
                                            @displaySmearLengthChange="displaySmearLengthChangeHandler"
                                            @latChange="latChangeHandler"
                                            @lngChange="lngChangeHandler"
                                            @resetView="resetViewHandler"
                                        ></Settings>
                                    </div>
                                </div>

                                <div class="leaflet-sidebar-pane" id="log">
                                    <h1 class="leaflet-sidebar-header">
                                        Logs
                                        <div class="leaflet-sidebar-close">
                                            <el-icon><DArrowLeft /></el-icon>
                                        </div>
                                    </h1>
                                    <div style="margin-top: 10px">
                                        <Log></Log>
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
                                    <div style="margin-top: 10px"></div>
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
                <MotionRugs
                    @changeRangeX="changeRangeXHandler"
                    @fullScreenChange="fullScreenChangeHandler"
                    @changeRangeY="changeRangeYHandler"
                    @pixelHighlightChange="pixelHighlightChangeHandler"
                ></MotionRugs>
            </el-footer>
        </el-container>
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
}
#main-container {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}
.el-container {
    height: 89%;
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
.my-div-icon {
    background-color: transparent;
    width: 24px;
    height: 24px;
}
</style>
