import { createSSRApp } from "vue";
import App from "./App.vue";
import { Dialog, Field } from "vant";

export function createApp() {
  const app = createSSRApp(App);
  app.use(Dialog);
  app.use(Field);

  return {
    app,
  };
}
