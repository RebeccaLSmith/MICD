#!/bin/bash

# Ensure the script stops on any errors
set -e

# Ensure system is up to date and upgrade all out-of-date packages
sudo apt update && sudo apt dist-upgrade -y

# Install necessary system packages
sudo apt install -y python3-pip python3-setuptools libudev-dev libusb-1.0-0-dev libhidapi-libusb0 libjpeg-dev zlib1g-dev libopenjp2-7 libtiff5

# Install python library dependencies
pip3 install wheel pillow AWSIoTPythonSDK

# Add udev rule to allow all users non-root access to Elgato StreamDeck devices
sudo cp 50-streamdeck.rules /etc/udev/rules.d/

# Reload udev rules to ensure the new permissions take effect
sudo udevadm control --reload-rules

# Install the latest version of the StreamDeck library via pip
pip3 install streamdeck

# Run the Python setup script
sudo python3 setup.py install

echo "Setup complete!"

