<script setup>
const props = defineProps({
    // vehicle_type: {
    //     type: String,
    //     default: "null",
    // },
    vehicle_id: {
        type: Number,
        default: 0,
    },
    ith: {
        type: Number,
        default: 0,
    },
    len: {
        type: Number,
        default: 0,
    },
});
</script>

<template>
    <div class="vehicle_state" :style="{ width: (100 / props.len - 1).toString() + '%' }">
        v_id: {{ props.vehicle_id }}, frame: {{ props.ith }}
    </div>
</template>

<style scoped>
.vehicle_state {
    text-align: center;
    margin-right: 0.5%;
    margin-left: 0.5%;
    line-height: 1.5em;
    font-size: 1.5em;
    height: 4%;
    color: black;
    background-color: aliceblue;
    display: inline;
    float: left;
}
</style>
