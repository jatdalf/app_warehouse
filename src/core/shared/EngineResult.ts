export interface EngineResult<T = void>{

    success:boolean;

    message:string;

    data?:T;

}