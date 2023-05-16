import { Component, OnInit } from '@angular/core';

import { Agent1 } from 'src/app/agents/agent1';
import { Agent2 } from 'src/app/agents/agent2';
import { Agent3 } from 'src/app/agents/agent3';
import { Agent4 } from 'src/app/agents/agent4';
import { SignalInterface } from 'src/app/agents/interfaces';

@Component({
  selector: 'app-sim-form',
  templateUrl: './sim-form.component.html',
  styleUrls: ['./sim-form.component.css']
})

export class SimFormComponent implements OnInit {

  // Parametros de la infraestructuras
  // Tamaño del depósito que almacena la lámina de agua
  metrosCubricosPorMetroAlturaLamina = 350;
  // Máximo bombeo de agua de las bombas por hora
  metrosCubricosPorHoraBomba = 100;
  minimoRangoTrabajoBomba = 0.7;
  
  // Parametros para simular la evolucion de la preisón
  // Altura a la que está ubicado el depósito
  alturaDeposito = 48;
  // Lámina de agua inicial
  laminaAguaInicial = 0.9;
  // Lo que puede llegar a bajar la presión cuando se consume agua
  constantePorCosumo = 15; 
  // Lo que puede llegar a subir la presión cuando se bombea agua al máximo de la potencia de las bombas
  constantePorBombeo = 15; 
  // Máximo consumo que se ha producido en las infraestructurtas
  consumoMaximo = 70;

  // Estado inicial de la señalas, lamina de agua 0,9 y presion igual a lámina de agua más altura, no hay consumo
  signals = {
    // entrada
    laminaAgua: this.laminaAguaInicial,
    aguaDesdeDeposito: 0,
    aguaDesdeBomba: 0,
    aguaHaciaDeposito: 0,
    presionAgua: this.alturaDeposito + this.laminaAguaInicial,
    // internas
    deseoLamina: 0,
    deseoInercia: 0,
    deseoPresion: 0,
    // salida
    influenciaMotor: 0,

    // estado bombas y cálculo de flujo 
    consumoCiudad: 0,
    estadoBombas: 0,
    estadoDeseadoBombas: 0,

  }

  word: SignalInterface[] = [];

