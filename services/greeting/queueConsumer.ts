import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
import { SQSEvent, SQSRecord, SQSHandler } from "aws-lambda";

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const stepFunctionsClient = new SFNClient({ region: process.env.AWS_REGION });

export const handler: SQSHandler = async (event: SQSEvent) => {
  await Promise.all(
    event.Records.map(async (record: SQSRecord) => {
      const { helloFrom, taskToken } = JSON.parse(record.body);

      const putItemCommand = new PutItemCommand({
        Item: {
          helloFrom: {
            S: helloFrom.value,
          },
        },
        TableName: process.env.TABLE_NAME,
      });

      await dynamoDBClient.send(putItemCommand);

      const sendTaskSuccessCommand = new SendTaskSuccessCommand({
        output: JSON.stringify("Callback task completed successfully"),
        taskToken: taskToken,
      });

      await stepFunctionsClient.send(sendTaskSuccessCommand);
    })
  );

  return;
};
