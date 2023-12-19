#!/usr/bin/env python3


# AWS IoT Configuration

HOST = "a1b4x0bevzfgbi-ats.iot.us-west-2.amazonaws.com"
ROOT_CA = "aws/certs/root-CA.crt"
PRIVATE_KEY = "aws/certs/private.key"
CERTIFICATE = "aws/certs/certificate.pem"
CLIENT_ID = "MICD_15"



# create policy document

# POLICY_DOCUMENT = "MICD_Policy" {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Action": [
#         "iot:Connect"
#       ],
#       "Resource": [
#         "*"
#       ],
#       "Condition": {
#         "Bool": {
#           "iot:Connection.Thing.IsAttached": [
#             "true"
#           ]
#         }
#       }
#     },
#     {
#       "Effect": "Allow",
#       "Action": [
#         "iot:Subscribe"
#       ],
#       "Resource": [
#         "arn:aws:iot:*:*:topicfilter/comm/${iot:Connection.Thing.ThingName}"
#       ]
#     },
#     {
#       "Effect": "Allow",
#       "Action": [
#         "iot:Receive",
#         "iot:Publish"
#       ],
#       "Resource": [
#         "arn:aws:iot:*:*:topic/comm/${iot:Connection.Thing.ThingName}"
#       ]
#     }
#   ]
# }


  




def BUTTON_MESSAGES(key_count):
    BUTTON_MESSAGES = {
        6: {
            0: "I am hungry",
            1: "I am thirsty",
            2: "I am cold",
            3: "I don't feel well",
            4: "I need to use the restroom",
            5: "I love you"
        },
        15: {    
            0: "I am hungry",
            1: "I am thirsty",
            2: "I am tired",
            3: "I am cold",
            4: "I am hot",
            5: "I don't feel well",
            6: "I need to use the restroom",
            7: "What time is it?",
            8: "I need medicine",
            9: "I love you",
            10: "I want to go outside",
            11: "Call my family",
            12: "Yes",
            13: "No",
            14: "I need to see a doctor"
        },
        3: {
            0: "I am hungry",
            1: "I am thirsty",
            2: "I love you"
        }
    }
    return BUTTON_MESSAGES.get(key_count, {})