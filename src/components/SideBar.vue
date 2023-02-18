<script setup>
import { ref } from "vue";
import { FILE_COUNT } from "./Constants.js";

const props = defineProps(["vstates"]);
const emit = defineEmits(["toggle", "displayTrajectoryChange", "findVehicle", "iconChange"]);

const collapseActiveName = ref([""]);
const switchValue = ref(new Array(FILE_COUNT).fill(false));
const iconValue = ref(() => {
    const arr = new Array(FILE_COUNT);
    for (let i = 0; i < FILE_COUNT; i++) {
        if (vstates[i].vehicleType == "UGV") {
            arr[i] = "UGV";
        } else {
            arr[i] = "UAV";
        }
    }
    return arr;
});

const icons = [
    {
        value: "UGV",
        label: "UGV",
        url: "/ugv.svg",
    },
    {
        value: "UAV",
        label: "UAV",
        url: "/uav.svg",
    },
];

const toggle = (id) => {
    emit("toggle", id);
};

const displayTrajectoryChange = (id) => {
    emit("displayTrajectoryChange", id);
};

const findVehicle = (id) => {
    emit("findVehicle", id);
};

const iconChange = (iconName, id) => {
    emit("iconChange", id, iconName);
};
</script>

<template>
    <el-scrollbar height="100%">
        <el-collapse v-model="collapseActiveName">
            <div v-for="item in vstates">
                <el-collapse-item>
                    <template #title>
                        <el-icon><Van /></el-icon>
                        &nbsp;&nbsp;|&nbsp;&nbsp; Vehicle: {{ item.id }}
                    </template>
                    <div>Frame: {{ item.frame }}</div>
                    <el-button v-if="item.isRunning" type="primary" @click="toggle(item.id)">
                        <el-icon><VideoPause /></el-icon>
                    </el-button>
                    <el-button v-else type="warning" @click="toggle(item.id)">
                        <el-icon><VideoPlay /></el-icon>
                    </el-button>
                    <br />
                    <el-button type="info" @click="findVehicle(item.id)">Lock</el-button>
                    <br />
                    <el-switch
                        v-model="switchValue[item.id]"
                        active-text="Show"
                        inactive-text="Hide"
                        @change="displayTrajectoryChange(item.id)"
                    />
                    <br />
                    <el-select
                        :teleported="false"
                        v-model="iconValue[item.id]"
                        :placeholder="vstates[item.id].vehicleType"
                        @change="iconChange($event, item.id)"
                    >
                        <el-option :key="icon.value" v-for="icon in icons" :label="icon.label" :value="icon.value">
                            <span style="float: left">{{ icon.label }}</span>
                            <span style="float: right; position: absolute; right: 15px; top: 4px">
                                <img :src="icon.url" />
                            </span>
                        </el-option>
                    </el-select>
                </el-collapse-item>
            </div>
        </el-collapse>
    </el-scrollbar>
</template>

<style scoped></style>
