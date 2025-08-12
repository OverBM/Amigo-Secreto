// Variables
const entrada = document.getElementById('entrada-nombre');
const botonAgregar = document.getElementById('boton-agregar');
const botonSortear = document.getElementById('boton-sortear');
const botonSortearEliminar = document.getElementById('boton-sortear-eliminar');
const botonVerLista = document.getElementById('boton-ver-lista');
const botonSortearNuevamente = document.getElementById('boton-sortear-nuevamente');
const lista = document.getElementById('lista-amigos');
const contenedorLista = document.getElementById('contenedor-lista');
const contenedorRuleta = document.getElementById('contenedor-ruleta');
const ruleta = document.getElementById('ruleta');
const botonesGrupo = document.querySelector('.botones-grupo');
const sonidoTick = document.getElementById('sonido-ruleta-tick');

let anguloActual = 0;
let nombres = [];
let ultimoNombreSorteado = null;
let estadoVisualizacion = 0; // 0: oculto, 1: mostrar sorteado, 2: mostrar lista
let girandoRuleta = false;
let animacionTerminada = false;

// Colores para los segmentos de la ruleta
const coloresRuleta = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FCEA2B',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#C44569', '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8'
];

// Utilidades para responsive
const esMobile = () => window.innerWidth <= 1200;
const obtenerRadioTranslate = () => esMobile() ? -125 : -263;

// Funciones de la ruleta
function crearRuleta(nombres) {
  ruleta.innerHTML = '';
  const segmentos = nombres.length;
  const anguloPorSegmento = 360 / segmentos;
  const radioTranslate = obtenerRadioTranslate();

  // Generar el background con todos los colores
  const gradiente = nombres.reduce((acc, _, index) => {
    const color = coloresRuleta[index % coloresRuleta.length];
    const inicio = index * anguloPorSegmento;
    const fin = inicio + anguloPorSegmento;
    return acc + `${color} ${inicio}deg ${fin}deg${index < nombres.length - 1 ? ', ' : ''}`;
  }, 'conic-gradient(') + ')';

  ruleta.style.background = gradiente;

  // Posicionar los textos sobre la ruleta
  nombres.forEach((nombre, index) => {
    const angulo = index * anguloPorSegmento + anguloPorSegmento / 2;
    const texto = document.createElement('div');
    texto.className = 'texto-segmento';
    texto.textContent = nombre;
    texto.style.transform = `rotate(${angulo}deg) translateY(${radioTranslate}px) rotate(${-angulo}deg)`;
    ruleta.appendChild(texto);
  });
}

function mostrarRuleta() {
  if (nombres.length === 0) return;
  
  crearRuleta(nombres);
  ruleta.style.transition = 'none';
  ruleta.style.transform = `rotate(${anguloActual}deg)`;
  
  contenedorRuleta.style.display = 'flex';
  girandoRuleta = true;
  
  // Deshabilitar elementos durante la animación
  botonesGrupo.classList.add('botones-deshabilitados');
  botonAgregar.disabled = true;
  entrada.disabled = true;
  
  // Reproducir sonido
  if (sonidoTick) {
    sonidoTick.currentTime = 0;
    sonidoTick.loop = true;
    sonidoTick.play().catch(e => console.warn("No se pudo reproducir el sonido automáticamente:", e));
  }
}

function ocultarRuleta() {
  contenedorRuleta.style.display = 'none';
  girandoRuleta = false;
  
  // Rehabilitar elementos
  botonesGrupo.classList.remove('botones-deshabilitados');
  botonAgregar.disabled = false;
  entrada.disabled = false;
  
  if (sonidoTick) {
    sonidoTick.pause();
    sonidoTick.currentTime = 0;
    sonidoTick.loop = false;
  }
}

