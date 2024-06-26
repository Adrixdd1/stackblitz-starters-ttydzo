import { Component, Input, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Empresa } from '../models/Empresa';
import { Opinion } from '../models/Opinon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apoyos } from '../models/Apoyos';
import { LocalStorageService } from '../local-storage.service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-opiniones',
  standalone: true,
  imports: [ReactiveFormsModule,MessagesModule],
  templateUrl: './opiniones.component.html',
  styleUrl: './opiniones.component.css'
})
export class OpinionesComponent implements OnInit {
  estrellas=[1,2,3,4,5];
   idEmpresa!:number;
   matricula:string="1";//se obtiene de la sesión
   empresa!:Empresa;
   allOpiniones!:Opinion[];
   opinionesDeLaEmpresa:Opinion[]=[];
   formulario:FormGroup;
   apoyos!:Apoyos;
   mostrando:number=10;//para controlar las opiniones que se muestran
   public messages: Message[] = [{ severity: 'info', detail: 'Message Content' }];
   constructor(localStorage:LocalStorageService,private router:Router, private servicio:DatabaseService,fb:FormBuilder){
    let idString=localStorage.cargarDeLocal("idEmpresaSeleccionada");
    if(idString){
      this.idEmpresa=parseInt(idString);
    }
    this.formulario=fb.group({
      txtCalificacion:["1",Validators.required],
      txtOpinion:[""]
    });
   }
   ngOnInit(): void {
    this.messages=[{ severity: 'info', summary: 'localStorage', detail: 'El sistema está haciendo uso del localStorage, favor de no borrarlo' }];
    this.servicio.getEmpresaById(this.idEmpresa).subscribe(data=>{let empresaAny=<any>data
      this.empresa=new Empresa(empresaAny.idEmpresa,empresaAny.nombre,empresaAny.ocupacionPrincipal,
        empresaAny.descripcion,empresaAny.paginaWeb,empresaAny.logo)
        console.log(this.empresa);
    });
    this.servicio.getApoyosById(this.idEmpresa).subscribe(data=>{let apoyosAny=<any>data
      this.apoyos=new Apoyos(apoyosAny.idEmpresa,apoyosAny.beca,apoyosAny.alimentos,
        apoyosAny.hospedaje,apoyosAny.transporte,apoyosAny.salario
      )
        console.log(this.apoyos);
    });

    this.servicio.getOpiniones().subscribe(data => {
      let opinionesAny = <any>data;
      this.allOpiniones = opinionesAny.map((opinion: any) => new Opinion(
        opinion.id,
        opinion.idEmpresa,
        new Date(opinion.fecha),
        opinion.usuario,
        opinion.calificacion,
        opinion.opinion
      ));
      for(let opinion of this.allOpiniones){
        if(opinion.getIdEmpresa()==this.idEmpresa){
          this.opinionesDeLaEmpresa.push(opinion);
        }
      }
      console.log(this.allOpiniones);
      //this.allOpiniones=[];
      console.log(this.opinionesDeLaEmpresa);
    });
   }
   getCalificacionTotal(){
      let valorTotal = 0;
      this.opinionesDeLaEmpresa.forEach(item => {
          valorTotal += item.getCalificacion();
      });
      if(this.opinionesDeLaEmpresa.length!=0){
        valorTotal/=this.opinionesDeLaEmpresa.length
      }
      return valorTotal;
   }
   getEstrellas(valor:number){
      let arreglo=[];
      for(let i = 1; i<=5;i++){
        if (i <= valor) {
          arreglo.push(true)//"<i class='bi bi-star-fill'></i>"; // Estrella llena
      } else {
          arreglo.push(false)//"<i class='bi bi-star'></i>"; // Estrella vacía
      }
      }
      return arreglo;
   }
   nuevaOpinion(){
    let calificacion=this.formulario.get("txtCalificacion")?.value;
    let opinion=this.formulario.get("txtOpinion")?.value;
    let op=new Opinion(this.generarNuevoId(),this.idEmpresa,new Date(),this.matricula,calificacion,opinion);
    this.servicio.createOpinion(op).subscribe(data => {console.log("opinion creada");
    });
   }
  generarNuevoId(): number {
  let nuevoId:number;
  do {
    nuevoId = this.randomId();
  } while (this.allOpiniones.some(proyecto => proyecto.getId() === nuevoId));
  return nuevoId;
  }
  randomId(): number {
    return Math.floor(100 + Math.random() * 900); // Genera un ID aleatorio de 3 dígitos
  }
   getSomeOpinions(){
    return this.opinionesDeLaEmpresa.filter((val,indice)=>{return indice<this.mostrando})
   }
   masOpiniones(){
    this.mostrando+=10;
   }
   salir(){
    this.router.navigate(["/catalogo"]);
   }
   setEstrellas(valor:number){
    this.formulario.patchValue({txtCalificacion:valor});
   }
}
