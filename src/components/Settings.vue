<script setup>
import { ref } from "vue";

const emit = defineEmits(["displaySmearChange"]);

const displaySmearValue = ref(true);
const displaySmearChange = (isDisplay) => {
    emit("displaySmearChange", isDisplay);
};

const displaySmearLengthValue = ref(2);
const displaySmearLengthChange = (length) => {
    emit("displaySmearLengthChange", length);
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
                        @change="displaySmearLengthChange"
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
