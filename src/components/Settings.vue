<script setup>
import { onMounted, ref } from "vue";

const props = defineProps(["latlng"]);
const emit = defineEmits(["displaySmearChange", "displaySmearLengthChange", "latChange", "lngChange", "resetView"]);

const displaySmearValue = ref(true);
const displaySmearChange = (isDisplay) => {
    disableDisplaySmearLengthChange.value = !disableDisplaySmearLengthChange.value;
    emit("displaySmearChange", isDisplay);
};

const displaySmearLengthValue = ref(2);
const disableDisplaySmearLengthChange = ref(false);
const displaySmearLengthChange = (length) => {
    emit("displaySmearLengthChange", length);
};

const latChange = (newLat) => {
    emit("latChange", newLat);
};

const lngChange = (newLng) => {
    emit("lngChange", newLng);
};

const resetView = () => {
    emit("resetView");
};
</script>

<template>
    <el-card shadow="hover" class="box-card">
        <template #header>
            <div class="card-header">
                <span style="font-size: large">Smear Settings</span>
            </div>
        </template>
        <div class="card-content">
            <div class="card-item">
                <span class="setting-content">Display Smears</span>
                <span class="setting-control">
                    <el-switch v-model="displaySmearValue" @change="displaySmearChange" />
                </span>
            </div>
            <div class="card-item">
                <span class="setting-content">Smear Length</span>
                <span class="setting-control">
                    <el-input-number
                        v-model="displaySmearLengthValue"
                        :min="1"
                        :max="5"
                        size="small"
                        :disabled="disableDisplaySmearLengthChange"
                        @change="displaySmearLengthChange"
                    />
                </span>
            </div>
        </div>
    </el-card>
    <br />
    <el-card shadow="hover" class="box-card">
        <template #header>
            <div class="card-header">
                <span style="font-size: large">Viewer</span>
            </div>
        </template>
        <div class="card-content">
            <div class="card-item">
                <span class="setting-content">View Reset</span>
                <span class="setting-control">
                    <el-button type="primary" size="small" round plain @click="resetView">Reset</el-button>
                </span>
            </div>
            <div class="card-item">
                <span class="setting-content">Latitude</span>
                <span class="setting-control">
                    <el-input-number
                        v-model="props.latlng.lat"
                        :precision="6"
                        :min="0"
                        :max="90"
                        :step="0.00005"
                        size="small"
                        @change="latChange"
                    />
                </span>
            </div>
            <div class="card-item">
                <span class="setting-content">Longitude</span>
                <span class="setting-control">
                    <el-input-number
                        v-model="props.latlng.lng"
                        :precision="6"
                        :min="0"
                        :max="180"
                        :step="0.00005"
                        size="small"
                        @change="lngChange"
                    />
                </span>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
.card-item {
    height: 40px;
    line-height: 40px;
}
.setting-control {
    float: right;
}
</style>
