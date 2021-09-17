import {
  EventBus,
  EventField,
  Rule,
  RuleTargetInput,
} from "@aws-cdk/aws-events";
import { SfnStateMachine } from "@aws-cdk/aws-events-targets";
import {
  IntegrationPattern,
  JsonPath,
  StateMachine,
  TaskInput,
} from "@aws-cdk/aws-stepfunctions";
import { SnsPublish, SqsSendMessage } from "@aws-cdk/aws-stepfunctions-tasks";
import {
  Api,
  App,
  Function,
  Queue,
  Stack,
  StackProps,
  Table,
  TableFieldType,
  Topic,
} from "@serverless-stack/resources";

export default class GreetingServiceStack extends Stack {
  public readonly ApiEndpoint: string;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventBus = new EventBus(this, "EventBus", {
      eventBusName: "custom-event-bus",
    });

    const sayHelloFunction = new Function(this, "SayHelloFunction", {
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      handler: "services/greeting/sayHello.handler",
    });

    const api = new Api(this, "Api");

    api.addRoutes(this, { "POST /hello/{helloFrom}": sayHelloFunction });

    sayHelloFunction.attachPermissions([[eventBus, "grantPutEventsTo"]]);

    const helloTable = new Table(this, "Hello", {
      fields: {
        helloFrom: TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "helloFrom" },
    });

    const queueConsumerFunction = new Function(this, "QueueConsumerFunction", {
      environment: {
        TABLE_NAME: helloTable.tableName,
      },
      handler: "services/greeting/queueConsumer.handler",
    });

    const sqsQueue = new Queue(this, "Queue", {
      consumer: queueConsumerFunction,
    });

    const snsTopic = new Topic(this, "Topic", {
      subscribers: ["services/greeting/topicSubscriber.handler"],
    });

    const stateMachine = new StateMachine(this, "StateMachine", {
      definition: new SqsSendMessage(this, "SendSQSMessage", {
        integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
        messageBody: TaskInput.fromObject({
          helloFrom: TaskInput.fromJsonPathAt("$.helloFrom"),
          taskToken: JsonPath.taskToken,
        }),
        queue: sqsQueue.sqsQueue,
      }).next(
        new SnsPublish(this, "PublishSNSMessage", {
          message: TaskInput.fromJsonPathAt("$"),
          topic: snsTopic.snsTopic,
        })
      ),
    });

    queueConsumerFunction.attachPermissions([
      [helloTable.dynamodbTable, "grantWriteData"],
      [stateMachine, "grantTaskResponse"],
    ]);

    const rule = new Rule(this, "Rule", {
      eventBus: eventBus,
      eventPattern: {
        detailType: ["HELLO"],
        source: ["event.custom"],
      },
    });

    rule.addTarget(
      new SfnStateMachine(stateMachine, {
        input: RuleTargetInput.fromObject({
          helloFrom: EventField.fromPath("$.detail.helloFrom"),
        }),
      })
    );

    this.addOutputs({
      ApiEndpoint: api.httpApi.apiEndpoint,
    });

    this.ApiEndpoint = api.httpApi.apiEndpoint;
  }
}
