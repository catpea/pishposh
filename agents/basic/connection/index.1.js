export default class Connection extends EventEmitter {

  constructor({ id, fromId, fromPortId, toId, toPortId }){

    this.id = id;

    this.fromId = fromId;
    this.fromPortId = fromPortId;

    this.toId = toId;
    this.toPortId = toPortId;

  }

  connect(){

  }

  disconnect(){

  }


}
