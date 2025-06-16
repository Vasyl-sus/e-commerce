var customerSchema1 = {     // 1 - new
    "title": "customer",
    "type": "object",
    "properties": {
      "email": { "type": "string", "format": "email" },
      "approved": { "type": "integer" },
      "rating": { "type": ["integer", "null", "string"] },
      "postcode": { "type": "string" },
      "address": { "type": "string" },
      "country": { "type": "string" },
      "city": { "type": "string" },
      "telephone": { "type": "string" },
      "last_name": { "type": "string" },
      "first_name": { "type": "string" },

      "shipping_email": { "type": ["string", "null"], "format": "email" },
      "shipping_postcode": { "type": "string" },
      "shipping_address": { "type": "string" },
      "shipping_country": { "type": "string" },
      "shipping_city": { "type": "string" },
      "shipping_telephone": { "type": ["string", "null"] },
      "shipping_last_name": { "type": "string" },
      "shipping_first_name": { "type": "string" },

      "birthdate": { "type": ["string","null"] }
    },
    "required": ["email","postcode","address","country","city","telephone",
                 "last_name","first_name"]
};

var customerSchema2 = {     // 2 - edit
    "title": "customer",
    "type": "object",
    "properties": {
      "email": { "type": "string", "format": "email" },
      "approved": { "type": "integer" },
      "rating": { "type": ["integer", "null", "string"] },
      "postcode": { "type": "string" },
      "address": { "type": "string" },
      "country": { "type": "string" },
      "city": { "type": "string" },
      "telephone": { "type": "string" },
      "last_name": { "type": "string" },
      "first_name": { "type": "string" },
      "shipping_email": { "type": ["string", "null"], "format": "email" },
      "shipping_postcode": { "type": "string" },
      "shipping_address": { "type": "string" },
      "shipping_country": { "type": "string" },
      "shipping_city": { "type": "string" },
      "shipping_telephone": { "type": ["string", "null"] },
      "shipping_last_name": { "type": "string" },
      "shipping_first_name": { "type": "string" },
      "birthdate": { "type": ["string","null"] },
      "comments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties":{
                "author": {"type": "string"},
                "content": {"type": "string"},
                "date_added": {"type": "string"}
            },
            "required": ["author", "content"]
          }
      },
      "badges": {
      "type": "array",
      "items": {
                    "type": "integer"
                }
      }
    },
    "additionalProperties":false
};

var customerSchema3 = {     // 1 - new mongo import
    "title": "customer",
    "type": "object",
    "properties": {
      "email": { "type": "string", "format": "email" },
      "approved": { "type": "integer" },
      "rating": { "type": "integer" },
      "postcode": { "type": "string" },
      "address": { "type": "string" },
      "country": { "type": "string" },
      "city": { "type": "string" },
      "telephone": { "type": "string" },
      "last_name": { "type": "string" },
      "first_name": { "type": "string" },
      "birthdate": { "type": ["string","null"] }
    },
    "required": ["email","postcode","address","country","city","telephone",
                 "last_name","first_name"]
};

var infoBipMessage = {
    "title": "infobipmessage",
    "type": "object",
    "properties": {
        "to": {
            "type": "array",
            "items": {
                "type": "string",
                "minItems": 1
            }
        },
        "text": {"type": "string"},
        "from": {"type": "string"},
    },
    "required": ["to", "text", "from"]
};

var infoBipOMNIScenario = {
    "title": "infobipomniscenario",
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "flow": {
            "type": "array",
            "items": {
                "type": "object",
                "minItems": 1,
                "properties": {
                    "from": {"type": "string"},
                    "channel": {"type": "string", "enum": ["SMS", "VOICE", "VIBER", "FACEBOOK", "EMAIL", "PUSH", "VK", "WHATSAPP"]}
                },
                "required": ["from", "channel"]
            }
        },
        "default": {"type": "boolean"},
    },
    "required": ["name", "flow", "default"]
};

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

var infoBipOmniMessage = {
    "title": "infobipomnimessage",
    "type": "object",
    "properties": {
        "bulkId": {"type": "string"},
        "scenarioKey": {"type": "string"},
        "destinations": {
            "type": "array",
            "items": {
                "type": "object",
                "minItems": 1,
                "properties": {
                    "to": {
                        "type": "object",
                        "properties": {
                            "phoneNumber": {"type": "string"},
                            "emailAddress": {"type": "string"}
                        }
                    }
                },
                "required": ["to"]
            }
        },
        "sms": {
            "type": "object",
            "properties": {
                "text": {"type": "string"}
            },
            "required": ["text"]
        },
        "whatsapp": {
            "type": "object",
            "properties": {
                "text": {"type": "string"}
            },
            "required": ["text"]
        },
        "viber": {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
                "imageURL": {"type": "string"},
                "buttonText": {"type": "string"},
                "buttonURL": {"type": "string"},
                "isPromotional": {"type": "boolean"},
                "validityPeriod": {"type": "integer"}
            },
            "required": ["text"],
        },
        "facebook": {
            "type": "object",
            "properties": {
                "text": {"type": "string"}
            },
            "required": ["text"]
        },
        "voice": {
            "type": "object",
            "properties": {
                "text": {"type": "string"}
            },
            "required": ["text"],
        },
        "email": {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
                "subject": {"type": "string"}
            },
            "required": ["text", "subject"]
        },
        "sendAt": {"type": "string"}
    },
    "required": ["destinations"],
    "additionalProperties":false
};

var influencerSchema1 = {
    "title": "influencer",
    "type": "object",
    "properties": {
        "first_name": { "type": "string" },
        "last_name": { "type": "string" },
        "address": { "type": "string" },
        "postcode": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" },
        "type": { "type": "string", "enum": ["ambasador", "influencer", "microinfluencer"]  },
        "nickname": { "type": ["string","null"] },
        "telephone": { "type": ["string", "null"] },
        "email": { "type": "string" },
        "facebook_url": { "type": ["string","null"] },
        "opomba": { "type": ["string","null"] },
        "instagram_url": { "type": ["string","null"] },
        "youtube_url": { "type": ["string","null"] },
        "webpage_url": { "type": ["string","null"] },
        "payment_type": { "type": "string", "enum": ["monthly", "onetime"] },
        "date_from": { "type": ["string","null"] },
        "state":{"type":"string","enum":["active","archived"]}
    },
    "required": ["email","postcode","address","country","city",
                 "last_name","first_name", "type", "payment_type","state"]
}

var influencerPaymentSchema1 = {
    "title": "influencer_payment",
    "type": "object",
    "properties": {
        "date_added": { "type": "string" },
        "price": { "type": "number" },
        "description": { "type": "string" }
    },
    "required": ["date_added","price","description"]
}

var influencerPaymentSchema2 = {
    "title": "influencer_payment",
    "type": "object",
    "properties": {
        "date_added": { "type": "string" },
        "price": { "type": "integer" },
        "description": { "type": "string" }
    },
    "additionalProperties":false
}

