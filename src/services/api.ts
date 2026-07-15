const API_BASE=import.meta.env.VITE_API_URL||"http://localhost:4000/api";

async function request<T>(
    endpoint:string,
    options:RequestInit={}
):Promise<T>{

    const response=await fetch(`${API_BASE}${endpoint}`,{
        headers:{
            "Content-Type":"application/json",
            ...(options.headers||{})
        },
        ...options
    });

    const data=await response.json();

    if(!response.ok){
        throw new Error(data.error||"Error de comunicación con el servidor.");
    }

    return data;
}

export async function get<T>(endpoint:string){
    return request<T>(endpoint,{
        method:"GET"
    });
}

export async function post<T>(endpoint:string,body:any){
    return request<T>(endpoint,{
        method:"POST",
        body:JSON.stringify(body)
    });
}