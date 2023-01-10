<script setup>
// import HelloWorld from "./components/HelloWorld.vue";
import myMap from "./components/myMap.vue";
import myState from "./components/myState.vue";
import Axios from "axios";
import { onMounted, watch, reactive } from "vue";
import { csvToArray } from "./tools.js";
import { dataAdaptor } from "./adaptor.js";

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
    <!-- <myState></myState> -->
</template>

<style scoped>
.container-header {
    width: 100%;
    height: 50px;
    background-color: aqua;
}

#mymap {
    width: 1000px;
    height: 500px;
    background-color: slategray;
}
</style>
