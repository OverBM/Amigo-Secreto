// Variables globales
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

// Inicializar eventos principales
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

// Clase para el fondo animado optimizado
class FondoAnimado {
  constructor() {
    this.canvas = document.getElementById("fondo-animado");
    this.ctx = this.canvas.getContext("2d");
    this.particulas = [];
    this.cursor = { x: null, y: null };
    
    this.inicializarConfiguracion();
    this.init();
  }
  
  inicializarConfiguracion() {
    // Detección de dispositivos
    this.esMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.esDispositivoLento = this.esMobile || window.innerWidth < 1200 || navigator.hardwareConcurrency < 4;
    
    // Configuración fija de partículas
    this.config = {
      numParticulas: 120, // 120 partículas
      velocidadMaxima: this.esDispositivoLento ? 0.8 : 1.5,
      radioMaximo: this.esDispositivoLento ? 1.5 : 2,
      distanciaConexion: this.esDispositivoLento ? 60 : 100,
      distanciaInteraccion: this.esDispositivoLento ? 0 : 150, // Sin interacción en móviles
      opacidadFondo: this.esDispositivoLento ? 0.4 : 0.3,
      factorInteraccion: 0.015,
      colorParticula: "#aaa9a0ff",
      anchoLinea: this.esDispositivoLento ? 0.6 : 0.8
    };
    
    // Control de FPS
    this.ultimoFrame = 0;
    this.fps = this.esDispositivoLento ? 30 : 60;
    this.intervaloFrame = 1000 / this.fps;
  }
  
  init() {
    this.ajustarCanvas();
    this.crearParticulas();
    this.configurarEventos();
    this.animar(0);
  }
  
  ajustarCanvas() {
    this.ancho = this.canvas.width = window.innerWidth;
    this.alto = this.canvas.height = window.innerHeight;
  }
  
  configurarEventos() {
    // Resize con throttle
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.ajustarCanvas();
      }, 150);
    });
    
    // Solo eventos de interacción en dispositivos de escritorio
    if (!this.esDispositivoLento) {
      this.configurarEventosEscritorio();
    } else {
      this.deshabilitarEventosMoviles();
    }
  }
  
  configurarEventosEscritorio() {
    // Mousemove con throttle
    let mouseMoveTimeout;
    window.addEventListener("mousemove", (e) => {
      if (!mouseMoveTimeout) {
        mouseMoveTimeout = setTimeout(() => {
          this.cursor.x = e.clientX;
          this.cursor.y = e.clientY;
          mouseMoveTimeout = null;
        }, 16);
      }
    });
    
    window.addEventListener("click", () => {
      this.particulas.forEach(p => {
        p.dx = (Math.random() - 0.5) * this.config.velocidadMaxima;
        p.dy = (Math.random() - 0.5) * this.config.velocidadMaxima;
      });
    });
    
    window.addEventListener("mouseleave", () => {
      this.cursor.x = null;
      this.cursor.y = null;
    });
  }
  
  deshabilitarEventosMoviles() {
    // Prevenir interacciones táctiles que causan lag
      const preventDefault = (e) => e.preventDefault();
    
      this.canvas.addEventListener("touchstart", preventDefault, { passive: false });
      this.canvas.addEventListener("touchmove", preventDefault, { passive: false });
      this.canvas.addEventListener("touchend", preventDefault, { passive: false });
    
      this.cursor.x = null;
      this.cursor.y = null;
  }
  
  crearParticulas() {
    this.particulas = [];
    for (let i = 0; i < this.config.numParticulas; i++) {
      this.particulas.push({
        x: Math.random() * this.ancho,
        y: Math.random() * this.alto,
        dx: (Math.random() - 0.5) * this.config.velocidadMaxima,
        dy: (Math.random() - 0.5) * this.config.velocidadMaxima,
        radio: Math.random() * this.config.radioMaximo + 1
      });
    }
  }
  
  animar(tiempoActual) {
    // Control de FPS
    if (tiempoActual - this.ultimoFrame < this.intervaloFrame) {
      requestAnimationFrame(this.animar.bind(this));
      return;
    }
    this.ultimoFrame = tiempoActual;
    
    this.limpiarCanvas();
    this.actualizarParticulas();
    this.dibujarParticulas();
    
    // Solo dibujar conexiones en escritorio para mejor rendimiento
    if (!this.esDispositivoLento) {
      this.dibujarConexiones();
    }
    
    requestAnimationFrame(this.animar.bind(this));
  }
  
  limpiarCanvas() {
    this.ctx.fillStyle = `rgba(0, 0, 19, ${this.config.opacidadFondo})`;
    this.ctx.fillRect(0, 0, this.ancho, this.alto);
  }
  
  actualizarParticulas() {
    this.particulas.forEach(p => {
      // Movimiento básico
      p.x += p.dx;
      p.y += p.dy;
      
      // Rebotes optimizados
      if (p.x < 0 || p.x > this.ancho) {
        p.dx *= -1;
        p.x = Math.max(0, Math.min(this.ancho, p.x));
      }
      if (p.y < 0 || p.y > this.alto) {
        p.dy *= -1;
        p.y = Math.max(0, Math.min(this.alto, p.y));
      }
      
      // Interacción con cursor solo en escritorio
      if (!this.esDispositivoLento && this.cursor.x !== null && this.cursor.y !== null) {
        this.aplicarInteraccionCursor(p);
      }
    });
  }
  
  aplicarInteraccionCursor(particula) {
    const dx = this.cursor.x - particula.x;
    const dy = this.cursor.y - particula.y;
    const distSq = dx * dx + dy * dy;
    const maxDistSq = this.config.distanciaInteraccion * this.config.distanciaInteraccion;
    
    if (distSq < maxDistSq) {
      const factor = this.config.factorInteraccion * (1 - distSq / maxDistSq);
      particula.x += dx * factor;
      particula.y += dy * factor;
    }
  }
  
  dibujarParticulas() {
    this.ctx.fillStyle = this.config.colorParticula;
    this.particulas.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);

      this.ctx.fill();
    });
  }
  
  dibujarConexiones() {
    const distanciaSq = this.config.distanciaConexion * this.config.distanciaConexion;
    for (let i = 0; i < this.particulas.length; i++) {
      for (let j = i + 1; j < this.particulas.length; j++) {
        const a = this.particulas[i];
        const b = this.particulas[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < distanciaSq) {
          const opacidad = 0.1 + (1 - distSq / distanciaSq) * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(255,255,255,${opacidad})`;
          this.ctx.lineWidth = this.config.anchoLinea;
          this.ctx.stroke();
        }
      }
    }
  
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  inicializarEventos();
  new FondoAnimado();
});