function girarRuleta(callback, nombreGanador) {
  const totalSegmentos = nombres.length;
  const anguloPorSegmento = 360 / totalSegmentos;
  const indiceGanador = nombres.indexOf(nombreGanador);
  
  if (indiceGanador === -1) {
    console.error('Nombre no encontrado en la lista');
    return;
  }

  const anguloCentroGanador = indiceGanador * anguloPorSegmento + anguloPorSegmento / 2;
  const vueltas = 5;
  const anguloFinal = (vueltas * 360) + (360 - anguloCentroGanador) + 90;

  animacionTerminada = false;
  girandoRuleta = true;
  
  ruleta.style.transition = 'none';
  ruleta.style.transform = `rotate(${anguloActual}deg)`;
  void ruleta.offsetWidth; // Forzar reflow

  requestAnimationFrame(() => {
    ruleta.style.transition = 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)';
    ruleta.style.transform = `rotate(${anguloFinal}deg)`;
    anguloActual = anguloFinal % 360;
  });

  setTimeout(() => {
    if (!animacionTerminada) {
      animacionTerminada = true;
      girandoRuleta = false;
      callback();
    }
  }, 4000);
}

// Funciones de lista
function actualizarLista() {
  lista.innerHTML = '';
  
  if (nombres.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No hay nombres en la lista.';
    li.className = 'lista-vacia';
    lista.appendChild(li);
    return;
  }

  nombres.forEach((nombre, index) => {
    const li = document.createElement('li');
    li.className = 'item-lista';
    
    const spanNombre = document.createElement('span');
    spanNombre.textContent = `${index + 1}. ${nombre}`;
    spanNombre.className = 'nombre-item';
    
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.className = 'boton-eliminar';
    botonEliminar.addEventListener('click', () => eliminarNombre(index));
    
    li.appendChild(spanNombre);
    li.appendChild(botonEliminar);
    lista.appendChild(li);
  });
}

function eliminarNombre(index) {
  if (confirm(`¿Deseas eliminar a "${nombres[index]}" de la lista?`)) {
    if (nombres[index] === ultimoNombreSorteado) {
      ultimoNombreSorteado = null;
    }
    nombres.splice(index, 1);
    actualizarLista();
  }
}

function agregarNombre() {
  const nombre = entrada.value.trim();
  
  if (nombre === '') {
    alert("Por favor, ingresa un nombre.");
    return;
  }
  
  if (nombres.includes(nombre)) {
    alert("El nombre ya está en la lista.");
    return;
  }

  nombres.push(nombre);
  entrada.value = '';
  actualizarLista();
  
  // Asegurar que la lista esté visible
  contenedorLista.classList.add('activa');
  estadoVisualizacion = 2;
}

function mostrarNombreSorteado(nombre, mostrarEfectos = true) {
  if (mostrarEfectos) {
    // Reproducir sonido de ganador
    const sonido = document.getElementById('sonido-sorteo');
    if (sonido) {
      sonido.currentTime = 0;
      sonido.play().catch(e => console.warn("No se pudo reproducir el sonido automáticamente:", e));
    }
    
    // Lanzar confeti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 }
    });
  }

  // Mostrar el nombre sorteado
  lista.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = nombre;
  li.className = 'nombre-sorteado';
  lista.appendChild(li);
}

// Funciones de sorteo
function sortearNombre() {
  if (nombres.length === 0) {
    alert("No hay nombres para sortear.");
    return;
  }
  
  if (girandoRuleta) return;

  const indice = Math.floor(Math.random() * nombres.length);
  const nombre = nombres[indice];
  ultimoNombreSorteado = nombre;
  
  mostrarRuleta();
  girarRuleta(() => {
    ocultarRuleta();
    mostrarNombreSorteado(nombre);
    botonSortearNuevamente.style.display = 'inline-block';
    contenedorLista.classList.add('activa');
    estadoVisualizacion = 1;
  }, nombre);
}

function sortearPorEliminacion() {
  if (nombres.length === 0) {
    alert("No hay más nombres para sortear.");
    return;
  }
  
  if (girandoRuleta) return;

  const indice = Math.floor(Math.random() * nombres.length);
  const nombre = nombres[indice];
  ultimoNombreSorteado = nombre;
  
  mostrarRuleta();
  girarRuleta(() => {
    ocultarRuleta();
    mostrarNombreSorteado(nombre);
    nombres.splice(indice, 1); // Eliminar el nombre sorteado
    botonSortearNuevamente.style.display = 'inline-block';
    contenedorLista.classList.add('activa');
    estadoVisualizacion = 1;
  }, nombre);
}