var influencerSchema2 = {
    "title": "influencer",
    "type": "object",
    "properties": {
        "first_name": { "type": "string" },
        "last_name": { "type": "string" },
        "address": { "type": "string" },
        "postcode": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" },
        "type": { "type": "string", "enum": ["ambasador", "influencer", "microinfluencer"]  },
        "nickname": { "type": ["string","null"] },
        "telephone": { "type": ["string", "null"] },
        "email": { "type": "string" },
        "facebook_url": { "type": ["string","null"] },
        "opomba": { "type": ["string","null"] },
        "instagram_url": { "type": ["string","null"] },
        "youtube_url": { "type": ["string","null"] },
        "webpage_url": { "type": ["string","null"] },
        "payment_type": { "type": "string", "enum": ["monthly", "onetime"] },
        "date_from": { "type": ["string","null"] },
        "state":{"type":"string","enum":["active","archived"]}
    },
    "additionalProperties":false
}

var discountSchema1 = {
    "title": "discount",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "dodatni_naziv": { "type": ["string", "null"] },
      "type": { "type": "string" },
      "active": { "type": "integer" },
      "utm_source": { "type": "string" },
      "utm_medium": { "type": "string" },
      "discount_type": { "type": ["string","null"] },
      "discount_value": { "type": ["number","null"] },
      "min_order_amount": { "type": ["number","null"] },
      "date_start": { "type": "string" },
      "date_end": { "type": "string" },
      "isOtomCoupon": { "type": "integer" },
      "comment": { "type": ["string","null"] },
      "therapies":{
        "type": "array",
        "items": {
                "type": "string"
                 }
       },
       "accessories":{
        "type": "array",
        "items": {
                "type": "string"
                 }
       },
      "countries":{
        "type": "array",
        "minItems": 1,
        "items": {
                "type": "string"
                 }
       },
       "free_therapies":{
         "type": "array",
         "items": {
                 "type": "string"
                  }
        },
        "free_accessories":{
          "type": "array",
          "items": {
                  "type": "string"
                   }
         }
    },
    "required": ["name", "type", "date_start", "date_end", "therapies", "accessories", "free_therapies", "free_accessories", "countries"]
};

var discountSchema2 = {
    "title": "discount",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "dodatni_naziv": { "type": ["string", "null"] },
      "type": { "type": "string" },
      "active": { "type": "integer" },
      "utm_source": { "type": ["string","null"] },
      "utm_medium": { "type": ["string","null"] },
      "discount_type": { "type": ["string","null"] },
      "discount_value": { "type": ["number","null"] },
      "min_order_amount": { "type": ["number","null"] },
      "date_start": { "type": ["string","null"] },
      "date_end": { "type": ["string","null"] },
      "isOtomCoupon": { "type": "integer" },
      "comment": { "type": ["string","null"] },
      "therapies":{
        "type": "array",
        "items": {
                  "type": "string"
                 }
       },
       "accessories":{
        "type": "array",
        "items": {
                "type": "string"
                 }
       },
      "countries":{
        "type": "array",
        "minItems": 1,
        "items": {
                  "type": "string"
                 }
       },
       "free_therapies":{
         "type": "array",
         "items": {
                 "type": "string"
                  }
        },
        "free_accessories":{
          "type": "array",
          "items": {
                  "type": "string"
                   }
         }
    },
    "additionalProperties":false
};

var productSchema1 = {
    "title": "product",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "category": { "type": "string" },
      "amount": { "type": "integer" },
      "translations": { "type": "array" },
      "sort_order": { "type": "integer" },
      "active": { "type": "integer" }
    },
    "required": ["name", "category", "amount", "sort_order"]
};

var productSchema2 = {
    "title": "product",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "category": { "type": "string" },
      "translations": { "type": "array" },
      "sort_order": { "type": "integer" },
      "active": { "type": "integer" }
    },
    "additionalProperties":false
};

var currencySchema1 = {
    "title": "currency",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "code": { "type": "string" },
      "symbol": { "type": "string" },
      "value": { "type": "number" }
    },
    "required": ["name","code","symbol","value"]
};

var currencySchema2 = {
    "title": "currency",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "code": { "type": "string" },
      "symbol": { "type": "string" },
      "value": { "type": "number" }
    },
    "additionalProperties":false
};

var paymentmethodSchema1 = {
    "title": "paymentmethod",
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "default_method": { "type": ["number", "string"] },
      "code": { "type": "string" },
      "active": { "type": "integer" },
      "countries": {
        "type": "array",
        "minItems":1,
        "items": {
                  "type": "string"
                 }
        },
        "translations": { "type": ["string","null"] },
        "is_other": {"type": ["integer", "string"]}
    },
    "required": ["title","code","active","countries","translations","is_other", "default_method"]
};

var paymentmethodSchema2 = {
    "title": "paymentmethod",
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "default_method": { "type": ["number", "string"] },
      "code": { "type": "string" },
      "active": { "type": "integer" },
      "countries": {
        "type": "array",
        "minItems":1,
        "items": {
                  "type": "string"
                 }
       },
      "translations": { "type": ["string","null"] },
      "is_other": {"type": ["integer", "string"]}
    },
    "additionalProperties":false
};

var deliverymethodSchema1 = {
    "title": "deliverymethod",
    "type": "object",
    "properties": {
      "to_price": { "type": "number" },
      "default_method": { "type": ["number", "string"] },
      "price": { "type": "number" },
      "active": { "type": "integer" },
      "email": { "type": "string", "format": "email" },
      "telephone": { "type": "string" },
      "code": { "type": "string" },
      "country": { "type": "string" },
      "is_other": { "type": "string" },
      "therapies": {
          "type": "array",
          "items": {
              "type": "string"
          }
      },
      "translations": { "type": ["string","null"] }
    },
    "required": ["to_price", "price", "country","code","translations", "default_method"]
};

var deliverymethodSchema2 = {
    "title": "deliverymethod",
    "type": "object",
    "properties": {
      "to_price": { "type": "number" },
      "default_method": { "type": ["number", "string"] },
      "price": { "type": "number" },
      "active": { "type": "integer" },
      "email": { "type": ["string","null"], "format": "email" },
      "telephone": { "type": ["string","null"] },
      "code": { "type": "string" },
      "country": { "type": "string" },
      "is_other": { "type": "string" },
      "therapies": {
        "type": "array",
        "items": {
            "type": "string"
        }
      },
      "translations": { "type": ["string","null"] }
    },
    "additionalProperties":false
};

var smstemplateSchema1 = {
    "title": "smstemplate",
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "text": { "type": "string" },
      "country": { "type": "string" }
    },
    "required": ["title","text","country"]
};

var smstemplateSchema2 = {
    "title": "smstemplate",
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "text": { "type": "string" },
      "country": { "type": "string" }
    },
    "additionalProperties":false
};

