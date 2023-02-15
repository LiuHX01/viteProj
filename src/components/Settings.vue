<script setup>
import { ref } from "vue";

const emit = defineEmits(["displaySmearChange"]);

const displaySmearValue = ref(true);
const displaySmearChange = (isDisplay) => {
    emit("displaySmearChange", isDisplay);
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
                <span class="setting-switch"
                    ><el-switch v-model="displaySmearValue" @change="displaySmearChange"
                /></span>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
.card-item {
    height: 32px;
    line-height: 32px;
}
.setting-switch {
    float: right;
}
</style>
