document.addEventListener('DOMContentLoaded', function () { //esperar a q el DOM esté cargado

  var currentUser = JSON.parse(localStorage.getItem('currentUser')); //recuperar el usuario desde el localStorage

  if (currentUser) {
    //console.log("UID del usuario almacenado:", currentUser.uid);
    if (currentUser.uid.toString() == 'ryN8Qk0lOrV5zHBNj3MaJAUeZj42') {
      console.log('usuario con permisos autenticado');
      mostrarTodo(true);
    } else {
      console.log('usuario sin permisos autenticado');
      mostrarTodo(false);
    }

  } else {
    console.log('No hay usuario almacenado.');
    window.location.href = '../index.html';
  }

  //cerrar sesión
  var btnCerrarSesion = document.getElementById('cerrarSesion');
  btnCerrarSesion.onclick = function () {
    firebase.auth().signOut().then(() => {
      console.log('Sesión cerrada correctamente');
      window.location.href = '../index.html';
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  };
});


function mostrarTodo(booleanArg) { //para mostrar u ocultar ciertas secciones dependiendo de los permisos
  var elements = document.getElementsByClassName('soloAdmin');
  for (var i = 0; i < elements.length; i++) {
    if (booleanArg) {
      elements[i].style.display = '';
    } else {
      elements[i].style.display = 'none';
    }
  }
}

function mostrarProductos(nombreFiltro, consultaBusqueda = '') {
  // Obtiene la referencia a la rama 'Producto' en la base de datos
  const productosRef = firebase.database().ref('Producto');

  // Array para almacenar los productos
  const productosArray = [];

  // Lee los datos una vez desde la referencia
  productosRef.once('value')
    .then((snapshot) => {
      // Obtiene el valor de los datos leídos
      const productos = snapshot.val();
      console.log('Productos:', productos);

      // Si hay productos, los agrega al array
      if (productos) {
        Object.keys(productos).forEach((key) => {
          productosArray.push(productos[key]);
        });

        const contenedor = document.getElementById('resto-seccion-productos');
        contenedor.innerHTML = '';

        productosArray.forEach(producto => {
          // Crear el div contenedor para cada producto
          const productoDiv = document.createElement('div');
          productoDiv.classList.add('producto', 'cardboard'); // Añadir las clases

          // Crear el elemento de la imagen
          const img = document.createElement('img');
          img.src = producto.RutaImagen;
          img.alt = producto.Descripcion;
          productoDiv.appendChild(img);

          // Crear el elemento del nombre del producto
          const descripcion = document.createElement('h2');
          descripcion.textContent = producto.Descripcion;
          productoDiv.appendChild(descripcion);

          // Crear el elemento de los ingredientes
          const ingredientes = document.createElement('p');
          ingredientes.textContent = `Ingredientes: ${producto.Ingredientes}`;
          productoDiv.appendChild(ingredientes);

          // Crear el elemento del precio
          const precio = document.createElement('p');
          precio.textContent = `Precio: $${producto.Precio.toFixed(2)}`;
          productoDiv.appendChild(precio);

          // Crear el elemento del stock
          const stock = document.createElement('p');
          stock.textContent = `Stock: ${producto.Stock}`;
          productoDiv.appendChild(stock);

          // Añadir el div del producto al contenedor principal
          var anadirProd = false;

          if (consultaBusqueda == '') {
            switch (nombreFiltro) {
              case 'todos':
                anadirProd = true;
                break;
              case 'Disponibles':
                //console.log(productoDiv);
                if (parseInt(producto.Stock) > 0) {
                  anadirProd = true;
                }
                break;
              case 'No disponibles':
                if (parseInt(producto.Stock) <= 0) {
                  anadirProd = true;
                }
                break;
            }
          } else {
            if (producto.Descripcion.toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim())) {
              anadirProd = true;
            }
          }

          //console.log('antes de añadir');
          //añadimos
          if (anadirProd) {
            //console.log('añadir');
            contenedor.appendChild(productoDiv);
          }

        });

      } else {
        console.log('No hay productos disponibles.');
      }
    })
    .catch((error) => {
      console.error('Error al leer los productos:', error);
    });
}

/*SIDEBAR*/
document.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('.nav-list li[data-content]');
  const contentSections = document.querySelectorAll('.content-section');
  let sidebar = document.querySelector(".sidebar");
  let closeBtn = document.querySelector("#btn");

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const contentToShow = item.getAttribute('data-content');

      // Cerrar la barra lateral si está abierta
      if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        menuBtnChange();
      }

      contentSections.forEach(section => {
        section.style.display = 'none';
      });

      document.getElementById(contentToShow).style.display = 'block';
      var nombreSeccion = document.getElementById(contentToShow).getAttribute('data-name');
      switch (nombreSeccion) {
        case 'pedidos':
          console.log('pedidos');
          break;
        case 'productos':
          //console.log('productos');
          mostrarProductos('todos');
          setUpBarraBusqueda('productos');
          setUpAnadirProd();
          break;
        case 'ofertas':
          mostrarOfertas('todos');
          setUpBarraBusqueda('ofertas');
          setUpAnadirOferta();
          break;
        case 'clientes':
          //console.log('clientes');
          mostrarClientes('todos');
          setUpBarraBusqueda('clientes');
          break;
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
  });

  function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  }
});

