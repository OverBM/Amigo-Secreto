# AmigoSecreto

---
### Importante
**USAR EL BRANCH MAIN PARA CLONAR EL PROYECTO, EN GH-PAGES ESTA MODIFICADO EL CONTENIDO DE HTML DEBIDO A QUE EL GIF moon.gif ES DEMASIADO GRANDE PARA SUBIR A GITHUB PAGES**

---

### Descripción

**AmigoSecreto** es una aplicación web interactiva desarrollada con HTML, CSS y JavaScript, diseñada como un sorteo de un juego llamado "Amigo Secreto". El proyecto ofrece una experiencia de usuario atractiva y gamificada, permitiendo a los participantes ingresar nombres y visualizarlos en una ruleta animada que realiza la selección aleatoria. La pagina web cuenta con responsive, lo que permite abrir en cualquier dispositivo con conexion a internet, ademas de no tener dependencias de servidor.

---

### Funcionalidades Destacadas

* **Gestión de Participantes:** Interfaz intuitiva para **agregar** y **eliminar** nombres de la lista de participantes en tiempo real.
* **Ruleta Interactiva:** Un componente de ruleta animado y visualmente dinámico que se adapta al número de participantes, brindando un método de sorteo atractivo.
* **Múltiples Modos de Sorteo:** La aplicación permite elegir entre dos modalidades:
    * **Sorteo normal:** Selecciona un nombre al azar sin retirarlo de la lista.
    * **Sorteo por eliminación:** Elige un ganador y lo elimina de la lista, ideal para realizar múltiples sorteos consecutivos sin repeticiones.
* **Visual y auditivo:** Incluye efectos de sonido para la ruleta y confeti al anunciar al ganador, enriqueciendo la experiencia del usuario.
* **Diseño Responsivo:** El diseño de la interfaz se adapta para funcionar sin problemas tanto en dispositivos móviles como en pantallas de escritorio.

---

### Tecnologías Utilizadas

* **HTML5:** Provee la estructura semántica de la página, incluyendo los elementos de la interfaz de usuario y los contenedores de la ruleta.
* **CSS:** Utilizado para la estilización, el diseño responsivo a través de `@media queries`, las animaciones y la creación de un fondo interactivo con variables CSS para una gestión consistente de la paleta de colores.
* **JavaScript:** La lógica principal reside en este lenguaje, manejando el **DOM**, los eventos del usuario, el algoritmo de sorteo aleatorio, y la clase **FondoAnimado** para el fondo estelar.

---

### Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

``` 
Amigo-Secreto/
├── assets/
│   ├── moon.gif          # Imagen de gif de la luna
│   ├── sonidowin.mp3     # Sonido de victoria al sortear
│   └── tick.mp3          # Sonido de la ruleta al girar
├── .gitattributes        # Usado en assets/moon.gif para comprimirlo
├── index.html            # Estructura principal del sitio
├── style.css             # Estilos y diseño de la aplicación
└── app.js                # Lógica central en JavaScript 
```

---

### Instalación

Para poner en funcionamiento este proyecto, no se requiere ningún paso de construcción ni la instalación de dependencias externas. Siga estos sencillos pasos:

1.  **Clonar el repositorio:** Abra su terminal o línea de comandos y ejecute el siguiente comando.
     ```bash
    git clone --single-branch --branch main https://github.com/OverBM/Amigo-Secreto.git
    ``` 
    En caso de que no funcione clonar directamente desde el main puede usar esta otra forma:
    ```bash
    git clone https://github.com/OverBM/Amigo-Secreto.git
    ```
2.  **Abrir el archivo:** Navegue al directorio del proyecto y abra el archivo **`index.html`** directamente en su navegador web. Para una mejor experiencia de desarrollo, puede usar un servidor local como **Live Server** en VS Code.
