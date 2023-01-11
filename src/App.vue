<script setup>
import MainMap from "./components/MainMap.vue";
import Axios from "axios";
import { onMounted } from "vue";
import { csvToArray } from "./components/Tools.js";
import { dataAdaptor } from "./components/Adaptor.js";

// fetch data from the server
const fetchData = async () => {
    for (let i = 0; i < 5; i++) {
        const rawData = await Axios.get(`/vehicledata/${i + 1}.csv`, {
            responseType: "text",
        });
        dataAdaptor.DataEmitter([csvToArray(rawData.data), i]);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="container-header"></div>
    <MainMap></MainMap>
</template>

<style scoped>
.container-header {
    width: 100%;
    height: 5%;
    background-color: grey;
}
</style>
