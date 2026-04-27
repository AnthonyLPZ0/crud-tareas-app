export function mapTodo(t){
    return{
        id:t.id,
        contenido:t.title,
        completado: t.completed,
        dificultad: "facil",
        fecha: new Date().toISOString()
    }
}