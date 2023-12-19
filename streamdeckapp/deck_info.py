#!/usr/bin/env python3

import json
import os
from src.decks.DeviceManager import DeviceManager

# Function to retrieve the serial number of the first detected Stream Deck
def get_deck_serial_number():
    streamdecks = DeviceManager().enumerate()
    if not streamdecks:
        return None

    deck = streamdecks[0]
    deck.open()
    serial = deck.get_serial_number()
    deck.close()
    return serial

# Function to write teh serial number to the messages.json file
# #def save_serial_to_json(serial):
#     json_file_path = os.path.join(os.path.dirname(__file__), 'messages.json')

#     with open(json_file_path, 'r') as f:
#         data = json.load(f)

#     # create or overwrite the entry for the serial
#     if serial not in data:
#         data[serial]={}

#     with open(json_file_path, 'w')as f:
#         json.dump(data, f, indent=4)

# Prints diagnostic information about a given Stream Deck
def print_deck_info(index, deck):
    image_format = deck.key_image_format()

    flip_description = {
        (False, False): "not mirrored",
        (True, False): "mirrored horizontally",
        (False, True): "mirrored vertically",
        (True, True): "mirrored horizontally/vertically",
    }

    print("Deck {} - {}.".format(index, deck.deck_type()))
    print("\t - ID: {}".format(deck.id()))
    print("\t - Serial: '{}'".format(deck.get_serial_number()))
    print("\t - Firmware Version: '{}'".format(deck.get_firmware_version()))
    print("\t - Key Count: {} (in a {}x{} grid)".format(
        deck.key_count(),
        deck.key_layout()[0],
        deck.key_layout()[1]))
    if deck.is_visual():
        print("\t - Key Images: {}x{} pixels, {} format, rotated {} degrees, {}".format(
            image_format['size'][0],
            image_format['size'][1],
            image_format['format'],
            image_format['rotation'],
            flip_description[image_format['flip']]))
    else:
        print("\t - No Visual Output")


if __name__ == "__main__":
    streamdecks = DeviceManager().enumerate()

    print("Found {} Stream Deck(s).\n".format(len(streamdecks)))

    for index, deck in enumerate(streamdecks):
        deck.open()
        deck.reset()

        print_deck_info(index, deck)

        serial = deck.get_serial_number()
     

        deck.close()
