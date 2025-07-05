import { Signal } from "../../core/Signal.js";

export class SignalFieldGenerator {
  constructor() {
    this.supportedTypes = ["text", "email", "password", "number", "tel", "url", "search", "date", "datetime-local", "month", "week", "time", "checkbox", "radio", "range", "color", "file", "hidden", "submit", "reset", "button", "textarea", "select"];
  }

  generateFields(specifications){
    const fields = [];
    const signals = [];

    specifications.forEach((specification, index) => {
      const [field, signal] = this.createField(specification);
      fields.push(field);
      signals.push(signal);
    });

    return [fields, signals];

  }

  createField(field) {
    const { name, description, type, attributes = {} } = field;

    // Validate required fields
    if (!name || !type) {
      throw new Error(`Field name and type are required`);
    }

    // Validate type
    if (!this.supportedTypes.includes(type)) {
      throw new Error(`Field unsupported type "${type}"`);
    }

    // Create wrapper div for better organization
    const fieldWrapper = document.createElement("div");

    // Add description if provided
    if (description) {
      const desc = document.createElement("div");
      desc.className = "field-description";
      desc.textContent = description;
      fieldWrapper.appendChild(desc);
    }

    // Create label (except for hidden, submit, reset, button)
    const hiddenTypes = ["hidden", "submit", "reset", "button"];
    if (!hiddenTypes.includes(type)) {
      const label = document.createElement("label");
      label.setAttribute("for", name);
      label.textContent = this.formatLabel(name);
      fieldWrapper.appendChild(label);
    }

    // Create the input element
    const [element, signal] = this.createElement(type, name, attributes);
    fieldWrapper.appendChild(element);

    return [fieldWrapper, signal];
  }

  createElement(type, name, attributes) {
    let element;

    if (type === "textarea") {
      element = document.createElement("textarea");
    } else if (type === "select") {
      element = document.createElement("select");
      this.addSelectOptions(element, attributes.options || []);
    } else {
      element = document.createElement("input");
      element.setAttribute("type", type);
    }

    // Set name attribute
    element.setAttribute("name", name);
    element.setAttribute("id", name);

    // Apply all attributes
    this.applyAttributes(element, attributes, type);
    const signal = new Signal(element.value);
    element.addEventListener("input", function(event) {
      signal.name = name;
      signal.value = event.target.value;
    });
    return [element, signal];
  }

  applyAttributes(element, attributes, type) {
    Object.entries(attributes).forEach(([key, value]) => {
      // Skip special attributes handled separately
      if (key === "options") return;

      // Handle boolean attributes
      if (typeof value === "boolean") {
        if (value) {
          element.setAttribute(key, key);
        }
      } else {
        element.setAttribute(key, value);
      }
    });
  }

  addSelectOptions(selectElement, options) {
    options.forEach((option) => {
      const optionElement = document.createElement("option");

      if (typeof option === "string") {
        optionElement.setAttribute("value", option);
        optionElement.textContent = option;
      } else if (typeof option === "object") {
        optionElement.setAttribute("value", option.value || "");
        optionElement.textContent = option.text || option.value || "";

        // Apply other attributes
        Object.entries(option).forEach(([key, value]) => {
          if (key !== "value" && key !== "text") {
            optionElement.setAttribute(key, value);
          }
        });
      }

      selectElement.appendChild(optionElement);
    });
  }

  formatLabel(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1");
  }
}
