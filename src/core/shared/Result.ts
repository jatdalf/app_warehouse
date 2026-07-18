export interface ProcessResult<T>{
    success:boolean;
    message:string;
    data?:T;
}