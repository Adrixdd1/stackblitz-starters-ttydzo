import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { LocalStorageService } from '../local-storage.service';
import { DatabaseService } from '../database.service';
import { Alumno } from '../models/Alumno';
import { Estancias } from '../models/Estancias';
import { Proyecto } from '../models/Proyecto';
import { Empresa } from '../models/Empresa';
import { Ubicacion } from '../models/Ubicacion';
import { DatosEmpresa } from '../models/DatosEmpresa';
import { Router } from '@angular/router';
import { ValidarSolicitudComponent } from '../validar-solicitud/validar-solicitud.component';

@Component({
  selector: 'app-solitud-validar',
  standalone: true,
  imports: [ReactiveFormsModule, MatDatepickerModule,MatNativeDateModule,MatInputModule,ValidarSolicitudComponent],
  templateUrl: './solitud-validar.component.html',
  styleUrl: './solitud-validar.component.css',

  providers: [DatePipe,MatDatepickerModule, MatNativeDateModule]
})
export class SolitudValidarComponent implements OnInit {
  info: FormGroup;
  alumno!:Alumno;
  matricula!:string;
  estancia!:Estancias;
  proyecto!:Proyecto;
  empresa!:Empresa;
  datos!:DatosEmpresa;

  constructor(private fb: FormBuilder,private localStorageService: LocalStorageService,private datePipe: DatePipe, private db:DatabaseService,private router: Router) {
    let matricula=localStorageService.cargarDeLocal("matriculaSeleccionada");
    if(matricula){
      this.matricula=matricula;
    }else{
      this.matricula="21010008";
    }
    this.info= this.fb.group({
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
  // this.obtenerDatosAlumno('21010021');
  }

  ngOnInit() {
    this.obtenerDatosAlumno(this.matricula);
    this.db.getEstanciaById(this.matricula).subscribe(data=>{
      let estancia = <any>data;
      this.estancia=new Estancias(estancia.fechaInicio,estancia.fechaTermino,estancia.deHrs,estancia.aHrs,estancia.matricula,estancia.idEmpresa,estancia.idProyecto,estancia.estadoSolicitud);
      console.log(this.estancia);
      //despues de obtener la estancia se obtienen el resto de los datos
      this.bajarDeDB();
    });
  }
  bajarDeDB(){
    this.db.getEmpresaById(this.estancia.getIdEmpresa()).subscribe(data=>{
      let empresa=<any>data;
      this.empresa=new Empresa(empresa.idEmpresa,empresa.nombre,empresa.ocupacionPrincipal,empresa.descripcion,empresa.paginaWeb,empresa.logo);
      
      this.db.getDatosById(this.estancia.getIdEmpresa()).subscribe(data=>{
        let datosDeLaEmpresa=<any>data;

        this.datos=new DatosEmpresa(this.empresa.getIdEmpresa(),this.empresa.getNombre(),this.empresa.getOcupacionPrincipal(),this.empresa.getDescripcion(),this.empresa.getPaginaWeb(),this.empresa.getLogo(),datosDeLaEmpresa.giro,datosDeLaEmpresa.direccion,datosDeLaEmpresa.codigoP,datosDeLaEmpresa.localidad,datosDeLaEmpresa.municipio,datosDeLaEmpresa.estado,datosDeLaEmpresa.telOficinas,datosDeLaEmpresa.ext,datosDeLaEmpresa.telFax,datosDeLaEmpresa.jefeRH,datosDeLaEmpresa.emailDatos,datosDeLaEmpresa.jefeArea,datosDeLaEmpresa.emailArea,datosDeLaEmpresa.jefeInmediato,datosDeLaEmpresa.cargo,datosDeLaEmpresa.emailInmediato);
        console.log(this.datos);
        
      });
    
    });
    
    this.db.getProyectoById(this.estancia.getIdProyecto()).subscribe(data=>{
      let proyecto=<any>data;
      this.proyecto=new Proyecto(proyecto.idProyecto,proyecto.idEmpresa,proyecto.nombre,proyecto.descripcion,proyecto.modalidad,proyecto.remuneracion,new Ubicacion(proyecto.ubicacion.ciudad,proyecto.ubicacion.estado),proyecto.estadoDelProyecto,new Date(proyecto.fechaDeExpiracion));
      console.log(this.proyecto);
    });
  }
  obtenerDatosAlumno(matricula: string ) {
    //this.db.getAlumno(matricula).subscribe<any>(alumno=>{
      this.db.getAlumno(matricula).subscribe(matricula => {
     if(matricula){
          let al=<any>matricula
          
          this.info.patchValue({
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
    
  rechazarSolicitud() {
      const motivo = prompt("Ingrese el motivo del rechazo:");
      if (motivo) {
        alert(`Solicitud rechazada por el siguiente motivo: ${motivo}`);
        this.estancia.setEstadoSolicitud("2");
        this.db.createEstancias(this.estancia).subscribe(data=>{"actualizado"});
        this.salir();
      }
    }

    aceptarSolicitud(){
      alert("Aceptaste la solicitud");
      this.estancia.setEstadoSolicitud("1");
      this.db.createEstancias(this.estancia).subscribe(data=>{"actualizado"});
      this.salir();
    }

    salir(){
      this.router.navigate(["/validarSolicitud"])
    }
}
