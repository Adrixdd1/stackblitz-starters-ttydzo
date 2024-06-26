import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Alumno } from '../models/Alumno';
import { DatabaseService } from '../database.service';
import { LocalStorageService } from '../local-storage.service';
import { Estancias } from '../models/Estancias';

@Component({
  selector: 'app-validar-solicitud',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './validar-solicitud.component.html',
  styleUrl: './validar-solicitud.component.css'
})
export class ValidarSolicitudComponent implements OnInit {
  servicios:Estancias[]=[];
  alumnosAny!:any[];
  alumnos:Alumno[]=[];
constructor(private router: Router,private db:DatabaseService,private ls:LocalStorageService){

}
ngOnInit() {
  this.db.getEstancias().subscribe(data=>{this.alumnosAny=data
    this.instanciar();
  });
}
soli(){
this.router.navigate(['/solicitudValidar']);
}
instanciar(){
  this.alumnosAny.forEach(estancia=>{
    this.servicios.push(new Estancias(estancia.fechaInicio,estancia.fechaTermino,estancia.deHrs,estancia.aHrs,estancia.matricula,estancia.idEmpresa,estancia.idProyecto,estancia.estadoSolicitud));
    
  
  })
}

obtenerDatosAlumno(matricula: string ) {
  //this.db.getAlumno(matricula).subscribe<any>(alumno=>{
    this.db.getAlumnos().subscribe(matricula => {
        matricula.forEach(al=>{
          let alu=<any>al;
          this.alumnos.push(new Alumno(alu.matricula, alu.noFolio,alu.fechaEntrega,alu.carrera,alu.nombre,alu.domicilio,alu.tel,alu.semestre,alu.noSeguro,alu.email))
        })
    });
   }
  
   getSemestre(matricula:string){
    return this.alumnos.find(al=>{al.getMatricula()==matricula})?.getSemestre();
   }
   salir(matricula:string){
    this.ls.guardarEnLocal("matriculaSeleccionada",matricula);
    this.router.navigate(['/solitudValidar']);
   }
   
}