var orderstatusSchema1 = {
    "title": "orderstatus",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "color": { "type": "string" },
      "hidden": { "type": ["number", "string"] },
      "next_statuses": {
        "type": "array",
        "items": {
                  "type": "string"
                 }
       },
       "sort_order": {"type": "integer"},
       "translations":{"type": "string"}
    },
    "required": ["name","color","next_statuses", "sort_order","translations"]
};

var orderstatusSchema2 = {
    "title": "orderstatus",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "hidden": { "type": ["number", "string"] },
      "color": { "type": "string" },
      "next_statuses": {
        "type": "array",
        "items": {
                  "type": "string"
                 }
       },
       "sort_order": {"type": "integer"},
       "new_sort_order": {"type": "integer"},
       "translations":{"type": "string"}
    },
    "additionalProperties":false
};

var utmmediumSchema = {
    "title": "utmmedium",
    "type": "object",
    "properties": {
      "name": { "type": "string" }
    },
    "additionalProperties":false,
    "required": ["name"]
};

var categorySchema = {
    "title": "category",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "sef_link": {"type": "string"},
      "lang": {"type": "string"},
      "meta_title": { "type": ["string", "null"] },
      "meta_description": { "type": ["string", "null"] }
    },
    "additionalProperties":false,
    "required": ["name"]
};


var categorySchema1 = {
    "title": "category",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "sort_order": { "type": "integer" },
      "css_class_name": { "type": "string" },
      "translations": {
          "type": "array",
          "items": {
              "type":"object",
              "properties":{
                  "lang": {"type":"string"},
                  "display_name": {"type":"string"},
                  "link_name": {"type":"string"},
                  "description": {"type":"string"},
                  "display_name_wrap": {"type":"string"}
              },
              "required":["lang","display_name","link_name","description"]
            }
        }
    },
    "required": ["name","sort_order","css_class_name","translations"]
};


var categorySchema2 = {
    "title": "category",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "sort_order": { "type": "integer" },
      "css_class_name": { "type": "string" },
      "translations": {
          "type": "array",
          "items": {
              "type":"object",
              "properties":{
                  "lang": {"type":"string"},
                  "display_name": {"type":"string"},
                  "link_name": {"type":"string"},
                  "description": {"type":"string"},
                  "display_name_wrap": {"type":"string"}
              },
              "required":["lang","display_name","link_name","description"]
            }
        }
    },
    "additionalProperties":false
};


var admingroupSchema1 = {
    "title": "admingroup",
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "name": { "type": "string" },
      "permissions": {
        "type": "array",
        "minItems": 0,
        "items": {
            "type": "object",
            "properties": {
                "route": { "type": "string" },
                "method": { "type": "string" },
                "category": { "type": "string" }
                }
            },
            "required":["route","method"]
        }
    },
    "required": ["name","permissions"]
};

var admingroupSchema2 = {
    "title": "admingroup",
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "name": { "type": "string" },
      "permissions": {
        "type": "array",
        "minItems": 0,
        "items": {
            "type": "object",
            "properties": {
                "route": { "type": "string" },
                "method": { "type": "string" }
                }
            },
            "required":["route","method"]
        }
    },
    "additionalProperties":false
};

var adminSchema1 = {
    "title": "admin",
    "type": "object",
    "properties": {
        "id" :{ "type": "integer" },
        "username": { "type": "string" },
        "password": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "userGroupId": { "type": "string" },
        "last_name": { "type": "string" },
        "first_name": { "type": "string" },
        "vcc_username": { "type": "string" },
        "countries": {
            "type": "array",
            "minItems":1,
            "items": {
                      "type": "string"
                     }
        },
        "call_countries": {
            "type": "array",
            "items": {
                      "type": "string"
                     }
        }
    },
    "required":["username","password","email","userGroupId","last_name","first_name", "countries"]
};

var adminSchema2 = {
    "title": "admin",
    "type": "object",
    "properties": {
        "id" :{ "type": "integer" },
        "username": { "type": "string" },
        "password": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "userGroupId": { "type": "string" },
        "last_name": { "type": "string" },
        "first_name": { "type": "string" },
        "vcc_username": { "type": ["string", "null"] },
        "countries": {
            "type": "array",
            "minItems":1,
            "items": {
                      "type": "string"
                     }
        },
        "call_countries": {
            "type": "array",
            "items": {
                      "type": "string"
                     }
        }
    },
    "additionalProperties": false
};