function sortearNuevamente() {
  if (!confirm("¿Deseas iniciar un nuevo sorteo? Se borrará la lista actual.")) {
    return;
  }
  
  // Reiniciar todo
  nombres = [];
  ultimoNombreSorteado = null;
  entrada.value = '';
  lista.innerHTML = '';
  contenedorLista.classList.remove('activa');
  botonSortearNuevamente.style.display = 'none';
  estadoVisualizacion = 0;
  
  // Resetear la rotación de la ruleta
  ruleta.style.transform = 'rotate(0deg)';
  anguloActual = 0;
}

function listaNombres() {
  if (girandoRuleta) return;
  
  estadoVisualizacion = (estadoVisualizacion + 1) % 3;
  
  if (estadoVisualizacion === 0) {
    contenedorLista.classList.remove('activa');
    lista.innerHTML = '';
  } else if (estadoVisualizacion === 1) {
    if (ultimoNombreSorteado) {
      contenedorLista.classList.add('activa');
      mostrarNombreSorteado(ultimoNombreSorteado, false);
    } else {
      estadoVisualizacion = 2;
      contenedorLista.classList.add('activa');
      actualizarLista();
    }
  } else if (estadoVisualizacion === 2) {
    contenedorLista.classList.add('activa');
    actualizarLista();
  }
}

// Lista de eventos
function inicializarEventos() {
  botonAgregar.addEventListener('click', agregarNombre);
  botonSortear.addEventListener('click', sortearNombre);
  botonSortearEliminar.addEventListener('click', sortearPorEliminacion);
  botonVerLista.addEventListener('click', listaNombres);
  botonSortearNuevamente.addEventListener('click', sortearNuevamente);
  
  entrada.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') agregarNombre();
  });
  
  // Recalcular ruleta al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    if (girandoRuleta && nombres.length > 0) {
      setTimeout(() => crearRuleta(nombres), 100);
    }
  });
}

// Fondo animado estelar
class FondoAnimado {
  constructor() {
    this.canvas = document.getElementById("fondo-animado");
    this.ctx = this.canvas.getContext("2d");
    this.particulas = [];
    this.cursor = { x: null, y: null };
    
    this.init();
  }
  
  init() {
    this.ajustarCanvas();
    this.crearParticulas(160);
    this.configurarEventos();
    this.animar();
  }
  
  ajustarCanvas() {
    this.ancho = this.canvas.width = window.innerWidth;
    this.alto = this.canvas.height = window.innerHeight;
  }
  
  configurarEventos() {
    window.addEventListener("resize", () => this.ajustarCanvas());
    
    window.addEventListener("mousemove", (e) => {
      this.cursor.x = e.clientX;
      this.cursor.y = e.clientY;
    });
    
    window.addEventListener("click", () => {
      this.particulas.forEach(p => {
        p.dx = (Math.random() - 0.5) * 2;
        p.dy = (Math.random() - 0.5) * 2;
      });
    });
  }
  
  crearParticulas(num) {
    this.particulas = [];
    for (let i = 0; i < num; i++) {
      this.particulas.push({
        x: Math.random() * this.ancho,
        y: Math.random() * this.alto,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        radio: Math.random() * 2 + 1
      });
    }
  }
  
  animar() {
    this.ctx.fillStyle = "rgba(0, 0, 19, 0.3)";
    this.ctx.fillRect(0, 0, this.ancho, this.alto);
    
    this.particulas.forEach(p => {
      // Movimiento
      p.x += p.dx;
      p.y += p.dy;
      
      // Rebotes en bordes
      if (p.x < 0 || p.x > this.ancho) p.dx *= -1;
      if (p.y < 0 || p.y > this.alto) p.dy *= -1;
      
      // Interacción con cursor
      if (this.cursor.x !== null && this.cursor.y !== null) {
        const dx = this.cursor.x - p.x;
        const dy = this.cursor.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          p.x += dx * 0.015;
          p.y += dy * 0.015;
        }
      }
      
      // Dibujar partícula
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      this.ctx.fillStyle = "#aaa9a0ff";
      this.ctx.fill();
    });
    
    // Dibujar conexiones
    for (let i = 0; i < this.particulas.length; i++) {
      for (let j = i + 1; j < this.particulas.length; j++) {
        const a = this.particulas[i];
        const b = this.particulas[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const opacidad = 0.1 + (1 - dist / 100);
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(255,255,255,${opacidad})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animar());
  }
}

// Inicializar aplicación
inicializarEventos();
new FondoAnimado();