function mostrarOfertas(nombreFiltro, consultaBusqueda = '') {
  // Obtiene la referencia a la rama 'Ofertas' en la base de datos
  const ofertasRef = firebase.database().ref('Oferta');
  const productosRef = firebase.database().ref('Producto'); // Referencia a la rama 'Producto'

  // Array para almacenar las ofertas
  const ofertasArray = [];

  // Lee los datos una vez desde la referencia
  ofertasRef.once('value')
    .then((snapshot) => {
      // Obtiene el valor de los datos leídos
      const ofertas = snapshot.val();
      console.log('Ofertas:', ofertas);

      // Si hay ofertas, las agrega al array
      if (ofertas) {
        // Leer las ofertas y construir el array
        Object.keys(ofertas).forEach((key) => {
          const oferta = ofertas[key];
          const ofertaObj = {
            Activada: oferta.Activada,
            Descuento: oferta.Descuento,
            IdOferta: oferta.IdOferta,
            Nombre: oferta.Nombre,
            ProductosId: oferta.ProductosId,
            RutaImagenOferta: oferta.RutaImagenOferta
          };
          ofertasArray.push(ofertaObj);
        });

        const contenedor = document.getElementById('resto-seccion-ofertas');
        contenedor.innerHTML = '';

        // Iterar sobre las ofertas para mostrarlas
        ofertasArray.forEach(oferta => {
          // Crear el div contenedor para cada oferta
          const ofertaDiv = document.createElement('div');
          ofertaDiv.classList.add('oferta', 'cardboard'); // Añadir las clases

          // Crear el elemento de la imagen
          const img = document.createElement('img');
          img.src = oferta.RutaImagenOferta;
          img.alt = oferta.Nombre;
          ofertaDiv.appendChild(img);

          // Crear el elemento del nombre de la oferta
          const nombre = document.createElement('h2');
          nombre.textContent = oferta.Nombre;
          ofertaDiv.appendChild(nombre);

          // Obtener la descripción de los productos asociados a la oferta
          const productosId = oferta.ProductosId;
          productosId.forEach(productoId => {
            // Buscar el producto en la base de datos
            productosRef.child(productoId).once('value')
              .then((snapshot) => {
                const producto = snapshot.val();
                if (producto) {
                  // Agregar el producto al div de la oferta
                  const productosEl = document.createElement('p');
                  productosEl.textContent = `Producto: ${producto.Descripcion}`;
                  ofertaDiv.appendChild(productosEl);
                }
              })
              .catch((error) => {
                console.error('Error al leer el producto:', error);
              });
          });

          // Crear el elemento del descuento de la oferta
          const descuento = document.createElement('p');
          descuento.textContent = `Descuento: ${oferta.Descuento * 100}%`;
          ofertaDiv.appendChild(descuento);

          var anadirOferta = false;

          if (consultaBusqueda == '') {
            switch (nombreFiltro) {
              case 'disponibles':
                if (oferta.Activada) {
                  anadirOferta = true;
                }
                break;
              case 'noDisponibles':
                if (!oferta.Activada) {
                  anadirOferta = true;
                }
                break;
              case 'todos':
                anadirOferta = true;
                break;
            }
          } else {
            if (oferta.Nombre.toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim())) {
              anadirOferta = true;
            }
          }

          // Añadir el div de la oferta al contenedor principal
          if (anadirOferta) {
            contenedor.appendChild(ofertaDiv);
          }
        });

      } else {
        console.log('No hay ofertas disponibles.');
      }
    })
    .catch((error) => {
      console.error('Error al leer las ofertas:', error);
    });
}


