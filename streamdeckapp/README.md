# Common Errors:

When connecting a new Stream Deck Device:
Error:
Failed to open connection to StreamDeck: Could not open HID device.

Fix:
unplug the stream deck
    sudo udevadm monitor
        Plug in the Stream Deck
    once it runs through its process crtl c and run main.py