<script setup>
import { ref } from "vue";
import { FILE_COUNT } from "./Constants.js";

const props = defineProps(["vstates"]);
const emit = defineEmits([
    "toggle",
    "displayTrajectoryChange",
    "findVehicle",
    "iconChange",
    "lockVehicle",
    "setPathStart",
    "setPathEnd",
    "deletePath",
]);

const collapseActiveName = ref([""]);
const switchValue = ref(new Array(FILE_COUNT).fill(false));

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

const lockVehicle = (e, id) => {
    e.target.blur();
    emit("lockVehicle", id);
};

const setPathStart = (e, id) => {
    e.target.blur();
    emit("setPathStart", id);
};

const setPathEnd = (e, id) => {
    e.target.blur();
    emit("setPathEnd", id);
};

const deletePath = (e, id) => {
    e.target.blur();
    emit("deletePath", id);
};
</script>

<template>
    <el-scrollbar height="100%">
        <el-collapse v-model="collapseActiveName">
            <div v-for="item in vstates">
                <el-collapse-item>
                    <template #title>
                        {{ item.vehicleType }}: {{ item.id }} &nbsp;&nbsp;
                        <span v-if="item.isRunning" style="color: #67c23a">Running</span>
                        <span v-else style="color: #f56c6c">Stop</span>
                        <span v-if="item.locked" style="color: #409eff">&nbsp;&nbsp;Locked</span>
                        <span v-if="item.setPathing" style="color: #e6a23c">&nbsp;&nbsp;Setting Path</span>
                    </template>
                    <div class="statusItem">
                        <span class="statusContent">Frame:</span>
                        <span class="statusSet" style="float: right; padding-right: 12px; font-size: 17px">{{
                            item.frame
                        }}</span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Latitude:</span>
                        <span class="statusSet" style="float: right; padding-right: 12px; font-size: 17px">{{
                            parseFloat(item.currLatLng.lat).toFixed(6)
                        }}</span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Longitude:</span>
                        <span class="statusSet" style="float: right; padding-right: 12px; font-size: 17px">{{
                            parseFloat(item.currLatLng.lng).toFixed(6)
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
                        <span class="statusContent">Locate/Lock:</span>
                        <span class="statusSet">
                            <el-button-group>
                                <el-button type="info" @click="findVehicle($event, item.id)" round plain>
                                    <el-icon size="18" color="#7289AB"><Location /></el-icon>
                                </el-button>
                                <el-button
                                    v-if="!vstates[item.id].locked"
                                    type="info"
                                    @click="lockVehicle($event, item.id)"
                                    round
                                    plain
                                    ><el-icon size="18"><Lock /></el-icon
                                ></el-button>
                                <el-button v-else type="info" @click="lockVehicle($event, item.id)" round
                                    ><el-icon size="18"><Unlock /></el-icon
                                ></el-button>
                            </el-button-group>
                        </span>
                    </div>
                    <div class="statusItem">
                        <span class="statusContent">Disabled right now :)</span>
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
                    <div class="statusItem">
                        <span class="statusContent">Set Path</span>
                        <span class="statusSet">
                            <el-button-group>
                                <el-button
                                    v-if="!vstates[item.id].setPathing"
                                    type="info"
                                    @click="setPathStart($event, item.id)"
                                    round
                                    plain
                                    ><el-icon size="18"><Plus /></el-icon
                                ></el-button>
                                <el-button v-else type="info" @click="setPathEnd($event, item.id)" round
                                    ><el-icon size="18"><Check /></el-icon
                                ></el-button>
                                <el-button type="warning" round plain>
                                    <el-icon size="18" @click="deletePath($event, item.id)" color="#7289AB"
                                        ><Delete
                                    /></el-icon>
                                </el-button>
                            </el-button-group>
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
