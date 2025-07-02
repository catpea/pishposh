import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../../core/Signal.js";

export class Connection {

  // this allows for this[name] access
  #signalStorage = {};

  #defaults = {
    fromId:0,
    toId:0,
    startLabel: 'output>',
    centerLabel: 'connection',
    endLabel:'input>',
    agentType: 'basic/pass-through',
  };

  #acceptable = [
    'id','fromId','toId','startLabel','centerLabel','endLabel','agentType'
  ];

  #serializable = [
    'id','fromId','toId','startLabel','centerLabel','endLabel','agentType'
  ]

  constructor(configure) {
    const enriched = Object.assign({}, this.#defaults, configure );
    const picked = this.#pick(this.#acceptable, enriched);
    this.setup(picked);
  }

  // reusable creator used by deserializer and constructor
  setup(options){

    this.#signalStorage.id = new Signal(options.id??rid());

    this.#signalStorage.fromId = new Signal(options.fromId);
    this.#signalStorage.toId = new Signal(options.toId);
    this.#signalStorage.startLabel = new Signal(options.startLabel);
    this.#signalStorage.centerLabel = new Signal(options.centerLabel);
    this.#signalStorage.endLabel = new Signal(options.endLabel);
    this.#signalStorage.agentType = new Signal(options.agentType);

  }

  entries(){
    return this.#serializable.map(key=>[key, this.get(key)])
  }

  deserialize(data){
    const picked = this.#pick(this.#acceptable, data);
    this.setup(picked);
  }

  serialize(){
    const picked = this.#pick(this.#serializable, this);
    return picked
  }

  // Ease Of Access  'id','fromId','toId','startLabel','centerLabel','endLabel','agentType'

  get id(){ return this.#signalStorage.id.value; } // hidden, unless asked

  get fromId(){ return this.#signalStorage.fromId.value; }
  set fromId(v){ this.#signalStorage.fromId.value = v; }

  get toId(){ return this.#signalStorage.toId.value; }
  set toId(v){ this.#signalStorage.toId.value = v; }

  get startLabel(){ return this.#signalStorage.startLabel.value; }
  set startLabel(v){ this.#signalStorage.startLabel.value = v; }

  get centerLabel(){ return this.#signalStorage.centerLabel.value; }
  set centerLabel(v){ this.#signalStorage.centerLabel.value = v; }

  get endLabel(){ return this.#signalStorage.endLabel.value; }
  set endLabel(v){ this.#signalStorage.endLabel.value = v; }

  get agentType(){ return this.#signalStorage.agentType.value; }
  set agentType(v){ this.#signalStorage.agentType.value = v; }

  get signals(){ return this.#signalStorage; } // station5.signals access

  get(name){
    return this.#signalStorage[name].value;
  }

  set(name, value){
    this.#signalStorage[name].value = value;
  }

  // Subscription Tools

  signal(name, subscriber){ // station6('x', fn)
    return this.#signalStorage[name].subscribe(subscriber);
  }

  subscribe(subscriber){
    return namedCombineLatest(this.#signalStorage).subscribe(subscriber);
  }

  get stream(){
    return namedCombineLatest(this.#signalStorage);
  }

  // Helper & Utility Functions
  #pick(keys, data){
    const entries = (data.entries?data.entries():Object.entries(data));
    const cleared = entries.filter(([k,v])=>keys.includes(k));
    return Object.fromEntries(cleared);
  }

}
