import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoConstruct} from "./constructs/cognito-construct";
import { AppSyncConstruct } from "./constructs/appsync-construct";
import { AmplifyConstruct } from "./constructs/amplify-construct";
import { IotConstruct } from "./constructs/iot-construct";

export interface AppStackProps extends cdk.StackProps {
  readonly topicName: string;
}

export class AppStack extends cdk.Stack {
  public readonly topicName: string;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const cognito = new CognitoConstruct(this, "Cognito", props);
    const appsync = new AppSyncConstruct(this, "AppSync", { userPool: cognito.userPool });
    const iot = new IotConstruct(this, "Iot", { 
      identityPoolId: cognito.identityPoolId, 
      messagesTable: appsync.messagesTable,
      identityPool: cognito.identityPool,
      topicName: props.topicName
    });
    const amplifyApp = new AmplifyConstruct(this, "Amplify", { 
      userPool: cognito.userPool, 
      identityPoolId: cognito.identityPoolId,
      userPoolClientId: cognito.clientId,
      graphqlUrl: appsync.api.graphqlUrl,
      apiId: appsync.api.apiId,
      iotEndpoint: iot.iotEndpoint,
      topicName: props.topicName,
    });

    appsync.node.addDependency(cognito);
    iot.node.addDependency(cognito);
    iot.node.addDependency(appsync);
    amplifyApp.node.addDependency(cognito);
    amplifyApp.node.addDependency(appsync);
    amplifyApp.node.addDependency(iot);
    /*
     * START
     * Cognito Groups and Admin User
     */

    const adminGroup = new cdk.aws_cognito.CfnUserPoolGroup(this,"AdminGroup",
      {
        groupName: "admin",
        userPoolId: cognito.userPoolId,
        description: "Administrator Group",
      }
    );

    const patientGroup = new cdk.aws_cognito.CfnUserPoolGroup(this, "PatientGroup", {
      groupName: "patient",
      userPoolId: cognito.userPoolId,
      description: "Patient Group",
      roleArn: cognito.patientGroupRole.roleArn
    });

    // Admin User
    const adminUser = new cdk.aws_cognito.CfnUserPoolUser(
      this,
      "AdminUser",
      {
        userPoolId: cognito.userPoolId,
        username: "Admin",
        userAttributes: [
          {
            name: "email",
            value: this.node.tryGetContext("admin_email")
          },
          {
            name: "given_name",
            value: this.node.tryGetContext("admin_given_name")
          },
          {
            name: "family_name",
            value: this.node.tryGetContext("admin_family_name")
          },
          {
            name: "email_verified",
            value: "true",
          },
          {
            name: "preferred_username",
            value: "Admin",
          },
        ],
        desiredDeliveryMediums: ["EMAIL"],
      }
    );

    // Patient User
    const patientUser = new cdk.aws_cognito.CfnUserPoolUser(
      this,
      "PatientUser",
      {
        userPoolId: cognito.userPoolId,
        username: "Patient",
        userAttributes: [
          {
            name: "email",
            value: this.node.tryGetContext("patient_email")
          },
          {
            name: "given_name",
            value: this.node.tryGetContext("patient_given_name")
          },
          {
            name: "family_name",
            value: this.node.tryGetContext("patient_family_name")
          },
          {
            name: "email_verified",
            value: "true",
          },
          {
            name: "preferred_username",
            value: "Patient",
          },
        ],
        desiredDeliveryMediums: ["EMAIL"],
      }
    );

    // Add Admin User to Admin Group
    const adminGroupAttachment =
      new cdk.aws_cognito.CfnUserPoolUserToGroupAttachment(
        this,
        "AdminGroupAttachment",
        {
          username: adminUser.username!,
          groupName: adminGroup.groupName!,
          userPoolId: cognito.userPoolId,
        }
      );

    // Add Patient User to Patient Group
    const patientGroupAttachment =
      new cdk.aws_cognito.CfnUserPoolUserToGroupAttachment(
        this,
        "PatientGroupAttachment",
        {
          username: patientUser.username!,
          groupName: patientGroup.groupName!,
          userPoolId: cognito.userPoolId,
        }
      );

    adminGroupAttachment.node.addDependency(adminGroup, adminUser);
    patientGroupAttachment.node.addDependency(patientGroup, patientUser);

    /*
     * END
     * Cognito Groups and Admin User
     */
  }
}
