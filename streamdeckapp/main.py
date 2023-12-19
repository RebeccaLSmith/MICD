#!/usr/bin/env python3

import os
import logging
import json
import time
import traceback
from datetime import datetime
import uuid
from PIL import Image
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

from src.decks.DeviceManager import DeviceManager
from src.ImageHelpers import PILHelper
from src.config import BUTTON_MESSAGES
from src.config import (
    CLIENT_ID,
    HOST,
    ROOT_CA,
    PRIVATE_KEY,
    CERTIFICATE,
)
# logging errors
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# streamdeck images path
ASSETS_PATH = os.path.join(os.path.dirname(__file__), "Assets")

# Connect to AWS IoT Core
logging.info('Attempting to connect to AWS IoT...')
myMQTTClient = AWSIoTMQTTClient(CLIENT_ID)
myMQTTClient.configureEndpoint(HOST, 8883)
myMQTTClient.configureCredentials(ROOT_CA, PRIVATE_KEY, CERTIFICATE)

try:
    myMQTTClient.connect()
    logging.info('Successfully connected to AWS IoT.')
except Exception as e:
    logging.error(f'Failed to connect to AWS IoT: {e}')


#########################
# Connect to StreamDeck #
#########################
try:
    decks = DeviceManager().enumerate()
    if not decks:
        logging.error('No StreamDeck devices found!')
        exit(1)

    stream_deck = decks[0]
    stream_deck.open()

except Exception as e:
    logging.error(f"Failed to open connection to StreamDeck: {e}")
    exit(1)

try:
    stream_deck.reset()

# Set Images for Streamdeck
    for key in range(stream_deck.key_count()):
        image_path = os.path.join(ASSETS_PATH, f"button_{key + 1}.png")
        try:
            key_image = Image.open(image_path).convert("RGB")
            stream_deck.set_key_image(key, PILHelper.to_native_format(stream_deck, key_image))
        except FileNotFoundError:
            image_path = os.path.join(ASSETS_PATH, "temp_button_image.png")
            key_image = Image.open(image_path).convert("RGB")
            stream_deck.set_key_image(key, PILHelper.to_native_format(stream_deck, key_image))
        except Exception as e:
            logging.error(f"Failed to set image for key {key}: {e}")
except Exception as e:
    logging.error(f"Failed to interact with StreamDeck: {e}")


def get_message_for_device(key_count):
    return BUTTON_MESSAGES(key_count, f"No message defined for button {key_count}.")

def generate_json_message(deck, key):
    messages_for_device = BUTTON_MESSAGES(deck.KEY_COUNT)
    message = messages_for_device.get(key, "Unknown button")
    timestamp = datetime.now()
    timestamp = timestamp.isoformat(timespec='milliseconds') + 'Z'
    payload = {
        "Timestamp": timestamp,
        "Message": message,
        "id": str(uuid.uuid4())
    }
    return json.dumps(payload)

def construct_topic(device_type, user_name, button_id):
    topic =  f"MICD/{device_type}/{user_name}/Button{button_id}"
    print(topic)
    return topic

# what happens when a button is pressed on the stream deck
def on_key_event(deck, key, state):
    try:
        if state:
            message = generate_json_message(deck, key)
            logging.info(f"Key event detected- Key: {key}, State: {state}")
            logging.info(f"Publishing message to topic: {mqtt_topic}: {message}")
            myMQTTClient.publish(mqtt_topic, message, 1)
            logging.info(f"Message published succesfully")
    except Exception as e:
        logging.error(f"Failed to publish message: {e}")
        logging.error(traceback.format_exc())

stream_deck.set_key_callback(on_key_event)

def button_callback(topic, payload,):
    print("Received message from topic '{}': {}".format(topic, payload))

def publish_message(mqtt_topic, message):
    try:
        myMQTTClient.publish(mqtt_topic, message, 1)
    except Exception as e:
        logging.error(f"Failed to publish message: {e}")
        exit(1)
        print 

def subscribe_to_topic(topic):
    try:
        myMQTTClient.subscribe(mqtt_topic, 1, button_callback)
    except Exception as e:  
        logging.error(f"Failed to subscribe to topic {topic}: {e}")
        exit(1)


def on_disconnect_callback(client, userdata, rc):
    print("Disconnected from MQTT broker with result code {}".format(rc))

myMQTTClient.on_disconnect = on_disconnect_callback

if __name__ == "__main__":
    user_name = ""
    while not user_name:
        user_input = input("Please enter your name: ").strip()
        user_name = user_input.replace(" ", "")
        if not user_name:
            print("Name cannot be empty.")

  
    device_type = type(stream_deck).__name__
    mqtt_topic = construct_topic(device_type, user_name, '1')
    print(mqtt_topic)
    print(f"Constructed MQTT topic: {mqtt_topic}")

try:
    while True:
        time.sleep(1)  # Keep the script running to listen for key events
except KeyboardInterrupt:
    logging.info('Received keyboard interrupt. Cleaning up and exiting...')
    try:
        myMQTTClient.disconnect()
    except Exception as e:
        logging.error('keyboard interrupt. Cleanup and exit')
        try:
            stream_deck.reset()
            stream_deck.close()
            logging.info('Disconnected from Streamdeck')
        except Exception as e:
            logging.error(f"Failed to properly close StreamDeck {stream_deck}: {e}")
        logging.info('Cleanup complete, exiting...')
