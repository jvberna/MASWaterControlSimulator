import { SignalInterface } from "./interfaces";

export class Agent4 {

    watchList:string[] = ['deseoLamina','deseoInercia','deseoPresion'];
    mu:number = 0.1;
    memory:SignalInterface[] = [];
    perception:SignalInterface[] = [];
    Im=0;

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
        return ([{name:'influenciaMotor', value:this.Im}]) 
        
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
        let Dl = this.perception.find(element => element.name == this.watchList[0]) || {name:this.watchList[0], value:0};
        let Di = this.perception.find(element => element.name == this.watchList[1]) || {name:this.watchList[1], value:0};
        let Dp = this.perception.find(element => element.name == this.watchList[2]) || {name:this.watchList[2], value:0};
        let ponderar = [0.5, 0.3, 0.2]
        this.Im = Dl.value * ponderar[0] + Di.value * ponderar[1] + Dp.value * ponderar[2]
    }

    exec() {
        // En este caso exec no hace nada pues simplemente hay que pasar el valor de Dl
    }


}