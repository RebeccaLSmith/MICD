import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import PatientPage from './PatientPage';
import AdminPage from './AdminPage';
import ErrorPage from './ErrorPage';
import FetchUserDetails from '../common/components/FetchUserDetails';
import { Route, Routes } from 'react-router-dom';

import { AmplifyConfig } from '../config/amplify-config';
Amplify.configure(AmplifyConfig);

// import awsmobile from '../aws-exports';
// Amplify.configure(awsmobile);

const App = ({ signOut, user }) => {
  return (
    <>
      {/* <Authenticator loginMechanisms={['email']}  hideSignUp> */}
      {/* <Router> */}
      <FetchUserDetails user={user} signOut={signOut} />
      <Routes>
        <Route path="/" element={
          user ? (
            user.signInUserSession.accessToken.payload['cognito:groups'][0] === 'admin' ? 
              <AdminPage user={user} />
            :
              <PatientPage user={user} />
          ) : (  
            <div>Loading...</div>
          )} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      {/* </Router> */}
      {/* </Authenticator> */}
    </>
  );
};

export default withAuthenticator(App);