var therapySchema1 = {
    "title": "therapy",
    "type": "object",
    "properties": {
        "id" :{ "type": "integer" },
        "name": { "type": "string" },
        "active" :{ "type": "integer" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "category": { "type": "string" },
        "seo_link": { "type": "string" },
        "view_label": { "type": "string" },
        "total_price": { "type": "number" },
        "inflated_price": { "type": "number" },
        "meta_title": { "type": "string" },
        "meta_description": { "type": "string" },
        "title_color": { "type": "string" },
        "products": {
            "type":"array",
            "minItems": 1,
            "items":{
                "type":"object",
                "properties":{
                    "id": { "type": "string" },
                    "product_quantity": { "type": "integer" }
                },
                "required": ["id", "product_quantity"]
            }
        },
        "percent": { "type": ["string","null"] },
        "bonus": { "type": ["string","null"] },
        "second_bonus": { "type": ["string","null"] },
        "therapy_name": { "type": ["string","null"] },
        "box_title": { "type": ["string","null"] },
        "box_subtitle": { "type": ["string","null"] },
        "inflated_price_label": { "type": ["string","null"]}
    },
    "required":["name","country", "language","category","total_price", "inflated_price","products"]
};

var therapySchema2 = {
    "title": "therapy",
    "type": "object",
    "properties": {
        "id" :{ "type": "integer" },
        "name": { "type": "string" },
        "active" :{ "type": "integer" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "category": { "type": "string" },
        "seo_link": { "type": ["string","null"] },
        "view_label": { "type": ["string","null"] },
        "total_price": { "type": "number" },
        "inflated_price": { "type": "number" },
        "meta_title": { "type": ["string","null"] },
        "meta_description": { "type": ["string","null"] },
        "title_color": { "type": "string" },
        "products": {
            "type":"array",
            "minItems": 1,
            "items":{
                "type":"object",
                "properties":{
                    "id": { "type": "string" },
                    "product_quantity": { "type": "integer" }
                },
                "required": ["id", "product_quantity"]
            }
        },
        "percent": { "type": ["string","null"] },
        "bonus": { "type": ["string","null"] },
        "second_bonus": { "type": ["string","null"] },
        "therapy_name": { "type": ["string","null"] },
        "box_title": { "type": ["string","null"] },
        "box_subtitle": { "type": ["string","null"] },
        "inflated_price_label": { "type": ["string","null"] }
    },
    "additionalProperties":false
};

var blogpostSchema1 = {
    "title": "blogpost",
    "type": "object",
    "properties": {
        "title": { "type": "string" },
        "content": { "type": "string" },
        "short_content": { "type": "string" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "url": { "type": ["string","null"] },
        "meta_description": { "type": ["string","null"] },
        "seo_link": { "type": ["string","null"] },
        "starred": { "type": "integer" },
        "slider": { "type": "integer" },
        "categories": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "therapies": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "accessories": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "tags": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["title", "content", "short_content", "country", "language", "categories"]
};

var blogpostSchema2 = {
    "title": "blogpost",
    "type": "object",
    "properties": {
        "title": { "type": "string" },
        "content": { "type": "string" },
        "short_content": { "type": "string" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "url": { "type": ["string","null"] },
        "meta_description": { "type": ["string","null"] },
        "seo_link": { "type": ["string","null"] },
        "starred": { "type": "integer" },
        "slider": { "type": "integer" },
        "linked_posts": { "type": "array" },
        "categories": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "tags": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "therapies": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
        "accessories": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string"
            }
        },
    },
    "additionalProperties":false
};

var testimonialSchema1 = {
    "title": "testimonial",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "full_name": { "type": "string" },
        "profession": { "type": "string" },
        "category": { "type": "string" },
        "country": { "type": "string" },
        "gender": { "type": "string" },
        "sort_order": { "type": "integer" },
        "language": { "type": "string" },
        "content": { "type": "string" },
        "favourite": { "type": "string" },
        "facebook_link": { "type": "string" },
        "instagram_link": { "type": "string" },
        "url": { "type": "string" },
        "therapies": { "type": "array" },
        "show_home": { "type": ["string", "integer"] }
    },
    "required": ["full_name", "profession", "category" ,"country", "language", "gender", "sort_order", "content","url"]
};

var testimonialSchema2 = {
    "title": "testimonial",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "full_name": { "type": "string" },
        "profession": { "type": "string" },
        "category": { "type": "string" },
        "country": { "type": "string" },
        "gender": { "type": "string" },
        "sort_order": { "type": "integer" },
        "language": { "type": "string" },
        "content": { "type": "string" },
        "favourite": { "type": "string" },
        "facebook_link": { "type": "string" },
        "instagram_link": { "type": "string" },
        "url": { "type": "string" },
        "therapies": { "type": "array" },
        "show_home": { "type": ["string", "integer"] }
    },
    "additionalProperties":false
};

var userTestimonialSchema1 = {
    "title": "userTestimonial",
    "type": "object",
    "properties": {
        "user_name": { "type": "string" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "text": { "type": "string" },
        "category": { "type": "string" },
        "sort_number": { "type": "integer" },
        "rating": { "type": "integer" },
    },
    "required": ["user_name", "category", "country", "lang", "rating"]
};

var userTestimonialSchema2 = {
    "title": "userTestimonial",
    "type": "object",
    "properties": {
        "user_name": { "type": "string" },
        "country": { "type": "string" },
        "category": { "type": "string" },
        "lang": { "type": "string" },
        "text": { "type": "string" },
        "sort_number": { "type": "integer" },
        "rating": { "type": "integer" },
    },
    "required": []
};

var mediumSchema1 = {
    "title": "medium",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "name": { "type": "string" },
        "language": { "type": "string" },
        "country": { "type": "string" },
        "sort_order": { "type": "string" }
    },
    "required": ["name", "language", "country", "sort_order"]
};

var mediumSchema2 = {
    "title": "medium",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "name": { "type": "string" },
        "language": { "type": "string" },
        "country": { "type": "string" },
        "sort_order": { "type": "string" }
    },
    "additionalProperties":false
};

var stockchangeSchema = {
    "title": "stockchange",
    "type": "object",
    "properties": {
        "product_id": { "type": "string" },
        "product_name": { "type": "string" },
        "admin_id": { "type": "string" },
        "admin_full_name": { "type": "string" },
        "value": { "type": "integer" },
        "comment": { "type": ["string","null"] }
    },
    "additionalProperties":false,
    "required": ["product_id", "product_name", "admin_id", "admin_full_name", "value"]
};

var stockreminderSchema1 = {
    "title": "stockreminder",
    "type": "object",
    "properties": {
        "product_id": { "type": "string" },
        "critical_value": { "type": "integer" },
        "emails": {
            "type": "array",
            "minItems": 1,
            "items": {
                        "type": "string", "format": "email"
                        }
        }
    },
    "required": ["product_id", "critical_value", "emails"]
};

var stockreminderSchema2 = {
    "title": "stockreminder",
    "type": "object",
    "properties": {
        "product_id": { "type": "string" },
        "critical_value": { "type": "integer" },
        "emails": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string", "format": "email"
                    }
        }
    },
    "additionalProperties":false
};

var orderSchema1 = {
    "title": "order",
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "order_type": { "type": "string" },
        "order_status": { "type": "string" },
        "finished": { "type": "integer" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "currency_code": { "type": "string" },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "delivery_method_id": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "shipping_postcode": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_country": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_telephone": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },

        "payment_postcode": { "type": "string" },
        "payment_address": { "type": "string" },
        "payment_country": { "type": "string" },
        "payment_city": { "type": "string" },
        "payment_telephone": { "type": "string" },
        "payment_email": { "type": "string", "format": "email" },
        "payment_last_name": { "type": "string" },
        "payment_first_name": { "type": "string" },

        "alt_shipping_first_name": { "type": "string" },
        "alt_shipping_last_name": { "type": "string" },
        "alt_shipping_address": { "type": "string" },
        "alt_shipping_city": { "type": "string" },
        "alt_shipping_postcode": { "type": "string" },
        "customer_id": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "responsible_agent_id": { "type": "string" },
        "responsible_agent_username": { "type": "string" },
        "date_added": { "type": "string" },
        "date_modified": { "type": "string" },
        "date_delivered": { "type": "string" },
        "utm_medium": { "type": ["string","null"] },
        "utm_source": { "type": ["string","null"] },
        "utm_campaign": { "type": ["string","null"] },
        "utm_content": { "type": ["string","null"] },
        "description": { "type": ["string","null"] },
        "tracking_code": { "type": ["string","null"] },
        "discount_id": { "type": "string" },
        "additional_discount": {"type": "number"},
        "additional_discount_id": { "type": ["string","null"] },
        "additional_discount_data": {
            "type": "object",
            "properties":{
                "type": { "type": "string" },
                "discount_type": { "type": "string" },
                "discount_value": { "type": "number" },
                "comment": { "type": "string" },
                "therapies": {
                    "type": "array",
                    "items": { "type":"string" }
                },
                "accessories": {
                    "type": "array",
                    "items": { "type":"string" }
                }
            }
        },
        "emails": {
            "type": "array",
            "items": {
                        "type": "string", "format": "email"
                        }
            },
        "therapies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "accessories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "comments": {
            "type": "array",
            "items": {
                        "type": "object",
                        "properties":{
                                    "author": { "type": "string" },
                                    "content": { "type": "string" }
                        },
                        "required":["author","content"]
                        }
            },
        "gifts": {
            "type": "array",
            "items": {
                    "type": "object",
                    "properties":{
                                "gift_id": { "type": "integer" },
                                "gift_size": { "type": ["string","null"] }
                    },
                    "required":["gift_id"]
                    }
            }
    },
    "anyOf":[
        {"properties": {"therapies":{"minItems":1}}},
        {"properties": {"accessories":{"minItems":1}}}
    ],
    "required": [
        "lang",
        "currency_symbol",
        "currency_value",
        "currency_code",
        "payment_method_id",
        "payment_method_code",
        "delivery_method_id",
        "delivery_method_code",
        "delivery_method_price",
        "delivery_method_to_price",
        "shipping_postcode",
        "shipping_address",
        "shipping_country",
        "shipping_city",
        "shipping_telephone",
        "shipping_email",
        "shipping_last_name",
        "shipping_first_name",

        "payment_postcode",
        "payment_address",
        "payment_country",
        "payment_city",
        "payment_telephone",
        "payment_email",
        "payment_last_name",
        "payment_first_name",

        "customer_id",
        "subtotal",
        "shipping_fee",
        "total",
        "order_type"
    ]
};

