import { PubSub, Hub, Auth } from 'aws-amplify';
import React, { useEffect } from 'react';
import { Button, ColumnLayout, Box } from '@cloudscape-design/components';
import '@aws-amplify/ui-react/styles.css';
import { CONNECTION_STATE_CHANGE } from '@aws-amplify/pubsub';
import './index.css';
import {v4 as uuidv4} from 'uuid';
import images from './images';

Hub.listen('pubsub', (data) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    console.log(payload.data.connectionState, payload);
  }
});

export default function PatientPage({user}) {

  const sendMessage = async (message) => {
    const currentDate = new Date();
    const randomId = uuidv4().toString();
    PubSub.publish(`${import.meta.env.VITE_TOPIC_NAME}`, {"id": randomId, "Message": message, "Timestamp": currentDate });
  }

  useEffect(() => {
    const sub = PubSub.subscribe(`${import.meta.env.VITE_TOPIC_NAME}`).subscribe({

      next: (data) => console.log('Message received', data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (

      <ColumnLayout columns={5} borders="horizontal">

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I am hot')}>
          <img className="button-image" src={images.hot_button} alt="Too Hot" />
            <h1>I feel Hot</h1>
          </Button>
        </Box>
            
        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I am tired')}>
          <img className="button-image" src={images.tired_button} alt="I am tired" />
            <h1>Tired</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I need to use the restroom')}>
          <img className="button-image" src={images.bathroom_button} alt="Restroom" />
            <h1>Restroom</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I am cold')}>
          <img className="button-image" src={images.cold_button} alt="I am cold" />
            <h1>I am Cold</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I need medicine')}>
          <img className="button-image" src={images.medicine_button} alt="Medicine" />
            <h1>Medicine</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I want to go outside')}>
          <img className="button-image" src={images.go_outside_button} alt="Go outside" />
            <h1>Go outside</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage("I don't feel well")}>
          <img className="button-image" src={images.dont_feel_well_button} alt="I don't feel well" />
            <h1>Feeling Sick</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I love you')}>
          <img className="button-image" src={images.love_you_button} alt="I love you" />
            <h1>I love you</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I am hungry')}>
          <img className="button-image" src={images.food_button} alt="Food" />
            <h1>Food</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I am thirsty')}>
          <img className="button-image" src={images.drink_button} alt="I am thirsty" />
            <h1>Drink</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('Call my family')}>
          <img className="button-image" src={images.call_my_family_button} alt="Call my family" />
            <h1>Call my family</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('Yes')}>
          <img className="button-image" src={images.yes_button} alt="Yes" />
            <h1>Yes</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('No')}>
          <img className="button-image" src={images.no_button} alt="No" />
            <h1>No</h1>
          </Button>
        </Box>

        <Box margin="xxl" padding="xxl">
          <Button fullWidth onClick={() => sendMessage('I need to see a doctor')}>
          <img className="button-image" src={images.see_doctor_button} alt="See doctor" />
            <h1>See doctor</h1>
          </Button>
        </Box>

      </ColumnLayout>

  )
}