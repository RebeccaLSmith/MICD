import * as cdk from "aws-cdk-lib";
import { Action } from "aws-cdk-lib/aws-codepipeline";
import { Construct } from "constructs";

export interface CognitoProps extends cdk.StackProps {}

const defaultProps: Partial<CognitoProps> = {};

export class CognitoConstruct extends Construct {
    public userPool: cdk.aws_cognito.UserPool;
    public webClientUserPool: cdk.aws_cognito.UserPoolClient;
    public nativeClientUserPool: cdk.aws_cognito.UserPoolClient;
    public identityPool: cdk.aws_cognito.CfnIdentityPool;
    public userPoolId: string;
    public identityPoolId: string;
    public clientId: string;
    public authenticatedRole: cdk.aws_iam.Role;
    public unauthenticatedRole: cdk.aws_iam.Role;
    public patientGroupRole: cdk.aws_iam.Role;

    constructor(
        scope: Construct, 
        name: string, 
        props: CognitoProps
    ) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    const awsRegion = cdk.Stack.of(this).region;

    // User pool
    const userPool = new cdk.aws_cognito.UserPool(this, 'UserPool', {
      signInAliases: {
        email: true,
        username: true,
      },
      userPoolName: 'MICD-user-pool',
      selfSignUpEnabled: false, // Prototype front-ends that are public to the internet should keep this value as false
      autoVerify: { email: true },
      userVerification: {
        emailSubject: "Verify your email the app!",
        emailBody:
          "Hello {username}, Thanks for signing up to the app! Your verification code is {####}",
        emailStyle: cdk.aws_cognito.VerificationEmailStyle.CODE,
        smsMessage:
          "Hello {username}, Thanks for signing up to app! Your verification code is {####}",
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true,
        requireLowercase: true,
      },
      standardAttributes: {
        preferredUsername: {
          required: true,
          mutable: false,
        },
      },
      accountRecovery: cdk.aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,

    });

    const userPoolClient = new cdk.aws_cognito.UserPoolClient(
      this,
      "UserPoolClient",
      {
        generateSecret: false,
        userPool: userPool,
        userPoolClientName: "Client",
        authFlows: {
          userPassword: true,
          userSrp: true,
          custom: true,
        },
      }
    );

    const identityPool = new cdk.aws_cognito.CfnIdentityPool(
      this,
      "IdentityPool",
      {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
            serverSideTokenCheck: false
          }
        ],
      }
    );

    const authenticatedRole = new cdk.aws_iam.Role(
      this,
      "DefaultAuthenticatedRole",
      {
        assumedBy: new cdk.aws_iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
                 "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ).withSessionTags(),
      }
    );
  
    const unauthenticatedRole = new cdk.aws_iam.Role(
      this,
      "DefaultUnauthenticatedRole",
      {
        assumedBy: new cdk.aws_iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ).withSessionTags(),
      }
    );

    const patientGroupRole = new cdk.aws_iam.Role(
      this,
      "PatientGroupRole",
      {
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSIoTConfigAccess'),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSIoTDataAccess'),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
        ],
        assumedBy: new cdk.aws_iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ).withSessionTags(),
      } 
    ); 
  
    new cdk.aws_cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roleMappings: {
          roleMappingsKey: {
            identityProvider: `cognito-idp.${awsRegion}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`,
            ambiguousRoleResolution: 'Deny',
            type: 'Token',
          }
        },
        roles: {
          unauthenticated: unauthenticatedRole.roleArn,
          authenticated: authenticatedRole.roleArn,
        },
      }
    );
  
    // Assign Cfn Outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
    new cdk.CfnOutput(this, "WebClientId", {
      value: userPoolClient.userPoolClientId,
    });

  
    // assign public properties
    this.userPool = userPool;
    this.webClientUserPool = userPoolClient;
    this.authenticatedRole = authenticatedRole;
    this.unauthenticatedRole = unauthenticatedRole;
    this.userPoolId = userPool.userPoolId;
    this.identityPoolId = identityPool.ref;
    this.identityPool = identityPool;
    this.clientId = userPoolClient.userPoolClientId;
    this.patientGroupRole = patientGroupRole;
  }
}