import { Amplify } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: `${import.meta.env.VITE_REGION}`,
    aws_pubsub_endpoint: `wss://${import.meta.env.VITE_IOT_ENDPOINT}/mqtt`,
  })
);

const AmplifyConfig = {
  // Existing API
  API: {
    aws_appsync_graphqlEndpoint: `${import.meta.env.VITE_GRAPHQL_URL}`,
    aws_appsync_region: `${import.meta.env.VITE_REGION}`,
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS', // No touchy
  },

  // Existing Auth
  Auth: {
    identityPoolId: `${import.meta.env.VITE_IDENTITY_POOL_ID}`,

    // REQUIRED - Amazon Cognito Region
    region: `${import.meta.env.VITE_REGION}`,

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: `${import.meta.env.VITE_REGION}`,

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: `${import.meta.env.VITE_USER_POOL_ID}`,
    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: import.meta.env.VITE_APP_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: true,

  },
};

export { AmplifyConfig };