import { SNSEvent, SNSEventRecord, SNSHandler } from "aws-lambda";

export const handler: SNSHandler = async (event: SNSEvent) => {
  event.Records.map((record: SNSEventRecord) => {
    console.log(record);
  });

  return;
};
