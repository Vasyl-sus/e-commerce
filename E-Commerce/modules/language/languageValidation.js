var defsSchema = {
    "$id":"elt_def",
    "definitions":{
        "element":{
            "title": "language_element",
            "type": "object",
            "properties":{
                "name": {"type": "string"},
                "value": {"type": "string"},
                "page": {"type": "string"}
            },
            "additionalProperties": false,
            "required":["name", "value"]
        }
    }
};

var header_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [1]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1h": {"$ref":"elt_def#/definitions/element"},
                "btn1h": {"$ref":"elt_def#/definitions/element"},
                "btn2h": {"$ref":"elt_def#/definitions/element"},
                "btn3h": {"$ref":"elt_def#/definitions/element"},
                "btn4h": {"$ref":"elt_def#/definitions/element"},
                "text1h": {"$ref":"elt_def#/definitions/element"},
                "text2h": {"$ref":"elt_def#/definitions/element"},
                "btn5h": {"$ref":"elt_def#/definitions/element"},
                "btn6h": {"$ref":"elt_def#/definitions/element"}

            },
            "required":["img1h","btn1h","btn2h","btn3h","btn4h","text1h","text2h","btn5h","btn6h"]
        }
    },
    "required":["name","language","data"]
}

var header_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [1]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1h": {"$ref":"elt_def#/definitions/element"},
                "btn1h": {"$ref":"elt_def#/definitions/element"},
                "btn2h": {"$ref":"elt_def#/definitions/element"},
                "btn3h": {"$ref":"elt_def#/definitions/element"},
                "btn4h": {"$ref":"elt_def#/definitions/element"},
                "text1h": {"$ref":"elt_def#/definitions/element"},
                "text2h": {"$ref":"elt_def#/definitions/element"},
                "btn5h": {"$ref":"elt_def#/definitions/element"},
                "btn6h": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s1_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [2]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s1": {"$ref":"elt_def#/definitions/element"},
                "text1s1": {"$ref":"elt_def#/definitions/element"},
                "h1s1": {"$ref":"elt_def#/definitions/element"},
                "text2s1": {"$ref":"elt_def#/definitions/element"},
                "btn1s1": {"$ref":"elt_def#/definitions/element"},
                "btn2s1": {"$ref":"elt_def#/definitions/element"},
                "btn3s1": {"$ref":"elt_def#/definitions/element"},
                "btn4s1": {"$ref":"elt_def#/definitions/element"},
                "text3s1": {"$ref":"elt_def#/definitions/element"}

            },
            "required":["img1s1","text1s1","h1s1","text2s1","btn1s1","btn2s1","btn3s1","btn4s1","text3s1"]
        }
    },
    "required":["name","language","data"]
}

var index_s1_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [2]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s1": {"$ref":"elt_def#/definitions/element"},
                "text1s1": {"$ref":"elt_def#/definitions/element"},
                "h1s1": {"$ref":"elt_def#/definitions/element"},
                "text2s1": {"$ref":"elt_def#/definitions/element"},
                "btn1s1": {"$ref":"elt_def#/definitions/element"},
                "btn2s1": {"$ref":"elt_def#/definitions/element"},
                "btn3s1": {"$ref":"elt_def#/definitions/element"},
                "btn4s1": {"$ref":"elt_def#/definitions/element"},
                "text3s1": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s2_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [3]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1s2": {"$ref":"elt_def#/definitions/element"},
                "btn1s2": {"$ref":"elt_def#/definitions/element"},
                "h1s2": {"$ref":"elt_def#/definitions/element"},
                "h2s2": {"$ref":"elt_def#/definitions/element"},
                "h2_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_1s2": {"$ref":"elt_def#/definitions/element"},
                "h3_1_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_1_imgs2": {"$ref":"elt_def#/definitions/element"},
                "h3_2s2": {"$ref":"elt_def#/definitions/element"},
                "h3_2_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_2_imgs2": {"$ref":"elt_def#/definitions/element"},
                "h3_3s2": {"$ref":"elt_def#/definitions/element"},
                "h3_3_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_3_imgs2": {"$ref":"elt_def#/definitions/element"},
                "text2s2": {"$ref":"elt_def#/definitions/element"},
                "text3s2": {"$ref":"elt_def#/definitions/element"},
                "text4s2": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1s2","btn1s2","h1s2","h2s2","h2_texts2","h3_1s2","h3_1_texts2","h3_1_imgs2",
                        "h3_2s2","h3_2_texts2","h3_2_imgs2","h3_3s2","h3_3_texts2","h3_3_imgs2","text2s2",
                        "text3s2","text4s2"]
        }
    },
    "required":["name","language","data"]
}

var index_s2_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [3]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1s2": {"$ref":"elt_def#/definitions/element"},
                "btn1s2": {"$ref":"elt_def#/definitions/element"},
                "h1s2": {"$ref":"elt_def#/definitions/element"},
                "h2s2": {"$ref":"elt_def#/definitions/element"},
                "h2_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_1s2": {"$ref":"elt_def#/definitions/element"},
                "h3_1_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_1_imgs2": {"$ref":"elt_def#/definitions/element"},
                "h3_2s2": {"$ref":"elt_def#/definitions/element"},
                "h3_2_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_2_imgs2": {"$ref":"elt_def#/definitions/element"},
                "h3_3s2": {"$ref":"elt_def#/definitions/element"},
                "h3_3_texts2": {"$ref":"elt_def#/definitions/element"},
                "h3_3_imgs2": {"$ref":"elt_def#/definitions/element"},
                "text2s2": {"$ref":"elt_def#/definitions/element"},
                "text3s2": {"$ref":"elt_def#/definitions/element"},
                "text4s2": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s3_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [4]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s3": {"$ref":"elt_def#/definitions/element"},
                "img2s3": {"$ref":"elt_def#/definitions/element"},
                "text1s3": {"$ref":"elt_def#/definitions/element"},
                "h1s3": {"$ref":"elt_def#/definitions/element"},
                "h1_texts3": {"$ref":"elt_def#/definitions/element"},
                "text2s3": {"$ref":"elt_def#/definitions/element"},
                "text3s3": {"$ref":"elt_def#/definitions/element"},
                "btn1s3": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1s3","img2s3","text1s3","h1s3","h1_texts3","text2s3","text3s3","btn1s3"]
        }
    },
    "required":["name","language","data"]
}

var index_s3_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [4]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s3": {"$ref":"elt_def#/definitions/element"},
                "img2s3": {"$ref":"elt_def#/definitions/element"},
                "text1s3": {"$ref":"elt_def#/definitions/element"},
                "h1s3": {"$ref":"elt_def#/definitions/element"},
                "h1_texts3": {"$ref":"elt_def#/definitions/element"},
                "text2s3": {"$ref":"elt_def#/definitions/element"},
                "text3s3": {"$ref":"elt_def#/definitions/element"},
                "btn1s3": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s4_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [5]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s4": {"$ref":"elt_def#/definitions/element"},
                "img2s4": {"$ref":"elt_def#/definitions/element"},
                "text1s4": {"$ref":"elt_def#/definitions/element"},
                "h1s4": {"$ref":"elt_def#/definitions/element"},
                "h1_texts4": {"$ref":"elt_def#/definitions/element"},
                "text2s4": {"$ref":"elt_def#/definitions/element"},
                "text3s4": {"$ref":"elt_def#/definitions/element"},
                "btn1s4": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1s4","img2s4","text1s4","h1s4","h1_texts4","text2s4","text3s4","btn1s4"]
        }
    },
    "required":["name","language","data"]
}

