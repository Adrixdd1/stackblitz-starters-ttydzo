import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Empresa } from '../models/Empresa';
import { LocalStorageService } from '../local-storage.service';
import { RouterModule } from '@angular/router';
import { Proyecto } from '../models/Proyecto';
import { DatabaseService } from '../database.service';
import { Ubicacion } from '../models/Ubicacion';

@Component({
  selector: 'app-validar-proyecto-empresa',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './validar-proyecto-empresa.component.html',
  styleUrls: ['./validar-proyecto-empresa.component.css']
})
export class ValidarProyectoEmpresaComponent implements OnInit {
  public empresas: Empresa[] = [];
  public proyectos: Proyecto[] = [];
  public flagsProyectos: boolean[] = [];
  private empresasObjeto!: any[];
  private proyectosObjeto!: any[];


  constructor(private localStorageService: LocalStorageService, private bd: DatabaseService) {
    console.log(this.empresas);
  }

  ngOnInit(): void {
    this.bd.getEmpresas().subscribe(data => {
      this.empresasObjeto = data
      this.darFormatoAEmpresa();
    })//esto es para probar, se reemplaza por el id de la empresa logueada.
    this.bd.getProyectos().subscribe(data => {
      this.proyectosObjeto = data
      this.darFormatoAProyectos();
    });
  }

  getIndexEmpresa(id: number): number {
    let indice = this.empresas.findIndex(empresa => {
      return id === empresa.getIdEmpresa();
    });
    return indice;
  }
  // id de la empresa
  verProyectos(id: number): void {
    this.flagsProyectos[this.getIndexEmpresa(id)] = !this.flagsProyectos[this.getIndexEmpresa(id)];
  }

  //id de la empresa //id del proyecto
  aceptar(id: number, idpry: string) {
    // let indice = this.getIndexEmpresa(id);
    let proyectosDeEmpresa = this.proyectos.filter(proyecto => proyecto.getIdEmpresa() === id);
    let proyectoActual!: Proyecto;
    //colocar como aceptado un proyecto dado un id
    for (let i = 0; i < proyectosDeEmpresa.length; i++) {
      proyectoActual = proyectosDeEmpresa[i];
      if (proyectoActual.getIdProyecto() === idpry) {
        proyectoActual.setEstadoDelProyecto(2);
        this.bd.createProyecto(proyectoActual).subscribe(data => { console.log("proyecto aceptado") });
        alert("avisando a la empresa que ha sido aceptado su proyecto...");
        break;
      }
    }
    //this.localStorageService.actualizarProyectos(this.proyectos,10);
    //let pryAceptado= this.localStorageService.cargarDeLocal("proyectos[i]")
    console.log(proyectoActual);
    console.log(this.localStorageService.cargarDeLocal("proyectos_" + id));
  }

  rechazar(id: number, idpry: string) {
    let btnEnviarMjs = document.getElementById('btnEnviarMjs');
    //let idModal=document.getElementById('exampleModal{}');
    let messageTextArea = document.getElementById('message-text') as HTMLTextAreaElement;
    if (btnEnviarMjs && messageTextArea) {
      let messageText = messageTextArea.value.trim();
      if (messageText == "") {
        alert("Por favor, escriba un mensaje antes de enviar.");
      } else {
        let proyectosDeEmpresa = this.proyectos.filter(proyecto => proyecto.getIdEmpresa() === id);
        let proyectoActual!: Proyecto;
        //colocar como rechazado un proyecto dado un id
        for (let i = 0; i < proyectosDeEmpresa.length; i++) {
          proyectoActual = proyectosDeEmpresa[i];
          if (proyectoActual.getIdProyecto() === idpry) {
            proyectoActual.setEstadoDelProyecto(5);
            this.bd.createProyecto(proyectoActual).subscribe(data => { console.log("proyecto rechazado") });
            this.alerta();
            break;
          }
        }
        //this.localStorageService.actualizarProyectos(this.proyectos,10);
        //let pryAceptado= this.localStorageService.cargarDeLocal("proyectos[i]")
        console.log(proyectoActual);
        console.log(this.localStorageService.cargarDeLocal("proyectos_" + id));
      }
    }
  }

  obtenerModalidad(codigo: number): string {
    codigo = Number(codigo);  // Convertir a número
    let a: string[] = ["Remoto", "Presencial", "Mixto", "desconocido"];
    return a[codigo];
  }


  alerta() {
    alert("Notificando a la empresa el motivo del rechazo...")
  }

  getProyectosEmpresa(idEmpresa: number) {
    console.log(idEmpresa);
    console.log(this.proyectos);
    let pry: Proyecto[] = [];
    for (let proyecto of this.proyectos) {
      if (proyecto.getIdEmpresa() === idEmpresa) {
        pry.push(proyecto);
      }
    }
    return pry;
  }

  empresaConPry() {
    return this.empresas.filter(empresa => {
      return this.proyectos.some(proyecto => {
        return proyecto.getIdEmpresa() == empresa.getIdEmpresa() && proyecto.getEstadoDelProyecto() == 1
      });
    });
  }
  getFechaFormato(date: Date) {
    let dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return dias[date.getDay()] + " " + date.getDate() + " " + meses[date.getMonth()] + " " + date.getFullYear();
  }

  darFormatoAEmpresa() {
    this.empresas = [];
    this.empresasObjeto.forEach(empresa => { this.empresas.push(new Empresa(empresa.idEmpresa, empresa.nombre, empresa.ocupacionPrincipal, empresa.descripcion, empresa.paginaWeb, empresa.logo)) })
    this.empresas.forEach((empresa) => { this.flagsProyectos.push(false) })

  }
  darFormatoAProyectos() {
    this.proyectos = [];
    this.proyectosObjeto.forEach(proyecto => { this.proyectos.push(new Proyecto(proyecto.idProyecto, proyecto.idEmpresa, proyecto.nombre, proyecto.descripcion, proyecto.modalidad, proyecto.remuneracion, new Ubicacion(proyecto.ubicacion.ciudad, proyecto.ubicacion.estado), proyecto.estadoDelProyecto, new Date(proyecto.fechaDeExpiracion))) })
    console.log(this.proyectos);
  }
  public id!:string;
  guardarId(id:string){
    this.id=id;
  }
  obtenerId():string{
    return this.id;
  }
}