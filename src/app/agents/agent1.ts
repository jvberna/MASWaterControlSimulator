import { SignalInterface } from "./interfaces";

export class Agent1 {

    watchList:string[] = ['laminaAgua'];
    mu:number = 0.01;
    memory:SignalInterface[] = [];
    perception:SignalInterface[] = [];
    Dl=0;

    constructor() {

    }

    percept(mundo:SignalInterface[]){
        // Buscamos en el array las señales que nos interesan
        const intereses = mundo.filter(signal => this.watchList.includes(signal.name));

        // Si ha llegado alguna señal que nos interese la guardamos en percepcion y llamamos al resto de funciones
        if (intereses.length>0) {
            this.perception = JSON.parse(JSON.stringify(intereses));
            this.mem()
            this.decision();
            this.exec()
        }
        return ([{name:'deseoLamina', value:this.Dl}]) 
        
    }

    mem() {
        // calcular distancia y memorizar si distancia es grande
        let valueMemory=0, valuePerpection=0;
        this.memory.forEach(element => valueMemory += Math.abs(element.value));
        this.perception.forEach(element => valuePerpection += Math.abs(element.value));
        let distancia = Math.abs( valuePerpection - valueMemory )
        if ( distancia >= this.mu ) {
            this.memory = this.perception;
        }
    }

    decision() {
        let elem = this.perception.find(element => element.name == this.watchList[0]) || {name:this.watchList[0], value:0};
        let value = elem.value;
        if (value < 0.5) this.Dl = 1;
        if (0.5 <= value && value <= 0.6) this.Dl = (0.6 - value) * 10;
        if (0.6 < value && value < 0.9) this.Dl=0;
        if (0.9 <= value && value<= 1) this.Dl = (0.9 - value) * 10;
        if (value>1 ) this.Dl = -1;
    }

    exec() {
        // En este caso exec no hace nada pues simplemente hay que pasar el valor de Dl
    }


}