var index_s4_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [5]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s4": {"$ref":"elt_def#/definitions/element"},
                "img2s4": {"$ref":"elt_def#/definitions/element"},
                "text1s4": {"$ref":"elt_def#/definitions/element"},
                "h1s4": {"$ref":"elt_def#/definitions/element"},
                "h1_texts4": {"$ref":"elt_def#/definitions/element"},
                "text2s4": {"$ref":"elt_def#/definitions/element"},
                "text3s4": {"$ref":"elt_def#/definitions/element"},
                "btn1s4": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s5_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [6]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s5": {"$ref":"elt_def#/definitions/element"},
                "text1s5": {"$ref":"elt_def#/definitions/element"},
                "img1s5": {"$ref":"elt_def#/definitions/element"},
                "text2s5": {"$ref":"elt_def#/definitions/element"},
                "h2s5": {"$ref":"elt_def#/definitions/element"},
                "h2_texts5": {"$ref":"elt_def#/definitions/element"},
                "text3s5": {"$ref":"elt_def#/definitions/element"},
                "text4s5": {"$ref":"elt_def#/definitions/element"},
                "text5s5": {"$ref":"elt_def#/definitions/element"},
                "text6s5": {"$ref":"elt_def#/definitions/element"},
                "btn1s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text1s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text2s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text3s5": {"$ref":"elt_def#/definitions/element"},
                "text3s51": {"$ref":"elt_def#/definitions/element"},
                "text3s52": {"$ref":"elt_def#/definitions/element"},
                "text3s53": {"$ref":"elt_def#/definitions/element"},
                "text3s54": {"$ref":"elt_def#/definitions/element"},
                "text3s55": {"$ref":"elt_def#/definitions/element"},
                "text3s56": {"$ref":"elt_def#/definitions/element"},
                "text3s66": {"$ref":"elt_def#/definitions/element"},
            },
            "required":["h1s5","text1s5","img1s5","text2s5","h2s5","h2_texts5","text3s5","text4s5", "text3s53", "text3s54", "text3s55", "text3s56",
                        "text5s5","text6s5","btn1s5","bottom_text1s5", "text3s66","bottom_text2s5", "bottom_text3s5", "text3s51", "text3s52"]
        }
    },
    "required":["name","language","data"]
}

var index_s5_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [6]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s5": {"$ref":"elt_def#/definitions/element"},
                "text1s5": {"$ref":"elt_def#/definitions/element"},
                "img1s5": {"$ref":"elt_def#/definitions/element"},
                "text2s5": {"$ref":"elt_def#/definitions/element"},
                "h2s5": {"$ref":"elt_def#/definitions/element"},
                "h2_texts5": {"$ref":"elt_def#/definitions/element"},
                "text3s5": {"$ref":"elt_def#/definitions/element"},
                "text4s5": {"$ref":"elt_def#/definitions/element"},
                "text5s5": {"$ref":"elt_def#/definitions/element"},
                "text6s5": {"$ref":"elt_def#/definitions/element"},
                "btn1s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text1s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text2s5": {"$ref":"elt_def#/definitions/element"},
                "bottom_text3s5": {"$ref":"elt_def#/definitions/element"},
                "text3s51": {"$ref":"elt_def#/definitions/element"},
                "text3s52": {"$ref":"elt_def#/definitions/element"},
                "text3s53": {"$ref":"elt_def#/definitions/element"},
                "text3s54": {"$ref":"elt_def#/definitions/element"},
                "text3s55": {"$ref":"elt_def#/definitions/element"},
                "text3s56": {"$ref":"elt_def#/definitions/element"},
                "text3s66": {"$ref":"elt_def#/definitions/element"},
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s6_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [7]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s6": {"$ref":"elt_def#/definitions/element"},
                "text1s6": {"$ref":"elt_def#/definitions/element"},
                "h1s6": {"$ref":"elt_def#/definitions/element"},
                "text2s6": {"$ref":"elt_def#/definitions/element"},
                "text3s6": {"$ref":"elt_def#/definitions/element"},
                "h2s6": {"$ref":"elt_def#/definitions/element"},
                "h2_texts6": {"$ref":"elt_def#/definitions/element"},
                "text4s6": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1s6","text1s6","h1s6","text2s6","text3s6","h2s6","h2_texts6","text4s6"]
        }
    },
    "required":["name","language","data"]
}

var index_s6_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [7]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1s6": {"$ref":"elt_def#/definitions/element"},
                "text1s6": {"$ref":"elt_def#/definitions/element"},
                "h1s6": {"$ref":"elt_def#/definitions/element"},
                "text2s6": {"$ref":"elt_def#/definitions/element"},
                "text3s6": {"$ref":"elt_def#/definitions/element"},
                "h2s6": {"$ref":"elt_def#/definitions/element"},
                "h2_texts6": {"$ref":"elt_def#/definitions/element"},
                "text4s6": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s7_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [8]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s7": {"$ref":"elt_def#/definitions/element"},
                "text1s7": {"$ref":"elt_def#/definitions/element"},
                "text2s7": {"$ref":"elt_def#/definitions/element"},
                "text3s7": {"$ref":"elt_def#/definitions/element"},
                "text4s7": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1s7","text1s7","text2s7","text3s7","text4s7"]
        }
    },
    "required":["name","language","data"]
}

var index_s7_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [8]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s7": {"$ref":"elt_def#/definitions/element"},
                "text1s7": {"$ref":"elt_def#/definitions/element"},
                "text2s7": {"$ref":"elt_def#/definitions/element"},
                "text3s7": {"$ref":"elt_def#/definitions/element"},
                "text4s7": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s8_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [9]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s8": {"$ref":"elt_def#/definitions/element"},
                "h1_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_1s8": {"$ref":"elt_def#/definitions/element"},
                "h2_1_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_2s8": {"$ref":"elt_def#/definitions/element"},
                "h2_2_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_3s8": {"$ref":"elt_def#/definitions/element"},
                "h2_3_texts8": {"$ref":"elt_def#/definitions/element"},
                "img1s8": {"$ref":"elt_def#/definitions/element"},
                "h2_4s8": {"$ref":"elt_def#/definitions/element"},
                "h2_4_texts8": {"$ref":"elt_def#/definitions/element"},
                "text1s8": {"$ref":"elt_def#/definitions/element"},
                "text2s8": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1s8","h1_texts8","h2_1s8","h2_1_texts8","h2_2s8","h2_2_texts8","h2_3s8","h2_3_texts8",
                        "img1s8","h2_4s8","h2_4_texts8","text1s8","text2s8"]
        }
    },
    "required":["name","language","data"]
}

var index_s8_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [9]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s8": {"$ref":"elt_def#/definitions/element"},
                "h1_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_1s8": {"$ref":"elt_def#/definitions/element"},
                "h2_1_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_2s8": {"$ref":"elt_def#/definitions/element"},
                "h2_2_texts8": {"$ref":"elt_def#/definitions/element"},
                "h2_3s8": {"$ref":"elt_def#/definitions/element"},
                "h2_3_texts8": {"$ref":"elt_def#/definitions/element"},
                "img1s8": {"$ref":"elt_def#/definitions/element"},
                "h2_4s8": {"$ref":"elt_def#/definitions/element"},
                "h2_4_texts8": {"$ref":"elt_def#/definitions/element"},
                "text1s8": {"$ref":"elt_def#/definitions/element"},
                "text2s8": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s9_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [10]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s9": {"$ref":"elt_def#/definitions/element"},
                "text1s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var1s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var2s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var3s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var4s9": {"$ref":"elt_def#/definitions/element"},
                "btn1s9": {"$ref":"elt_def#/definitions/element"},
                "text2s9": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1s9","text1s9","text1_var1s9","text1_var4s9","btn1s9","text2s9"]
        }
    },
    "required":["name","language","data"]
}

var index_s9_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [10]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1s9": {"$ref":"elt_def#/definitions/element"},
                "text1s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var1s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var2s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var3s9": {"$ref":"elt_def#/definitions/element"},
                "text1_var4s9": {"$ref":"elt_def#/definitions/element"},
                "btn1s9": {"$ref":"elt_def#/definitions/element"},
                "text2s9": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var index_s10_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [11]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1s10": {"$ref":"elt_def#/definitions/element"},
                "h1s10": {"$ref":"elt_def#/definitions/element"},
                "h1_texts10": {"$ref":"elt_def#/definitions/element"},
                "text2s10": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1s10","h1s10","h1_texts10","text2s10"]
        }
    },
    "required":["name","language","data"]
}

