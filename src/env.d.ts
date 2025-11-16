import type { Lang } from "./lib/i18n";

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    lang?: Lang;
  }
}