function setUpBarraBusqueda(seccion) {
  switch (seccion) {
    case 'productos':
      var caja = document.getElementById('txt-prod');
      var lupa = document.getElementById('btn-lupa-prod');
      var disponibles = document.getElementById('opc1-prod');
      var noDisponibles = document.getElementById('opc2-prod');
      var todos = document.getElementById('opc3-prod');

      lupa.onclick = function () {
        mostrarProductos('todos', caja.value);
      };

      disponibles.onclick = function () {
        mostrarProductos('Disponibles');
      };

      noDisponibles.onclick = function () {
        mostrarProductos('No disponibles');
      };

      todos.onclick = function () {
        mostrarProductos('todos');
      };
      break;
    case 'clientes':
      var caja = document.getElementById('txt-cli');
      var lupa = document.getElementById('btn-lupa-cli');
      var activos = document.getElementById('opc1-cli');
      var bloqueados = document.getElementById('opc2-cli');
      var todos = document.getElementById('opc3-cli');

      lupa.onclick = function () {
        //console.log('click');
        mostrarClientes('todos', caja.value);
      };

      todos.onclick = function () {
        mostrarClientes('todos');
        //console.log('click en todos');
      };

      activos.onclick = function () {
        mostrarClientes('activos');
      };

      bloqueados.onclick = function () {
        mostrarClientes('bloqueados');
      };

      break;
    case 'ofertas':
      var caja = document.getElementById('txt-of');
      var lupa = document.getElementById('btn-lupa-of');
      var disponibles = document.getElementById('opc1-of');
      var noDisponibles = document.getElementById('opc2-of');
      var todos = document.getElementById('opc3-of');

      lupa.onclick = function () {
        mostrarOfertas('todos', caja.value);
      };

      disponibles.onclick = function () {
        mostrarOfertas('disponibles');
      };

      noDisponibles.onclick = function () {
        mostrarOfertas('noDisponibles');
      };

      todos.onclick = function () {
        mostrarOfertas('todos');
      };

      break;
  }
}


