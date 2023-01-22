import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],

    // chainWebpack(config) {
    //     // set worker-loader
    //     config.module
    //         .rule("worker")
    //         .test(/\.worker\.js$/)
    //         .use("worker-loader")
    //         .loader("worker-loader")
    //         .end();

    //     // 解决：worker 热更新问题
    //     config.module.rule("js").exclude.add(/\.worker\.js$/);
    // },
    // parallel: false,
    // chainWebpack: (config) => {
    //     // 解决：“window is undefined”报错，这个是因为worker线程中不存在window对象，因此不能直接使用，要用this代替
    //     config.output.globalObject("this");
    // },
});
