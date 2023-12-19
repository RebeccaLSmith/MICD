#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from './app-stack';

const app = new cdk.App();

const topicName = 'MICD';

const account =
    app.node.tryGetContext("account") ||
    process.env.CDK_DEPLOY_ACCOUNT ||
    process.env.CDK_DEFAULT_ACCOUNT;

const region =
    app.node.tryGetContext("region") ||
    process.env.CDK_DEPLOY_REGION ||
    process.env.CDK_DEFAULT_REGION;

    
const appStack = new AppStack(app, 'MICDStack', {
  env: {
    account: account,
    region: region
  },
  topicName: topicName
});