function setUpAnadirProd() {
  var boton = document.getElementById('btMasProd');
  boton.onclick = function () {

    // Limpiar el contenido de #resto-seccion
    var restoSeccion = document.getElementById('resto-seccion-productos');
    restoSeccion.innerHTML = '';

    //ocultar botones
    var barraBusqueda = document.getElementById('search-container-prod');
    var menuDesplegable = document.getElementById('dropdown-prod');
    barraBusqueda.style.display = 'none';
    menuDesplegable.style.display = 'none';
    boton.style.display = 'none';

    // Crear el contenedor del formulario
    var modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Crear el formulario
    var form = document.createElement('form');
    form.id = 'modal-form';

    // Crear campos del formulario
    var campos = [
      { label: 'Descripción', name: 'descripcion', type: 'text' },
      { label: 'ID del Producto', name: 'idProducto', type: 'text' },
      { label: 'Ingredientes', name: 'ingredientes', type: 'text' },
      { label: 'Precio', name: 'precio', type: 'number' },
      { label: 'URL de la Imagen', name: 'urlimagen', type: 'url' },
      { label: 'Stock', name: 'stock', type: 'number' },
      { label: 'Tipo', name: 'tipo', type: 'text' }
    ];

    campos.forEach(function (campo) {
      var label = document.createElement('label');
      label.textContent = campo.label;

      var input = document.createElement('input');
      input.type = campo.type;
      input.name = campo.name;
      input.required = true;

      form.appendChild(label);
      form.appendChild(input);
    });

    // Crear botón de enviar
    var btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    restoSeccion.appendChild(form);

    // Manejar el evento de envío del formulario
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var producto = {
        descripcion: form.descripcion.value,
        idProducto: form.idProducto.value,
        ingredientes: form.ingredientes.value,
        precio: parseFloat(form.precio.value), // Convertir el precio a número
        urlimagen: form.urlimagen.value,
        stock: parseInt(form.stock.value), // Convertir el stock a número entero
        tipo: form.tipo.value
      };
      guardarProductoBBDD(producto);/*.then(() => {
        setTimeout(() => {
          mostrarProductos('todos');
        }, 500);
      });*/

      //borro el formulario
      restoSeccion.innerHTML = '';

      //muestro los botones
      barraBusqueda.style.display = '';
      menuDesplegable.style.display = '';
      boton.style.display = '';

      //actualizo la busqueda
      mostrarProductos('todos');

      //alert de q se ha enviado
      //alert('Formulario enviado!');
    });

  };
}
/*
function setUpAnadirOferta() {
  var btn = document.getElementById('btMasOf');
  btn.onclick = function () {

    // Limpiar pantalla
    var barraBusqueda = document.getElementById('search-container-ofertas');
    var dropdown = document.getElementById('dropdown-ofertas');
    var restoSeccion = document.getElementById('resto-seccion-ofertas');

    barraBusqueda.style.display = 'none';
    dropdown.style.display = 'none';
    restoSeccion.innerHTML = '';

    // Crear el contenedor del formulario
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Crear el formulario
    const form = document.createElement('form');
    form.id = 'oferta-form';

    // Crear campos del formulario
    const campos = [
      { label: 'Nombre', name: 'nombre', type: 'text' },
      { label: 'Descuento', name: 'descuento', type: 'number' },
      { label: 'Productos (IDs separados por espacios)', name: 'productos', type: 'text' },
      { label: 'Imagen de la Oferta (URL)', name: 'imagen', type: 'url' },
      { label: 'Activada', name: 'activada', type: 'checkbox' },
      { label: 'Condiciones', name: 'condiciones', type: 'text' },
      { label: 'IdOferta', name: 'idOferta', type: 'number' },
      { label: 'MenusId (IDs separados por espacios)', name: 'menusId', type: 'text' },
      { label: 'OfertasId (IDs separados por espacios)', name: 'ofertasId', type: 'text' },
      { label: 'ProductosId (IDs separados por espacios)', name: 'productosId', type: 'text' },
    ];

    campos.forEach(function (campo) {
      const label = document.createElement('label');
      label.textContent = campo.label;

      const input = document.createElement('input');
      input.type = campo.type;
      input.name = campo.name;
      input.required = true;

      form.appendChild(label);
      form.appendChild(input);
    });

    // Crear botón de enviar
    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    modalContainer.appendChild(form);

    // Manejar el evento de envío del formulario
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Obtener los valores del formulario
      const oferta = {
        nombre: form.nombre.value,
        descuento: parseFloat(form.descuento.value), // Convertir el descuento a número
        productos: form.productos.value.split(' '), // Separar los productos por espacios
        imagen: form.imagen.value,
        activada: form.activada.checked,
        condiciones: form.condiciones.value.split(',').map(cond => cond.trim()), // Separar y limpiar las condiciones
        idOferta: parseInt(form.idOferta.value),
        menusId: form.menusId.value.split(' '), // Separar los IDs de menús por espacios
        ofertasId: form.ofertasId.value.split(' '), // Separar los IDs de ofertas por espacios
        productosId: form.productosId.value.split(' ') // Separar los IDs de productos por espacios
      };

      // Guardar la oferta en la base de datos
      guardarOfertaBBDD(oferta);

      // Resetear el formulario
      //form.reset();
    });

    // Agregar el formulario al cuerpo del documento
    restoSeccion.appendChild(modalContainer);
    //document.body.appendChild(modalContainer);

    // Ocultar formulario y volver a mostrar todo
    //barraBusqueda.style.display = '';
    //dropdown.style.display = '';
    //mostrarOfertas('todos');
  };
}*/


