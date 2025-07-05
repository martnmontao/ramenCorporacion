import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { GraficosService } from 'src/app/servicios/graficos.service';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BaseChartDirective} from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-estadisticas-encuesta',
  imports:[ CommonModule,
    FormsModule,
    IonicModule,
    BaseChartDirective],
  templateUrl: './estadisticas-encuesta.page.html',
  styleUrls: ['./estadisticas-encuesta.page.scss'],
  standalone:true,
})
export class EstadisticasEncuestaPage implements OnInit {

  @Input() tipoEncuesta: 'cliente' | 'empleado' = 'cliente';

  rangoPromedio: number = 0;
  selectData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  selectOptions: ChartConfiguration<'pie'>['options'] = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};
  checkboxData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  radioData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

  rangoEsTexto:any;
  rangoFrecuencias:any;
  
  constructor(private firebase: FirebaseService, private graficos: GraficosService) { }

  ngOnInit(): void {
    this.firebase.getEncuestas().subscribe(encuestas => {
      const encuestasFiltradas = encuestas.filter(e => e.tipo === this.tipoEncuesta);
      const estadisticas = this.graficos.obtenerEstadisticas(encuestasFiltradas);

      this.rangoEsTexto = estadisticas.rango.esTexto;
      this.rangoFrecuencias = estadisticas.rango.frecuencias;
      this.rangoPromedio = estadisticas.rango.promedio;

      this.radioData = {
        labels: Object.keys(estadisticas.radio),
        datasets: [{
          label: 'Radios',
          data: Object.values(estadisticas.radio),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      };

      this.selectData = { labels: Object.keys(estadisticas.select),
      datasets:[{
      label: 'Respuestas',
      data: Object.values(estadisticas.select),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]};

      this.checkboxData = { labels: Object.keys(estadisticas.checkbox), 
      datasets:[{
      label: 'Selecciones',
      data: Object.values(estadisticas.checkbox),
      backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB']
      }]};
    });
  }

}
