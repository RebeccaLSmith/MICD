import * as cdk from "aws-cdk-lib";
import * as amplify from "@aws-cdk/aws-amplify-alpha";
import { Construct } from "constructs";

export interface AmplifyProps extends cdk.StackProps {
    readonly userPool: cdk.aws_cognito.UserPool;
    readonly identityPoolId: string;
    readonly userPoolClientId: string;
    readonly graphqlUrl: string;
    readonly apiId: string;
    readonly iotEndpoint: string;
    readonly topicName: string;
}

const defaultProps: Partial<AmplifyProps> = {};

export class AmplifyConstruct extends Construct {

  constructor(scope: Construct, name: string, props: AmplifyProps) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    const awsRegion = cdk.Stack.of(this).region;

    const amplifyApp = new amplify.App(this, 'MyApp', {
      appName: 'MICD_App',
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'BeccaLSmith',
        repository: 'MICD_Device_Communication_App',
        oauthToken: cdk.SecretValue.secretsManager('github-token')
      }),
      environmentVariables: {
        REGION: awsRegion,
        USER_POOL_ID: props.userPool.userPoolId,
        IDENTITY_POOL_ID: props.identityPoolId, 
        APP_CLIENT_ID: props.userPoolClientId,
        GRAPHQL_ENDPOINT: props.graphqlUrl,
        GRAPHQL_API_ID: props.apiId,
        IOT_ENDPOINT: props.iotEndpoint,
        TOPIC_NAME: props.topicName
      },
      customRules: [{
        source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
        status: amplify.RedirectStatus.REWRITE,
        target: '/index.html'
      }],
      buildSpec: cdk.aws_codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'echo Entered the pre-build phase...',
                'pwd',
                'cd web-app',
                'pwd',
                'npm install'
              ],
            },
            build: {
              commands: [
                'echo "🛠️ Setting up your environmental variables..."',
                'echo "VITE_REGION=$REGION" >> .env',
                'echo "VITE_API_ID=$GRAPHQL_API_ID" >> .env',
                'echo "VITE_GRAPHQL_URL=$GRAPHQL_ENDPOINT" >> .env',
                'echo "VITE_IDENTITY_POOL_ID=$IDENTITY_POOL_ID" >> .env',
                'echo "VITE_USER_POOL_ID=$USER_POOL_ID" >> .env',
                'echo "VITE_APP_CLIENT_ID=$APP_CLIENT_ID" >> .env',
                'echo "VITE_IOT_ENDPOINT=$IOT_ENDPOINT" >> .env',
                'echo "VITE_TOPIC_NAME=$TOPIC_NAME" >> .env',
                'echo "Printing environmental variables to the console to ensure they are correct"',
                'cat .env',
                'npm run build',
                'echo "✅ Success!"'
              ],
            },
          },
          artifacts: {
            baseDirectory: './web-app/build',
            files: [
              '**/*'
            ]
          },
        },          
      }),
    });

    const main = amplifyApp.addBranch('main', {autoBuild: true});

    // Trigger to automatically start build
    const build_trigger = new cdk.custom_resources.AwsCustomResource(this, 'triggerAppBuild', {
      policy: cdk.custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cdk.custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE
      }),
      onCreate: {
          service: 'Amplify',
          action: 'startJob',
          physicalResourceId: cdk.custom_resources.PhysicalResourceId.of('app-build-trigger'),
          parameters: {
              appId: amplifyApp.appId,
              branchName: main.branchName,
              jobType: 'RELEASE',
              jobReason: 'Auto Start build',
          }
      },
  });

  new cdk.CfnOutput(this, "AmplifyDomain", {
    value: amplifyApp.defaultDomain,
  });

  }
}