var index_s10_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [11]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1s10": {"$ref":"elt_def#/definitions/element"},
                "h1s10": {"$ref":"elt_def#/definitions/element"},
                "h1_texts10": {"$ref":"elt_def#/definitions/element"},
                "text2s10": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var footer_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [12]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1f": {"$ref":"elt_def#/definitions/element"},
                "text1f": {"$ref":"elt_def#/definitions/element"},
                "h1f": {"$ref":"elt_def#/definitions/element"},
                "h1_text1f": {"$ref":"elt_def#/definitions/element"},
                "h1_text2f": {"$ref":"elt_def#/definitions/element"},
                "text2f": {"$ref":"elt_def#/definitions/element"},
                "text3f": {"$ref":"elt_def#/definitions/element"},
                "text4f": {"$ref":"elt_def#/definitions/element"},
                "text5f": {"$ref":"elt_def#/definitions/element"},
                "text6f": {"$ref":"elt_def#/definitions/element"},
                "text7f": {"$ref":"elt_def#/definitions/element"},
                "text8f": {"$ref":"elt_def#/definitions/element"},
                "text9f": {"$ref":"elt_def#/definitions/element"},
                "btn1f": {"$ref":"elt_def#/definitions/element"},
                "text10f": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1f","text1f","h1f","h1_text1f","h1_text2f","text2f","text3f","text4f",
                        "text5f","text6f","text7f","text8f","text9f","btn1f","text10f"]
        }
    },
    "required":["name","language","data"]
}

var footer_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [12]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1f": {"$ref":"elt_def#/definitions/element"},
                "text1f": {"$ref":"elt_def#/definitions/element"},
                "h1f": {"$ref":"elt_def#/definitions/element"},
                "h1_text1f": {"$ref":"elt_def#/definitions/element"},
                "h1_text2f": {"$ref":"elt_def#/definitions/element"},
                "text2f": {"$ref":"elt_def#/definitions/element"},
                "text3f": {"$ref":"elt_def#/definitions/element"},
                "text4f": {"$ref":"elt_def#/definitions/element"},
                "text5f": {"$ref":"elt_def#/definitions/element"},
                "text6f": {"$ref":"elt_def#/definitions/element"},
                "text7f": {"$ref":"elt_def#/definitions/element"},
                "text8f": {"$ref":"elt_def#/definitions/element"},
                "text9f": {"$ref":"elt_def#/definitions/element"},
                "btn1f": {"$ref":"elt_def#/definitions/element"},
                "text10f": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s1_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [13]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g1": {"$ref":"elt_def#/definitions/element"},
                "text1g1": {"$ref":"elt_def#/definitions/element"},
                "h1g1": {"$ref":"elt_def#/definitions/element"},
                "h1_textg1": {"$ref":"elt_def#/definitions/element"},
                "btn1g1": {"$ref":"elt_def#/definitions/element"},
                "h2g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text4g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text5g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text6g1": {"$ref":"elt_def#/definitions/element"},
                "btn2g1": {"$ref":"elt_def#/definitions/element"},
                "text2g1": {"$ref":"elt_def#/definitions/element"},
                "textTableG1": {"$ref":"elt_def#/definitions/element"},
                "img1g11topHim": {"$ref":"elt_def#/definitions/element"},
                "img1g11topHimMob": {"$ref":"elt_def#/definitions/element"}
                
            },
            "required":["img1g1","text1g1","h1g1","h1_textg1","btn1g1","h2g1","h2_text1g1","h2_text2g1",
                        "h2_text3g1","h2_text4g1","h2_text5g1","h2_text6g1","btn2g1","text2g1", "textTableG1", "img1g11topHim", "img1g11topHimMob"]
        }
    },
    "required":["name","language","data"]
}

var gender_s1_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [13]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g1": {"$ref":"elt_def#/definitions/element"},
                "text1g1": {"$ref":"elt_def#/definitions/element"},
                "h1g1": {"$ref":"elt_def#/definitions/element"},
                "h1_textg1": {"$ref":"elt_def#/definitions/element"},
                "btn1g1": {"$ref":"elt_def#/definitions/element"},
                "h2g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text4g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text5g1": {"$ref":"elt_def#/definitions/element"},
                "h2_text6g1": {"$ref":"elt_def#/definitions/element"},
                "btn2g1": {"$ref":"elt_def#/definitions/element"},
                "text2g1": {"$ref":"elt_def#/definitions/element"},
                "textTableG1": {"$ref":"elt_def#/definitions/element"},
                "img1g11topHim": {"$ref":"elt_def#/definitions/element"},
                "img1g11topHimMob": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s2_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [14]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1g2": {"$ref":"elt_def#/definitions/element"},
                "h1g2": {"$ref":"elt_def#/definitions/element"},
                "btn1g2": {"$ref":"elt_def#/definitions/element"},
                "text2g2": {"$ref":"elt_def#/definitions/element"},
                "text3g2": {"$ref":"elt_def#/definitions/element"},
                "text4g2": {"$ref":"elt_def#/definitions/element"},
                "text5g2": {"$ref":"elt_def#/definitions/element"},
                "text6g2": {"$ref":"elt_def#/definitions/element"},
                "text2g2s": {"$ref":"elt_def#/definitions/element"},
                "text3g2s": {"$ref":"elt_def#/definitions/element"},
                "text4g2s": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text2g2s", "text3g2s", "text4g2s", "text1g2","h1g2","btn1g2","text2g2","text3g2","text4g2","text5g2","text6g2"]
        }
    },
    "required":["name","language","data"]
}

var gender_s2_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [14]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1g2": {"$ref":"elt_def#/definitions/element"},
                "h1g2": {"$ref":"elt_def#/definitions/element"},
                "btn1g2": {"$ref":"elt_def#/definitions/element"},
                "text2g2": {"$ref":"elt_def#/definitions/element"},
                "text3g2": {"$ref":"elt_def#/definitions/element"},
                "text4g2": {"$ref":"elt_def#/definitions/element"},
                "text5g2": {"$ref":"elt_def#/definitions/element"},
                "text6g2": {"$ref":"elt_def#/definitions/element"},
                "text2g2s": {"$ref":"elt_def#/definitions/element"},
                "text3g2s": {"$ref":"elt_def#/definitions/element"},
                "text4g2s": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s3_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [15]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g3": {"$ref":"elt_def#/definitions/element"},
                "h1_textg3": {"$ref":"elt_def#/definitions/element"},
                "btn1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_1_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_2g3": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_3g3": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_4g3": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg3": {"$ref":"elt_def#/definitions/element"},
                "text1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_3g311": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg311": {"$ref":"elt_def#/definitions/element"},
                "h2_4g311": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg311": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1g3","h1_textg3","btn1g3","h2_1g3","h2_1_textg3","h2_2g3","h2_2_textg3", "h2_3g311", "h2_3_textg311", "h2_4g311", "h2_4_textg311",
                        "h2_3g3","h2_3_textg3","h2_4g3","h2_4_textg3","text1g3"]
        }
    },
    "required":["name","language","data"]
}

var gender_s3_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [15]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g3": {"$ref":"elt_def#/definitions/element"},
                "h1_textg3": {"$ref":"elt_def#/definitions/element"},
                "btn1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_1_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_2g3": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_3g3": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg3": {"$ref":"elt_def#/definitions/element"},
                "h2_4g3": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg3": {"$ref":"elt_def#/definitions/element"},
                "text1g3": {"$ref":"elt_def#/definitions/element"},
                "h2_3g311": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg311": {"$ref":"elt_def#/definitions/element"},
                "h2_4g311": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg311": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s4_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [16]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g4": {"$ref":"elt_def#/definitions/element"},
                "text1g4": {"$ref":"elt_def#/definitions/element"},
                "text2g4": {"$ref":"elt_def#/definitions/element"},
                "text3g4": {"$ref":"elt_def#/definitions/element"},
                "text4g4": {"$ref":"elt_def#/definitions/element"},
                "text5g4": {"$ref":"elt_def#/definitions/element"},
                "text6g4": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1g4","text1g4","text2g4","text3g4","text4g4","text5g4","text6g4"]
        }
    },
    "required":["name","language","data"]
}

