#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DreamsOfTheDeepStack } from '../lib/stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'production';

new DreamsOfTheDeepStack(app, `DreamsOfTheDeep-${stage}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  stage,
});
