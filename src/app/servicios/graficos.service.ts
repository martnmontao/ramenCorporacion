import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraficosService {

  constructor() { }

  obtenerEstadisticas(encuestas:any){
    const estadisticas: any = {
      rango: {
        total: 0,
        suma: 0,
        promedio: 0
      },
      select: {},
      input: [],
      checkbox: {},
      radio: {}
    };

    encuestas.forEach((encuesta: any) => {
      if(encuesta.preguntaRange !== undefined){
        estadisticas.rango.total++;
        estadisticas.rango.suma += encuesta.preguntaRange;
      }

      const seleccion = encuesta.preguntaSelect;
      if(seleccion){
        estadisticas.select[seleccion] = (estadisticas.select[seleccion] || 0) + 1;
      }

      const respuestaRadio = encuesta.preguntaRdo;
      if (respuestaRadio) {
        estadisticas.radio[respuestaRadio] = (estadisticas.radio[respuestaRadio] || 0) + 1;
      }

      if(encuesta.preguntaInput){
        estadisticas.input.push(encuesta.preguntaInput);
      }

      const checks = encuesta.preguntaChk;
      if(checks){
        Object.keys(checks).forEach(key => {
          if (checks[key]){
            estadisticas.checkbox[key] = (estadisticas.checkbox[key] || 0) + 1;
          }
        });
      }
    });

    if(estadisticas.rango.total > 0){
      estadisticas.rango.promedio = estadisticas.rango.suma / estadisticas.rango.total;
    }

    return estadisticas;

  }



}