var gender_s4_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [16]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g4": {"$ref":"elt_def#/definitions/element"},
                "text1g4": {"$ref":"elt_def#/definitions/element"},
                "text2g4": {"$ref":"elt_def#/definitions/element"},
                "text3g4": {"$ref":"elt_def#/definitions/element"},
                "text4g4": {"$ref":"elt_def#/definitions/element"},
                "text5g4": {"$ref":"elt_def#/definitions/element"},
                "text6g4": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s7_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [17]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g7": {"$ref":"elt_def#/definitions/element"},
                "h1_textg7": {"$ref":"elt_def#/definitions/element"},
                "h2g7": {"$ref":"elt_def#/definitions/element"},
                "text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_2g7": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_3g7": {"$ref":"elt_def#/definitions/element"},
                "h2_3_text1g7": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1g7","h1_textg7","h2g7","text1g7","h2_1g7","h2_1_text1g7","h2_1_text2g7","h2_1_text3g7",
                        "h2_1_btn1g7","h2_2g7","h2_2_text1g7","h2_3g7","h2_3_text1g7"]
        }
    },
    "required":["name","language","data"]
}

var gender_s7_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [17]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g7": {"$ref":"elt_def#/definitions/element"},
                "h1_textg7": {"$ref":"elt_def#/definitions/element"},
                "h2g7": {"$ref":"elt_def#/definitions/element"},
                "text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3g7": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_2g7": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1g7": {"$ref":"elt_def#/definitions/element"},
                "h2_3g7": {"$ref":"elt_def#/definitions/element"},
                "h2_3_text1g7": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender_s8_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [18]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g8": {"$ref":"elt_def#/definitions/element"},
                "h1g8": {"$ref":"elt_def#/definitions/element"},
                "h1_text1g8": {"$ref":"elt_def#/definitions/element"},
                "h2g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g8": {"$ref":"elt_def#/definitions/element"},
                "btn1g8": {"$ref":"elt_def#/definitions/element"},
                "text1g8": {"$ref":"elt_def#/definitions/element"},
                "text1g81511": {"$ref":"elt_def#/definitions/element"},
                "text1g81522": {"$ref":"elt_def#/definitions/element"},
                "text1g81533": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1g8","h1g8","h1_text1g8","h2g8","h2_text1g8","h2_text2g8","h2_text3g8","btn1g8","text1g8", "text1g81511", "text1g81522", "text1g81533"]
        }
    },
    "required":["name","language","data"]
}

var gender_s8_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [18]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g8": {"$ref":"elt_def#/definitions/element"},
                "h1g8": {"$ref":"elt_def#/definitions/element"},
                "h1_text1g8": {"$ref":"elt_def#/definitions/element"},
                "h2g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g8": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g8": {"$ref":"elt_def#/definitions/element"},
                "btn1g8": {"$ref":"elt_def#/definitions/element"},
                "text1g8": {"$ref":"elt_def#/definitions/element"},
                "text1g81511": {"$ref":"elt_def#/definitions/element"},
                "text1g81522": {"$ref":"elt_def#/definitions/element"},
                "text1g81533": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}


var gender1_s1_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [28]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g11": {"$ref":"elt_def#/definitions/element"},
                "text1g11": {"$ref":"elt_def#/definitions/element"},
                "h1g11": {"$ref":"elt_def#/definitions/element"},
                "h1_textg11": {"$ref":"elt_def#/definitions/element"},
                "btn1g11": {"$ref":"elt_def#/definitions/element"},
                "h2g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text4g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text5g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text6g11": {"$ref":"elt_def#/definitions/element"},
                "btn2g11": {"$ref":"elt_def#/definitions/element"},
                "text2g11": {"$ref":"elt_def#/definitions/element"},
                "textTableG11": {"$ref":"elt_def#/definitions/element"},
                "img1g11top": {"$ref":"elt_def#/definitions/element"},
                "img1g11topMob": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["img1g11","text1g11","h1g11","h1_textg11","btn1g11","h2g11","h2_text1g11","h2_text2g11",
                        "h2_text3g11","h2_text4g11","h2_text5g11","h2_text6g11","btn2g11","text2g11", "textTableG11", "img1g11top", "img1g11topMob"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s1_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [28]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g11": {"$ref":"elt_def#/definitions/element"},
                "text1g11": {"$ref":"elt_def#/definitions/element"},
                "h1g11": {"$ref":"elt_def#/definitions/element"},
                "h1_textg11": {"$ref":"elt_def#/definitions/element"},
                "btn1g11": {"$ref":"elt_def#/definitions/element"},
                "h2g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text4g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text5g11": {"$ref":"elt_def#/definitions/element"},
                "h2_text6g11": {"$ref":"elt_def#/definitions/element"},
                "btn2g11": {"$ref":"elt_def#/definitions/element"},
                "text2g11": {"$ref":"elt_def#/definitions/element"},
                "textTableG11": {"$ref":"elt_def#/definitions/element"},
                "img1g11top": {"$ref":"elt_def#/definitions/element"},
                "img1g11topMob": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender1_s2_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [29]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1g21": {"$ref":"elt_def#/definitions/element"},
                "h1g21": {"$ref":"elt_def#/definitions/element"},
                "btn1g21": {"$ref":"elt_def#/definitions/element"},
                "text2g21": {"$ref":"elt_def#/definitions/element"},
                "text3g21": {"$ref":"elt_def#/definitions/element"},
                "text4g21": {"$ref":"elt_def#/definitions/element"},
                "text5g21": {"$ref":"elt_def#/definitions/element"},
                "text6g21": {"$ref":"elt_def#/definitions/element"},
                "text2g21ss": {"$ref":"elt_def#/definitions/element"},
                "text3g21ss": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text2g21ss", "text3g21ss", "text4g2s", "text1g21","h1g21","btn1g21","text2g21","text3g21","text4g21","text5g21","text6g21"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s2_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [29]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1g21": {"$ref":"elt_def#/definitions/element"},
                "h1g21": {"$ref":"elt_def#/definitions/element"},
                "btn1g21": {"$ref":"elt_def#/definitions/element"},
                "text2g21": {"$ref":"elt_def#/definitions/element"},
                "text3g21": {"$ref":"elt_def#/definitions/element"},
                "text4g21": {"$ref":"elt_def#/definitions/element"},
                "text5g21": {"$ref":"elt_def#/definitions/element"},
                "text6g21": {"$ref":"elt_def#/definitions/element"},
                "text2g21ss": {"$ref":"elt_def#/definitions/element"},
                "text3g21ss": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender1_s3_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [30]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g31": {"$ref":"elt_def#/definitions/element"},
                "h1_textg31": {"$ref":"elt_def#/definitions/element"},
                "btn1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_1_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_2g31": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_3g31": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_4g31": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg31": {"$ref":"elt_def#/definitions/element"},
                "text1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_4g312": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg312": {"$ref":"elt_def#/definitions/element"},
                "h2_3g312": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg312": {"$ref":"elt_def#/definitions/element"},
            },
            "required":["h1g31","h1_textg31","btn1g31","h2_1g31","h2_1_textg31","h2_2g31","h2_2_textg31", "h2_4g312", "h2_4_textg312", "h2_3g312",
            "h2_3_textg312", "h2_3g31","h2_3_textg31","h2_4g31","h2_4_textg31","text1g31"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s3_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [30]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g31": {"$ref":"elt_def#/definitions/element"},
                "h1_textg31": {"$ref":"elt_def#/definitions/element"},
                "btn1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_1_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_2g31": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_3g31": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg31": {"$ref":"elt_def#/definitions/element"},
                "h2_4g31": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg31": {"$ref":"elt_def#/definitions/element"},
                "text1g31": {"$ref":"elt_def#/definitions/element"},
                "h2_4g312": {"$ref":"elt_def#/definitions/element"},
                "h2_4_textg312": {"$ref":"elt_def#/definitions/element"},
                "h2_3g312": {"$ref":"elt_def#/definitions/element"},
                "h2_3_textg312": {"$ref":"elt_def#/definitions/element"},
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender1_s4_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [31]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g41": {"$ref":"elt_def#/definitions/element"},
                "text1g41": {"$ref":"elt_def#/definitions/element"},
                "text2g41": {"$ref":"elt_def#/definitions/element"},
                "text3g41": {"$ref":"elt_def#/definitions/element"},
                "text4g41": {"$ref":"elt_def#/definitions/element"},
                "text5g41": {"$ref":"elt_def#/definitions/element"},
                "text6g41": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1g41","text1g41","text2g41","text3g41","text4g41","text5g41","text6g41"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s4_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [31]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g41": {"$ref":"elt_def#/definitions/element"},
                "text1g41": {"$ref":"elt_def#/definitions/element"},
                "text2g41": {"$ref":"elt_def#/definitions/element"},
                "text3g41": {"$ref":"elt_def#/definitions/element"},
                "text4g41": {"$ref":"elt_def#/definitions/element"},
                "text5g41": {"$ref":"elt_def#/definitions/element"},
                "text6g41": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender1_s7_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [32]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g71": {"$ref":"elt_def#/definitions/element"},
                "h1_textg71": {"$ref":"elt_def#/definitions/element"},
                "h2g71": {"$ref":"elt_def#/definitions/element"},
                "text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_2g71": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_3g71": {"$ref":"elt_def#/definitions/element"},
                "h2_3_text1g71": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1g71","h1_textg71","h2g71","text1g71","h2_1g71","h2_1_text1g71","h2_1_text2g71","h2_1_text3g71",
                        "h2_1_btn1g71","h2_2g71","h2_2_text1g71","h2_3g71","h2_3_text1g71"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s7_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [32]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1g71": {"$ref":"elt_def#/definitions/element"},
                "h1_textg71": {"$ref":"elt_def#/definitions/element"},
                "h2g71": {"$ref":"elt_def#/definitions/element"},
                "text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3g71": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_2g71": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1g71": {"$ref":"elt_def#/definitions/element"},
                "h2_3g71": {"$ref":"elt_def#/definitions/element"},
                "h2_3_text1g71": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var gender1_s8_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [33]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g81": {"$ref":"elt_def#/definitions/element"},
                "h1g81": {"$ref":"elt_def#/definitions/element"},
                "h1_text1g81": {"$ref":"elt_def#/definitions/element"},
                "h2g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g81": {"$ref":"elt_def#/definitions/element"},
                "btn1g81": {"$ref":"elt_def#/definitions/element"},
                "text1g81": {"$ref":"elt_def#/definitions/element"},
                "text1g8151": {"$ref":"elt_def#/definitions/element"},
                "text1g8152": {"$ref":"elt_def#/definitions/element"},
                "text1g8153": {"$ref":"elt_def#/definitions/element"},
            },
            "required":["img1g81","h1g81","h1_text1g81","h2g81","h2_text1g81","h2_text2g81","h2_text3g81","btn1g81","text1g81", "text1g8151", "text1g8152", "text1g8153"]
        }
    },
    "required":["name","language","data"]
}

