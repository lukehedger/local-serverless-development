# local-serverless-development

Using the [Serverless Stack's](https://serverless-stack.com/) [*Live Lambda Development Environment*](https://docs.serverless-stack.com/live-lambda-development) to iteratively build serverless applications rapidly.

## Example app

A simple "Say Hello App" is used to demonstrate local serverless application development with the Serverless Stack. The app's primary features are:

- Say hello to the app via the API and get a hello back!
- Store received hellos in a database

### Architecture

*TODO: Architecture diagram*
<!-- API -> Lambda -> EventBridge -> Step Functions [Callback: SQS -> Lambda -> DynamoDB] -> SNS -->

## Install dependencies

```sh
npm install
```

## Local development

Deploy the local development debug stack and services:

```sh
npm start
```

### Remove local development stack

```sh
npm run remove
```

## Build

```sh
npm run build
```

## Test

```sh
npm test
```
