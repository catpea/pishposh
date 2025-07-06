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
    const { name, description, type, defaultValue, attributes = {} } = field;

    // Validate required fields
    if (!name || !type) throw new Error(`Field name and type are required`);


    // Validate type
    if (!this.supportedTypes.includes(type)) throw new Error(`Field unsupported type "${type}"`);


    // Create wrapper div for better organization
    const fieldContainer = document.createElement("div");

    // Add description if provided
    if (description) {
      const descriptionElement = document.createElement("div");
      descriptionElement.className = "field-description";
      descriptionElement.textContent = description;
      fieldContainer.appendChild(descriptionElement);
    }

    // Create label (except for hidden, submit, reset, button)
    const hiddenTypes = ["hidden", "submit", "reset", "button"];
    if (!hiddenTypes.includes(type)) {
      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", name);
      labelElement.textContent = this.formatLabel(name);
      fieldContainer.appendChild(labelElement);
    }

    // Create the input element
    const [element, signal] = this.createElement(fieldContainer, type, name, attributes);

    return [fieldContainer, signal];
  }

  createElement(fieldContainer, type, name, attributes) {

    let unsubscribe;

    let element;

    if (type === "textarea") {
      element = document.createElement("textarea");

    } else if (type === "select") {
      element = document.createElement("select");
      this.addSelectOptions(element, attributes.options || []);
    } else if (type === "checkbox") {
      element = document.createElement("input");
      element.setAttribute("type", type);
    } else {
      element = document.createElement("input");
      element.setAttribute("type", type);
    }

    const signal = new Signal(element.value);
    signal.identity = name;

    if (type === "checkbox" || type === "radio" ) {
      unsubscribe = signal.subscribe(v=>{
        if(v){
          element.setAttribute('checked', 'checked');
        }else{
          element.removeAttribute('checked');
        }
      });
    element.addEventListener("change", function(event) {
      signal.value = event.target.value;
    });
    }else{
      unsubscribe = signal.subscribe(v=>element.value = v);
      element.addEventListener("input", function(event) {
        signal.value = event.target.value;
      });
    }

    this.observeRemoval(fieldContainer, element, (removedNode) => {
      console.log('The target node has been removed:', removedNode);
      unsubscribe();
    });


    // Set name attribute
    element.setAttribute("name", name);
    element.setAttribute("id", name);

    // Apply all attributes
    this.applyAttributes(element, attributes, type);









    fieldContainer.appendChild(element);
    return [element, signal];
  }

  applyAttributes(element, attributes, type) {
    Object.entries(attributes).forEach(([key, value]) => {

      if (key === "options") return; // Skip special attributes handled separately
      if (key === "value") return;  // Skip value that is already taken care of
      if (key === "checked") return;  // Skip checked that is part of value

      // Handle boolean attributes
      if (typeof value === "boolean") {
        if (value) element.setAttribute(key, key);
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

  observeRemoval(parent, target, callback) {
      const config = { childList: true }; // Observe changes to child nodes

      const observer = new MutationObserver((mutationsList) => {
          for (let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  // Check if the target node has been removed
                  if (![...mutation.removedNodes].includes(target)) {
                      continue; // Target is still present
                  }

                  // Call the callback function with the target node
                  callback(target);

                  // Optionally disconnect the observer if you no longer need it
                  observer.disconnect();
              }
          }
      });

      observer.observe(parent, config);
  }
}
