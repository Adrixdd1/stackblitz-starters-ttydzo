import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Proyecto } from '../models/Proyecto';
import { Ubicacion } from '../models/Ubicacion';
import { RouterModule, Router } from '@angular/router';
import { LocalStorageService } from '../local-storage.service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { DatabaseService } from '../database.service';
import { Subscription } from 'rxjs';
import {MessagesModule} from "primeng/messages";
import { Message, MessageService } from 'primeng/api';


@Component({
  selector: 'app-nuevo-proyecto',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,MatFormFieldModule, 
    MatInputModule, MatDatepickerModule,MessagesModule],
  templateUrl: './nuevo-proyecto.component.html',
  styleUrls: ['./nuevo-proyecto.component.css'],
  providers:[MessageService]
})
export class NuevoProyectoComponent implements OnInit{
  public formulario!: FormGroup;
  public hasUbicacion = false;
  public guardado:boolean=false;
  public modalidad!: number;
  public clickError:boolean=false;
  private proyectosObjeto!:any[];//para recibir los datos de la base de datos y posteriormente parsearlos a tipo Proyecto
  private proyectos: Proyecto[]=[];
  public minDate : Date=new Date();
  private idEmpresa:number=-1;
  public messages: Message[] = [{ severity: 'info', detail: 'Message Content' }];
  constructor(private database:DatabaseService, private fb: FormBuilder, private servicio: LocalStorageService, private router: Router,private mensajes:MessageService) {

    //creamos los controles del formulario
    this.formulario = this.fb.group({
      txtNombreProyecto: ['', Validators.required],
      txtIdProyecto: [{ value: '', disabled: true }, Validators.required],
      txtDescripcion: ['', Validators.required],
      optModalidad: ['0', Validators.required],
      txtCiudad: [''],
      txtEstado: [''],
      chkRemuneracion: ['false', Validators.required],
      pickerFecha:['',Validators.required],
      txtTamañoEquipo:['',Validators.required]
    });

    //cargamos los proyectos usando el servicio
      database.getProyectos().subscribe(data=>{this.proyectosObjeto=data
        this.darFormatoAProyectos();
      })
    

    //subscriptor al select para mostrar o no "ubicacion"
    this.formulario.get("optModalidad")?.valueChanges.subscribe(valor => { this.modalidad = valor; });
    this.modalidad = 0;

    //cargamos los datos del proyecto si se busca completar la información
    let proyectoIncompleto = servicio.cargarDeLocal("proyecto");
    if (proyectoIncompleto) {
      let item = JSON.parse(proyectoIncompleto);
      let proyecto = new Proyecto(item.idProyecto, item.idEmpresa, item.nombre, item.descripcion, item.modalidad, item.remuneracion, new Ubicacion(item.ubicacion.ciudad, item.ubicacion.estado), item.estadoDelProyecto,new Date(item.fechaDeExpiracion));
      this.idEmpresa=proyecto.getIdEmpresa();
      this.formulario.setValue({
        txtNombreProyecto: proyecto.getNombre(),
        txtIdProyecto: proyecto.getIdProyecto(),
        txtDescripcion: proyecto.getDescripcion(),
        optModalidad: proyecto.getModalidad(),
        txtCiudad: proyecto.getUbicacion().getCiudad()||"",
        txtEstado: proyecto.getUbicacion().getEstado()||"",
        chkRemuneracion: proyecto.isRemunerado(),
        pickerFecha:proyecto.getFechaDeExpiracion(),
        txtTamañoEquipo:4
      });
    } else {
      let idString=this.servicio.cargarDeLocal("idEmpresa");
      if(idString){
        this.idEmpresa=parseInt(idString);
      }else{
        alert(idString);
      }
      
      // Generar un nuevo ID si no hay un proyecto incompleto cargado
      this.formulario.get("txtIdProyecto")?.setValue(this.generarNuevoId());

      //mostrar mensaje sobre LS
    }
  }
  ngOnInit(): void {
    this.messages=[{ severity: 'info', summary: 'localStorage', detail: 'El sistema está haciendo uso del localStorage, favor de no borrarlo' }];
  }

  generarNuevoId(): string {
    let nuevoId:string;
    do {
      nuevoId = this.randomId();
    } while (this.proyectos.some(proyecto => proyecto.getIdProyecto() === nuevoId));
    this.proyectos=[];
    return nuevoId;
  }

  randomId(): string {
    return Math.floor(100 + Math.random() * 900).toString(); // Genera un ID aleatorio de 3 dígitos
  }

  enviar() {
    let nProyecto = this.getProyecto(1);
    //this.servicio.actualizarProyectos(this.proyectos,1);
    
    if(this.formulario.valid){
      this.database.createProyecto(nProyecto).subscribe(data=>{console.log("proyecto creado")})
      this.servicio.eliminarDelLocal("proyecto");
      this.salir();
    }
  }

  guardarBorrador() {
    let nProyecto = this.getProyecto(0);
    //this.servicio.actualizarProyectos(this.proyectos,1);
    this.database.createProyecto(nProyecto).subscribe(data=>{console.log(data)})
    this.servicio.eliminarDelLocal("proyecto");
    nProyecto=new Proyecto("",-1,",","",0,false,new Ubicacion("",""),-1,new Date());
    this.salir();
  }

  getProyecto(estadoPry: number): Proyecto {

    let idProyecto: string = this.formulario.get("txtIdProyecto")?.value;
    let nombre: string = this.formulario.get("txtNombreProyecto")?.value;
    let descripcion: string = this.formulario.get("txtDescripcion")?.value;
    let modalidad: number = this.formulario.get("optModalidad")?.value;
    let ciudad: string = "";
    let estado: string = "";
    if (modalidad>0) {
      ciudad = this.formulario.get("txtCiudad")?.value;
      estado = this.formulario.get("txtEstado")?.value;
    }
    let fecha=this.formulario.get("pickerFecha")?.value;
    if(!fecha){
      fecha=new Date();
      fecha.setDate(fecha.getDate()+5);
    }
    let remuneracion: boolean = this.formulario.get("chkRemuneracion")?.value;
    return new Proyecto(idProyecto, this.idEmpresa, nombre, descripcion, modalidad, remuneracion, new Ubicacion(ciudad, estado), estadoPry,fecha);
  }

  salir() {
    this.router.navigate(['/proyectos']);
  }

  darFormatoAProyectos(){
    this.proyectos=[];
    this.proyectosObjeto.forEach(proyecto=>{this.proyectos.push(new Proyecto(proyecto.idProyecto,proyecto.idEmpresa,proyecto.nombre,proyecto.descripcion,proyecto.modalidad,proyecto.remuneracion,new Ubicacion(proyecto.ubicacion.cuidad,proyecto.ubicacion.estado),proyecto.estadoDelProyecto,new Date(proyecto.fechaDeExpiracion)))})
  }
}