  // Opciones de configuración del charts;
  // Merge son los valores que se irán añadiendo en la simulación
  merge: any = {
    xAxis: {
      data: [] = []
    },
    series: [
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
    ],
  };
  // Options marca los valores base del chart
  options: any = {

    legend: {
      data: ['laminaAgua', 'presionAgua', 'deseoL', 'deseoIner', 'deseoPres',
        'infMotor', 'consCalc', 'estadoBom', 'aguaDesDep', 'aguaDesBom', 'aguaHacDep']
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: [
      {
        name: 'Flujo(m³/s)/Presión mca',
        type: 'value'
      },
      {
        name: 'Deseo/Influencia/Altura agua',
        type: 'value'
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 1000
      },
      {
        start: 0,
        end: 1000
      }
    ],
    series: [
      {
        name: 'laminaAgua',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'presionAgua',
        type: 'line',
        yAxisIndex: 0,
        data: []
      },
      {
        name: 'deseoL',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'deseoIner',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'deseoPres',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'infMotor',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'consCalc',
        type: 'line',
        yAxisIndex: 0,
        data: []
      },
      {
        name: 'estadoBom',
        type: 'line',
        yAxisIndex: 1,
        data: []
      },
      {
        name: 'aguaDesDep',
        type: 'line',
        yAxisIndex: 0,
        data: []
      },
      {
        name: 'aguaDesBom',
        type: 'line',
        yAxisIndex: 0,
        data: []
      },
      {
        name: 'aguaHacDep',
        type: 'line',
        yAxisIndex: 0,
        data: []
      }
    ]
  };

  // Configuración de simulador
  timeoutID: any;
  timerActive: boolean = false;
  time = 100; // ms entre cada iteracion
  miliSegundosPorHora = 60 * 60 * 1000;  // 60 minutos * 60 segundos, en milisegundos
  tiempoCiclo = 1000 * 60 * 10; // tiempo que transcurre en cada ciclo, 10 minuto en milisegundos

  // Creamos los agentes
  agent1: Agent1 = new Agent1();
  agent2: Agent2 = new Agent2();
  agent3: Agent3 = new Agent3();
  agent4: Agent4 = new Agent4();

  constructor() {

  }

  ngOnInit() {

    this.valuesToOptions();

  }

  // Funciones para automatizar la generación de data
  start() {
    this.timerActive = true;
    this.timeoutID = setTimeout(() => {
      this.emitir();
      this.start();
    }, this.time)
  }

  stop() {
    this.timerActive = false;
    clearTimeout(this.timeoutID);
  }

  emitir() {
    // calculamos los flujos
    this.calcularFlujos();
    // Calculamos los agentes con el estado del mundo

    let res = this.agent1.percept(this.readWord());
    this.signals.deseoLamina = res[0].value;

    res = this.agent2.percept(this.readWord());
    this.signals.deseoInercia = res[0].value;

    res = this.agent3.percept(this.readWord());
    this.signals.deseoPresion = res[0].value;

    res = this.agent4.percept(this.readWord());
    this.signals.influenciaMotor = res[0].value;
    this.influirSobremotor();

    this.valuesToOptions();

  }

  influirSobremotor() {
    // Vemos el valor de influenciaMotor y cambiamos el estado del motor

    // La variable reactivo hace que sea más reactivo (proximo a 1) o menos reactivo (cercano a 0)
    let reaccion = 1;

    if (this.signals.influenciaMotor == 0) return; // no hay que hacer nada
    // Si queremos que pare y están encendidas
    if (this.signals.influenciaMotor < 0) {
      // calculamos cuanta potencia vamos a restar al motor
      let pow = Math.abs(reaccion * this.signals.influenciaMotor);
      this.signals.estadoDeseadoBombas = Math.max(this.signals.estadoDeseadoBombas - pow, 0);
    }
    // si queremos arrancar y está parado
    if (this.signals.influenciaMotor > 0) {
      let pow = Math.abs(reaccion * this.signals.influenciaMotor);
      this.signals.estadoDeseadoBombas = Math.min(this.signals.estadoDeseadoBombas + pow, 1);
    }
    // La bomba tiene un mínimo de trabajo
    if (this.signals.estadoDeseadoBombas < this.minimoRangoTrabajoBomba)
    {
      this.signals.estadoBombas = 0;
    } else {
      this.signals.estadoBombas = this.signals.estadoDeseadoBombas;
    }
    this.signals.estadoBombas = this.signals.estadoDeseadoBombas;
  }

  // Calcula los flujos desde depósito, hacia depósito y desde bomba en función del estado de la bomba y los consumos
  calcularFlujos() {
    // Si las bombas están encendidas, están generando agua, se calcula el agua que generan
    this.signals.aguaDesdeBomba = this.signals.estadoBombas * this.metrosCubricosPorHoraBomba;
    // Se calcula el total de consumo de las infraestructuras como el consumo de ciudad menos lo que produce las bombas
    let consumoInfraestructuras = this.signals.consumoCiudad - this.signals.aguaDesdeBomba;
    // Se establecen los valores de estas señañes
    if (consumoInfraestructuras > 0) {
      // Si se está consumiendo, sale agua desde el depósito
      this.signals.aguaDesdeDeposito = consumoInfraestructuras;
      this.signals.aguaHaciaDeposito = 0;
    } else {
      // Si no se está consumiendo, se está llenando el depósito
      this.signals.aguaDesdeDeposito = 0;
      this.signals.aguaHaciaDeposito = -consumoInfraestructuras;
    }

    // Calculamos el total de la altura

    let tiempo = this.tiempoCiclo / this.miliSegundosPorHora;
    let cambioMetros = (this.signals.aguaHaciaDeposito - this.signals.aguaDesdeDeposito) * tiempo
    let modificarLamina = cambioMetros / this.metrosCubricosPorMetroAlturaLamina;
       
    this.signals.laminaAgua += modificarLamina;
    console.log('Horas pasadas:',tiempo);
    console.log('cambioMetros:',cambioMetros);
    console.log('modificarLamina',modificarLamina );


    // simular la presión
    // la altura de la lámina del depósito más la altura del depósito
    // menos una presión en función del consumo
    // más una presilón en función del estado de bombeo
    this.signals.presionAgua = this.alturaDeposito +
      this.signals.laminaAgua +
      (this.signals.estadoBombas * this.constantePorBombeo)
      - Math.min(this.constantePorCosumo, this.constantePorCosumo * (this.signals.consumoCiudad / this.consumoMaximo))
  }

  // Convierte los valores del formulario en un objeto tenendible como señales para ser utilizado por los agentes
  readWord() {
    this.word = [];
    this.word.push({ name: 'laminaAgua', value: this.signals.laminaAgua });
    this.word.push({ name: 'deseoLamina', value: this.signals.deseoLamina });
    this.word.push({ name: 'deseoInercia', value: this.signals.deseoInercia });
    this.word.push({ name: 'deseoPresion', value: this.signals.deseoPresion });
    this.word.push({ name: 'influenciaMotor', value: this.signals.influenciaMotor });
    this.word.push({ name: 'consumoCiudad', value: this.signals.consumoCiudad });
    this.word.push({ name: 'estadoBombas', value: this.signals.estadoBombas });
    this.word.push({ name: 'presionAgua', value: this.signals.presionAgua });
    this.word.push({ name: 'aguaDesdeDeposito', value: this.signals.aguaDesdeDeposito });
    this.word.push({ name: 'aguaDesdeBomba', value: this.signals.aguaDesdeBomba });
    this.word.push({ name: 'aguaHaciaDeposito', value: this.signals.aguaHaciaDeposito });
    return this.word;
  }

  // Ingecta los valores del formulario en la gráfica
  valuesToOptions() {
    this.merge.xAxis.data.push(String(this.merge.xAxis.data.length + 1));
    this.merge.series[0].data.push(this.signals.laminaAgua);
    this.merge.series[1].data.push(this.signals.presionAgua);
    this.merge.series[2].data.push(this.signals.deseoLamina);
    this.merge.series[3].data.push(this.signals.deseoInercia);
    this.merge.series[4].data.push(this.signals.deseoPresion);
    this.merge.series[5].data.push(this.signals.influenciaMotor);
    this.merge.series[6].data.push(this.signals.consumoCiudad);
    this.merge.series[7].data.push(this.signals.estadoBombas);
    this.merge.series[8].data.push(this.signals.aguaDesdeDeposito);
    this.merge.series[9].data.push(this.signals.aguaDesdeBomba);
    this.merge.series[10].data.push(this.signals.aguaHaciaDeposito);
    this.refreshOptions();
  }

  // Refrescaa el chart
  refreshOptions() {
    // Modificamos el valor de options para que se actualice echars
    this.merge = JSON.parse(JSON.stringify(this.merge));
  }

}
