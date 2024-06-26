//Amaranny correo: anyoh2003@gmail.com

import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule , FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Alumno, crearAlumno } from '../models/Alumno';
import { LocalStorageService } from '../local-storage.service';
import { DatosEmpresa } from '../models/DatosEmpresa';
import { getLocaleDirection } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DatePipe } from '@angular/common';
import { Proyecto } from '../models/Proyecto';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DatabaseService } from '../database.service';
import { Empresa } from '../models/Empresa';
import { Ubicacion } from '../models/Ubicacion';
import { Estancias } from '../models/Estancias';
import { EstanciasService } from '../../service/estancias.service';
//import { Alumno } from '../models/Alumno';


@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [ReactiveFormsModule, MatDatepickerModule,MatNativeDateModule,MatInputModule],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.css',

  providers: [DatePipe,MatDatepickerModule, MatNativeDateModule]
})
export class SolicitudComponent implements OnInit{
  info: FormGroup;
  isSubmitted = false;
  inputsDisabled = false;
  selectedEmpresaId: number | null = null;
  empresas:Empresa[]=[];
  proyectos: Proyecto[] = [];  // todos los proyectos activos
  proyectosFiltrados: Proyecto[] = [];  // proyectos filtrados por empresa
  estado=false;
  private allDatosEmpresas: DatosEmpresa[]=[];
  private empresasObjeto!:any[];
  private proyectosObjeto!:any[];
  private datosEmpresaObjeto!:any[];
  private allDatosAlumno: Alumno[]=[];

  private alumno!:any|Alumno;
  private alumno2!:Alumno;
  private datosEmpresa!:any|DatosEmpresa;



  constructor(private fb: FormBuilder,private localStorageService: LocalStorageService,private datePipe: DatePipe, private db:DatabaseService) {
    this.info = this.fb.group({
      txtMatricula: ['', Validators.required],
      txtNoFolio: [''],
       txtFechaEntrega: [''],
      txtCarrera: [''],
      txtNombre: [''],
      txtDomicilio: [''],
      txtTel: [''],
      txtSemestre: [''],
      txtNoSeguro: [''],
      txtEmail: [''],
      txtNombreEmpresa: ['', Validators.required],
      txtGiro: [''],
      txtDireccionEmpresa: [''],
      txtCp: [''],
      txtLocalidad: [''],
      txtMunicipio: [''],
      txtEstado: [''],
      txtTelOficina: [''],
      txtExt: [''],
      txtTelFax: [''],
      txtPagina: [''],
      txtNombreJefe: [''],
      txtEmailEmpresa: [''],
      txtArea: [''],
      txtJefeInteres: [''],
      txtAreaEmail: [''],
      txtNombreInmediato: [''],
      txtCargo: [''],
      txtEmailInmediato: [''],
      txtDocumento: [''],
      txtInicio: [''],
      txtTermino: [''],
      txtDe: [''],
      txtHrs: [''],
      txtA: [''],
      txtHora: [''],
      empresaSelect: ['-999', Validators.required],
      txtSelecPry: ['', Validators.required]
    });
   //this.obtenerDatosAlumno('21010021');
  }

