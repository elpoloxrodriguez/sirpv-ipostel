import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { UtilService } from '@core/services/util/util.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jwt_decode from "jwt-decode";
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormBuilder } from '@angular/forms';
import { IPOSTEL_U_PagosDeclaracionOPP_SUB } from '@core/services/empresa/form-opp.service';

@Component({
  selector: 'app-list-payments',
  templateUrl: './list-payments.component.html',
  styleUrls: ['./list-payments.component.scss']
})
export class ListPaymentsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public ActualizarPago : IPOSTEL_U_PagosDeclaracionOPP_SUB = {
    status_pc: undefined,
    fecha_pc: '',
    id_banco_pc: undefined,
    referencia_bancaria: '',
    monto_pc: '',
    monto_pagar: '',
    dolar_dia: '',
    petro_dia: '',
    archivo_adjunto: undefined,
    observacion_pc: '',
    user_created: undefined,
    user_updated: undefined,
    id_pc: 0
  }
  
public idOPP
 public SelectBancos = []
 public SelectStatusConciliacion = [
  { id: '0', name:'En Revisión'},
  { id: "1", name:'No Liquidado'},
  { id: '2', name:'Pago Aprobado'},
  { id: '3', name:'Pago Rechazado'}
 ]
  
  public MontoTotalAdeudado : string = '0'
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public searchValue = '';

  public token
  public n_opp = 0
  public rowsPagosConciliacion
  public tempDataPagosConciliacion = []
  public List_Pagos_Recaudacion = []
  public TipoRegistro

  public title_modal
  public Mpagar
  public Mpc
  public NombreBancoEmisor
 public FechaPago

  constructor(
    private apiService: ApiService,
    private utilService: UtilService,
    private modalService: NgbModal,
    private router: Router,
    private _formBuilder: FormBuilder,

  ) { }

  async ngOnInit() {
    this.token = jwt_decode(sessionStorage.getItem('token'));
    this.idOPP = this.token.Usuario[0].id_opp
    await this.ListaBancosVzla()
    await this.ListaPagosRecaudacion()
  }

  async CapturarNav(event) {
    switch (event.target.id) {
      case 'ngb-nav-0':
        this.List_Pagos_Recaudacion = []
        this.n_opp = 0
        await this.ListaPagosRecaudacion()
        break;
      case 'ngb-nav-1':
        this.List_Pagos_Recaudacion = []
        this.n_opp = 1
        await this.ListaPagosRecaudacion()
        break;
        case 'ngb-nav-2':
          this.List_Pagos_Recaudacion = []
          this.n_opp = 3
          await this.ListaPagosRecaudacion()
          break;
          case 'ngb-nav-3':
            this.List_Pagos_Recaudacion = []
            this.n_opp = 2
            await this.ListaPagosRecaudacion()
            break;
      default:
        break;
    }
  }

  async ListaPagosRecaudacion() {
    this.xAPI.funcion = "IPOSTEL_R_Pagos_Conciliacion"
    this.xAPI.parametros = `${this.n_opp}`
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.List_Pagos_Recaudacion = []
        data.Cuerpo.map(e => {
          // console.log(e)
            if (e.monto_pc != '0.00' || e.monto_pagar == '0.00') {
            e.MontoPAGAR = e.monto_pagar
            e.MontoPC = e.monto_pc
            e.fecha_pc = this.utilService.FechaMomentL(e.fecha_pc)
            e.monto_pagar = this.utilService.ConvertirMoneda(e.monto_pagar)
            e.monto_pc = this.utilService.ConvertirMoneda(e.monto_pc)
            this.List_Pagos_Recaudacion.push(e) 
            } 
        });
        this.rowsPagosConciliacion = this.List_Pagos_Recaudacion;
        this.tempDataPagosConciliacion = this.rowsPagosConciliacion
        let MontoTotalA =  this.List_Pagos_Recaudacion.map(item => item.MontoPC).reduce((prev, curr) => parseFloat(prev) + parseFloat(curr), 0);
        this.MontoTotalAdeudado =  this.utilService.ConvertirMoneda(MontoTotalA)

      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ListaBancosVzla() {
    this.xAPI.funcion = "IPOSTEL_R_BancosVzla"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.SelectBancos = data.Cuerpo.map(e => {
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }


  filterUpdatePagos(event) {
    // Reset ng-select on search
    const val = event.target.value.toLowerCase();
    // Filter Our Data
    const temp = this.tempDataPagosConciliacion.filter(function (d) {
      return d.nombre_empresa.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Update The Rows
    this.rowsPagosConciliacion = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

  filterUpdatePagosNoLiquidados(event) {
    // Reset ng-select on search
    const val = event.target.value.toLowerCase();
    // Filter Our Data
    const temp = this.tempDataPagosConciliacion.filter(function (d) {
      return d.nombre_empresa.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Update The Rows
    this.rowsPagosConciliacion = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }


  dwUrl(ncontrol: string, archivo: string): string {
    // console.log(ncontrol,archivo);
    return this.apiService.Dws(btoa("D" + ncontrol) + '/' + archivo)
  }


  ConciliarPago(modal, data){
    console.log(data)
    this.title_modal = data.nombre_empresa
    this.NombreBancoEmisor = '('+ data.bzCodigo +') '+data.bzNombre
    this.FechaPago = this.utilService.FechaMomentLL(data.fecha_pc)
    this.ActualizarPago.status_pc = data.status_pc
    this.ActualizarPago.fecha_pc = data.fecha_pc
    this.ActualizarPago.id_banco_pc = data.id_banco_pc
    this.ActualizarPago.referencia_bancaria = data.referencia_bancaria
    this.ActualizarPago.monto_pc = data.MontoPC
    this.ActualizarPago.monto_pagar = data.MontoPAGAR
    this.ActualizarPago.dolar_dia = data.dolar_dia
    this.ActualizarPago.petro_dia = data.petro_dia
    this.ActualizarPago.archivo_adjunto = data.archivo_adjunto
    this.ActualizarPago.observacion_pc = data.observacion_pc
    this.ActualizarPago.user_created = data.id_opp
    this.ActualizarPago.user_updated = data.id_opp
    this.ActualizarPago.id_pc = data.id_pc
    this.Mpagar = this.utilService.ConvertirMoneda(data.MontoPAGAR)
    this.Mpc = this.utilService.ConvertirMoneda(data.MontoPC)
    
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async ConciliarPagoRecaudacion(){
    // console.log(this.ActualizarPago)
    this.xAPI.funcion = "IPOSTEL_U_PagosDeclaracionOPP_SUB"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.ActualizarPago)
    this.sectionBlockUI.start('Comprobando Pago, Porfavor Espere!!!');
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowsPagosConciliacion.push(this.List_Pagos_Recaudacion)
        if (data.tipo === 1) {
          this.List_Pagos_Recaudacion = []
          this.ListaPagosRecaudacion()
          this.modalService.dismissAll('Close')
          this.sectionBlockUI.stop()
          this.utilService.alertConfirmMini('success', 'Reporte Analizado Exitosamente!')
        } else {
          this.sectionBlockUI.stop();
          this.utilService.alertConfirmMini('error', 'Algo salio mal! <br> Verifique e intente de nuevo')
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

}