function setUpAnadirOferta() {
  var btn = document.getElementById('btMasOf');
  btn.onclick = function () {

    // Limpiar pantalla
    var barraBusqueda = document.getElementById('search-container-ofertas');
    var dropdown = document.getElementById('dropdown-ofertas');
    var restoSeccion = document.getElementById('resto-seccion-ofertas');

    barraBusqueda.style.display = 'none';
    dropdown.style.display = 'none';
    restoSeccion.innerHTML = '';

    // Crear el contenedor del formulario
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Crear el formulario
    const form = document.createElement('form');
    form.id = 'oferta-form';

    // Crear campos del formulario
    const campos = [
      { label: 'Nombre', name: 'nombre', type: 'text' },
      { label: 'Descuento', name: 'descuento', type: 'number' },
      { label: 'Productos (IDs separados por espacios)', name: 'productos', type: 'text' },
      { label: 'Imagen de la Oferta (URL)', name: 'imagen', type: 'url' },
      { label: 'Activada', name: 'activada', type: 'checkbox', required: false },
      { label: 'Condiciones', name: 'condiciones', type: 'text' },
      { label: 'IdOferta', name: 'idOferta', type: 'number' },
      { label: 'MenusId (IDs separados por espacios)', name: 'menusId', type: 'text' },
      { label: 'OfertasId (IDs separados por espacios)', name: 'ofertasId', type: 'text' },
      { label: 'ProductosId (IDs separados por espacios)', name: 'productosId', type: 'text' },
    ];

    campos.forEach(function (campo) {
      const label = document.createElement('label');
      label.textContent = campo.label;

      const input = document.createElement('input');
      input.type = campo.type;
      input.name = campo.name;
      input.required = true;

      form.appendChild(label);
      form.appendChild(input);
    });
    // Crear botón de enviar
    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    modalContainer.appendChild(form);

    // Manejar el evento de envío del formulario
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Obtener los valores del formulario
      const oferta = {
        nombre: form.nombre.value,
        descuento: parseFloat(form.descuento.value), // Convertir el descuento a número
        productos: form.productos.value.split(' '), // Separar los productos por espacios
        imagen: form.imagen.value,
        activada: form.activada.checked,
        condiciones: form.condiciones.value.split(',').map(cond => cond.trim()), // Separar y limpiar las condiciones
        idOferta: parseInt(form.idOferta.value),
        menusId: form.menusId.value.split(' '), // Separar los IDs de menús por espacios
        ofertasId: form.ofertasId.value.split(' '), // Separar los IDs de ofertas por espacios
        productosId: form.productosId.value.split(' ') // Separar los IDs de productos por espacios
      };

      // Guardar la oferta en la base de datos
      guardarOfertaBBDD(oferta);

      // Resetear el formulario
      //form.reset();
    });

    // Agregar el formulario al cuerpo del documento
    restoSeccion.appendChild(modalContainer);
    //document.body.appendChild(modalContainer);

    // Ocultar formulario y volver a mostrar todo
    //barraBusqueda.style.display = '';
    //dropdown.style.display = '';
    //mostrarOfertas('todos');
  };
}

