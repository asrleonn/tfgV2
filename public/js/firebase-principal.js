document.addEventListener('DOMContentLoaded', function () {

  var currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (currentUser) {
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


function mostrarTodo(booleanArg) {
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

  const productosRef = firebase.database().ref('Producto');

  const productosArray = [];

  productosRef.once('value')
    .then((snapshot) => {
      const productos = snapshot.val();
      console.log('Productos:', productos);

      if (productos) {
        Object.keys(productos).forEach((key) => {
          productosArray.push(productos[key]);
        });

        const contenedor = document.getElementById('resto-seccion-productos');
        contenedor.innerHTML = '';

        productosArray.forEach(producto => {
          const productoDiv = document.createElement('div');
          productoDiv.classList.add('producto', 'cardboard');

          const img = document.createElement('img');
          img.src = producto.RutaImagen;
          img.alt = producto.Descripcion;
          productoDiv.appendChild(img);

          const descripcion = document.createElement('h2');
          descripcion.textContent = producto.Descripcion;
          productoDiv.appendChild(descripcion);

          const ingredientes = document.createElement('p');
          ingredientes.textContent = `Ingredientes: ${producto.Ingredientes}`;
          productoDiv.appendChild(ingredientes);

          const precio = document.createElement('p');
          precio.textContent = `Precio: $${producto.Precio.toFixed(2)}`;
          productoDiv.appendChild(precio);

          const stock = document.createElement('p');
          stock.textContent = `Stock: ${producto.Stock}`;
          productoDiv.appendChild(stock);

          var anadirProd = false;

          if (consultaBusqueda == '') {
            switch (nombreFiltro) {
              case 'todos':
                anadirProd = true;
                break;
              case 'Disponibles':
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

          if (anadirProd) {
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
  const ofertasRef = firebase.database().ref('Oferta');
  const productosRef = firebase.database().ref('Producto'); 

  const ofertasArray = [];

  ofertasRef.once('value')
    .then((snapshot) => {
      const ofertas = snapshot.val();
      console.log('Ofertas:', ofertas);

      if (ofertas) {
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

        ofertasArray.forEach(oferta => {
          const ofertaDiv = document.createElement('div');
          ofertaDiv.classList.add('oferta', 'cardboard'); 

          const img = document.createElement('img');
          img.src = oferta.RutaImagenOferta;
          img.alt = oferta.Nombre;
          ofertaDiv.appendChild(img);

          const nombre = document.createElement('h2');
          nombre.textContent = oferta.Nombre;
          ofertaDiv.appendChild(nombre);

          const productosId = oferta.ProductosId;
          productosId.forEach(productoId => {
            productosRef.child(productoId).once('value')
              .then((snapshot) => {
                const producto = snapshot.val();
                if (producto) {
                  const productosEl = document.createElement('p');
                  productosEl.textContent = `Producto: ${producto.Descripcion}`;
                  ofertaDiv.appendChild(productosEl);
                }
              })
              .catch((error) => {
                console.error('Error al leer el producto:', error);
              });
          });

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
        mostrarClientes('todos', caja.value);
      };

      todos.onclick = function () {
        mostrarClientes('todos');
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

    var restoSeccion = document.getElementById('resto-seccion-productos');
    restoSeccion.innerHTML = '';

    var barraBusqueda = document.getElementById('search-container-prod');
    var menuDesplegable = document.getElementById('dropdown-prod');
    barraBusqueda.style.display = 'none';
    menuDesplegable.style.display = 'none';
    boton.style.display = 'none';

    var modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    var form = document.createElement('form');
    form.id = 'modal-form';

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

    var btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    restoSeccion.appendChild(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var producto = {
        descripcion: form.descripcion.value,
        idProducto: form.idProducto.value,
        ingredientes: form.ingredientes.value,
        precio: parseFloat(form.precio.value),
        urlimagen: form.urlimagen.value,
        stock: parseInt(form.stock.value),
        tipo: form.tipo.value
      };
      guardarProductoBBDD(producto);

      restoSeccion.innerHTML = '';

      barraBusqueda.style.display = '';
      menuDesplegable.style.display = '';
      boton.style.display = '';

      mostrarProductos('todos');
    });

  };
}
function setUpAnadirOferta() {
  var btn = document.getElementById('btMasOf');
  btn.onclick = function () {
    var barraBusqueda = document.getElementById('search-container-ofertas');
    var dropdown = document.getElementById('dropdown-ofertas');
    var restoSeccion = document.getElementById('resto-seccion-ofertas');

    barraBusqueda.style.display = 'none';
    dropdown.style.display = 'none';
    restoSeccion.innerHTML = '';

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const form = document.createElement('form');
    form.id = 'oferta-form';

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

    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Enviar';

    form.appendChild(btnEnviar);
    modalContainer.appendChild(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const oferta = {
        nombre: form.nombre.value,
        descuento: parseFloat(form.descuento.value),
        productos: form.productos.value.split(' '),
        imagen: form.imagen.value,
        activada: form.activada.checked,
        condiciones: form.condiciones.value.split(',').map(cond => cond.trim()),
        idOferta: parseInt(form.idOferta.value),
        menusId: form.menusId.value.split(' '), 
        ofertasId: form.ofertasId.value.split(' '),
        productosId: form.productosId.value.split(' ') 
      };
      guardarOfertaBBDD(oferta);

    });

    restoSeccion.appendChild(modalContainer);
  };
}

function guardarOfertaBBDD(oferta) {

  const dbRef = firebase.database().ref('Oferta');

  const nuevaClaveOferta = oferta.idOferta;

  const activada = oferta.activada ? oferta.activada : false;

  dbRef.child(nuevaClaveOferta).set({
    Activada: activada,
    Descuento: oferta.descuento,
    IdOferta: nuevaClaveOferta, 
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

  const dbRef = firebase.database().ref('Producto');

  const newProductoKey = producto.idProducto;

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

function mostrarClientes(nombreFiltro, consultaBusqueda = '') {
  var listaClientes = document.getElementById('lista-clientes');

  listaClientes.innerHTML = '';

  firebase.database().ref('Cliente').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var cliente = childSnapshot.val();

      var clienteDiv = document.createElement('div');
      clienteDiv.className = 'cliente-div';

      var contenidoCliente = '<h3>' + cliente.Nombre + '</h3>' +
        '<p>Correo: ' + cliente.Correo + '</p>' +
        '<p>Teléfono: ' + cliente.Telefono + '</p>' +
        '<p>Puntos: ' + cliente.Puntos + '</p>';

      var botonBanear = document.createElement('button');
      botonBanear.className = 'boton-banear';

      if (cliente.Bloqueado) {
        botonBanear.textContent = 'Restablecer';
        botonBanear.style.backgroundColor = '#00cc00'; // Verde
      } else {
        botonBanear.textContent = 'Banear';
        botonBanear.style.backgroundColor = '#ff3333'; // Rojo
      }

      botonBanear.onclick = function () {
        gestionarClientes(cliente.Correo);
      };

      clienteDiv.innerHTML = contenidoCliente;
      clienteDiv.appendChild(botonBanear);


      var anadirProd = false;

      if (consultaBusqueda == '') {
        switch (nombreFiltro) {
          case 'todos':
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

      if (anadirProd) {
        listaClientes.appendChild(clienteDiv);
      }
    });
  });
}

function gestionarClientes(correoCliente) {
  var database = firebase.database();

  database.ref('Cliente').orderByChild('Correo').equalTo(correoCliente).once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var cliente = childSnapshot.val();
      var nuevoEstadoBloqueo = !cliente.Bloqueado;

      childSnapshot.ref.update({ Bloqueado: nuevoEstadoBloqueo }).then(function () {
        console.log('Estado de bloqueo actualizado correctamente para el cliente con correo electrónico:', correoCliente);
      }).catch(function (error) {
        console.error('Error al actualizar el estado de bloqueo para el cliente:', error);
      });
    });

    setTimeout(function () {
      mostrarClientes('todos');
    }, 300);
  });
}