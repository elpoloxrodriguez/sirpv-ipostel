import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService, DocumentoAdjunto, IAPICore } from '@core/services/apicore/api.service';
import { Router } from '@angular/router';
import { UtilService } from '@core/services/util/util.service';
import { NgbModal, NgbActiveModal, NgbModalConfig, NgbDateStruct, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { animate, style, transition, trigger } from '@angular/animations';
import { IPOSTEL_C_Peso_Envio_Franqueo } from '@core/services/empresa/form-opp.service';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';


export const repeaterAnimation = trigger('heightIn', [
  transition(':enter', [
    style({ opacity: '0', height: '0px' }),
    animate('.2s ease-out', style({ opacity: '1', height: '*' }))
  ])
]);

@Component({
  selector: 'app-price-table',
  templateUrl: './price-table.component.html',
  styleUrls: ['./price-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
  animations: [repeaterAnimation]
})
export class PriceTableComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public PesoEnvioFranqueo: IPOSTEL_C_Peso_Envio_Franqueo = {
    id_opp: 0,
    pmvp: '',
    descripcion: '',
    iva: '',
    tasa_postal: '',
    total_pagar: '',
    mes: '',
    id_servicio_franqueo: 0,
    user_created: 0
  }

  public itemsSelectMes = [
    {
      id: '0',
      name: 'Enero'
    },
    {
      id: '1',
      name: 'Febrero'
    },
    {
      id: '2',
      name: 'Marzo'
    },
    {
      id: '3',
      name: 'Abril'
    },
    {
      id: '4',
      name: 'Mayo'
    },
    {
      id: '5',
      name: 'Junio'
    },
    {
      id: '6',
      name: 'Julio'
    },
    {
      id: '7',
      name: 'Agosto'
    },
    {
      id: '8',
      name: 'Septiembre'
    },
    {
      id: '9',
      name: 'Ocubre'
    },
    {
      id: '10',
      name: 'Noviembre'
    },
    {
      id: '11',
      name: 'Diciembre'
    }
  ];

  public token
  public idOPP
  public fechax
  public fecha = new Date();
  public mes = this.fecha.getMonth() + 1;
  public anio = this.fecha.getFullYear();

  public items = [];
  public item = {
    id_opp: '',
    id_peso_envio: '',
    descripcion: '',
    pmvp: '',
    iva: '',
    tasa_postal: '',
    total_pagar: '',
    mes: '',
    id_servicio_franqueo: '',
    user_created: '',
  };

  public selectAnio = [
    { name: '2020' },
    { name: '2021' },
    { name: '2022' },
  ]

  public loginForm: FormGroup;

  public selectServicioFranqueo = []
  public itemsSelectPesoEnvio = []
  public rowsTarifaNacionalAereo
  public tempDataTarifasFranqueo = []
  public TarifasFranqueo = []

  public TarifasFranqueoAll = []
  public rowsTarifaFranqueoAll
  public tempDataTarifasFranqueoAll = []


  public montoIVA = 16
  public montoTASA
  public montoTASAnombre

  public ServicioFranqueoID = 1

  public selectedMes
  public sidebarToggleRef = false;
  public rows;
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public temp = [];
  public previousRoleFilter = '';
  public previousPlanFilter = '';
  public previousStatusFilter = '';
  public selectedRole = [];
  public selectedPlan = [];
  public selectedStatus = [];
  public searchValue = '';
  private tempData = [];
  private _unsubscribeAll: Subject<any>;


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
    await this.ListaTarifaNacionalAereo()
    await this.ListaPesoEnvio()
    await this.ListaServicioFranqueo()
    await this.ListaTarifasFranqueoAll()
    await this.TasaPostal(this.token.Usuario[0].tipologia_empresa, this.idOPP)
  }

  addItem() {
    this.items.push({
      id_opp: null,
      id_peso_envio: null,
      descripcion: null,
      pmvp: null,
      iva: null,
      tasa_postal: null,
      total_pagar: null,
      mes: null,
      id_servicio_franqueo: null,
      user_created: null,
    });
  }
  deleteItem(id) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items.indexOf(this.items[i]) === id) {
        this.items.splice(i, 1);
        break;
      }
    }
  }

  async TasaPostal(tipologia, id_opp){
    this.xAPI.funcion = "IPOSTEL_R_TasaPostal"
    this.xAPI.parametros = tipologia+','+id_opp
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map(e => {
          this.montoTASA = e.tasa_postal
          this.montoTASAnombre = e.nombre_tasa_postal
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async CapturarNav(event) {
    console.log(event.target.id);
    switch (event.target.id) {
      case 'ngb-nav-0':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 1
        await this.ListaTarifaNacionalAereo()
        break;
      case 'ngb-nav-1':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 2
        await this.ListaTarifaNacionalAereo()
        break;
      case 'ngb-nav-2':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 3
        await this.ListaTarifaNacionalAereo()
        break;
      case 'ngb-nav-3':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 4
        await this.ListaTarifaNacionalAereo()
        break;
      case 'ngb-nav-4':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 5
        await this.ListaTarifaNacionalAereo()
        break;
      case 'ngb-nav-5':
        this.TarifasFranqueo = []
        this.TarifasFranqueoAll = []
        this.ServicioFranqueoID = 6
        await this.ListaTarifaNacionalAereo()
        break;
      default:
        break;
    }
  }

  async ListaTarifaNacionalAereo() {
    const date = this.anio + '-' + this.mes
    const id = this.ServicioFranqueoID
    this.xAPI.funcion = "IPOSTEL_R_TarifasFranqueo_date_id"
    this.xAPI.parametros = this.idOPP + ',' + date + ',' + id
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map(e => {
          e.pmvp = this.utilService.ConvertirMoneda(e.pmvp);
          e.iva = this.utilService.ConvertirMoneda(e.iva);
          e.tasa_postal = this.utilService.ConvertirMoneda(e.tasa_postal);
          e.total_pagar = this.utilService.ConvertirMoneda(e.total_pagar);
          this.TarifasFranqueo.push(e)
        });
        this.rowsTarifaNacionalAereo = this.TarifasFranqueo;
        this.tempDataTarifasFranqueo = this.rowsTarifaNacionalAereo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ListaTarifasFranqueoAll() {
    this.xAPI.funcion = "IPOSTEL_R_TarifasFranqueo"
    this.xAPI.parametros = this.idOPP
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map(e => {
          e.pmvp = this.utilService.ConvertirMoneda(e.pmvp);
          e.iva = this.utilService.ConvertirMoneda(e.iva);
          e.tasa_postal = this.utilService.ConvertirMoneda(e.tasa_postal);
          e.total_pagar = this.utilService.ConvertirMoneda(e.total_pagar);
          this.TarifasFranqueoAll.push(e)
        });
        this.rows = this.TarifasFranqueoAll
        this.tempData = this.rows
        // this.rowsTarifaFranqueoAll = this.TarifasFranqueoAll;
        // this.tempDataTarifasFranqueoAll = this.rowsTarifaFranqueoAll
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ListaServicioFranqueo() {
    this.xAPI.funcion = "IPOSTEL_R_ServicioFranqueo";
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.selectServicioFranqueo = data.Cuerpo.map(e => {
          e.name = e.nombre_servicios_franqueo
          e.id = e.id_servicios_franqueo
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ListaPesoEnvio() {
    this.xAPI.funcion = "IPOSTEL_R_PesoEnvio";
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.itemsSelectPesoEnvio = data.Cuerpo.map(e => {
          e.name = e.nombre_peso_envio
          e.id = e.id_peso_envio
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ModalRegistrarTarifaEnvio(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
    this.fechax = ''
    this.items.splice(0);
    this.items.push([{
      id_opp: '',
      id_peso_envio: '',
      descripcion: '',
      pmvp: '',
      iva: '',
      tasa_postal: '',
      total_pagar: '',
      mes: '',
      id_servicio_franqueo: '',
      user_created: ''
    }]);
  }

  async RegistrarTarifaNacionalAereo() {
    for (let index = 0; index < this.items.length; index++) {
      const element = this.items[index];
      const iva = element.pmvp * this.montoIVA / 100
      const tasa = element.pmvp * this.montoTASA / 100
      const total = element.pmvp + iva + tasa
      this.PesoEnvioFranqueo.id_opp = this.idOPP
      this.PesoEnvioFranqueo.pmvp = element.pmvp
      this.PesoEnvioFranqueo.id_peso_envio = parseInt(element.id_peso_envio)
      this.PesoEnvioFranqueo.descripcion = element.descripcion
      this.PesoEnvioFranqueo.iva = parseFloat(iva.toFixed(2))
      this.PesoEnvioFranqueo.tasa_postal = parseFloat(tasa.toFixed(2))
      this.PesoEnvioFranqueo.total_pagar = parseFloat(total.toFixed(2))
      this.PesoEnvioFranqueo.mes = this.fechax
      this.PesoEnvioFranqueo.id_servicio_franqueo = this.ServicioFranqueoID
      this.PesoEnvioFranqueo.user_created = this.idOPP
      this.xAPI.funcion = "IPOSTEL_C_Peso_Envio_Franqueo"
      this.xAPI.parametros = ''
      this.xAPI.valores = JSON.stringify(this.PesoEnvioFranqueo)
      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.sectionBlockUI.start('Guardando Registros, Porfavor Espere!!!');
          this.rowsTarifaNacionalAereo.push(this.TarifasFranqueo)
          if (data.tipo === 1) {
            this.TarifasFranqueo = []
            this.TarifasFranqueoAll = []
            this.ListaTarifaNacionalAereo()
            this.ListaTarifasFranqueoAll()
            this.modalService.dismissAll('Close')
            this.sectionBlockUI.stop()
            this.utilService.alertConfirmMini('success', 'Tarifas Registradas Exitosamente!')
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

  async DeleteTarifaNacionalAereo(data: any) {
    await Swal.fire({
      title: 'Esta Seguro?',
      text: "De Eliminar Este Registro!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.xAPI.funcion = "IPOSTEL_D_TarifasFranqueo";
        this.xAPI.parametros = data.id_pef
        this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          (data) => {
            this.rowsTarifaNacionalAereo.push(this.TarifasFranqueo)
            if (data.tipo === 1) {
              this.utilService.alertConfirmMini('success', 'Registro Eliminado Exitosamente')
              this.TarifasFranqueo = []
              this.TarifasFranqueoAll = []
              this.ListaTarifaNacionalAereo()
              this.ListaTarifasFranqueoAll()  
            } else {
              this.utilService.alertConfirmMini('error', 'Lo sentimos algo salio mal, intente de nuevo')
            }
          },
          (error) => {
            console.log(error)
          }
        )
      }
    })
  }

  filterUpdateTarifaNacionalAereo(event) {
    // Reset ng-select on search
    const val = event.target.value.toLowerCase();
    // Filter Our Data
    const temp = this.tempDataTarifasFranqueo.filter(function (d) {
      return d.nombre_peso_envio.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Update The Rows
    this.rowsTarifaNacionalAereo = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }



  filterUpdate(event) {
    // Reset ng-select on search
    this.selectedRole = this.selectedMes[0];
    this.selectedPlan = this.selectServicioFranqueo[0];
    this.selectedStatus = this.itemsSelectPesoEnvio[0];

    const val = event.target.value.toLowerCase();

    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.nombre_peso_envio.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Update The Rows
    this.rows = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

  filterByFecha(event) {
    console.log(event)
    const filter = event ? event : '';
    this.previousRoleFilter = filter;
    this.temp = this.filterRows(filter, this.previousPlanFilter, this.previousStatusFilter);
    this.rows = this.temp;
  }

  filterByServicio(event) {
    const filter = event ? event.nombre_servicios_franqueo : '';
    this.previousPlanFilter = filter;
    this.temp = this.filterRows(this.previousRoleFilter, filter, this.previousStatusFilter);
    this.rows = this.temp;
  }

  filterByPeso(event) {
    const filter = event ? event.nombre_peso_envio : '';
    this.previousStatusFilter = filter;
    this.temp = this.filterRows(this.previousRoleFilter, this.previousPlanFilter, filter);
    this.rows = this.temp;
  }

  filterRows(roleFilter, planFilter, statusFilter): any[] {
    // Reset search on select change
    this.searchValue = '';

    roleFilter = roleFilter.toLowerCase();
    planFilter = planFilter.toLowerCase();
    statusFilter = statusFilter.toLowerCase();

    return this.tempData.filter(row => {
      const isPartialNameMatch = row.mes.indexOf(roleFilter) !== -1 || !roleFilter;
      const isPartialGenderMatch = row.nombre_servicios_franqueo.toLowerCase().indexOf(planFilter) !== -1 || !planFilter;
      const isPartialStatusMatch = row.nombre_peso_envio.toLowerCase().indexOf(statusFilter) !== -1 || !statusFilter;
      return isPartialNameMatch && isPartialGenderMatch && isPartialStatusMatch;
    });
  }



}