var gender1_s8_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [33]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "img1g81": {"$ref":"elt_def#/definitions/element"},
                "h1g81": {"$ref":"elt_def#/definitions/element"},
                "h1_text1g81": {"$ref":"elt_def#/definitions/element"},
                "h2g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text1g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text2g81": {"$ref":"elt_def#/definitions/element"},
                "h2_text3g81": {"$ref":"elt_def#/definitions/element"},
                "btn1g81": {"$ref":"elt_def#/definitions/element"},
                "text1g81": {"$ref":"elt_def#/definitions/element"},
                "text1g8151": {"$ref":"elt_def#/definitions/element"},
                "text1g8152": {"$ref":"elt_def#/definitions/element"},
                "text1g8153": {"$ref":"elt_def#/definitions/element"},
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var shopping_header_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [19]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1ss1": {"$ref":"elt_def#/definitions/element"},
                "text2ss1": {"$ref":"elt_def#/definitions/element"},
                "text3ss1": {"$ref":"elt_def#/definitions/element"},
                "text4ss1": {"$ref":"elt_def#/definitions/element"},
                "btn1ss1": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1ss1","text2ss1","text3ss1","text4ss1","btn1ss1"]
        }
    },
    "required":["name","language","data"]
}

var shopping_header_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [19]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1ss1": {"$ref":"elt_def#/definitions/element"},
                "text2ss1": {"$ref":"elt_def#/definitions/element"},
                "text3ss1": {"$ref":"elt_def#/definitions/element"},
                "text4ss1": {"$ref":"elt_def#/definitions/element"},
                "btn1ss1": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var shopping_step1_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [20]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1ss2": {"$ref":"elt_def#/definitions/element"},
                "h1ss222": {"$ref":"elt_def#/definitions/element"},
                "text1ss2": {"$ref":"elt_def#/definitions/element"},
                "text2ss2": {"$ref":"elt_def#/definitions/element"},
                "text3ss2": {"$ref":"elt_def#/definitions/element"},
                "text4ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var1ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var2ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var3ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var4ss2": {"$ref":"elt_def#/definitions/element"},
                "text5ss2": {"$ref":"elt_def#/definitions/element"},
                "btn1ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var1ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var2ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var3ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var4ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h1ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t1ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t2ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t3ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t4ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h2ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h2_tss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t5ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t6ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t7ss2": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1ss222","h1ss2","text1ss2","text2ss2","text3ss2","text4ss2","text4_var1ss2","text4_var4ss2","text5ss2",
                        "text6_var1ss2","text6_var4ss2","summary_h1ss2","summary_t1ss2","summary_t2ss2","summary_t3ss2",
                        "summary_t4ss2","summary_h2ss2","summary_h2_tss2","summary_t5ss2","summary_t6ss2","summary_t7ss2"]
        }
    },
    "required":["name","language","data"]
}

var shopping_step1_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [20]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1ss2": {"$ref":"elt_def#/definitions/element"},
                "h1ss222": {"$ref":"elt_def#/definitions/element"},
                "text1ss2": {"$ref":"elt_def#/definitions/element"},
                "text2ss2": {"$ref":"elt_def#/definitions/element"},
                "text3ss2": {"$ref":"elt_def#/definitions/element"},
                "text4ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var1ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var2ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var3ss2": {"$ref":"elt_def#/definitions/element"},
                "text4_var4ss2": {"$ref":"elt_def#/definitions/element"},
                "text5ss2": {"$ref":"elt_def#/definitions/element"},
                "btn1ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var1ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var2ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var3ss2": {"$ref":"elt_def#/definitions/element"},
                "text6_var4ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h1ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t1ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t2ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t3ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t4ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h2ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_h2_tss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t5ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t6ss2": {"$ref":"elt_def#/definitions/element"},
                "summary_t7ss2": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var shopping_step2_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [21]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1_1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text3ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text3ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text4ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text5ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text6ss3": {"$ref":"elt_def#/definitions/element"},
                "btn1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text1ss332": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1_2_text1ss332", "h1_1ss3","h1_1_text1ss3","h1_1_text2ss3","h1_1_text2ss3","h1_2ss3","h1_2_text1ss3","h1_2_text2ss3","h1_2_text3ss3",
                        "h1_2_text4ss3","h1_2_text5ss3","h1_2_text6ss3","btn1ss3"]
        }
    },
    "required":["name","language","data"]
}

var shopping_step2_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [21]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1_1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_1_text3ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text2ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text3ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text4ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text5ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text6ss3": {"$ref":"elt_def#/definitions/element"},
                "btn1ss3": {"$ref":"elt_def#/definitions/element"},
                "h1_2_text1ss332": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var shopping_step3_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [22]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1_1ss4": {"$ref":"elt_def#/definitions/element"},
                "h1_2ss4": {"$ref":"elt_def#/definitions/element"},
                "btn1ss4": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1_1ss4","h1_2ss4","btn1ss4"]
        }
    },
    "required":["name","language","data"]
}

