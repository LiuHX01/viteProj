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
    <div class="vehicle_state" :style="{ width: ((101 - props.len) / props.len).toString() + '%' }">
        v_id: {{ props.vehicle_id }}, frame: {{ props.ith }}
    </div>
</template>

<style scoped>
.vehicle_state {
    text-align: center;
}
</style>
