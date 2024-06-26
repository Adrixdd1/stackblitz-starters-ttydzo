export class Estancias{
    private fechaInicio: number;
    private fechaTermino:number;
    private deHrs: number;
    private aHrs: number;
    private matricula: string;
    private idEmpresa: number;
    constructor(
        fechaInicio: number,
        fechaTermino:  number,
        deHrs:number,
        aHrs:number,
        matricula:string,
        idEmpresa:number
    ){
        this.fechaInicio=fechaInicio;
        this.fechaTermino=fechaTermino;
        this.deHrs=deHrs;
        this.aHrs=aHrs;
        this.matricula=matricula;
        this.idEmpresa=idEmpresa;
    }
    public getFechaInicio(): number {
        return this.fechaInicio;
    }

    public setFechaInicio(fechaInicio: number): void {
        this.fechaInicio = fechaInicio;
    } 

    public getFechaTermino(): number {
        return this.fechaTermino;
    }

    public setFechaTermino(fechaTermino: number): void {
        this.fechaTermino = fechaTermino;
    }

    public getDeHrs(): number {
        return this.deHrs;
    }

    public setDeHrs(deHrs: number): void {
        this.deHrs = deHrs;
    }

    public getAHrs(): number {
        return this.aHrs;
    }

    public setAHrs(aHrs: number): void {
        this.aHrs = aHrs;
    } 

    public getMatricula(): string {
        return this.matricula;
    }

    public setMatricula(matricula: string): void {
        this.matricula = matricula;
    } 

     public getIdEmpresa(): number {
        return this.idEmpresa;
    }

    public setIdEmpresa(idEmpresa: number): void {
        this.idEmpresa = idEmpresa;
    }

}