var shopping_step3_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [22]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1_1ss4": {"$ref":"elt_def#/definitions/element"},
                "h1_2ss4": {"$ref":"elt_def#/definitions/element"},
                "btn1ss4": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var shopping_step4_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [23]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1ss5": {"$ref":"elt_def#/definitions/element"},
                "text1ss5": {"$ref":"elt_def#/definitions/element"},
                "text2ss5": {"$ref":"elt_def#/definitions/element"},
                "text3ss5": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1ss5","text1ss5","text2ss5","text3ss5"]
        }
    },
    "required":["name","language","data"]
}

var shopping_step4_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [23]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1ss5": {"$ref":"elt_def#/definitions/element"},
                "text1ss5": {"$ref":"elt_def#/definitions/element"},
                "text2ss5": {"$ref":"elt_def#/definitions/element"},
                "text3ss5": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var terms_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [24]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1t1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1t1": {"$ref":"elt_def#/definitions/element"},
                "h2_1t1": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textt1": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "required":["h1t1","h1_text1t1","h2_1t1","h2_2_textt1","datas"]
        }
    },
    "required":["name","language","data"]
}

var terms_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [24]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1t1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1t1": {"$ref":"elt_def#/definitions/element"},
                "h2_1t1": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textt1": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var meta_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [40]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "homeTitle": {"$ref":"elt_def#/definitions/element"},
                "homeDescription": {"$ref":"elt_def#/definitions/element"},
                "forHimTitle": {"$ref":"elt_def#/definitions/element"},
                "forHimDescription": {"$ref":"elt_def#/definitions/element"},
                "forHerTitle": {"$ref":"elt_def#/definitions/element"},
                "forHerDescription": {"$ref":"elt_def#/definitions/element"},
                "faqTitle": {"$ref":"elt_def#/definitions/element"},
                "faqDescription": {"$ref":"elt_def#/definitions/element"},
                "cartTitle": {"$ref":"elt_def#/definitions/element"},
                "cartDescription": {"$ref":"elt_def#/definitions/element"},
                "cartInfoTitle": {"$ref":"elt_def#/definitions/element"},
                "cartInfoDescription": {"$ref":"elt_def#/definitions/element"},
                "cartAddressTitle": {"$ref":"elt_def#/definitions/element"},
                "cartAddressDescription": {"$ref":"elt_def#/definitions/element"},
                "cartPaymentTitle": {"$ref":"elt_def#/definitions/element"},
                "cartPaymentDescription": {"$ref":"elt_def#/definitions/element"},
                "successTitle": {"$ref":"elt_def#/definitions/element"},
                "successDescription": {"$ref":"elt_def#/definitions/element"},
            },
            "required":["homeTitle","homeDescription","forHimTitle","forHimDescription","forHerTitle", "forHerDescription","faqTitle","faqDescription","cartTitle","cartDescription", "cartInfoTitle","cartInfoDescription","cartAddressTitle","cartAddressDescription","cartPaymentTitle", "cartPaymentDescription","successTitle","successDescription"]
        }
    },
    "required":["name","language","data"]
}

var meta_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [40]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "homeTitle": {"$ref":"elt_def#/definitions/element"},
                "homeDescription": {"$ref":"elt_def#/definitions/element"},
                "forHimTitle": {"$ref":"elt_def#/definitions/element"},
                "forHimDescription": {"$ref":"elt_def#/definitions/element"},
                "forHerTitle": {"$ref":"elt_def#/definitions/element"},
                "forHerDescription": {"$ref":"elt_def#/definitions/element"},
                "faqTitle": {"$ref":"elt_def#/definitions/element"},
                "faqDescription": {"$ref":"elt_def#/definitions/element"},
                "cartTitle": {"$ref":"elt_def#/definitions/element"},
                "cartDescription": {"$ref":"elt_def#/definitions/element"},
                "cartInfoTitle": {"$ref":"elt_def#/definitions/element"},
                "cartInfoDescription": {"$ref":"elt_def#/definitions/element"},
                "cartAddressTitle": {"$ref":"elt_def#/definitions/element"},
                "cartAddressDescription": {"$ref":"elt_def#/definitions/element"},
                "cartPaymentTitle": {"$ref":"elt_def#/definitions/element"},
                "cartPaymentDescription": {"$ref":"elt_def#/definitions/element"},
                "successTitle": {"$ref":"elt_def#/definitions/element"},
                "successDescription": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": true
        }
    },
    "required":["name","language","data"]
}

var popular_offers_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [25]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_1": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text4": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1": {"$ref":"elt_def#/definitions/element"},
                "h2_2": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_2_btn1": {"$ref":"elt_def#/definitions/element"},
                "text1": {"$ref":"elt_def#/definitions/element"},
                "text2": {"$ref":"elt_def#/definitions/element"},
                "bottom_text1": {"$ref":"elt_def#/definitions/element"},
                "bottom_text2": {"$ref":"elt_def#/definitions/element"},
                "bottom_text3": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["h1","h1_text1","h2_1","h2_1_text1","h2_1_text2","h2_1_text3",
                        "h2_1_text4","h2_1_btn1","h2_2","h2_2_text1","h2_2_btn1",
                        "text1","text2","bottom_text1","bottom_text2","bottom_text3"]
        }
    },
    "required":["name","language","data"]
}

var popular_offers_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [25]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_1": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text2": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text3": {"$ref":"elt_def#/definitions/element"},
                "h2_1_text4": {"$ref":"elt_def#/definitions/element"},
                "h2_1_btn1": {"$ref":"elt_def#/definitions/element"},
                "h2_2": {"$ref":"elt_def#/definitions/element"},
                "h2_2_text1": {"$ref":"elt_def#/definitions/element"},
                "h2_2_btn1": {"$ref":"elt_def#/definitions/element"},
                "text1": {"$ref":"elt_def#/definitions/element"},
                "text2": {"$ref":"elt_def#/definitions/element"},
                "bottom_text1": {"$ref":"elt_def#/definitions/element"},
                "bottom_text2": {"$ref":"elt_def#/definitions/element"},
                "bottom_text3": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var faq_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [26]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1f1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1f1": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "required":["h1f1","h1_text1f1","datas"]
        }
    },
    "required":["name","language","data"]
}

var faq_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [26]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1f1": {"$ref":"elt_def#/definitions/element"},
                "h1_text1f1": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var links_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [27]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "l1": {"$ref":"elt_def#/definitions/element"},
                "l2": {"$ref":"elt_def#/definitions/element"},
                "l3": {"$ref":"elt_def#/definitions/element"},
                "l4": {"$ref":"elt_def#/definitions/element"},
                "l5": {"$ref":"elt_def#/definitions/element"},
                "l6": {"$ref":"elt_def#/definitions/element"},
                "l7": {"$ref":"elt_def#/definitions/element"},
                "l8": {"$ref":"elt_def#/definitions/element"},
                "l9": {"$ref":"elt_def#/definitions/element"},
                "l10": {"$ref":"elt_def#/definitions/element"},
                "l11": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["l1","l2","l3","l4","l5","l6","l7","l8","l9","l10", "l11"]
        }
    },
    "required":["name","language","data"]
}

