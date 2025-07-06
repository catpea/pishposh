import { Signal } from "../../core/Signal.js";

export class SignalFieldGenerator {
  constructor() {
    this.supportedTypes = ["text", "email", "password", "number", "tel", "url", "search", "date", "datetime-local", "month", "week", "time", "checkbox", "radio", "range", "color", "file", "hidden", "submit", "reset", "button", "textarea", "select"];
  }

  generateFields(specifications) {
    const containers = [];
    const signals = [];
    const unsubscriptions = [];

    specifications.forEach((specification, index) => {

      if(specification.type == 'hidden') return;

      const [container, signal, unsubscribe] = this.createField(specification);
      containers.push(container);
      signals.push(signal);
      unsubscriptions.push(...unsubscribe);
    });

    return [containers, signals, unsubscriptions];
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
    const [element, signal, unsubscribe] = this.createElementByType(fieldContainer, type, name, attributes);

    // Add description if provided
    if (description) {
      const descriptionElement = document.createElement("div");
      descriptionElement.className = "field-description";
      descriptionElement.textContent = description;
      fieldContainer.appendChild(descriptionElement);
    }

    return [fieldContainer, signal, unsubscribe];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
  }

  // createSubmitField(fieldContainer, name, attributes) {
  //   const element = document.createElement("input");
  //   element.setAttribute("type", "submit");

  //   const signal = new Signal();
  //   signal.identity = name;

  //   const unsubscribe = signal.subscribe(v => element.value = v);

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

    // re: unsubscribe > File inputs are read-only from the value perspective. We can't programmatically set files for security reasons.

    element.addEventListener("change", function(event) {
      signal.value = event.target.files;
    });

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, []];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
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

    this.setBasicAttributes(element, name);
    this.applyAttributes(element, attributes);

    fieldContainer.appendChild(element);
    return [element, signal, [unsubscribe]];
  }

  // Helper methods
  setBasicAttributes(element, name) {
    element.setAttribute("name", name);
    element.setAttribute("id", name);
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









export class PropertiesForm {

  constructor(device, manifest, database, target){
    this.subscriptions = new Set();

    this.device = device;
    this.manifest = manifest;
    this.database = database;
    this.target = target;

    this.spawn();
  }

  spawn(){

    const generator = new SignalFieldGenerator();

    const [elements, signals, unsubscriptions] = generator.generateFields(this.manifest.node.properties);

    for(const element of elements){
      this.target.appendChild(element);
    }

    unsubscriptions.forEach(subscription=>this.subscriptions.add(subscription));

    // signals
    const selectedStationRecord = this.database.records.get(this.device.id);

    for(const fieldSignal of signals){
      const propertyName = fieldSignal.identity;

      // Pass existing value from the record to the UI
      if(selectedStationRecord[propertyName]) fieldSignal.value = selectedStationRecord[propertyName];

      // When the UI artefact changes value
      fieldSignal.subscribe(value=>{
        const activeRecord = this.database.records.get(this.device.id);
        // assign that value to the appropriate record field
        activeRecord[propertyName] = value;
        // store the updated record in the database.
        this.database.records.set(this.device.id, activeRecord);
        console.log(`activeRecord: Updated database record ${this.device.id}/${propertyName}`, value)
      });

    }

  }


  terminate(){

    // first terminate all signals
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();

    // then remove elements
    this.target.replaceChildren();

  }
}
