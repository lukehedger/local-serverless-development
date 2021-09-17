import { expect, haveResource } from "@aws-cdk/assert";
import { App } from "@serverless-stack/resources";
import GreetingServiceStack from "../GreetingServiceStack";

test("Test Greeting Service Stack", () => {
  const app = new App();

  const stack = new GreetingServiceStack(app, "greeting-test-stack");

  expect(stack).to(haveResource("AWS::Lambda::Function"));
});
