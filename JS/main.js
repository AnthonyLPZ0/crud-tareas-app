import { createTodo, deleteTodo, toggleTodo, updateTodo } from "./api.js";
import { mapTodo } from "./mapper.js";
import { state } from "./state.js";
import { guardarTareas, obtenerTareasDesdeAPI } from "./storage.js";
import { renderTareas, mostrarMensaje } from "./ui.js";

// variable para las acciones y valores
const containerLista = document.getElementById("listaTarea");
const inputTarea = document.getElementById("inputText");
const btnAgregar = document.getElementById("btn-agregar");
const selectNivel = document.getElementById("selectDificultad");
const containerFiltro = document.getElementById("sectionFiltro");

async function init() {

    // cargar datos
    // antes -> state.tareas = cargarDatos();
    const data = await obtenerTareasDesdeAPI();
    state.tareas = data.slice(0,10).map(mapTodo)

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
    
    try {

        // SI ESTA EN MODO EDICION
        if (state.edicion !== null) {

            btnAgregar.disabled = true;
            btnAgregar.textContent = "Cargando..."
            
            await updateTodo(state.edicion, {title: valorInput});

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

            mostrarMensaje("Tarea Actualizada");
            
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
            
            const data = await createTodo(tareaAPI);

            // mantener tu app con tu propio formato interno
            const nuevaTarea = mapTodo(data);

            nuevaTarea.dificultad = valorSelect;
            
            // sincronizar UI + storage + render
            actualizarState([...state.tareas,nuevaTarea]);
            mostrarMensaje("Tarea Creada");
        }
            resetFormulario();
        } catch (error) {
            console.log(error);
            alert("Error al guardar la tarea");
        }finally{
            btnAgregar.disabled = false;
            btnAgregar.textContent = "Agregar";
        }
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

    if(!confirm("¿Seguro que quieres eliminar?")) return;

    try {
        
        await deleteTodo(id);

        actualizarState(
            state.tareas.filter( t => t.id !== id)
        );
    
        // si eliminaste la que estabas editando
        if(state.edicion === id){
            resetFormulario();
        }

        btnAgregar.disabled = true;
        mostrarMensaje("Tarea eliminada");
    } catch (error) {
        console.log(error);
        alert("Error al eliminar la tarea");
    }   finally{
        btnAgregar.disabled = false;
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
async function handleCompletado(id){

    const tarea = state.tareas.find(t => t.id === id);

    if(!tarea) return;

    const nuevoEstado = !tarea.completado;

    try {
        // actualizar tareas existentes usando el método PATCH.
        await toggleTodo(id, nuevoEstado);

        actualizarState(
            state.tareas.map(t => 
                t.id === id
                ? {
                    ...t,
                    completado: nuevoEstado
                }
                : t
            )
        )

        mostrarMensaje(nuevoEstado ? "Tarea Completada" : "Tarea marcada como pendiente");
    } catch (error) {
        console.log(error);
        alert("Error al guardar la tarea");
    }
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