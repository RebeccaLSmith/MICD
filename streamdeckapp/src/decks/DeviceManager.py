#         Python Stream Deck Library
#      Released under the MIT license
#

import logging

from .Devices.StreamDeckMini import StreamDeckMini
from .Devices.StreamDeckOriginal import StreamDeckOriginal
from .Devices.StreamDeckOriginalV2 import StreamDeckOriginalV2
from .Devices.StreamDeckXL import StreamDeckXL
from .Devices.StreamDeckPedal import StreamDeckPedal
from src.Transport.Dummy import Dummy
from src.Transport.LibUSBHIDAPI import LibUSBHIDAPI
from .ProductIDs import USBVendorIDs, USBProductIDs



class ProbeError(Exception):
    """
    Exception thrown when attempting to probe for attached StreamDecks,
    but no suitable valid transport was found.
    """

    pass


class DeviceManager:
    """
    Central device manager, to enumerate any attached StreamDeck devices. An
    instance of this class must be created in order to detect and use any
    StreamDeck devices.
    """

    USB_VID_ELGATO = 0x0fd9
    USB_PID_STREAMDECK_ORIGINAL = 0x0060
    USB_PID_STREAMDECK_ORIGINAL_V2 = 0x006d
    USB_PID_STREAMDECK_MINI = 0x0063
    USB_PID_STREAMDECK_XL = 0x006c
    USB_PID_STREAMDECK_MK2 = 0x0080
    USB_PID_STREAMDECK_PEDAL = 0x0086
 

    @staticmethod
    def _get_transport(transport):
        """
        Creates a new HID transport instance from the given transport back-end
        name. If no specific transport is supplied, an attempt to find an
        installed backend will be made.

        :param str transport: Name of a supported HID transport back-end to use, None to autoprobe.

        :rtype: Transport.* instance
        :return: Instance of a HID Transport class
        """

        transports = {
            "dummy": Dummy,
            "libusb": LibUSBHIDAPI,
        }

        if transport:
            transport_class = transports.get(transport)

            if transport_class is None:
                raise ProbeError("Unknown HID transport backend \"{}\".".format(transport))

            try:
                transport_class.probe()
                return transport_class()
            except Exception as transport_error:
                raise ProbeError("Probe failed on HID backend \"{}\".".format(transport), transport_error)
        else:
            probe_errors = {}

            for transport_name, transport_class in transports.items():
                if transport_name == "dummy":
                    continue

                try:
                    transport_class.probe()
                    return transport_class()
                except Exception as transport_error:
                    probe_errors[transport_name] = transport_error

            raise ProbeError("Probe failed to find any functional HID backend.", probe_errors)

    def __init__(self, transport=None):
            """
            Creates a new StreamDeck DeviceManager, used to detect attached StreamDeck devices.

            :param str transport: name of the the specific HID transport back-end to use, None to auto-probe.
            """
            self.transport = self._get_transport(transport)
            
    def detect_device(self):
        # Detect the connected StreamDeck device and set the 'deck' attribute.
        devices = self.enumerate()
        
        if not devices:
            return "Unknown"

        self.deck = devices[0]

        stream_deck_model = {
            StreamDeckMini.KEY_COUNT: "StreamDeckMini",
            StreamDeckOriginalV2.KEY_COUNT: "StreamDeckOriginalV2",
            StreamDeckPedal.KEY_COUNT: "StreamDeckPedal"
            # Can add additional models here
        }

        return stream_deck_model.get(self.deck.KEY_COUNT, "Unknown")

    def get_serial_number(self):
        if self.deck:
            return self.deck.get_serial_number()
        return None

    def enumerate(self):
        """
        Detect attached StreamDeck devices.

        :rtype: list(StreamDeck)
        :return: list of :class:`StreamDeck` instances, one for each detected device.
        """

        products = [
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_ORIGINAL, StreamDeckOriginal),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_ORIGINAL_V2, StreamDeckOriginalV2),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_MINI, StreamDeckMini),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_XL, StreamDeckXL),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_MK2, StreamDeckOriginalV2),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_PEDAL, StreamDeckPedal),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_MINI_MK2, StreamDeckMini),
            (USBVendorIDs.USB_VID_ELGATO, USBProductIDs.USB_PID_STREAMDECK_XL_V2, StreamDeckXL),
        ]

        streamdecks = list()

        for vid, pid, class_type in products:
            found_devices = self.transport.enumerate(vid=vid, pid=pid)
            streamdecks.extend([class_type(d) for d in found_devices])

        return streamdecks
