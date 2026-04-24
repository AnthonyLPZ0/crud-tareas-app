const key = "tareas";

// guardar
// guardamos las tareas en localstorage como string
export function guardarTareas(tareas){
    localStorage.setItem(key, JSON.stringify(tareas));
}

// cargar -> antes cargarTarea() -> despues 
export async function obtenerTareasDesdeAPI(){
    // obtenemos la tareas del localstorage a una variable
    // antes ->  const data = localStorage.getItem(key);
    // ahora ->
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");

    // verificamos que exista datos en la variable
    // sino devolvemos un array vacio
    // antes -> if(!data) return []; 
    // despues ->
    const data = await response.json();
    
    // y si existe, lo convertimos en objeto por parse.
    // antes -> return JSON.parse(data);
    return data;
}

