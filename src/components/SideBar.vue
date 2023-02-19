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
    // emit("displayTrajectoryChange", id);
};

const findVehicle = (e, id) => {
    e.target.blur();
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
                    <div class="statusItem">
                        <span class="statusContent">Frame:</span>
                        <span class="statusSet" style="float: right; padding-right: 12px; font-size: 17px">{{
                            item.frame
                        }}</span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Pause/Resume:</span>
                        <span class="statusSet">
                            <el-button v-if="item.isRunning" type="primary" @click="toggle(item.id)" round plain>
                                <el-icon size="18"><VideoPause /></el-icon>
                            </el-button>
                            <el-button v-else type="warning" @click="toggle(item.id)" round plain>
                                <el-icon size="18"><VideoPlay /></el-icon>
                            </el-button>
                        </span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Locate:</span>
                        <span class="statusSet">
                            <el-button type="info" @click="findVehicle($event, item.id)" round plain>
                                <el-icon size="18" color="#7289AB"><Location /></el-icon>
                            </el-button>
                        </span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Trajectory is disabled right now :)</span>
                        <span class="statusSet">
                            <el-switch
                                disabled
                                v-model="switchValue[item.id]"
                                @change="displayTrajectoryChange(item.id)"
                        /></span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Icon:</span>
                        <span class="statusSet">
                            <!-- <el-select
                                size="small"
                                :teleported="false"
                                v-model="iconValue[item.id]"
                                :placeholder="vstates[item.id].vehicleType"
                                @change="iconChange($event, item.id)"
                            >
                                <el-option
                                    :key="icon.value"
                                    v-for="icon in icons"
                                    :label="icon.label"
                                    :value="icon.value"
                                >
                                    <span>{{ icon.label }}</span>
                                    <span>
                                        <img :src="icon.url" />
                                    </span>
                                </el-option>
                            </el-select> -->
                            <el-radio-group
                                v-model="vstates[item.id].vehicleType"
                                @change="iconChange($event, item.id)"
                            >
                                <el-radio size="large" v-for="icon in icons" :label="icon.label"
                                    ><img :src="icon.url" style="height: 20px; width: 20px; font-size: 27px"
                                /></el-radio>
                            </el-radio-group>
                        </span>
                    </div>
                </el-collapse-item>
            </div>
        </el-collapse>
    </el-scrollbar>
</template>

<style scoped>
.statusItem {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #ebeef5;
}
.statusSet {
    float: right;
    height: 40px;
    line-height: 40px;
    /* padding-right: 12px; */
}
.statusContent {
    font-weight: bold;
    font-size: 14px;
}
</style>
