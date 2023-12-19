// create iot cdk construct
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export interface IotProps extends cdk.StackProps {
  readonly identityPoolId: string;
  readonly messagesTable: cdk.aws_dynamodb.Table;
  readonly identityPool: cdk.aws_cognito.CfnIdentityPool;
  readonly topicName: string;
}

const defaultProps: Partial<IotProps> = {};

export class IotConstruct extends Construct {
  public iotEndpoint: string;

  constructor(scope: Construct, name: string, props: IotProps) {
    super(scope, name);
    
    props = { ...defaultProps, ...props };

    // Get IoT endpoint
    const getIoTEndpoint = new cdk.custom_resources.AwsCustomResource(this, 'IoTEndpoint', {
      onCreate: {
        service: 'Iot',
        action: 'describeEndpoint',
        physicalResourceId: cdk.custom_resources.PhysicalResourceId.fromResponse('endpointAddress'),
        parameters: {
          "endpointType": "iot:Data-ATS"
        }
      },
      policy: cdk.custom_resources.AwsCustomResourcePolicy.fromSdkCalls({resources: cdk.custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE})
    });
  
    const iotEndpoint = getIoTEndpoint.getResponseField('endpointAddress');

    // Create pub sub policy
    const pubSubPolicy = new cdk.aws_iot.CfnPolicy(this, 'PubSubPolicy', {
      policyName: 'PubSubPolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
        {
            Effect: 'Allow',
            Action: [
            'iot:Connect',
            'iot:Publish',
            'iot:Subscribe',
            'iot:Receive'
            ],
            Resource: ['*']
        }
        ]
      }
    });

    pubSubPolicy.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const iotDynamoRole = new cdk.aws_iam.Role(this, 'IotDynamoRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('iot.amazonaws.com')
      });
    props.messagesTable.grantReadWriteData(iotDynamoRole);

    // Create rule to send data to DynamoDB
    new cdk.aws_iot.CfnTopicRule(this, 'SendDataToDynamoRule', {
      topicRulePayload: {
        sql: `SELECT * FROM \'${props.topicName}\'`,
        description: 'Send data to DynamoDB',
        actions: [{
          dynamoDBv2: {
            putItem: {
              tableName: props.messagesTable.tableName
            },
            roleArn: iotDynamoRole.roleArn
          }
        }]
      }
    });

    this.iotEndpoint = iotEndpoint;

  }
}  