var orderInfluencersSchema = {
    "title": "order",
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "order_type": { "type": "string" },
        "order_status": { "type": "string" },
        "finished": { "type": "integer" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "currency_code": { "type": "string" },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "delivery_method_id": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "shipping_postcode": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_country": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_telephone": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },

        "alt_shipping_first_name": { "type": "string" },
        "alt_shipping_last_name": { "type": "string" },
        "alt_shipping_address": { "type": "string" },
        "alt_shipping_city": { "type": "string" },
        "alt_shipping_postcode": { "type": "string" },
        "customer_id": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "responsible_agent_id": { "type": "string" },
        "responsible_agent_username": { "type": "string" },
        "date_added": { "type": "string" },
        "date_modified": { "type": "string" },
        "date_delivered": { "type": "string" },
        "utm_medium": { "type": ["string","null"] },
        "utm_source": { "type": ["string","null"] },
        "utm_campaign": { "type": ["string","null"] },
        "utm_content": { "type": ["string","null"] },
        "description": { "type": ["string","null"] },
        "tracking_code": { "type": ["string","null"] },
        "discount_id": { "type": "string" },
        "additional_discount": {"type": "number"},
        "additional_discount_id": { "type": ["string","null"] },
        "additional_discount_data": {
            "type": "object",
            "properties":{
                "type": { "type": "string" },
                "discount_type": { "type": "string" },
                "discount_value": { "type": "number" },
                "comment": { "type": "string" },
                "therapies": {
                    "type": "array",
                    "items": { "type":"string" }
                },
                "accessories": {
                    "type": "array",
                    "items": { "type":"string" }
                }
            }
        },
        "emails": {
            "type": "array",
            "items": {
                        "type": "string", "format": "email"
                        }
            },
        "therapies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "accessories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "comments": {
            "type": "array",
            "items": {
                        "type": "object",
                        "properties":{
                                    "author": { "type": "string" },
                                    "content": { "type": "string" }
                        },
                        "required":["author","content"]
                        }
            },
        "gifts": {
            "type": "array",
            "items": {
                    "type": "object",
                    "properties":{
                                "gift_id": { "type": "integer" },
                                "gift_size": { "type": ["string","null"] }
                    },
                    "required":["gift_id"]
                    }
            }
    },
    "anyOf":[
        {"properties": {"therapies":{"minItems":1}}},
        {"properties": {"accessories":{"minItems":1}}}
    ],
    "required": [
        "lang",
        "currency_symbol",
        "currency_value",
        "currency_code",
        "payment_method_id",
        "payment_method_code",
        "delivery_method_id",
        "delivery_method_code",
        "delivery_method_price",
        "delivery_method_to_price",
        "shipping_postcode",
        "shipping_address",
        "shipping_country",
        "shipping_city",
        "shipping_telephone",
        "shipping_email",
        "shipping_last_name",
        "shipping_first_name",
        "customer_id",
        "subtotal",
        "shipping_fee",
        "total",
        "order_type"
    ]
};

var orderSchema2 = {
    "title": "order",
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "order_status": { "type": "string" },
        "finished": { "type": "integer" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "currency_code": { "type": "string" },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "payment_method_name": { "type": "string" },
        "delivery_method_id": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "shipping_postcode": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_country": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_telephone": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },
        "payment_postcode": { "type": "string" },
        "payment_address": { "type": "string" },
        "payment_country": { "type": "string" },
        "payment_city": { "type": "string" },
        "payment_telephone": { "type": "string" },
        "payment_email": { "type": "string", "format": "email" },
        "payment_last_name": { "type": "string" },
        "payment_first_name": { "type": "string" },
        "alt_shipping_first_name": { "type": ["string","null"] },
        "alt_shipping_last_name": { "type": ["string","null"] },
        "alt_shipping_address": { "type": ["string","null"] },
        "alt_shipping_city": { "type": ["string","null"] },
        "alt_shipping_postcode": { "type": ["string","null"] },
        "customer_id": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "date_added": { "type": "string" },
        "date_modified": { "type": ["string","null"] },
        "description": { "type": ["string","null"] },
        "tracking_code": { "type": ["string","null"] },
        "date_delivered": { "type": ["string","null"] },
        "date_naknadno": { "type": ["string","null"] },
        "utm_medium": { "type": ["string","null"] },
        "utm_source": { "type": ["string","null"] },
        "utm_campaign": { "type": ["string","null"] },
        "utm_content": { "type": ["string","null"] },
        "discount_id": { "type": ["string","null"] },
        "order_color_id": { "type": ["string","null"] },
        "order_color_value": { "type": ["string","null"] },
        "order_type": { "type": "string" },
        "additional_discount": {"type": "number"},
        "additional_discount_id": { "type": ["string","null"] },
        "storno_status": { "type": "string" },
        "declined_order_status": { "type": "string" },
        "additional_discount_data": {
            "type": ["object","null"],
            "properties":{
                "type": { "type": "string" },
                "discount_type": { "type": "string" },
                "discount_value": { "type": "number" },
                "comment": { "type": "string" },
                "therapies": {
                    "type": "array",
                    "items": { "type":"string" }
                },
                "accessories": {
                    "type": "array",
                    "items": { "type":"string" }
                }
            }
        },
        "emails": {
            "type": "array",
            "items": {
                "type": "string", "format": "email"
            }
        },
        "therapies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "accessories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "delete_free_accessories": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "delete_free_therapies": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "comments": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                            "author": { "type": "string" },
                            "content": { "type": "string" }
                },
                "required":["author","content"]
                }
        },
        "gifts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                            "gift_id": { "type": "integer" },
                            "gift_size": { "type": ["string","null"] }
                },
                "required":["gift_id"]
                }
        },
        "badges": {
            "type": "array",
            "items": {
                        "type": "integer"
                    }
            }
    },
    "additionalProperties":false
};

