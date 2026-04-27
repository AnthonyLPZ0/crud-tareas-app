
export async function createTodo(tareaAPI) {
    
    // enviar datos al servidor
    const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
        method: "POST",
        
        // decirle a la API: "te estoy enviando JSON"
        headers: {
            "Content-Type":"application/json"
        },
        
        // convertir objeto JS → string JSON
        body: JSON.stringify(tareaAPI)
    });
    
    if(!response.ok) throw new Error();
    
    // convertir respuesta → objeto usable
    return await response.json();
}

export async function updateTodo(id,data) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`,{
        method: "PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if(!response.ok) throw new Error();
}

export async function deleteTodo(id) {
    // elimina datos del servidor
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: "DELETE"
    });

    if(!response.ok) throw new Error();

}

export async function toggleTodo(id,nuevoEstado){
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method:"PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: nuevoEstado
        })
    })

    return await response.json();
}