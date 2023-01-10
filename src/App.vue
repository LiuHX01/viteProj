<script setup>
import myMap from "./components/myMap.vue";
import Axios from "axios";
import { onMounted } from "vue";
import { csvToArray } from "./tools.js";
import { dataAdaptor } from "./adaptor.js";

// fetch data from the server
const fetchData = async () => {
    for (let i = 1; i <= 5; i++) {
        const rawData = await Axios.get(`/vehicledata/${i}.csv`, {
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
    <myMap></myMap>
</template>

<style scoped>
.container-header {
    width: 100%;
    height: 50px;
    background-color: aqua;
}
</style>