var orderSchema3 = {
    "title": "order",
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "order_type": { "type": "string" },
        "order_status": { "type": "string" },
        "finished": { "type": "integer" },
        "lang": { "type": "string" },
        "ip": { "type": ["string","null"] },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "currency_code": { "type": "string" },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "payment_method_name": { "type": "string" },
        //"delivery_method_id": { },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "shipping_postcode": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_country": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_telephone": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },
        "alt_shipping_first_name": { "type": "string" },
        "alt_shipping_last_name": { "type": "string" },
        "alt_shipping_address": { "type": "string" },
        "alt_shipping_city": { "type": "string" },
        "alt_shipping_postcode": { "type": "string" },
        "customer_id": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "responsible_agent_id": { "type": ["string","null"] },
        "responsible_agent_username": { "type": ["string","null"] },
        "date_added": { "type": "string" },
        "date_modified": { "type": ["string","null"] },
        "date_delivered": { "type": ["string","null"] },
        "utm_medium": { "type": ["string","null"] },
        "utm_source": { "type": ["string","null"] },
        "utm_campaign": { "type": ["string","null"] },
        "utm_content": { "type": ["string","null"] },
        "tracking_code": { "type": ["string","null"] },
        "description": { "type": ["string","null"] },
        "discount_id": { "type": ["string","null"] },
        "additional_discount": {"type": "number"},
        "additional_discount_id": { "type": ["string","null"] },
        "additional_discount_data": {
            "type": "object",
            "properties":{
                "type": { "type": "string" },
                "discount_type": { "type": "string" },
                "discount_value": { "type": "number" },
                "comment": { "type": "string" },
                "therapies": {
                    "type": "array",
                    "items": { "type":"string" }
                },
                "accessories": {
                    "type": "array",
                    "items": { "type":"string" }
                }
            }
        },
        "emails": {
            "type": "array",
            "items": {
                        "type": "string", "format": "email"
                        }
            },
        "therapies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "accessories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","quantity"]
            }
        },
        "comments": {
            "type": "array",
            "items": {
                        "type": "object",
                        "properties":{
                                    "author": { "type": "string" },
                                    "comment": { "type": "string" }
                        },
                        "required":["author","comment"]
                        }
            },
        "gifts": {
            "type": "array",
            "items": {
                    "type": "object",
                    "properties":{
                                "gift_id": { "type": "integer" },
                                "gift_size": { "type": ["string","null"] }
                    },
                    "required":["gift_id"]
                    }
            }
    },
    "anyOf":[
        {"properties": {"accessories":{"minItems":0}}},
        {"properties": {"therapies":{"minItems":0}}}

    ],
    "required": [
        "lang",
        "currency_symbol",
        "currency_value",
        "currency_code",
        "payment_method_id",
        "payment_method_code",
        //"delivery_method_id",
        "delivery_method_code",
        "delivery_method_price",
        "delivery_method_to_price",
        "shipping_postcode",
        "shipping_address",
        "shipping_country",
        "shipping_city",
        "shipping_telephone",
        "shipping_email",
        "shipping_last_name",
        "shipping_first_name",
        "customer_id",
        "subtotal",
        "shipping_fee",
        "total",
        "order_type",
        "therapies",
        "accessories"
    ]
};

var landingSchema = {
    "title": "landing",
    "type": "object",
    "properties": {
        "filename" :{ "type": "string" },
        "html": { "type": "string" },
        "css": { "type": "string" }
    },
    "required":["filename","html", "css"]
};

var colorSchema = {
    "title": "color",
    "type": "object",
    "properties": {
        "description" :{ "type": "string" },
        "value": { "type": "string" }
    },
    "required":["description","value"]
}

var countrySchema1 = {
    "title": "country",
    "type": "object",
    "properties": {
        "name" :{ "type": "string" },
        "full_name": { "type": "string" },
        "currency": { "type": "string" },
        "ddv": { "type":"number"},
        "country_number": { "type": "string" },
        "send_reminders": {"type": "integer"}
    },
    "required":["name","full_name","currency","ddv","country_number"]
}

var countrySchema2 = {
    "title": "country",
    "type": "object",
    "properties": {
        "name" :{ "type": "string" },
        "full_name": { "type": "string" },
        "currency": { "type": "string" },
        "ddv": { "type":"number"},
        "country_number": { "type": "string" },
        "send_reminders": {"type": "integer"}
    },
    "additionalProperties":false
}

var changeStatusSchema = {
    "title": "changeStatus",
    "type": "object",
    "properties": {
        "ids" :{
            "type": "array",
            "items": { "type":"string" }
        },
        "new_status": { "type": "string" }
    },
    "required":["ids","new_status"]
}

var setOrdersAgentSchema = {
    "title": "setOrdersAgent",
    "type": "object",
    "properties": {
        "admin_id" :{ "type": "string" },
        "order_ids": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" }
        }
    },
    "required": ["admin_id", "order_ids"]
};

var setOrdersColorSchema = {
    "title": "setOrdersColor",
    "type": "object",
    "properties": {
        "color_id" :{ "type": "integer" },
        "color_value" :{ "type": "string" },
        "order_ids": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" }
        }
    },
    "required": ["color_id", "color_value", "order_ids"]
};

var pharmacySchema1 = {
    "title": "pharmacy",
    "type": "object",
    "properties": {
        "name" :{ "type": "string" },
        "address": { "type": "string" },
        "postcode": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" },
        "latitude": { "type": "number" },
        "longitude": { "type": "number" },
        "telephone": { "type": "string" },
        "link": { "type": "string" }
    },
    "required":["name", "address", "postcode", "city","country","latitude","longitude"]
};

var pharmacySchema2 = {
    "title": "pharmacy",
    "type": "object",
    "properties": {
        "name" :{ "type": "string" },
        "address": { "type": "string" },
        "postcode": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" },
        "latitude": { "type": "number" },
        "longitude": { "type": "number" },
        "telephone": { "type": ["string","null"] },
        "link": { "type": ["string","null"] }
    },
    "additionalProperties":false
};

var stickynoteSchema1 = {
    "title": "stickynote",
    "type": "object",
    "properties": {
        "active" :{ "type": "integer" },
        "content": { "type": "string" },
        "link": { "type": "string" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "button_text": { "type": "string" },
        "from_date": {"type": "string"},
        "to_date": {"type": "string"},
        "has_button": {"type": "integer"}
    },
    "required":["active", "content", "link", "country", "button_text", "to_date", "has_button"]
};

var stickynoteSchema2 = {
    "title": "stickynote",
    "type": "object",
    "properties": {
        "active" :{ "type": "integer" },
        "content": { "type": "string" },
        "link": { "type": "string" },
        "country": { "type": "string" },
        "language": { "type": "string" },
        "button_text": { "type": "string" },
        "from_date": {"type": "string"},
        "to_date": {"type": "string"},
        "has_button": {"type": "integer"}
    },
    "additionalProperties": false
};

var expenseSchema1 = {
    "title": "expense",
    "type": "object",
    "properties": {
        "category": { "type":"string" },
        "name": { "type":"string" },
        "active": {"type": "integer"},
        "expense_type": { "type":"string" },
        "billing_type": { "type":"string" },
        "billing_period": { "type":"string" },
        "value": { "type":"number" },
        "additional_fields": { "type":"string" },
        "products": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        },
        "gifts": {
            "type":"array",
            "minItems": 1,
            "items":{
                "type":"integer"
            }
        },
        "deliverymethods": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        },
        "accessories": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        }
    },
    "required":["category", "name", "expense_type"]
}