function guardarOfertaBBDD(oferta) {
  // Referencia a la base de datos de Firebase
  const dbRef = firebase.database().ref('Oferta');

  // Generar una nueva clave para la oferta
  //const nuevaClaveOferta = dbRef.push().key;
  const nuevaClaveOferta = oferta.idOferta;

  // Establecer el estado de la casilla de verificación
  const activada = oferta.activada ? oferta.activada : false;

  // Guardar la oferta en la base de datos utilizando la clave generada
  dbRef.child(nuevaClaveOferta).set({
    Activada: activada,
    Descuento: oferta.descuento,
    IdOferta: nuevaClaveOferta, // Utilizamos la clave como IdOferta
    Nombre: oferta.nombre,
    ProductosId: oferta.productos,
    RutaImagenOferta: oferta.imagen
  }, function (error) {
    if (error) {
      console.error('Error al guardar la oferta en la base de datos:', error);
    } else {
      console.log('Oferta guardada exitosamente.');
    }
  });
}

function guardarProductoBBDD(producto) {
  // Referencia a la base de datos de Firebase
  const dbRef = firebase.database().ref('Producto');

  // Usar el idProducto como clave principal
  const newProductoKey = producto.idProducto;

  // Guardar el producto en la base de datos
  dbRef.child(newProductoKey).set({
    Descripcion: producto.descripcion,
    Ingredientes: producto.ingredientes,
    Precio: producto.precio,
    RutaImagen: producto.urlimagen,
    Stock: producto.stock,
    Tipo: producto.tipo
  }, function (error) {
    if (error) {
      console.error('Error al guardar el producto en la base de datos:', error);
    } else {
      console.log('Producto guardado exitosamente.');
    }
  });
}



/*function setUpAnadirOferta() {
  var btn = document.getElementById('btMasOf');
  btn.onclick = function () {

    //limpiar pantalla
    var barraBusqueda = document.getElementById('search-container-ofertas');
    var dropdown = document.getElementById('dropdown-ofertas');
    var restoSeccion = document.getElementById('resto-seccion-ofertas');

    barraBusqueda.style.display = 'none';
    dropdown.style.display = 'none';
    restoSeccion.innerHTML = '';

    // Crear el contenedor del formulario
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Crear el formulario
    const form = document.createElement('form');
    form.id = 'oferta-form';

    // Crear campos del formulario
    const campos = [
      { label: 'Nombre', name: 'nombre', type: 'text' },
      { label: 'Descuento', name: 'descuento', type: 'number' },
      { label: 'Productos (IDs separados por espacios)', name: 'productos', type: 'text' },
      { label: 'Imagen de la Oferta (URL)', name: 'imagen', type: 'url' },
      { label: 'Activada', name: 'activada', type: 'checkbox' }
    ];

    campos.forEach(function (campo) {
      const label = document.createElement('label');
      label.textContent = campo.label;

      const input = document.createElement('input');
      input.type = campo.type;
      input.name = campo.name;
      input.required = true;

      form.appendChild(label);
      form.appendChild(input);
    });

    // Crear botón de enviar
    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    modalContainer.appendChild(form);

    // Manejar el evento de envío del formulario
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Obtener los valores del formulario
      const oferta = {
        nombre: form.nombre.value,
        descuento: parseFloat(form.descuento.value), // Convertir el descuento a número
        productos: form.productos.value.split(' '), // Separar los productos por espacios
        imagen: form.imagen.value,
        activada: form.activada.checked
      };

      // Guardar la oferta en la base de datos
      //guardarOfertaBBDD(oferta);

      // Resetear el formulario
      //form.reset();
    });

    // Agregar el formulario al cuerpo del documento
    restoSeccion.appendChild(modalContainer);
    //document.body.appendChild(modalContainer);

    //ocultar formulario y volver a mostrar todo
    //barraBusqueda.style.display = '';
    //dropdown.style.display = '';
    //mostrarOfertas('todos');
  };
}*/



