const checklist = document.getElementById('checklist');
const input = document.getElementById('newTask');
const addBtn = document.getElementById('addBtn');
const counter = document.getElementById('counter');
const clearCompletedBtn = document.getElementById('clearCompleted');
const toggleThemeBtn = document.getElementById('toggleTheme');

// Reloj en tiempo real (24h)
function updateClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// Clima en tiempo real (Open-Meteo, Ciudad de México)
function updateWeather() {
    const weatherEl = document.getElementById('weather');
    if (!weatherEl) return;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&current_weather=true')
        .then(res => res.json())
        .then(data => {
            const w = data.current_weather;
            weatherEl.textContent =
                `Clima: ${w.temperature}°C, ${w.weathercode === 0 ? 'Despejado' : 'Nublado'}`;
        })
        .catch(() => {
            weatherEl.textContent = 'Clima no disponible';
        });
}
updateWeather();
setInterval(updateWeather, 60000);

// Carrusel de frases motivacionales/tips
const frases = [
    "¡Nunca olvides reiniciar antes de buscar el problema!",
    "La paciencia es clave en soporte técnico.",
    "Documenta cada paso que realices.",
    "Pregunta al usuario detalles específicos.",
    "Mantén tu software actualizado.",
    "Respira hondo y sigue adelante.",
    "La mejor solución es la más simple.",
    "Aprende algo nuevo cada día."
];
let fraseIndex = 0;
function updateCarousel() {
    const carouselEl = document.getElementById('carouselText');
    if (!carouselEl) return;
    carouselEl.textContent = frases[fraseIndex];
    fraseIndex = (fraseIndex + 1) % frases.length;
}
setInterval(updateCarousel, 4000);
updateCarousel();

// Checklist funcionalidad
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { text: "Verificar conexión a internet", completed: false },
    { text: "Reiniciar equipo", completed: false },
    { text: "Actualizar sistema operativo", completed: false },
    { text: "Comprobar cables y periféricos", completed: false },
    { text: "Escanear en busca de virus", completed: false }
];

let isLight = false;

// Notificación visual
function showNotification(msg) {
    let notif = document.createElement('div');
    notif.textContent = msg;
    notif.style.position = 'fixed';
    notif.style.bottom = '30px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = '#a259ff';
    notif.style.color = '#fff';
    notif.style.padding = '12px 24px';
    notif.style.borderRadius = '16px';
    notif.style.boxShadow = '0 0 16px #a259ff';
    notif.style.fontWeight = 'bold';
    notif.style.zIndex = '9999';
    notif.style.opacity = '0.95';
    notif.style.transition = 'opacity 0.5s';
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 1200);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    checklist.innerHTML = '';
    tasks.forEach((task, i) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${i}">
            <label ondblclick="editTask(${i})">${task.text}</label>
            <button class="edit-btn" onclick="editTask(${i})">Editar</button>
            <button class="delete-btn" onclick="deleteTask(${i})">Eliminar</button>
        `;
        checklist.appendChild(li);
    });
    updateCounter();
}

function updateCounter() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    counter.textContent = `Completadas: ${done} / Total: ${total}`;
}

checklist.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        const idx = e.target.getAttribute('data-index');
        tasks[idx].completed = e.target.checked;
        saveTasks();
        renderTasks();
        showNotification(tasks[idx].completed ? "¡Tarea completada!" : "Tarea marcada como pendiente");
    }
});

addBtn.onclick = addTask;
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const text = input.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        input.value = '';
        saveTasks();
        renderTasks();
        showNotification("¡Tarea agregada!");
    }
}

window.editTask = function(i) {
    const newText = prompt("Editar tarea:", tasks[i].text);
    if (newText !== null && newText.trim() !== "") {
        tasks[i].text = newText.trim();
        saveTasks();
        renderTasks();
        showNotification("Tarea editada");
    }
};

window.deleteTask = function(i) {
    if (confirm("¿Eliminar esta tarea?")) {
        tasks.splice(i, 1);
        saveTasks();
        renderTasks();
        showNotification("Tarea eliminada");
    }
};

clearCompletedBtn.onclick = function() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    showNotification("Tareas completadas eliminadas");
};

toggleThemeBtn.onclick = function() {
    isLight = !isLight;
    document.body.classList.toggle('light', isLight);
    showNotification(isLight ? "Modo claro" : "Modo oscuro");
};