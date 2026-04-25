import { state } from "./state.js";
import { guardarTareas, obtenerTareasDesdeAPI } from "./storage.js";
import { renderTareas } from "./ui.js";

// variable para las acciones y valores
const containerLista = document.getElementById("listaTarea");
const inputTarea = document.getElementById("inputText");
const btnAgregar = document.getElementById("btn-agregar");
const selectNivel = document.getElementById("selectDificultad");
const containerFiltro = document.getElementById("sectionFiltro");

async function init() {

    // cargar datos
    // antes -> state.tareas = cargarDatos();
    state.tareas = await obtenerTareasDesdeAPI();

    renderTareas();

    // boton para agregar tarea (1)
    btnAgregar.addEventListener("click",handleAgregarTarea);

    // delegacion para elementos dinamicos del contenedor especifico (2)
    containerLista.addEventListener("click", handleClickLista);

    // delegacion para los filtro
    containerFiltro.addEventListener("click", handleClickFiltro);
}

// function para agregar la nueva tarea (1)
async function handleAgregarTarea(){
    const valorInput = inputTarea.value;
    const valorSelect = selectNivel.value;
    
    if(valorInput.trim() === "") 
        return alert("La tarea no puede estar vacia");
    
    // SI ESTA EN MODO EDICION
    if (state.edicion !== null) {
        actualizarState(
            state.tareas.map(t => 
                t.id === state.edicion
                ? {
                    ...t,
                    contenido: valorInput,
                    dificultad: valorSelect
                }
                :t
            )
        );

    }else{
        // MODO CREAR TAREA 
        // const nuevaTarea = {
        //     id: Date.now(),
        //     contenido: valorInput,
        //     completado: false,
        //     dificultad: valorSelect,
        //     fecha: new Date().toISOString()
        // };

        // OBJETO PARA API
        // adaptar tu data al formato que la API entiende
        const tareaAPI = {
            title: valorInput,
            completed:false
        }
        
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
        const data = await response.json();

        // mantener tu app con tu propio formato interno
        const nuevaTarea = {
            id:data.id,
            contenido: data.title,
            completado: data.completed,
            dificultad: valorSelect,
            fecha: new Date().toISOString()
        }

        // sincronizar UI + storage + render
        actualizarState([...state.tareas,nuevaTarea]);
    }
    
    resetFormulario();
}

// funcion para la delegacion de eventos(2)
function handleClickLista(e){

    const action = e.target.dataset.action;

    if(!action) return;

    const id = Number(e.target.dataset.id);

    switch (action) {
        case "eliminar":
            handleEliminarTarea(id); //(3)
            break;
        case "editar":
            handleEditarTarea(id);// (4)
            break;
        case "toggle":
            handleCompletado(id); // (5)
            break;
        case "filtro":
            const valor = e.target.dataset.filtro;
            handleFiltroTarea(valor);
            break;
        default:
            break;
    }
}

// funcion para eliminar la tarea (3)
async function handleEliminarTarea(id){ 

    try {
        // elimina datos del servidor
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: "DELETE"
        });
    
        if(!response.ok) throw new Error();
    
        actualizarState(
            state.tareas.filter( t => t.id !== id)
        );
    
        // si eliminaste la que estabas editando
        if(state.edicion === id){
            resetFormulario();
        }
    } catch (error) {
        console.log(error);
        alert("Error al eliminar la tarea");
    }
    
}

// function para editar la tarea(4)
function handleEditarTarea(id){

    state.edicion = Number(id);

    const edicionTarea = state.tareas.find(t => 
        t.id === state.edicion
    )

    if (edicionTarea) {
        inputTarea.value = edicionTarea.contenido;
        selectNivel.value = edicionTarea.dificultad;

        btnAgregar.textContent = "Guardar Cambios";
    }
}

// function para el toggle (completado o no) (5)
function handleCompletado(id){
    actualizarState(
        state.tareas.map(t => 
            t.id === id
            ? {
                ...t,
                completado: !t.completado
            }
            : t
        )
    )
}

// fucnion para click en filtro
function handleClickFiltro(e){
    const action = e.target.dataset.action;
    if(!action) return;

    const valor = e.target.dataset.filtro;
    handleFiltroTarea(valor);
}

// function para el filtro
function handleFiltroTarea(valor){
    state.filtro = valor;
    renderTareas();
}

// funcion para actualizar el localstorage y no repetir codigo
function actualizarState(nuevasTareas){
    state.tareas = nuevasTareas;
    guardarTareas(state.tareas);
    renderTareas();
}

// funcion para resetearFormulario
function resetFormulario(){
    state.edicion = null;
    inputTarea.value = "";
    selectNivel.value = "facil";
    btnAgregar.textContent = "Agregar";
    
}

init();