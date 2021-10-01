import { APIGatewayProxyEventV2, Handler } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

type HandlerResponseHeaders = {
  "Content-Type": string;
};

export type HandlerResponse = {
  body: string;
  headers: HandlerResponseHeaders;
  statusCode: number;
};

const eventbridge = new EventBridgeClient({ region: process.env.AWS_REGION });

export function sayHello(helloFrom = "anonymous", receivedAt: string): string {
  return `Hello, ${helloFrom}! Your request was received at ${receivedAt}.`;
}

export const handler: Handler = async (
  event: APIGatewayProxyEventV2
): Promise<HandlerResponse> => {
  const helloFrom = event.pathParameters?.helloFrom;

  const putEventsCommand = new PutEventsCommand({
    Entries: [
      {
        Detail: JSON.stringify({ helloFrom: helloFrom }),
        DetailType: "HELLO",
        EventBusName: process.env.EVENT_BUS_NAME,
        Source: "event.custom",
      },
    ],
  });

  await eventbridge.send(putEventsCommand);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hello: sayHello(helloFrom, event.requestContext.time),
    }),
  };
};
