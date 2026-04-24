import { state } from "./state.js";

const containerLista = document.getElementById("listaTarea");

export function renderTareas(){

    let filtroArray = state.tareas.filter( t =>{
        if(state.filtro === "all") return true;
        if(state.filtro === "completado") return t.completado;
        if(state.filtro === "pendientes") return !t.completado;
    })

    // verificamos si hay tareas
    if (filtroArray.length === 0) {
        // agregamos un mensaje si no hay tareas
        containerLista.innerHTML =`
            <div class="empty">
                <p>No hay tareas😄</p>
            </div>
        `;
        return; // corta la funcion ahi
    } 

    // si hay tareas vamos creando campos para colocar los datos
    // recorremos las tareas, y colocamos sus datos en los campos
    const ul = filtroArray.map(t => {
        const fechaFormateada = new Date(t.fecha).toLocaleString();
        return `
            <li class="${t.completado ? "checked" : ""}">
    
                <input type="checkbox" 
                data-id=${t.id} 
                data-action="toggle" 
                ${t.completado ? "checked" : ""}>
    
                <p>${t.contenido}</p>
                <p>${t.dificultad}</p>
                <p>${fechaFormateada}</p>
    
                <button data-id=${t.id}
                data-action="editar">Editar</button>
    
                <button data-id=${t.id} data-action="eliminar">Eliminar</button>
    
            </li>
        `
    }).join("")
    
    // lo colocamos dentro del container
    containerLista.innerHTML = ul;
}