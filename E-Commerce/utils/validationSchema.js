var infoBipSimpleOmniMessage = {     
    "title": "infobipsimpleomnimessage",
    "type": "object",
    "properties": {
        "destinations": {
            "type": "array", 
            "items": {
                "type": "object",
                "minItems": 1,
                "properties": {
                    "to": {
                        "type": "object", 
                        "properties": {
                            "phoneNumber": {"type": "string"}
                        },
                        "required": ["phoneNumber"]
                    }
                },
                "required": ["to"]
            }
        },
        "text": {"type": "string"}
    },
    "required": ["destinations", "text"]
};

module.exports = {
    infoBipSimpleOmniMessage: infoBipSimpleOmniMessage
};