var expenses_visits_schema = {
    "title": "expense/visit",
    "type": "object",
    "properties": {
        "date_added":{"type": "string"},
        "code" :{ "type": "string" },
        "value": { "type": "integer" }
    },
    "required":["date_added","code","value"]
}

var orders_income_schema1 = {
    "title": "ordersIncomeStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
    "required":["fromDate","toDate","countries","orderStatuses"]
}

var orders_income_schema2 = {
    "title": "ordersIncomeStatisticsYear",
    "type": "object",
    "properties": {
        "year":{"type": "string"},
        "countries": { 
            "type": "array",
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
    "required":["year","countries","orderStatuses"]
}

var products_count_schema = {
    "title": "productsCountStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        "products": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "accessories": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","countries","orderStatuses","products"]
}

var utm_statistics_schema = {
    "title": "utmStatistics",
    "type": "object",
    "properties": {
        "utm_type":{"type": "string" },
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
    "required":["fromDate","toDate","countries","orderStatuses","utm_type"]
}

var orders_visitors_rate_schema1 = {
    "title": "ordersVisitorsRateStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string"},
        "countries": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","countries","users"]
}

var orders_visitors_rate_schema2 = {
    "title": "ordersVisitorsRateStatisticsYear",
    "type": "object",
    "properties": {
        "year" :{ "type": "string" },
        "countries": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["year","countries","users"]
}

var call_center_count_schema1 = {
    "title": "callCenterCountStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","countries","orderStatuses","users"]
}

var call_center_count_schema2 = {
    "title": "callCenterCountStatistics",
    "type": "object",
    "properties": {
        "year" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["year","countries","orderStatuses","users"]
}

var call_center_products_schema1 = {
    "title": "callCenterProductsStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "products": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","countries","orderStatuses","users","products"]
}


var call_center_products_schema2 = {
    "title": "callCenterProductsStatistics",
    "type": "object",
    "properties": {
        "year" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "products": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["year","countries","orderStatuses","users","products"]
}


var orders_upsale_schema1 = {
    "title": "ordersUpsaleStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "admin_ids": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","admin_ids"]
}

var orders_upsale_schema2 = {
    "title": "ordersUpsaleStatisticsYear",
    "type": "object",
    "properties": {
        "year" :{ "type": "string" },
        "admin_ids": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["year","admin_ids"]
}

var vcc_schema1 = {
    "title": "vccStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        },
        "users": {
            "type": "array",
            "minItems": 1,
            "items": {
                    "type": "string",
                }
        }
    },
    "required":["fromDate","toDate","countries","users"]
}

var agent_statistics_schema = {
    "title": "agentStatistics",
    "type": "object",
    "properties": {
        "fromDate":{"type": "string"},
        "toDate" :{ "type": "string" },
        "agent_id": { "type": "string" },
        "order_type": { "type": "string" },
        "countries": { 
            "type": "array",
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
    "required":["fromDate","toDate","agent_id","countries","orderStatuses"]
}

var expense_statistics_utm_schema = {
    "title": "agentStatisticsUtm",
    "type": "object",
    "properties": {
        "type": {"type": "string"},
        "inputDate" :{ "type": "string" },
        "countries": { 
            "type": "array",
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
        },
        
        "utm_mediums": {"type":"array", "items":{"type":["string", "null"]}},
        "utm_sources": {"type":"array", "items":{"type":["string", "null"]}},
        "utm_campaigns": {"type":"array", "items":{"type":["string", "null"]}},
        "utm_contents": {"type":"array", "items":{"type":["string", "null"]}}  
        
    },
    "required":["type","inputDate","countries","orderStatuses"]
}

module.exports = {
    expenses_visits_schema: expenses_visits_schema,
    orders_income_schema1: orders_income_schema1,
    orders_income_schema2: orders_income_schema2,
    products_count_schema: products_count_schema,
    utm_statistics_schema: utm_statistics_schema,
    orders_visitors_rate_schema1: orders_visitors_rate_schema1,
    orders_visitors_rate_schema2: orders_visitors_rate_schema2,

    call_center_count_schema1: call_center_count_schema1,
    call_center_count_schema2: call_center_count_schema2,
    call_center_products_schema1: call_center_products_schema1,
    call_center_products_schema2: call_center_products_schema2,

    orders_upsale_schema1: orders_upsale_schema1,
    orders_upsale_schema2: orders_upsale_schema2,

    vcc_schema1:vcc_schema1,
    agent_statistics_schema: agent_statistics_schema,
    expense_statistics_utm_schema: expense_statistics_utm_schema
};