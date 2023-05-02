import { SignalInterface } from "./interfaces";

export class Agent2 {

    watchList:string[] = ['aguaDesdeDeposito', 'aguaDesdeBomba', 'aguaHaciaDeposito','consumoCalculado'];
    mu:number = 0.5;
    memory:SignalInterface[] = [];
    perception:SignalInterface[] = [];
    Di=0;

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
        return ([{name:'deseoInercia', value:this.Di}]) 
        
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
        // Nos quedamos con el consumo calculado
        let elem = this.perception.find(element => element.name == this.watchList[3]) || {name:this.watchList[3], value:0};
        let value = elem.value;
        if (value < 45) this.Di = 0;
        if (45 <= value && value <= 50) this.Di = -(value - 45) / 5;
        if (value > 50 ) this.Di = -1;
    }

    exec() {
        // En este caso exec no hace nada pues simplemente hay que pasar el valor de Dl
    }


}