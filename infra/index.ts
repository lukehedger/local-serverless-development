import { App } from "@serverless-stack/resources";
import GreetingServiceStack from "./GreetingServiceStack";
import StaticSiteStack from "./StaticSiteStack";

export default function main(app: App): void {
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  const greetingServiceStack = new GreetingServiceStack(
    app,
    "greeting-service-stack"
  );

  new StaticSiteStack(app, "static-site-stack", {
    ApiEndpoint: greetingServiceStack.ApiEndpoint,
  });
}