  ngOnInit() {
    const savedData = localStorage.getItem('solicitudData');
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.info.patchValue(formData);
      this.isSubmitted = true;
      this.info.disable();
      this.inputsDisabled = true;
    }else {

      // Establecer la fecha actual en txtFechaEntrega si no hay datos guardados

      const fechaActual = new Date();
      const fechaFormateada = this.datePipe.transform(fechaActual, ' dd/MM/yyyy');
      this.info.patchValue({
        txtFechaEntrega: fechaFormateada
      });
    }
    this.db.getEmpresas().subscribe(data=>{this.empresasObjeto=data
      this.darFormatoAEmpresa();
    });
    this.db.getProyectos().subscribe(data=>{this.proyectosObjeto=data
      this.darFormatoAProyectos();
    });
    this.db.getDatosEmpresa().subscribe(data=>{this.datosEmpresaObjeto=data
      this.crearDatosEmpresa();
    });
    this.obtenerDatosAlumno('21010008');
    setTimeout(()=>{
      this.mostrarAtributos()}, 1000);
  }


  obtenerDatosAlumno(matricula: string ) {
  //this.db.getAlumno(matricula).subscribe<any>(alumno=>{
    this.db.getAlumno(matricula).subscribe(matricula => {
   if(matricula){
        let al=<any>matricula
        let fecha=new Date();
        this.info.patchValue({
          txtFechaEntrega: fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear(),
          txtMatricula: al.matricula,
          txtNoFolio: al.noFolio,
          txtCarrera: al.carrera,
          txtNombre: al.nombre,
          txtDomicilio: al.domicilio,
          txtTel: al.tel,
          txtSemestre: al.semestre,
          txtNoSeguro: al.noSeguro,
          txtEmail: al.email
        });
        this.alumno=new Alumno(al.matricula, al.noFolio,al.fechaEntrega,al.carrera,al.nombre,al.domicilio,al.tel,al.semestre,al.noSeguro,al.email)
  }
});
   }
  



  seleccionEmpresa(): void {
      let id=this.info.get("empresaSelect")?.value;
      this.selectedEmpresaId = id;
      this.obtenerDatosEmpresa(id);
      this.filtrarProyectosPorEmpresa(id);
    
  }
  
   obtenerDatosEmpresa(idEmpresa: number) {
    var empresa:DatosEmpresa|undefined=undefined;
    for(let datos of this.allDatosEmpresas){
      if(datos.getIdEmpresa()==idEmpresa){
        empresa=datos;
      }
    }
    if(empresa){
      this.info.patchValue({
        txtNombreEmpresa: empresa.getNombre(),
        txtGiro: empresa.getGiro(),
        txtDireccionEmpresa: empresa.getDireccion(),
        txtCp: empresa.getCodigoP(),
        txtLocalidad: empresa.getLocalidad(),
        txtMunicipio: empresa.getMunicipio(),
        txtEstado: empresa.getEstado(),
        txtTelOficina: empresa.getTelOficinas(),
        txtExt:empresa.getExt(),
        txtText: empresa.getExt(),
        txtTelFax: empresa.getTelFax(),
        txtPagina: empresa.getPaginaWeb(),
        txtNombreJefe: empresa.getJefeRH(),
        txtEmailEmpresa: empresa.getEmailDatos(),
        txtArea: empresa.getOcupacionPrincipal(),
        txtJefeInteres: empresa.getJefeArea(),
        txtAreaEmail: empresa.getEmailArea(),
        txtNombreInmediato: empresa.getJefeInmediato(),
        txtCargo: empresa.getCargo(),
        txtEmailInmediato: empresa.getEmailInmediato()
      });

    }else{
      ///alert("FALLO AL LEER LOS DATOS DE EMPRESA");
    }
  }

  filtrarProyectosPorEmpresa(idEmpresa: number) {
    console.log("id:"+idEmpresa);
    this.proyectosFiltrados=[];
    for(let i =0; i<this.proyectos.length;i++){
      if(this.proyectos[i].getIdEmpresa()==idEmpresa&&this.proyectos[i].getEstadoDelProyecto()==2){
        this.proyectosFiltrados.push(this.proyectos[i]);
      }
    }
    if(!this.proyectosFiltrados){
      ///alert("no hay");
    }else{
      console.log(this.proyectosFiltrados);
    }
  }
  
  agregarEmpresa():void{
   /* if(this.estado){
      this.estado=false;
    }else{
      this.estado=true;
    }*/
   this.estado=true;
  }

  
  ocultar():void{
    this.estado=false;
  }

  enviarSolicitud() {
    //this.bd.createProyecto(proyectoActual).subscribe(data=>{console.log("proyecto rechazado")});
    let fechaEntrega=this.info.get("txtFechaEntrega")?.value;
    let matricula=this.alumno.getMatricula();
    let fechaInicio=this.info.get("txtInicio")?.value;
    let fechaFin=this.info.get("txtTermino")?.value;
    let horaInicio=this.info.get("txtDe")?.value;
    let horaFin=this.info.get("txtA")?.value;
    let idEmpresa=this.info.get("empresaSelect")?.value;
    let idProyecto=this.info.get("txtSelecPry")?.value;
    let estancia=new Estancias(fechaInicio,fechaFin,horaInicio,horaFin,matricula,idEmpresa,idProyecto,"0");
    this.alumno.setFechaEntrega(fechaEntrega);
    this.db.createAlumno(this.alumno).subscribe(data=>{console.log("Alumno actualizado")});
    this.db.createEstancias(estancia).subscribe(data=>{console.log(data)});
}

