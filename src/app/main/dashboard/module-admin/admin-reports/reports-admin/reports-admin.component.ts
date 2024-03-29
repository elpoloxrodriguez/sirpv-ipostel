import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { ExcelService } from '@core/services/excel/excel.service'
import { UtilService } from '@core/services/util/util.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-reports-admin',
  templateUrl: './reports-admin.component.html',
  styleUrls: ['./reports-admin.component.scss']
})
export class ReportsAdminComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public ListReportEmpresasAprobadas = []
  public itemReports
  public statusEmpresa
  public ListReport = [
    { id: 1, name: 'Cantidad de Operadores Postales Privados (Registrados).' },
    { id: 2, name: 'Generar por mes la actividad y movimientos de los OPP.' },
    { id: 3, name: 'Mostrar la cantidad de empresas sub-contratadas y su actividad.' },
    { id: 4, name: 'Reporte de operadores por piezas.' },
    { id: 5, name: 'Reporte el día cuatro (04) hábil bancario de los OPP que no hayan realizado el Pago.' },
    { id: 6, name: 'Reporte el día cuatro (04) hábil bancario de los OPP que hayan realizado su Pago' },
    { id: 7, name: 'Historico Administrativo' },
  ]

  constructor(
    private excelservice: ExcelService,
    private apiService: ApiService,
    private utilservice: UtilService
  ) {}

  
  async ngOnInit() {
   
  }
  

  async ReportEmpresasAprobadas(id: any) {
    switch (this.itemReports) {
      case 1:
        this.sectionBlockUI.start('Generando Reporte, Porfavor Espere!!!');
        this.statusEmpresa = '1'
        this.xAPI.funcion = "IPOSTEL_R_OPP_Report";
        this.xAPI.parametros = this.statusEmpresa
        this.xAPI.valores = ''
        await this.apiService.Ejecutar(this.xAPI).subscribe(
          (data) => {
            data.Cuerpo.map(e => {
              this.ListReportEmpresasAprobadas.push(e);
            });
            this.itemReports = undefined
            this.exportAsXLSX(this.ListReportEmpresasAprobadas, 'Operadores Postales Privados')
            this.utilservice.alertConfirmMini('success', 'Archivo Descagado Exitosamente!')
            this.ListReportEmpresasAprobadas = []
            this.sectionBlockUI.stop();
          },
          (error) => {
            console.log(error)
          }
        )
        break;
      default:
        this.statusEmpresa = undefined
        break;
    }
  }

  exportAsXLSX(data: any, fileName: string) {
    this.excelservice.exportToExcel(data, fileName)
    this.utilservice.alertConfirmMini('success', 'Archivo Descagado Exitosamente!')
  }


}