var expenseSchema2 = {
    "title": "expense",
    "type": "object",
    "properties": {
        "category": { "type":"string" },
        "name": { "type":"string" },
        "active": {"type": "integer"},
        "expense_type": { "type":"string" },
        "billing_type": { "type": ["string","null"] },
        "billing_period": { "type": ["string","null"] },
        "value": { "type": ["number","null"] },
        "additional_fields": { "type":"string" },
        "products": {
            "type":"array",
            "minItems": 1,
            "items":{
                "type":"string"
            }
        },
        "gifts": {
            "type":"array",
            "minItems": 1,
            "items":{
                "type":"integer"
            }
        },
        "deliverymethods": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        },
        "accessories": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        }
    },
    "additionalProperties": false
}

var expenseExtendedSchema1 = {
    "title": "expense_extended",
    "type": "object",
    "properties": {
        "expense_id": { "type":"string" },
        "date_added": { "type":"string" },
        "additional_data": { "type":"object" },
        "expense_value": { "type":"number" },
        "countries": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        }
    },
    "required":["expense_id", "date_added", "additional_data", "expense_value", "countries"]
}

var expenseExtendedSchema2 = {
    "title": "expense_extended",
    "type": "object",
    "properties": {
        "expense_id": { "type":"string" },
        "date_added": { "type":"string" },
        "additional_data": { "type":"object" },
        "expense_value": { "type":"number" },
        "countries": {
            "type":"array",
            "minItems":1,
            "items":{
                "type":"string"
            }
        }
    },
    "additionalProperties": false
}

var expenseReportSchema = {
    "title": "expense_report",
    "type": "object",
    "properties": {
        "type": {"type":"string"},
        "inputDate":{"type": "string"},
        "countries": {
            "type": ["array", "string"],
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "orderStatuses": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["type","inputDate","countries","orderStatuses"]
}

var incomeReportSchema = {
    "title": "expense_report",
    "type": "object",
    "properties": {
        "type": {"type":"string"},
        "inputDate":{"type": "string"},
        "countries": {
            "type": ["array", "string"],
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "orderStatuses": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["type","inputDate","countries","orderStatuses"]
}

var giftSchema1 = {
    "title": "gift",
    "type": "object",
    "properties": {
        "name": {"type":"string"},
        "display_name": {"type":"string"},
        "active":{"type": "integer"},
        "country": {"type":"string"},
        "lang": {"type":"string"},
    },
    "required": ["name", "display_name", "active", "country", "lang"]
}

var giftSchema2 = {
    "title": "gift",
    "type": "object",
    "properties": {
        "name": {"type":"string"},
        "display_name": {"type":"string"},
        "active":{"type": "integer"},
        "country": {"type":"string"},
        "lang": {"type":"string"},
    },
    "additionalProperties": false
}

var giftConfigSchema1 = {
    "title": "giftConfig",
    "type": "object",
    "properties": {
        "country": {"type":"string"},
        "price": {"type":["integer", "null"]},
        "num_therapies": {"type":["integer", "null"]},
        "count":{"type": "integer"}
    },
    "required": ["country", "count"]
}

var giftConfigSchema2 = {
    "title": "giftConfig",
    "type": "object",
    "properties": {
        "country": {"type":"string"},
        "price": {"type":["integer", "null"]},
        "num_therapies": {"type":["integer", "null"]},
        "count":{"type": "integer"}
    },
    "additionalProperties": false
}
var reviewSchema = {
    "title": "review",
    "type": "object",
    "properties": {
        "review": {"type":"string"},
        "grade": {"type":"integer"},
        "name":{"type": "string"},
        "active": {"type":"integer"}
    },
    "additionalProperties": false
}

var accessorySchema1 = {
    "title": "accessory",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "long_description": { "type": ["string","null"] },
        "regular_price": { "type": "number" },
        "reduced_price": { "type": "number" },
        "seo_link": { "type": ["string","null"] },
        "sort_order": { "type": "integer" },
        "meta_title": { "type": "string" },
        "meta_description": { "type": "string" },
        "category": { "type": "string" },
        "product_id": { "type": ["string","null"] },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "status": { "type": "integer" },
        "is_gift": { "type": "number" },
        "min_order_total": { "type": "number" }
    },
    "required": ["name", "description", "regular_price", "reduced_price",
                 "meta_title", "meta_description", "country", "lang"]
};

var accessorySchema2 = {
    "title": "accessory",
    "type": "object",
    "properties": {
        "id" :{ "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "long_description": { "type": ["string","null"] },
        "regular_price": { "type": "number" },
        "reduced_price": { "type": "number" },
        "seo_link": { "type": ["string","null"] },
        "sort_order": { "type": "integer" },
        "meta_title": { "type": ["string","null"] },
        "meta_description": { "type": ["string","null"] },
        "category": { "type": ["string","null"] },
        "product_id": { "type": ["string","null"] },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "status": { "type": "integer" },
        "is_gift": { "type": "number" },
        "min_order_total": { "type": "number" }
    },
    "additionalProperties": false
};

var badgeSchema1 = {
    "title": "badge",
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "color": { "type": "string" }
    },
    "required": ["name", "color"]
};

var badgeSchema2 = {
    "title": "badge",
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "color": { "type": "string" }
    },
    "additionalProperties": false
};

var otomSchema1 = {
    "title": "otom",
    "type": "object",
    "properties": {
        "label": { "type": "string" },
        "discount_id": { "type": "string" },
        "active": { "type": "integer" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "send_after_days": { "type": "integer" },
        "title": { "type": "string" },
        "data": { "type": "string" },
        "subject": { "type": "string" },
        "sender": { "type": "string" },
        "btn_text": { "type": "string" },
        "image_link": { "type": "string" },
        "therapies": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties":{
                    "id": {"type":"string"},
                    "quantity": {"type":"integer"}
                },
                "required": ["id","quantity"]
            }
        }
    },
    "required": ["label", "discount_id", "country", "lang", "send_after_days",
                 "title", "data", "subject", "sender", "btn_text", "image_link", "therapies"]
};

var otomSchema2 = {
    "title": "otom",
    "type": "object",
    "properties": {
        "label": { "type": "string" },
        "discount_id": { "type": "string" },
        "active": { "type": "integer" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "send_after_days": { "type": "integer" },
        "title": { "type": "string" },
        "data": { "type": "string" },
        "subject": { "type": "string" },
        "sender": { "type": "string" },
        "btn_text": { "type": "string" },
        "image_link": { "type": "string" },
        "therapies": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties":{
                    "id": {"type":"string"},
                    "quantity": {"type":"integer"}
                },
                "required": ["id","quantity"]
            }
        }
    },
    "additionalProperties": false
};

