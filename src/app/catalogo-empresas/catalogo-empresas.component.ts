import { Component } from '@angular/core';
import { Proyecto } from '../models/Proyecto';
import { LocalStorageService } from '../local-storage.service';
import { Empresa } from '../models/Empresa';
import { DatabaseService } from '../database.service';
import { Ubicacion } from '../models/Ubicacion';
import { OpinionesComponent } from '../opiniones/opiniones.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo-empresas',
  standalone: true,
  imports: [OpinionesComponent],
  templateUrl: './catalogo-empresas.component.html',
  styleUrl: './catalogo-empresas.component.css'
})
export class CatalogoEmpresasComponent {
  public empresas: Empresa[] = [];
  public proyectos: Proyecto[] = [];
  public flagsProyectos: boolean[] = [];
  private empresasObjeto!: any[];
  private proyectosObjeto!: any[];

  constructor(private localStorageService: LocalStorageService, private bd: DatabaseService,private router:Router){
   
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
  

  empresaConPry(id: number){
    return this.proyectos.some(proyecto=>{return proyecto.getIdEmpresa()==id &&proyecto.getEstadoDelProyecto()==2
    });
  }

  getIndexEmpresa(id:number):number{
    let indice = this.empresas.findIndex(empresa => {
      return id === empresa.getIdEmpresa();
    });
    return indice;
  }
  // id de la empresa
  verProyectos(id: number): void {
    this.flagsProyectos[this.getIndexEmpresa(id)] = !this.flagsProyectos[this.getIndexEmpresa(id)];
  }


  

  getProyectosEmpresa(idEmpresa:number){
    console.log(idEmpresa);
    console.log(this.proyectos);
    let pry:Proyecto[]=[];
    for(let proyecto of this.proyectos){
      if(proyecto.getIdEmpresa()===idEmpresa){
          pry.push(proyecto);
      }
    }
    return pry;
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


  abrirEmpresa(id:number){
    this.localStorageService.guardarEnLocal("idEmpresaSeleccionada",id+"");
    this.router.navigate(["/opiniones"])
  }
} 