// Función para cargar y mostrar los clientes
function mostrarClientes(nombreFiltro, consultaBusqueda = '') {
  var listaClientes = document.getElementById('lista-clientes');

  // Limpiar la lista de clientes antes de cargarlos nuevamente
  listaClientes.innerHTML = '';

  // Obtener la lista de clientes de Firebase
  firebase.database().ref('Cliente').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var cliente = childSnapshot.val();

      // Crear un div para mostrar la información del cliente
      var clienteDiv = document.createElement('div');
      clienteDiv.className = 'cliente-div';

      // Construir el contenido del div del cliente
      var contenidoCliente = '<h3>' + cliente.Nombre + '</h3>' +
        '<p>Correo: ' + cliente.Correo + '</p>' +
        '<p>Teléfono: ' + cliente.Telefono + '</p>' +
        '<p>Puntos: ' + cliente.Puntos + '</p>';

      var botonBanear = document.createElement('button');
      botonBanear.className = 'boton-banear';

      // Comprobar si el cliente está bloqueado y establecer el color y el texto del botón en consecuencia
      if (cliente.Bloqueado) {
        botonBanear.textContent = 'Restablecer';
        botonBanear.style.backgroundColor = '#00cc00'; // Verde
      } else {
        botonBanear.textContent = 'Banear';
        botonBanear.style.backgroundColor = '#ff3333'; // Rojo
      }

      // Agregar el evento onclick al botón para llamar a la función gestionarClientes con el correo electrónico del cliente como argumento
      botonBanear.onclick = function () {
        gestionarClientes(cliente.Correo);
      };

      clienteDiv.innerHTML = contenidoCliente;
      clienteDiv.appendChild(botonBanear);


      var anadirProd = false;

      if (consultaBusqueda == '') {
        //console.log('sin consulta');
        switch (nombreFiltro) {
          case 'todos':
            //console.log('llega aqui');
            anadirProd = true;
            break;
          case 'activos':
            if (!cliente.Bloqueado) {
              anadirProd = true;
            }
            break;
          case 'bloqueados':
            if (cliente.Bloqueado == true) {
              anadirProd = true;
            }
            break;
        }

      } else {
        if (cliente.Nombre.toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim())) {
          anadirProd = true;
        }
      }

      // Agregar el div del cliente a la lista de clientes
      if (anadirProd) {
        listaClientes.appendChild(clienteDiv);
      }
    });
  });
}

// Función para gestionar los clientes al hacer clic en el botón
function gestionarClientes(correoCliente) {
  // Obtener una referencia a la base de datos de Firebase
  var database = firebase.database();

  // Buscar el cliente por su correo electrónico
  database.ref('Cliente').orderByChild('Correo').equalTo(correoCliente).once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      // Obtener el cliente
      var cliente = childSnapshot.val();

      // Cambiar el valor de la propiedad Bloqueado
      var nuevoEstadoBloqueo = !cliente.Bloqueado;

      // Actualizar el cliente en la base de datos
      childSnapshot.ref.update({ Bloqueado: nuevoEstadoBloqueo }).then(function () {
        console.log('Estado de bloqueo actualizado correctamente para el cliente con correo electrónico:', correoCliente);
      }).catch(function (error) {
        console.error('Error al actualizar el estado de bloqueo para el cliente:', error);
      });
    });

    // Esperar 300 milisegundos antes de llamar a la función mostrarClientes
    setTimeout(function () {
      mostrarClientes('todos');
    }, 300);
  });
}