var links_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [27]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "l1": {"$ref":"elt_def#/definitions/element"},
                "l2": {"$ref":"elt_def#/definitions/element"},
                "l3": {"$ref":"elt_def#/definitions/element"},
                "l4": {"$ref":"elt_def#/definitions/element"},
                "l5": {"$ref":"elt_def#/definitions/element"},
                "l6": {"$ref":"elt_def#/definitions/element"},
                "l7": {"$ref":"elt_def#/definitions/element"},
                "l8": {"$ref":"elt_def#/definitions/element"},
                "l9": {"$ref":"elt_def#/definitions/element"},
                "l10": {"$ref":"elt_def#/definitions/element"},
                "l11": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var main_Schema = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [34]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "full_lang_name": {"type": "string"}
            },
            "required": ["full_lang_name"],
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var privacy_policy_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [35]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1pp": {"$ref":"elt_def#/definitions/element"},
                "h1_text1pp": {"$ref":"elt_def#/definitions/element"},
                "h2_1pp": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textpp": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "required":["h1pp","h1_text1pp","h2_1pp","h2_2_textpp","datas"]
        }
    },
    "required":["name","language","data"]
}

var privacy_policy_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [35]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "h1pp": {"$ref":"elt_def#/definitions/element"},
                "h1_text1pp": {"$ref":"elt_def#/definitions/element"},
                "h2_1pp": {"$ref":"elt_def#/definitions/element"},
                "h2_2_textpp": {"$ref":"elt_def#/definitions/element"},
                "datas":{
                    "type": "array",
                    "minItems": 1,
                    "items":{
                        "$ref":"elt_def#/definitions/element"
                    }
                }
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var ask_us_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [36]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1au1": {"$ref":"elt_def#/definitions/element"},
                "text2au1": {"$ref":"elt_def#/definitions/element"},
                "text3au1": {"$ref":"elt_def#/definitions/element"},
                "text4au1": {"$ref":"elt_def#/definitions/element"},
                "text5au1": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1au1","text2au1","text3au1","text4au1","text5au1"]
        }
    },
    "required":["name","language","data"]
}

var ask_us_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [36]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1au1": {"$ref":"elt_def#/definitions/element"},
                "text2au1": {"$ref":"elt_def#/definitions/element"},
                "text3au1": {"$ref":"elt_def#/definitions/element"},
                "text4au1": {"$ref":"elt_def#/definitions/element"},
                "text5au1": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var about_us_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [37]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1au2": {"$ref":"elt_def#/definitions/element"},
                "text2au2": {"$ref":"elt_def#/definitions/element"},
                "text3au2": {"$ref":"elt_def#/definitions/element"},
                "text4au2": {"$ref":"elt_def#/definitions/element"},
                "text5au2": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1au2","text2au2","text3au2","text4au2","text5au2"]
        }
    },
    "required":["name","language","data"]
}

var about_us_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [37]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1au2": {"$ref":"elt_def#/definitions/element"},
                "text2au2": {"$ref":"elt_def#/definitions/element"},
                "text3au2": {"$ref":"elt_def#/definitions/element"},
                "text4au2": {"$ref":"elt_def#/definitions/element"},
                "text5au2": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var our_mission_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [38]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1om": {"$ref":"elt_def#/definitions/element"},
                "text2om": {"$ref":"elt_def#/definitions/element"},
                "text3om": {"$ref":"elt_def#/definitions/element"},
                "text4om": {"$ref":"elt_def#/definitions/element"},
                "text5om": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["text1om","text2om","text3om","text4om","text5om"]
        }
    },
    "required":["name","language","data"]
}

var our_mission_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [38]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "text1om": {"$ref":"elt_def#/definitions/element"},
                "text2om": {"$ref":"elt_def#/definitions/element"},
                "text3om": {"$ref":"elt_def#/definitions/element"},
                "text4om": {"$ref":"elt_def#/definitions/element"},
                "text5om": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var order_mail_Schema1 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [39,41,42]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "mail_title": {"$ref":"elt_def#/definitions/element"},
                "div_top_status1": {"$ref":"elt_def#/definitions/element"},
                "div_top_status2": {"$ref":"elt_def#/definitions/element"},
                "p_greeting": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t1": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t2": {"$ref":"elt_def#/definitions/element"},
                "order_info_1": {"$ref":"elt_def#/definitions/element"},
                "heading_order": {"$ref":"elt_def#/definitions/element"},
                "order_info_2": {"$ref":"elt_def#/definitions/element"},
                "order_info_3": {"$ref":"elt_def#/definitions/element"},
                "order_info_4": {"$ref":"elt_def#/definitions/element"},
                "order_info_5": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_1": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_2": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_3": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_4": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_5": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_1": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_2": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_3": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_4": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_6": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_7": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_p_1": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_greet": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_team": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3_1": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["mail_title", "div_top_status1", "div_top_status2",
            "p_greeting", "p_greeting_t1", "p_greeting_t2", 
            "order_info_1", "heading_order", "order_info_2", "order_info_3", "order_info_4", "order_info_5",
            "order_table_th_1", "order_table_th_2", "order_table_th_3", "order_table_th_4",
            "order_checkout_t_1", "order_checkout_t_2", "order_checkout_t_3", "order_checkout_t_4", "order_checkout_t_5",
            "order_checkout_t_6", "order_checkout_t_7","order_bottom_p_1", "order_bottom_greet", "order_bottom_team",
            "order_footer_1", "order_footer_1_1", "order_footer_2", "order_footer_2_1", 
            "order_footer_3", "order_footer_3_1"]
        }
    },
    "required":["name","language","data"]
}

var order_mail_Schema2 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [39,41,42]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "mail_title": {"$ref":"elt_def#/definitions/element"},
                "div_top_status1": {"$ref":"elt_def#/definitions/element"},
                "div_top_status2": {"$ref":"elt_def#/definitions/element"},
                "p_greeting": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t1": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t2": {"$ref":"elt_def#/definitions/element"},
                "order_info_1": {"$ref":"elt_def#/definitions/element"},
                "heading_order": {"$ref":"elt_def#/definitions/element"},
                "order_info_2": {"$ref":"elt_def#/definitions/element"},
                "order_info_3": {"$ref":"elt_def#/definitions/element"},
                "order_info_4": {"$ref":"elt_def#/definitions/element"},
                "order_info_5": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_1": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_2": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_3": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_4": {"$ref":"elt_def#/definitions/element"},
                "order_table_th_5": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_1": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_2": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_3": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_4": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_5": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_6": {"$ref":"elt_def#/definitions/element"},
                "order_checkout_t_7": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_p_1": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_team": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_greet": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3_1": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var order_mail_Schema3 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [43, 44]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "mail_title": {"$ref":"elt_def#/definitions/element"},
                "div_top_status1": {"$ref":"elt_def#/definitions/element"},
                "div_top_status2": {"$ref":"elt_def#/definitions/element"},
                "p_greeting": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t1": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t2": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_greet": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_team": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3_1": {"$ref":"elt_def#/definitions/element"}
            },
            "required":["mail_title", "div_top_status1", "div_top_status2",
            "p_greeting", "p_greeting_t1", "p_greeting_t2", 
            "order_bottom_greet", "order_bottom_team",
            "order_footer_1", "order_footer_1_1", "order_footer_2", "order_footer_2_1", 
            "order_footer_3", "order_footer_3_1"]
        }
    },
    "required":["name","language","data"]
}

