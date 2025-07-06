import { Signal } from "../../core/Signal.js";

export class SignalFieldGenerator {
  constructor() {
    this.supportedTypes = ["text", "email", "password", "number", "tel", "url", "search", "date", "datetime-local", "month", "week", "time", "checkbox", "radio", "range", "color", "file", "hidden", "submit", "reset", "button", "textarea", "select"];
  }

  generateFields(specifications) {
    const containers = [];
    const signals = [];

    specifications.forEach((specification, index) => {
      const [container, signal] = this.createField(specification);

      containers.push(container);
      signals.push(signal);
    });

    return [containers, signals];
  }

  createField(field) {
    const { name, description, type, defaultValue, attributes = {} } = field;

    // Validate required fields
    if (!name || !type) throw new Error(`Field name and type are required`);

    // Validate type
    if (!this.supportedTypes.includes(type)) throw new Error(`Field unsupported type "${type}"`);

    // Create wrapper div for better organization
    const fieldContainer = document.createElement("div");
    fieldContainer.classList.add('form-row');



    // Create label (except for hidden, submit, reset, button)
    const hiddenTypes = ["hidden", "submit", "reset", "button"];
    if (!hiddenTypes.includes(type)) {
      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", name);
      labelElement.textContent = this.formatLabel(name);
      fieldContainer.appendChild(labelElement);
    }

    // Create the appropriate field type
    const [element, signal] = this.createElementByType(fieldContainer, type, name, attributes);

    // Add description if provided
    if (description) {
      const descriptionElement = document.createElement("div");
      descriptionElement.className = "field-description";
      descriptionElement.textContent = description;
      fieldContainer.appendChild(descriptionElement);
    }

    return [fieldContainer, signal];
  }

  createElementByType(fieldContainer, type, name, attributes) {
    switch (type) {
      case "textarea":
        return this.createTextareaField(fieldContainer, name, attributes);
      case "select":
        return this.createSelectField(fieldContainer, name, attributes);
      case "checkbox":
        return this.createCheckboxField(fieldContainer, name, attributes);
      case "radio":
        return this.createRadioField(fieldContainer, name, attributes);
      case "hidden":
        return this.createHiddenField(fieldContainer, name, attributes);
      // case "submit":
      //   return this.createSubmitField(fieldContainer, name, attributes);
      // case "reset":
      //   return this.createResetField(fieldContainer, name, attributes);
      // case "button":
      //   return this.createButtonField(fieldContainer, name, attributes);
      case "file":
        return this.createFileField(fieldContainer, name, attributes);
      case "range":
        return this.createRangeField(fieldContainer, name, attributes);
      case "color":
        return this.createColorField(fieldContainer, name, attributes);
      default:
        return this.createStandardInputField(fieldContainer, type, name, attributes);
    }
  }

  createTextareaField(fieldContainer, name, attributes) {
    const element = document.createElement("textarea");
    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("input", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createSelectField(fieldContainer, name, attributes) {
    const element = document.createElement("select");
    const signal = new Signal();
    signal.identity = name;

    this.addSelectOptions(element, attributes.options || []);

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("change", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createCheckboxField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "checkbox");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => {
      if (v) {
        element.setAttribute('checked', 'checked');
      } else {
        element.removeAttribute('checked');
      }
    });

    element.addEventListener("change", function(event) {
      signal.value = event.target.checked;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createRadioField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "radio");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => {
      if (v) {
        element.setAttribute('checked', 'checked');
      } else {
        element.removeAttribute('checked');
      }
    });

    element.addEventListener("change", function(event) {
      signal.value = event.target.checked;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createHiddenField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "hidden");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("input", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  // createSubmitField(fieldContainer, name, attributes) {
  //   const element = document.createElement("input");
  //   element.setAttribute("type", "submit");

  //   const signal = new Signal();
  //   signal.identity = name;

  //   const unsubscribe = signal.subscribe(v => element.value = v);

  //   this.setupFieldCleanup(fieldContainer, element, unsubscribe);
  //   this.setBasicAttributes(element, name);
  //   this.applyAttributes(element, attributes);

  //   fieldContainer.appendChild(element);
  //   return [element, signal];
  // }

  // createResetField(fieldContainer, name, attributes) {
  //   const element = document.createElement("input");
  //   element.setAttribute("type", "reset");

  //   const signal = new Signal(element.value);
  //   signal.identity = name;

  //   const unsubscribe = signal.subscribe(v => element.value = v);

  //   this.setupFieldCleanup(fieldContainer, element, unsubscribe);
  //   this.setBasicAttributes(element, name);
  //   this.applyAttributes(element, attributes);

  //   fieldContainer.appendChild(element);
  //   return [element, signal];
  // }

  // createButtonField(fieldContainer, name, attributes) {
  //   const element = document.createElement("input");
  //   element.setAttribute("type", "button");

  //   const signal = new Signal(element.value);
  //   signal.identity = name;

  //   const unsubscribe = signal.subscribe(v => element.value = v);

  //   this.setupFieldCleanup(fieldContainer, element, unsubscribe);
  //   this.setBasicAttributes(element, name);
  //   this.applyAttributes(element, attributes);

  //   fieldContainer.appendChild(element);
  //   return [element, signal];
  // }

  createFileField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "file");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => {
      // File inputs are read-only from the value perspective
      // We can't programmatically set files for security reasons
    });

    element.addEventListener("change", function(event) {
      signal.value = event.target.files;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createRangeField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "range");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("input", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createColorField(fieldContainer, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", "color");

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("input", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  createStandardInputField(fieldContainer, type, name, attributes) {
    const element = document.createElement("input");
    element.setAttribute("type", type);

    const signal = new Signal();
    signal.identity = name;

    const unsubscribe = signal.subscribe(v => element.value = v);

    element.addEventListener("input", function(event) {
      signal.value = event.target.value;
    });

    this.setupFieldCleanup(fieldContainer, element, unsubscribe);
    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal];
  }

  // Helper methods
  setBasicAttributes(element, name) {
    element.setAttribute("name", name);
    element.setAttribute("id", name);
  }

  setupFieldCleanup(fieldContainer, element, unsubscribe) {
    this.observeRemoval(fieldContainer, element, (removedNode) => {
      console.log('The target node has been removed:', removedNode);
      unsubscribe();
    });
  }

  applyAttributes(element, attributes) {
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
