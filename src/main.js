import { createSSRApp } from "vue";
import App from "./App.vue";
import { Loading } from "vant";

export function createApp() {
  const app = createSSRApp(App);
  app.use(Loading);

  return {
    app,
  };
}