var order_mail_Schema4 = {
    "type": "object",
    "properties":{
        "id": {"type": "integer", "enum": [43, 44]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties":{
                "mail_title": {"$ref":"elt_def#/definitions/element"},
                "div_top_status1": {"$ref":"elt_def#/definitions/element"},
                "div_top_status2": {"$ref":"elt_def#/definitions/element"},
                "p_greeting": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t1": {"$ref":"elt_def#/definitions/element"},
                "p_greeting_t2": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_team": {"$ref":"elt_def#/definitions/element"},
                "order_bottom_greet": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_1_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2": {"$ref":"elt_def#/definitions/element"},
                "order_footer_2_1": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3": {"$ref":"elt_def#/definitions/element"},
                "order_footer_3_1": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name","language","data"]
}

var routes_Schema3 = {
    "type": "object",
    "properties": {
        "id": {"type": "integer", "enum": [45]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties": {
                "/home": {"$ref":"elt_def#/definitions/element"},
                "/checkout": {"$ref":"elt_def#/definitions/element"},
                "/terms": {"$ref":"elt_def#/definitions/element"},
                "/about-us": {"$ref":"elt_def#/definitions/element"},
            },
            "required": ["/home", "/for-him", "/for-her", "/checkout-info", "/checkout-cart", "/checkout-address", 
                        "/checkout-payment", "/checkout-success", "/faq", "/terms", "/ask-us", "/about-us", 
                        "/our-mission", "/privacy-policy"],
            "additionalProperties": false
        }
    },
    "required":["name", "language", "data"]
};

var routes_Schema4 = {
    "type": "object",
    "properties": {
        "id": {"type": "integer", "enum": [45]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties": {
                "/home": {"$ref":"elt_def#/definitions/element"},
                "/for-him": {"$ref":"elt_def#/definitions/element"},
                "/for-her": {"$ref":"elt_def#/definitions/element"},
                "/checkout-info": {"$ref":"elt_def#/definitions/element"},
                "/checkout-cart": {"$ref":"elt_def#/definitions/element"},
                "/checkout-address": {"$ref":"elt_def#/definitions/element"},
                "/checkout-payment": {"$ref":"elt_def#/definitions/element"},
                "/checkout-success": {"$ref":"elt_def#/definitions/element"},
                "/faq": {"$ref":"elt_def#/definitions/element"},
                "/terms": {"$ref":"elt_def#/definitions/element"},
                "/ask-us": {"$ref":"elt_def#/definitions/element"},
                "/about-us": {"$ref":"elt_def#/definitions/element"},
                "/our-mission": {"$ref":"elt_def#/definitions/element"},
                "/privacy-policy": {"$ref":"elt_def#/definitions/element"}
            },
            "additionalProperties": false
        }
    },
    "required":["name", "language", "data"]
};

var choose_language_Schema1 = {
    "type": "object",
    "properties": {
        "id": {"type": "integer", "enum": [46]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties": {
                "c_title": {"$ref":"elt_def#/definitions/element"},
                "c_button": {"$ref":"elt_def#/definitions/element"},
                "c_title1": {"$ref":"elt_def#/definitions/element"},
                "c_sub_title": {"$ref":"elt_def#/definitions/element"},
            },
            "required": ["c_title", "c_button", "c_title1", "c_sub_title"],
            "additionalProperties": false
        }
    },
    "required":["name", "language", "data"]
};

var choose_language_Schema2 = {
    "type": "object",
    "properties": {
        "id": {"type": "integer", "enum": [46]},
        "name": {"type": "string"},
        "language": {"type": "string"},
        "data": {
            "type": "object",
            "properties": {
                "c_title": {"$ref":"elt_def#/definitions/element"},
                "c_button": {"$ref":"elt_def#/definitions/element"},
                "c_title1": {"$ref":"elt_def#/definitions/element"},
                "c_sub_title": {"$ref":"elt_def#/definitions/element"},
            },
            "additionalProperties": false
        }
    },
    "required":["name", "language", "data"]
};

var addSchemaArray = [defsSchema, header_Schema1, index_s1_Schema1, index_s2_Schema1, index_s3_Schema1,
                      index_s4_Schema1, index_s5_Schema1, index_s6_Schema1, index_s7_Schema1, index_s8_Schema1,
                      index_s9_Schema1, index_s10_Schema1, footer_Schema1, gender_s1_Schema1, gender_s2_Schema1, gender_s3_Schema1,
                      gender_s4_Schema1, gender_s7_Schema1, gender_s8_Schema1, shopping_header_Schema1, shopping_step1_Schema1,
                      shopping_step2_Schema1, shopping_step3_Schema1, shopping_step4_Schema1, terms_Schema1, popular_offers_Schema1,
                      faq_Schema1, links_Schema1, gender1_s1_Schema1, gender1_s2_Schema1, gender1_s3_Schema1,
                      gender1_s4_Schema1, gender1_s7_Schema1, gender1_s8_Schema1, main_Schema, privacy_policy_Schema1,
                      ask_us_Schema1, about_us_Schema1, our_mission_Schema1, order_mail_Schema1, meta_Schema1, order_mail_Schema1, 
                      order_mail_Schema1, order_mail_Schema3, order_mail_Schema3, routes_Schema3, choose_language_Schema1];

var editSchemaArray = [defsSchema, header_Schema2, index_s1_Schema2, index_s2_Schema2, index_s3_Schema2,
                        index_s4_Schema2, index_s5_Schema2, index_s6_Schema2, index_s7_Schema2, index_s8_Schema2,
                        index_s9_Schema2, index_s10_Schema2, footer_Schema2, gender_s1_Schema2, gender_s2_Schema2, gender_s3_Schema2,
                        gender_s4_Schema2, gender_s7_Schema2, gender_s8_Schema2, shopping_header_Schema2, shopping_step1_Schema2,
                        shopping_step2_Schema2, shopping_step3_Schema2, shopping_step4_Schema2, terms_Schema2, popular_offers_Schema2,
                        faq_Schema2, links_Schema2, gender1_s1_Schema2, gender1_s2_Schema2, gender1_s3_Schema2,
                        gender1_s4_Schema2, gender1_s7_Schema2, gender1_s8_Schema2, main_Schema, privacy_policy_Schema2,
                        ask_us_Schema2, about_us_Schema2, our_mission_Schema2, order_mail_Schema2, meta_Schema2, order_mail_Schema2,
                        order_mail_Schema2, order_mail_Schema4, order_mail_Schema4, routes_Schema4, choose_language_Schema2];

var T = {header:1,index_s1:2,index_s2:3,index_s3:4,index_s4:5,index_s5:6,index_s6:7,index_s7:8,index_s8:9,index_s9:10,index_s10:11,
         footer:12,gender_s1:13,gender_s2:14,gender_s3:15,gender_s4:16,gender_s7:17,gender_s8:18,shopping_header:19,shopping_step1:20,
         shopping_step2:21,shopping_step3:22,shopping_step4:23,terms:24,popular_offers:25,faq:26, links: 27, gender1_s1:28,
         gender1_s2:29, gender1_s3:30, gender1_s4:31, gender1_s7:32, gender1_s8:33, main:34, privacy_policy:35, ask_us:36,
         about_us:37, our_mission:38, order_complete_mail: 39, meta: 40, order_sent_mail: 41, order_canceled_mail: 42, 
         order_delivered_mail:43, order_before_delivered_mail: 44, routes_data:45, choose_language: 46};

var maxModulesCount = Object.keys(T).length;

var all_routes = ["/home",
"/terms",
"/checkout",
"/blog",
"/about-us",
"/all-ambasadors",
"/products",
"/contact",
"/private-cookies"];

var routes_Schema1 = {
    "type": "object",
    "properties": {
        "country": {"type": "string"},
        "langs": {
            "type": "array",
            "minItems": 1,
            "items":{
                "type": "string"
            }
        }
    },
    "required":["country", "langs"],
    "additionalProperties": false
};

var routes_Schema2 = {
    "type": "object",
    "properties": {
        "country": {"type": "string"},
        "lang": {"type": "string"},
        "data": {
            "type": "object",
            "properties": {
                "/home": {"type": "string"},
                "/for-him": {"type": "string"},
                "/for-her": {"type": "string"},
                "/checkout-info": {"type": "string"},
                "/checkout-cart": {"type": "string"},
                "/checkout-address": {"type": "string"},
                "/checkout-payment": {"type": "string"},
                "/checkout-success": {"type": "string"},
                "/faq": {"type": "string"},
                "/terms": {"type": "string"},
                "/ask-us": {"type": "string"},
                "/about-us": {"type": "string"},
                "/our-mission": {"type": "string"},
                "/privacy-policy": {"type": "string"}
            },
            "additionalProperties": false
        }
    },
    "required":["country", "lang", "data"]
};

module.exports={
    addSchemaArray: addSchemaArray,
    editSchemaArray: editSchemaArray,
    T:T,
    maxModulesCount: maxModulesCount,
    possible_routes: all_routes,
    routes_Schema1: routes_Schema1,
    routes_Schema2: routes_Schema2
}