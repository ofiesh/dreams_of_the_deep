#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DreamsOfTheDeepStack } from '../lib/stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'production';

new DreamsOfTheDeepStack(app, `DreamsOfTheDeep-${stage}`, {
  env: {
    account: '015809852967',
    region: 'us-east-2',
  },
  stage,
});
