export const inputTypes = [
    {
        type: "text",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "password",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "email",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            },
            {
                name: "multiple",
                description: "Allows multiple email addresses to be entered.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "url",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "tel",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "number",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum value allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum value allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "step",
                description: "The legal number intervals.",
                dataType: "Number",
                defaultValue: "1",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "range",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum value allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum value allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "step",
                description: "The legal number intervals.",
                dataType: "Number",
                defaultValue: "1",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "date",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Date is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum date allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum date allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "time",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Time is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "datetime-local",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Date and time are typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum date and time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum date and time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "month",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Month is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum month allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum month allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "week",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Week is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum week allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum week allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "color",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current color value in hex format.",
                dataType: "String",
                defaultValue: "#000000",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "checkbox",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The value associated with the checkbox.",
                dataType: "String",
                defaultValue: "on",
                userValue: ""
            },
            {
                name: "checked",
                description: "Indicates whether the checkbox is checked.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "datetime-local",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Date and time are typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum date and time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum date and time allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "month",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Month is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum month allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum month allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "week",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String", // Week is typically represented as a string in HTML
                defaultValue: "",
                userValue: ""
            },
            {
                name: "min",
                description: "The minimum week allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "max",
                description: "The maximum week allowed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "color",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current color value in hex format.",
                dataType: "String",
                defaultValue: "#000000",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "checkbox",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The value associated with the checkbox.",
                dataType: "String",
                defaultValue: "on",
                userValue: ""
            },
            {
                name: "checked",
                description: "Indicates whether the checkbox is checked.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "radio",
        attributes: [
            {
                name: "name",
                description: "The name of the input field, used to group radio buttons.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The value associated with the selected radio button.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "checked",
                description: "Indicates whether the radio button is selected.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether at least one radio button in the group is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "file",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "accept",
                description: "Specifies the types of files that are accepted.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "multiple",
                description: "Allows multiple files to be selected.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            },
            {
                name: "required",
                description: "Indicates whether the input is required.",
                dataType: "Boolean",
                defaultValue: "false",
                userValue: ""
            }
        ]
    },
    {
        type: "hidden",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The value of the hidden input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            }
        ]
    },
    {
        type: "search",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The current value of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "placeholder",
                description: "A short hint that describes the expected value.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "maxlength",
                description: "The maximum number of characters allowed.",
                dataType: "Number",
                defaultValue: "",
                userValue: ""
            }
        ]
    },
    {
        type: "image",
        attributes: [
            {
                name: "src",
                description: "The URL of the image to be displayed.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "alt",
                description: "Alternative text for the image.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The value associated with the image button.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            }
        ]
    },
    {
        type: "submit",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The text displayed on the button.",
                dataType: "String",
                defaultValue: "Submit",
                userValue: ""
            }
        ]
    },
    {
        type: "reset",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The text displayed on the button.",
                dataType: "String",
                defaultValue: "Reset",
                userValue: ""
            }
        ]
    },
    {
        type: "button",
        attributes: [
            {
                name: "name",
                description: "The name of the input field.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            },
            {
                name: "value",
                description: "The text displayed on the button.",
                dataType: "String",
                defaultValue: "",
                userValue: ""
            }
        ]
    }
];
