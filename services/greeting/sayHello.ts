import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
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
      hello: `Hello, ${helloFrom}! Your request was received at ${event.requestContext.time}.`,
    }),
  };
};