var otomLangSchema1 = {
    "title": "otomLang",
    "type": "object",
    "properties": {
        "lang": { "type": "string" },
        "title": { "type": "string" },
        "data": { "type": "string" }
    },
    "required": ["lang", "title", "data"]
};

var otomLangSchema2 = {
    "title": "otomLang",
    "type": "object",
    "properties": {
        "lang": { "type": "string" },
        "title": { "type": "string" },
        "data": { "type": "string" }
    },
    "additionalProperties": false
};

var settingsSchema = {
    "title": "settings",
    "type": "object",
    "properties": {
        "send_delivery_reminder_mail": { "type": "integer" }
    },
    "additionalProperties": false
};

var billboardSchema = {
    "title": "billboard",
    "type": "object",
    "properties": {
        "text": { "type": "string" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "active": { "type": "integer" },
        "video_link": { "type": ["string", "null"] },
        "link": { "type": ["string", "null"] },
        "display_video": { "type": "integer" },
    },
    "required": ["text", "country", "lang", "active"]
};

var igFeedSchema1 = {
    "title": "instagram_feed",
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "link": { "type": "string" },
        "showed": { "type": "integer" },
        "countries": { "type": "array", "min": 1 },
        "products": {"type": "array"},
        "accessories": {"type": "array"}
    },
    "required": ["name", "link", "showed", "countries"]
};

var igFeedSchema2 = {
    "title": "instagram_feed",
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "link": { "type": "string" },
        "showed": { "type": "integer" },
        "countries": { "type": "array", "min": 1 },
        "products": {"type": "array"},
        "accessories": {"type": "array"}
    },
    "additionalProperties": false
};

var otoSchema = {
    "title": "oto",
    "type": "object",
    "properties": {
        "time": { "type": "integer" },
        "discount": { "type": "string" },
        "offer_on": { "type": "array" },
        "therapies": {"type": "array"},
        "accessories": {"type": "array"},
        "country": { "type": "string" },
        "title": { "type": "string" },
        "additional_text": {"type": ["string", "null"]},
        "payment_method_id": { "type": "array" }
    },
    "additionalProperties": false
};

var abandonedCartMailSchema1 = {
    "title": "abandonedCartMail",
    "type": "object",
    "properties": {
        "subject": { "type": "string" },
        "title": { "type": "string" },
        "content": { "type": "string" },
        "btn_text": { "type": "string" },
        "btn_link": { "type": "string" },
        "img_link": { "type": "string" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "discount_id": { "type": ["string", "null"] },
        "time": { "type": "integer" },
        "send_after": { "type": "string" }
    },
    "required": ["subject","title","content","btn_text","btn_link","country","lang","time"]
};

var abandonedCartMailSchema2 = {
    "title": "abandonedCartMail",
    "type": "object",
    "properties": {
        "subject": { "type": "string" },
        "title": { "type": "string" },
        "content": { "type": "string" },
        "btn_text": { "type": "string" },
        "btn_link": { "type": "string" },
        "img_link": { "type": "string" },
        "country": { "type": "string" },
        "lang": { "type": "string" },
        "discount_id": { "type": ["string","null"] },
        "time": { "type": "integer" },
        "send_after": { "type": "string" }
    },
    "additionalProperties": false
};

module.exports = {
    influencerSchema1,
    influencerSchema2,
    customerSchema1: customerSchema1,
    customerSchema2: customerSchema2,
    customerSchema3,
    discountSchema1: discountSchema1,
    discountSchema2: discountSchema2,
    productSchema1: productSchema1,
    productSchema2: productSchema2,
    currencySchema1: currencySchema1,
    currencySchema2: currencySchema2,
    paymentmethodSchema1: paymentmethodSchema1,
    paymentmethodSchema2: paymentmethodSchema2,
    deliverymethodSchema1: deliverymethodSchema1,
    deliverymethodSchema2: deliverymethodSchema2,
    smstemplateSchema1: smstemplateSchema1,
    smstemplateSchema2: smstemplateSchema2,
    orderstatusSchema1: orderstatusSchema1,
    orderstatusSchema2: orderstatusSchema2,
    utmmediumSchema: utmmediumSchema,
    admingroupSchema1: admingroupSchema1,
    admingroupSchema2: admingroupSchema2,
    adminSchema1: adminSchema1,
    adminSchema2: adminSchema2,
    therapySchema1: therapySchema1,
    therapySchema2: therapySchema2,
    blogpostSchema1: blogpostSchema1,
    blogpostSchema2: blogpostSchema2,
    testimonialSchema1: testimonialSchema1,
    testimonialSchema2: testimonialSchema2,
    mediumSchema1: mediumSchema1,
    mediumSchema2: mediumSchema2,
    stockchangeSchema: stockchangeSchema,
    stockreminderSchema1: stockreminderSchema1,
    stockreminderSchema2: stockreminderSchema2,
    orderSchema1: orderSchema1,
    orderSchema2: orderSchema2,
    orderSchema3,
    landingSchema: landingSchema,
    colorSchema: colorSchema,
    countrySchema1: countrySchema1,
    countrySchema2: countrySchema2,
    changeStatusSchema:changeStatusSchema,
    setOrdersAgentSchema: setOrdersAgentSchema,
    pharmacySchema1: pharmacySchema1,
    pharmacySchema2: pharmacySchema2,
    stickynoteSchema1: stickynoteSchema1,
    stickynoteSchema2: stickynoteSchema2,
    expenseSchema1: expenseSchema1,
    expenseSchema2: expenseSchema2,
    expenseExtendedSchema1: expenseExtendedSchema1,
    expenseExtendedSchema2: expenseExtendedSchema2,
    expenseReportSchema: expenseReportSchema,
    incomeReportSchema: incomeReportSchema,
    giftSchema1: giftSchema1,
    giftConfigSchema1,
    giftConfigSchema2,
    giftSchema2: giftSchema2,
    accessorySchema1: accessorySchema1,
    accessorySchema2: accessorySchema2,
    setOrdersColorSchema: setOrdersColorSchema,
    badgeSchema1: badgeSchema1,
    badgeSchema2: badgeSchema2,
    categorySchema: categorySchema,
    otomSchema1: otomSchema1,
    otomSchema2: otomSchema2,
    otomLangSchema1: otomLangSchema1,
    otomLangSchema2: otomLangSchema2,
    settingsSchema: settingsSchema,
    billboardSchema: billboardSchema,
    otoSchema: otoSchema,
    igFeedSchema1,
    igFeedSchema2,
    categorySchema1,
    categorySchema2,
    reviewSchema,
    abandonedCartMailSchema1: abandonedCartMailSchema1,
    abandonedCartMailSchema2: abandonedCartMailSchema2,
    influencerPaymentSchema1,
    influencerPaymentSchema2,
    infoBipMessage,
    infoBipOMNIScenario,
    infoBipOmniMessage,
    infoBipSimpleOmniMessage,
    orderInfluencersSchema,
    userTestimonialSchema1,
    userTestimonialSchema2,
};
