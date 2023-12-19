import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CognitoConstruct } from "./cognito-construct";

export interface AppSyncProps extends cdk.StackProps {
    readonly userPool: cdk.aws_cognito.UserPool; 
}

const defaultProps: Partial<AppSyncProps> = {};

export class AppSyncConstruct extends Construct {
  public api: cdk.aws_appsync.GraphqlApi;
  public messagesTable: cdk.aws_dynamodb.Table;

  constructor(scope: Construct, name: string, props: AppSyncProps) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    const messagesTable = new cdk.aws_dynamodb.Table(this, 'MessagesTable', {
      partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });

    // IAM role for AppSync to access DynamoDB
    const dynamoDbRole = new cdk.aws_iam.Role(this, 'AppSyncDynamoDBRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('appsync.amazonaws.com')
    });
    messagesTable.grantReadWriteData(dynamoDbRole);

    // AppSync API
    const api = new cdk.aws_appsync.GraphqlApi(this, 'Api', {
      name: 'appsync-dynamodb-api',
      schema: cdk.aws_appsync.SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: cdk.aws_appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool 
          }
        },
      }
    });
    
    // Data sources
    const messagesDs = api.addDynamoDbDataSource('MessagesDataSource', messagesTable);

    // Resolvers
    const listMessageInformations = api.createResolver('ListMessageInformationsResolver', {
      typeName: 'Query',
      fieldName: 'listMessageInformations',
      dataSource: messagesDs,
      code: cdk.aws_appsync.Code.fromAsset('resolvers/listMessageInformations.js'),
      runtime: cdk.aws_appsync.FunctionRuntime.JS_1_0_0
    });
    
    this.api = api;
    this.messagesTable = messagesTable; 
  }
}