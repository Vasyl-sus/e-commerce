var initialOrderSchema = {
    "title": "order",
    "type": "object",
    "properties": {
        "order_status": { "type": "string" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },
        "shipping_country": { "type": "string" },
        "currency_code": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "subtotal": { "type": "number" },
        "utm_medium": { "type": ["string", "null"] },
        "utm_source": { "type": ["string", "null"] },
        "utm_campaign": { "type": ["string", "null"] },
        "utm_content": { "type": ["string", "null"] },
        "oto": { "type": "integer"},
        "therapies": {
            "type": "array",
            "items": {
                    "type": "object",
                    "properties":{
                        "id":{"type":"string"},
                        "name":{"type":"string"},
                        "price":{"type":"number"},
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
                        "name":{"type":"string"},
                        "price":{"type":"number"},
                        "quantity":{"type":"integer"}
                    },
                    "required":["id","quantity"]
                }
            }

    },
    "anyOf":[
        {"properties": {"therapies":{"minItems":1}}},
        {"properties": {"accessories":{"minItems":1}}}
    ],
    "required": [
        "shipping_email",
        "shipping_last_name",
        "shipping_first_name",
        "currency_code",
        "currency_symbol",
        "currency_value"
    ]
};

var initialOrder2Schema = {
    "title": "order",
    "type": "object",
    "properties": {
        "shipping_telephone": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_postcode": { "type": "string" },
        "shipping_country": { "type": "string" },
        "alt_shipping_first_name": { "type": "string" },
        "alt_shipping_last_name": { "type": "string" },
        "alt_shipping_address": { "type": "string" },
        "alt_shipping_city": { "type": "string" },
        "alt_shipping_postcode": { "type": "string" },
        "currency_code": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "oto": { "type": "integer"},
    },
    "required": [
        "shipping_telephone",
        "shipping_address",
        "shipping_city",
        "shipping_postcode"
    ]
};

var orderSchema = {
    "title": "order",
    "type": "object",
    "properties": {
        "order_status": { "type": "string" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "responsible_agent_id": { "type": ["string","null"] },
        "responsible_agent_username": { "type": ["string","null"] },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "delivery_method_id": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "currency_code": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "customer_id": { "type": "string" },
        "additional_expenses": { "type": "number" },
        "post_expenses": { "type": "number" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "discount_id": { "type": "string" },
        "utm_medium": { "type": ["string", "null"] },
        "utm_source": { "type": ["string", "null"] },
        "utm_campaign": { "type": ["string", "null"] },
        "utm_content": { "type": ["string", "null"] },
        "oto": { "type": "integer"},
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
                        "name":{"type":"string"},
                        "price":{"type":"number"},
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
                        "name":{"type":"string"},
                        "price":{"type":"number"},
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
            }
    },
    "anyOf":[
        {"properties": {"therapies":{"minItems":1}}},
        {"properties": {"accessories":{"minItems":1}}}
    ],
    "required": [
        "payment_method_id",
        "payment_method_code",
        "delivery_method_id",
        "delivery_method_code",
        "delivery_method_price",
        "delivery_method_to_price"
    ]
};


var changeStatusSchema = {
    "title": "changeStatus",
    "type": "object",
    "properties": {
        "ids" :{
            "type": "array",
            "items": { "type":"string" }
        },
        "new_status": { "type": "string" },
        "date_naknadno": { "type": "string" }
    },
    "required":["ids","new_status"]
}

var oneStepOrderSchema = {
    "title": "order",
    "type": "object",
    "properties": {
        "order_status": { "type": "string" },
        "lang": { "type": "string" },
        "ip": { "type": "string" },
        "shipping_email": { "type": "string", "format": "email" },
        "shipping_last_name": { "type": "string" },
        "shipping_first_name": { "type": "string" },
        "shipping_telephone": { "type": "string", "minLength": 5 },
        "shipping_address": { "type": "string" },
        "shipping_city": { "type": "string" },
        "shipping_postcode": { "type": "string" },
        "shipping_country": { "type": "string" },
        "alt_shipping_first_name": { "type": "string" },
        "alt_shipping_last_name": { "type": "string" },
        "alt_shipping_address": { "type": "string" },
        "alt_shipping_city": { "type": "string" },
        "alt_shipping_postcode": { "type": "string" },
        "currency_code": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "currency_value": { "type": "number" },
        "responsible_agent_id": { "type": ["string","null"] },
        "responsible_agent_username": { "type": ["string","null"] },
        "payment_method_id": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "delivery_method_id": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "delivery_method_price": { "type": "number" },
        "delivery_method_to_price": { "type": "number" },
        "customer_id": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "discount_id": { "type": "string" },
        "utm_medium": { "type": ["string", "null"] },
        "utm_source": { "type": ["string", "null"] },
        "utm_campaign": { "type": ["string", "null"] },
        "utm_content": { "type": ["string", "null"] },
        "oto": { "type": "integer"},
        "therapies": {
            "type": "array",
            "items": {
                    "type": "object",
                    "properties":{
                        "id":{"type":"string"},
                        "name":{"type":"string"},
                        "category_id":{"type":["number", "string"]},
                        "price":{"type":["number", "string"]},
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
                        "name":{"type":"string"},
                        "price":{"type":["number", "string"]},
                        "quantity":{"type":"integer"}
                    },
                    "required":["id","quantity"]
                }
            }

    },
    "anyOf":[
        {"properties": {"therapies":{"minItems":1}}},
        {"properties": {"accessories":{"minItems":1}}}
    ],
    "required": [
        "shipping_email",
        "shipping_last_name",
        "shipping_first_name",
        "shipping_telephone",
        "shipping_address",
        "shipping_city",
        "shipping_postcode",
        "payment_method_id",
        "payment_method_code",
        "delivery_method_id",
        "delivery_method_code",
        "delivery_method_price",
        "delivery_method_to_price"
    ]
}

module.exports = {
    initialOrderSchema: initialOrderSchema,
    initialOrder2Schema: initialOrder2Schema,
    orderSchema: orderSchema,
    changeStatusSchema: changeStatusSchema,
    oneStepOrderSchema
}
