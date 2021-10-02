import {$log} from "@tsed/common";
import {PlatformExpress} from "@tsed/platform-express";
import {Server} from "./server"

async function bootstrap() {
  try {
    $log.debug("Start server...");
    const platform = await PlatformExpress.bootstrap(Server, {
      port: 3000
    });

    await platform.listen();
    $log.debug("Server initialized");


  } catch (er) {
    $log.error(er);
  }
}

bootstrap();