mostrarAtributos(){
  console.log(this.alumno);
    this.alumno=new Alumno(this.alumno.matricula,this.alumno.noFolio,this.alumno.fechaEntrega,this.alumno.carrera,this.alumno.nombre,this.alumno.domicilio,this.alumno.telefono,this.alumno.semestre,this.alumno.noSeguro,this.alumno.email);
   // this.datosEmpresa=new DatosEmpresa(this.datosEmpresa.idEmpresa,this.datosEmpresa.jefeInmediato,this.datosEmpresa.giro,this.datosEmpresa.descripcion,this.datosEmpresa.paginaWeb,this.datosEmpresa.logo,this.datosEmpresa.giro,this.datosEmpresa.direccion,this.datosEmpresa.codigoP,this.datosEmpresa.localidad,this.datosEmpresa.municipio,this.datosEmpresa.estado,this.datosEmpresa.telOficinas,this.datosEmpresa.ext,this.datosEmpresa.telFax,this.datosEmpresa.jefeRH,this.datosEmpresa.emailDatos,this.datosEmpresa.jefeArea,this.datosEmpresa.emailArea,this.datosEmpresa.jefeInmediato,this.datosEmpresa.cargo,this.datosEmpresa.emailInmediato);
    
}

  darFormatoAEmpresa(){
    this.empresas=[];
    this.empresasObjeto.forEach(empresa=>{this.empresas.push(new Empresa(empresa.idEmpresa,empresa.nombre,empresa.ocupacionPrincipal,empresa.descripcion,empresa.paginaWeb,empresa.logo))})
  }
  darFormatoAProyectos(){
    this.proyectos=[];
    this.proyectosObjeto.forEach(proyecto=>{this.proyectos.push(new Proyecto(proyecto.idProyecto,proyecto.idEmpresa,proyecto.nombre,proyecto.descripcion,proyecto.modalidad,proyecto.remuneracion,new Ubicacion(proyecto.ubicacion.ciudad,proyecto.ubicacion.estado),proyecto.estadoDelProyecto,new Date(proyecto.fechaDeExpiracion)))})
    console.log(this.proyectos);
  }
  crearDatosEmpresa(){
    console.log(this.datosEmpresaObjeto);
    this.allDatosEmpresas=[];
    this.empresas.forEach(empresa => {
      console.log(empresa.getIdEmpresa());
      let datosDeLaEmpresa=undefined;
      let encontrado=false;
      for(let i=0;i<this.datosEmpresaObjeto.length;i++){
        datosDeLaEmpresa=this.datosEmpresaObjeto[i];
        if(datosDeLaEmpresa.idEmpresa==empresa.getIdEmpresa()){
          encontrado=true;
        }
      }
      console.log(datosDeLaEmpresa);
        if(datosDeLaEmpresa){ 
          this.allDatosEmpresas.push(new DatosEmpresa(empresa.getIdEmpresa(),empresa.getNombre(),empresa.getOcupacionPrincipal(),empresa.getDescripcion(),empresa.getPaginaWeb(),empresa.getLogo(),datosDeLaEmpresa.giro,datosDeLaEmpresa.direccion,datosDeLaEmpresa.codigoP,datosDeLaEmpresa.localidad,datosDeLaEmpresa.municipio,datosDeLaEmpresa.estado,datosDeLaEmpresa.telOficinas,datosDeLaEmpresa.ext,datosDeLaEmpresa.telFax,datosDeLaEmpresa.jefeRH,datosDeLaEmpresa.emailDatos,datosDeLaEmpresa.jefeArea,datosDeLaEmpresa.emailArea,datosDeLaEmpresa.jefeInmediato,datosDeLaEmpresa.cargo,datosDeLaEmpresa.emailInmediato));
        }else{
          console.log( "no");
        }
    });
    console.log(this.allDatosEmpresas);
  }
  
}