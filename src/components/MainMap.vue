<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "l.movemarker";
import { generateColor } from "./Tools";
import VehicleState from "./VehicleState.vue";
import "leaflet.chinatmsproviders";
import "tilelayer-canvas";

// array of objects to store the state of each trajectory instance
const state = reactive([]);

// icon for the moving marker
const myIcon = L.icon({
    iconSize: [24, 24],
    iconUrl: "/vehicle.svg",
});

// convert the data to a list of latlng
const getLatLngList = (data) => {
    const latLngList = [];
    data.forEach((element) => {
        latLngList.push([Number(element["latitude"]), Number(element["longitude"])]);
    });
    return latLngList;
};

// create a new instance of trajectory
const newInstanceState = (vehicle_id, latLngList) => {
    state.push({
        vehicle_id: vehicle_id,
        ith: 1,
        instance: L.moveMarker(
            [latLngList[0], latLngList[1]],
            { duration: 1000, color: generateColor() },
            { duration: 1000, removeFirstLines: true, maxLengthLines: 5, icon: myIcon },
            {}
        ),
        timer: null,
        latLngList: latLngList,
    });
};

onMounted(() => {
    // initialize the map
    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView([39.92123, 116.51172], 12);

    // 方案一：使用leaflet.chinatmsproviders插件
    // L.tileLayer.chinaProvider("Tencent.Normal.Map", { zoom: 12, maxZoom: 18, minZoom: 5 }).addTo(map);

    // 方案二：使用tilelayer-canvas插件
    L.tileLayer
        .canvas("http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0", {
            zoom: 12,
        })
        .addTo(map);

    /**
     * 谷歌源 https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}
     * 高德路网 https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8<ype=11
     * 高德矢量 http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}
     * 百度 http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1
     * 腾讯 http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0
     * https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}
     */

    // add more lines to the trajectory instance
    const moreLines = (idx) => {
        if (state[idx].ith == 1) {
            console.log(`trajectory ${idx}, length is ${state[idx].latLngList.length}`);
        } else if (state[idx].ith == state[idx].latLngList.length - 1) {
            clearInterval(state[idx].timer);
        } else {
            state[idx].instance.addMoreLine(state[idx].latLngList[state[idx].ith], {
                animatePolyline: true,
            });
        }
        state[idx].ith++;
        state[idx].timer = setTimeout(() => {
            moreLines(idx);
        }, 1100);
    };

    // listen to the data from the adaptor
    GPSAdaptor.DataListener((data) => {
        newInstanceState(data[1], getLatLngList(data[0]));
        nextTick(() => {
            state[data[1]].instance.addTo(map);
            moreLines(data[1]);
        });
    });
});
</script>

<template>
    <div class="map_container">
        <div id="map"></div>
        <div v-for="item of state">
            <VehicleState :vehicle_id="item['vehicle_id']" :ith="item['ith']" :len="state.length"></VehicleState>
        </div>
    </div>
</template>

<style>
.map_container {
    width: 100%;
    height: 75%;
}
#map {
    width: 100%;
    height: 85%;
    margin-bottom: 10px;
}
</style>
