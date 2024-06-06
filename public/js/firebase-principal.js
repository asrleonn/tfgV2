/*COMPROBACIÓN INICIO DE SESIÓN*/
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

    mostrarPedidos('en curso');
    setUpBarraBusqueda('pedidos');

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

/*MOSTRAR U OCULTAR SEGÚN PERMISOS*/
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
          setUpBarraBusqueda('pedidos');
          mostrarPedidos('en curso');
          break;
        case 'productos':
          mostrarBarraBusquedaProd();
          mostrarProductos('todos');
          setUpBarraBusqueda('productos');
          setUpAnadirProd();
          break;
        case 'ofertas':
          mostrarBarraBusquedaOferta(); //-> llama a mostrarOfertas('todos')
          //mostrarOfertas('todos');
          setUpBarraBusqueda('ofertas');
          setUpAnadirOferta();
          break;
        case 'clientes':
          mostrarClientes('todos');
          setUpBarraBusqueda('clientes');
          break;
        case 'inventario':
          console.log('inventario');
          setUpStockProductos();
          setUpBorrarOferta();
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

          const idProducto = document.createElement('p');
          idProducto.textContent = `Id producto: ${producto.IdProducto}`;
          productoDiv.appendChild(idProducto);

          const ingredientes = document.createElement('p');
          ingredientes.textContent = `Ingredientes: ${producto.Ingredientes}`;
          productoDiv.appendChild(ingredientes);

          const precio = document.createElement('p');
          precio.textContent = `Precio: $${producto.Precio.toFixed(2)}`;
          productoDiv.appendChild(precio);

          const stock = document.createElement('p');
          stock.textContent = `Stock: ${producto.Stock}`;
          productoDiv.appendChild(stock);

          if (producto.Stock > 0) {
            productoDiv.classList.add('cardboard-azul');
          } else {
            productoDiv.classList.add('cardboard-rojo');
          }

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

function mostrarOfertas(nombreFiltro, consultaBusqueda = '') {
  const ofertasRef = firebase.database().ref('Oferta');
  const productosRef = firebase.database().ref('Producto');

  const contenedor = document.getElementById('resto-seccion-ofertas');
  contenedor.innerHTML = '';

  ofertasRef.once('value')
    .then((snapshot) => {
      const ofertas = snapshot.val();
      console.log('Ofertas:', ofertas);

      if (!ofertas) {
        console.log('No hay ofertas disponibles.');
        return;
      }

      const ofertasArray = Object.keys(ofertas).map(key => ofertas[key]);

      return productosRef.once('value').then(productSnapshot => {
        const productos = productSnapshot.val();

        ofertasArray.forEach(oferta => {
          if (!shouldAddOffer(oferta, nombreFiltro, consultaBusqueda)) return;

          const ofertaDiv = document.createElement('div');
          ofertaDiv.classList.add('oferta', 'cardboard');

          //dependiendo de si está activa o no la muestro en rojo o en azul
          if (oferta.Activada) {
            ofertaDiv.classList.add('cardboard-azul');
          } else {
            ofertaDiv.classList.add('cardboard-rojo');
          }

          const img = document.createElement('img');
          img.src = oferta.RutaImagenOferta;
          img.alt = oferta.Nombre;
          ofertaDiv.appendChild(img);

          const nombre = document.createElement('h2');
          nombre.textContent = oferta.Nombre;
          ofertaDiv.appendChild(nombre);

          oferta.ProductosId.forEach(productoId => {
            const producto = productos[productoId];
            if (producto) {
              const productosEl = document.createElement('p');
              productosEl.textContent = `Producto: ${producto.Descripcion}`;
              ofertaDiv.appendChild(productosEl);
            }
          });

          const descuento = document.createElement('p');
          descuento.textContent = `Descuento: ${oferta.Descuento * 100}%`;
          ofertaDiv.appendChild(descuento);

          contenedor.appendChild(ofertaDiv);
        });
      });
    })
    .catch((error) => {
      console.error('Error al leer las ofertas:', error);
    });
}


function mostrarPedidos(nombreFiltro, consultaBusqueda = '') {
  const pedidosRef = firebase.database().ref('Pedido');

  pedidosRef.once('value')
    .then((snapshot) => {
      const pedidos = snapshot.val();
      const contenedorPedidos = document.getElementById('resto-seccion-pedidos');
      contenedorPedidos.innerHTML = '';

      if (pedidos) {
        // Convertir los pedidos a un array para ordenarlos por fecha y hora
        const pedidosArray = Object.keys(pedidos).map(key => {
          const pedido = pedidos[key];
          const fechaHora = pedido.fechaHora ? new Date(
            pedido.fechaHora.year,
            pedido.fechaHora.monthValue - 1,
            pedido.fechaHora.dayOfMonth,
            pedido.fechaHora.hour,
            pedido.fechaHora.minute,
            pedido.fechaHora.second,
            pedido.fechaHora.nano / 1000000
          ) : new Date(); // Valor predeterminado si no existe fechaHora

          return {
            idPedido: pedido.idPedido,
            clienteId: pedido.clienteId || '0', // Aquí estamos guardando el ID del cliente
            entregado: pedido.entregado || false,
            fechaHora: fechaHora,
            importe: pedido.importe || 0,
            Productos: Array.isArray(pedido.productos) ? pedido.productos.map(producto => producto.idProducto) : [],
            Ofertas: Array.isArray(pedido.ofertas) ? pedido.ofertas.map(oferta => oferta.idOferta) : [],
            menus: Array.isArray(pedido.menus) ? pedido.menus : []
          };
        });

        // Ordenar los pedidos por fecha y hora de manera ascendente
        pedidosArray.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());

        // Mostrar cada pedido en HTML
        pedidosArray.forEach(pedido => {

          var anadirProd = false;

          if (consultaBusqueda == '') {
            switch (nombreFiltro) {
              case 'en curso':
                if (!pedido.entregado) {
                  anadirProd = true;
                }
                break;
              case 'terminados':
                if (pedido.entregado) {
                  anadirProd = true;
                }
                break;
              case 'todos':
                anadirProd = true;
                break;
            }
          } else {
            if (pedido.idPedido.toString().toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim())) {
              anadirProd = true;
            }
          }

          obtenerNombreCliente(pedido.clienteId)
            .then(nombreCliente => {
              pedido.nombreCliente = nombreCliente;

              const promisesProductos = pedido.Productos.map(productoId => {
                return obtenerDescripcionProducto(productoId)
                  .then(descripcion => descripcion)
                  .catch(error => {
                    console.error('Error al obtener la descripción del producto:', error);
                  });
              });

              const promisesOfertas = pedido.Ofertas.map(ofertaId => {
                return obtenerNombreOferta(ofertaId)
                  .then(nombre => nombre)
                  .catch(error => {
                    console.error('Error al obtener el nombre de la oferta:', error);
                  });
              });

              Promise.all([...promisesProductos, ...promisesOfertas])
                .then(descripciones => {
                  pedido.Productos = descripciones.slice(0, pedido.Productos.length);
                  pedido.Ofertas = descripciones.slice(pedido.Productos.length);
                  console.log('id del cliente' + pedido.clienteId);

                  /*CUIDAO*/
                  if (anadirProd) {
                    mostrarPedidoEnHTML(pedido, contenedorPedidos);
                  }
                });
            })
            .catch(error => {
              console.error('Error al obtener el nombre del cliente:', error);
              // Si hay un error al obtener el nombre del cliente, mostramos el ID del cliente en su lugar
              pedido.nombreCliente = pedido.clienteId;
              if (anadirProd) {
                mostrarPedidoEnHTML(pedido, contenedorPedidos);
              }
            });
        });
      } else {
        console.log('No hay pedidos disponibles.');
      }
    })
    .catch((error) => {
      console.error('Error al leer los pedidos:', error);
    });
}

async function mostrarPedidoEnHTML(pedido, contenedor) {
  // Crear elementos HTML
  const pedidoElement = document.createElement('div');
  const h3 = document.createElement('h3');
  const clienteParrafo = document.createElement('p');
  const entregadoParrafo = document.createElement('p');
  const fechaHoraParrafo = document.createElement('p');
  const importeParrafo = document.createElement('p');

  // Agregar clases a los elementos
  pedidoElement.className = 'pedido';
  // Agregar contenido a los elementos
  h3.innerHTML = `<b>Pedido</b>: ${pedido.idPedido}`;

  const nombreCliente = await obtenerNombreCliente(parseInt(pedido.clienteId));

  //clienteParrafo.innerHTML = `<b>Cliente:</b> ${parseInt(pedido.clienteId)}`;
  clienteParrafo.innerHTML = `<b>Cliente:</b> ${nombreCliente}`;


  console.log(nombreCliente);
  entregadoParrafo.innerHTML = `<b>Entregado:</b> ${pedido.entregado ? 'Sí' : 'No'}`;
  fechaHoraParrafo.innerHTML = `<b>Fecha y Hora:</b> ${pedido.fechaHora.toLocaleString()}`;
  importeParrafo.innerHTML = `<b>Importe:</b> ${pedido.importe.toFixed(2)}`;

  // Agregar elementos al contenedor
  pedidoElement.appendChild(h3);
  pedidoElement.appendChild(clienteParrafo);


  // Condicionalmente agregar párrafos para productos, ofertas y menús
  if (pedido.Productos.length > 0) {
    const productosParrafo = document.createElement('p');
    productosParrafo.innerHTML = `<b>Productos:</b> ${pedido.Productos.join(', ')}`;
    pedidoElement.appendChild(productosParrafo);
  }

  if (pedido.Ofertas.length > 0) {
    const ofertasParrafo = document.createElement('p');
    ofertasParrafo.innerHTML = `<b>Ofertas:</b> ${pedido.Ofertas.join(', ')}`;
    pedidoElement.appendChild(ofertasParrafo);
  }

  if (pedido.menus.length > 0) {
    const menuParrafo = document.createElement('p');
    menuParrafo.innerHTML = `<b>Id Menu(s):</b> ${pedido.menus.map(menu => menu.idMenu).join(', ')}`;
    pedidoElement.appendChild(menuParrafo);
  }

  pedidoElement.appendChild(entregadoParrafo);
  pedidoElement.appendChild(fechaHoraParrafo);
  pedidoElement.appendChild(importeParrafo);

  if (!pedido.entregado) {
    pedidoElement.classList.add('pedido-sin-entregar');
    const btnHecho = document.createElement('button');
    btnHecho.classList.add('btn-entregar');
    btnHecho.textContent = 'Hecho';
    btnHecho.id = pedido.idPedido;
    btnHecho.addEventListener('click', function () {
      //alert('id pedido: ' + btnHecho.id)
      marcarComoHecho(this); // Pasar el botón como argumento a la función borrarPedido
    });
    //console.log(btnHecho.id);
    pedidoElement.appendChild(btnHecho);
  } else {
    pedidoElement.classList.add('pedido-entregado');
  }

  contenedor.appendChild(pedidoElement);
}

function marcarComoHecho(btn) {

  const idPedido = parseInt(btn.id);
  const pedidosRef = firebase.database().ref('Pedido');
  let pedidoSeleccionado;
  const ids = [];

  //obtener el pedido
  pedidosRef.once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      const pedido = childSnapshot.val();
      if (pedido.idPedido == idPedido) {
        pedidoSeleccionado = pedido;
      }
    });
  }).then(function () {
    if (pedidoSeleccionado) {
      console.log('Pedido con ID:', pedidoSeleccionado);


      // Agregar IDs de productos
      if (pedidoSeleccionado.productos) {
        pedidoSeleccionado.productos.forEach(producto => {
          ids.push(producto.idProducto);
        });
      }

      // Agregar IDs de menús
      if (pedidoSeleccionado.menus) {
        pedidoSeleccionado.menus.forEach(menu => {
          ids.push(menu.idBebida, menu.idComplemento, menu.idEntrante);
        });
      }

      // Agregar IDs de ofertas y sus productos
      if (pedidoSeleccionado.ofertas) {
        pedidoSeleccionado.ofertas.forEach(oferta => {
          if (oferta.productosId) {
            ids.push(...oferta.productosId);
          }
        });
      }

      console.log('IDs del pedido:', ids);


      let stockInsuficiente = false;

      // Mapear todas las promesas de verificación de stock
      const promesasStock = ids.map(id => verificarStock(id));

      // Esperar a que todas las promesas se resuelvan
      Promise.all(promesasStock)
        .then(resultados => {
          // Verificar cada resultado
          resultados.forEach((stockDisponible, index) => {
            const id = ids[index];
            if (stockDisponible) {
              console.log(`Producto ID: ${id}, Stock Disponible: ${stockDisponible}`);
            } else {
              console.log(`Producto ID: ${id}, Stock Agotado`);
              alert(`Stock insuficiente en el producto con ID ${id}`);
              stockInsuficiente = true;
            }
          });

          // Si hay stock insuficiente, salir de la función
          if (stockInsuficiente) {
            return; // Salir de la función
          }
          Promise.all(ids.map(id => restarStockEnBD(id))).then(() => {
            entregarProducto(pedidoSeleccionado.idPedido);
            sumarPuntos(pedidoSeleccionado.clienteId, pedidoSeleccionado.importe);

          });



        })

    } else {
      console.log('No se encontró ningún pedido con ID asociado.');
    }
  }).catch(function (error) {
    console.error('Error al recuperar los pedidos:', error);
  });

}

function sumarPuntos(idCliente, importe) {
  var puntos = Math.floor(importe) * 10;
  const clientesRef = firebase.database().ref('Cliente');

  clientesRef.once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      if (childSnapshot.val().idCliente === idCliente) {
        var puntosActuales = childSnapshot.val().puntos;
        var nuevosPuntos = puntosActuales + puntos;
        clientesRef.child(childSnapshot.key).update({ puntos: nuevosPuntos });
      }
    });
  });
}

function entregarProducto(idPedido) {
  const pedidosRef = firebase.database().ref('Pedido');
  pedidosRef.once('value', (snapshot) => {
    snapshot.forEach((pedido) => {
      if (pedido.val().idPedido === idPedido) {
        pedido.ref.update({ entregado: true });
        mostrarPedidos('en curso');
      }
    });
  });
}

function restarStockEnBD(idProducto) {
  const productosRef = firebase.database().ref('Producto');

  return productosRef.once('value')
    .then(function (snapshot) {
      const productos = snapshot.val();
      for (const producto of productos) {
        if (producto.IdProducto === idProducto) {
          if (producto.Stock && producto.Stock > 0) {
            const nuevoStock = producto.Stock - 1;
            return firebase.database().ref('Producto/' + idProducto).update({ Stock: nuevoStock });
          } else {
            console.log('El producto con ID', idProducto, 'no tiene stock disponible.');
            return null;
          }
        }
      }
      console.log('No se encontró ningún producto con ID', idProducto);
      return null;
    })
    .then(function () {
      console.log('Stock restado con éxito para el producto con ID:', idProducto);
    })
    .catch(function (error) {
      console.error('Error al restar el stock del producto con ID:', idProducto, error);
    });
}

function setUpStockProductos() {
  const productosRef = firebase.database().ref('Producto');
  const tipoComidaRef = firebase.database().ref('Tipo_comida');
  const select2 = document.getElementById("editar-producto-select-2");
  const select = document.getElementById("editar-producto-select");
  const input1 = document.getElementById("editar-producto-input-1");
  const input2 = document.getElementById("editar-producto-input-2");
  const input3 = document.getElementById("editar-producto-input-3");
  const input4 = document.getElementById("editar-producto-input-4");
  const btnBorrar = document.getElementById('editar-producto-borrar');
  const btnGuardar = document.getElementById('editar-producto-guardar');
  var siSeHaSeleccionado = false;

  btnGuardar.onclick = function () {
    if (siSeHaSeleccionado) {
      const selectedId = select.value;
      const rutaImagen = input1.value.trim();
      const ingredientes = input2.value.trim();
      const precio = parseFloat(input3.value.trim());
      const stock = parseInt(input4.value.trim());
      const tipo = select2.value.trim();

      if (rutaImagen && ingredientes && !isNaN(precio) && !isNaN(stock) && tipo) {
        productosRef.once("value", (snapshot) => {
          snapshot.forEach((producto) => {
            if (producto.val().IdProducto === parseInt(selectedId)) {
              producto.ref.update({
                RutaImagen: rutaImagen,
                Ingredientes: ingredientes,
                Precio: precio,
                Stock: stock,
                Tipo: tipo
              });
              input1.value = "";
              input2.value = "";
              input3.value = "";
              input4.value = "";
              siSeHaSeleccionado = false;
            }
          });
        });
      } else {
        alert("Por favor, complete todos los campos correctamente.");
      }
    }
  }

  btnBorrar.onclick = function () {
    if (siSeHaSeleccionado) {
      const selectedId = select.value;
      productosRef.once("value", (snapshot) => {
        snapshot.forEach((producto) => {
          if (producto.val().IdProducto === parseInt(selectedId)) {
            producto.ref.remove(); // Eliminar el producto de la base de datos
          }
        });
      });
      input1.value = "";
      input2.value = "";
      input3.value = "";
      input4.value = "";
      siSeHaSeleccionado = false;
    }
  };

  productosRef.on('value', (snapshot) => {
    select.innerHTML = ''; // Limpiar el select antes de agregar los nuevos productos
    snapshot.forEach((producto) => {
      const option = document.createElement("option");
      option.value = producto.val().IdProducto;
      option.text = producto.val().Descripcion;
      select.appendChild(option);
    });
  });

  select.addEventListener("change", (e) => {
    siSeHaSeleccionado = true;
    const selectedId = e.target.value;
    productosRef.once("value", (snapshot) => {
      snapshot.forEach((producto) => {
        if (producto.val().IdProducto === parseInt(selectedId)) {
          input1.value = producto.val().RutaImagen;
          input2.value = producto.val().Ingredientes;
          input3.value = producto.val().Precio;
          input4.value = producto.val().Stock;
          select2.value = producto.val().Tipo;
        }
      });
    });
  });

  tipoComidaRef.once("value", (snapshot) => {
    select2.innerHTML = '';
    snapshot.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo.val();
      option.text = tipo.val();
      select2.appendChild(option);
    });
  });

}

function setUpBorrarOferta() {
  const ofertasRef = firebase.database().ref('Oferta');
  const select = document.getElementById('borrar-ofertas-select');
  const btnBorrar = document.getElementById('borrar-oferta-boton');

  btnBorrar.onclick = function() {
    const ofertaSeleccionada = select.value;
    ofertasRef.once('value', (snapshot) => {
      snapshot.forEach((oferta) => {
        if (oferta.val().Nombre === ofertaSeleccionada) {
          oferta.ref.remove();
        }
      });
      select.innerHTML = ''; // Limpiar el select antes de agregar las nuevas ofertas
      ofertasRef.on('value', (snapshot) => {
        snapshot.forEach((oferta) => {
          const option = document.createElement("option");
          option.value = oferta.val().Nombre;
          option.text = oferta.val().Nombre;
          select.appendChild(option);
        });
      });
    });
  };

  ofertasRef.on('value', (snapshot) => {
    select.innerHTML = ''; // Limpiar el select antes de agregar las nuevas ofertas
    snapshot.forEach((oferta) => {
      const option = document.createElement("option");
      option.value = oferta.val().Nombre;
      option.text = oferta.val().Nombre;
      select.appendChild(option);
    });
  });
}

function verificarStock(idProducto) {

  const productosRef = firebase.database().ref('Producto');

  return productosRef.child(idProducto).once('value')
    .then(function (snapshot) {
      const producto = snapshot.val();
      if (producto && producto.Stock > 0) {
        return true;
      } else {
        return false;
      }
    })
    .catch(function (error) {
      console.error('Error al verificar el stock:', error);
      return false; // En caso de error, retornamos false
    });
}

function obtenerMenuId(idMenu) {
  return new Promise((resolve, reject) => {
    const menuRef = firebase.database().ref('Menus').child(idMenu);
    menuRef.once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          resolve(snapshot.val().idMenu);
        } else {
          // Si el menú no existe, resolver con un valor nulo
          resolve(null);
        }
      })
      .catch(error => {
        reject(error);
      });
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

      var contenidoCliente = '<h3>' + cliente.nombre + '</h3>' +
        '<p>Correo: ' + cliente.correo + '</p>' +
        '<p>Puntos: ' + cliente.puntos + '</p>';

      var botonBanear = document.createElement('button');
      botonBanear.className = 'boton-banear';

      if (cliente.bloqueado) {
        botonBanear.textContent = 'Desbloquear';
        botonBanear.style.backgroundColor = '#00cc00'; // Verde
        clienteDiv.classList.add('cardboard-rojo');
      } else {
        botonBanear.textContent = 'Bloquear';
        botonBanear.style.backgroundColor = '#ff3333'; // Rojo
        clienteDiv.classList.add('cardboard-azul');
      }

      botonBanear.onclick = function () {
        gestionarClientes(cliente.correo);
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
            if (!cliente.bloqueado) {
              anadirProd = true;
            }
            break;
          case 'bloqueados':
            if (cliente.bloqueado == true) {
              anadirProd = true;
            }
            break;
        }

      } else {
        if (cliente.nombre.toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim())) {
          anadirProd = true;
        }
      }

      if (anadirProd) {
        listaClientes.appendChild(clienteDiv);
      }
    });
  });
}

function setUpAnadirProd() {
  var boton = document.getElementById('btMasProd');
  boton.onclick = function () {

    obtenerTiposComida().then(function (tiposComida) {
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
        { label: 'Ingredientes', name: 'ingredientes', type: 'text' },
        //{ label: 'Precio', name: 'precio', type: 'number' }, UN CAMBIO
        { label: 'Precio', name: 'precio', type: 'text' },
        { label: 'URL de la Imagen', name: 'urlimagen', type: 'url' },
        { label: 'Stock', name: 'stock', type: 'number' }
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

      // Crear select para Tipo
      var labelTipo = document.createElement('label');
      labelTipo.textContent = 'Tipo';

      var selectTipo = document.createElement('select');
      selectTipo.name = 'tipo';
      selectTipo.required = true;
      selectTipo.id = 'select-producto';

      tiposComida.forEach(function (tipo) {
        var option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        selectTipo.appendChild(option);
      });

      form.appendChild(labelTipo);
      form.appendChild(selectTipo);

      var btnEnviar = document.createElement('button');
      btnEnviar.type = 'submit';
      btnEnviar.textContent = 'Enviar';
      btnEnviar.classList.add('btnEnviar');

      var btnCancelar = document.createElement('button');
      btnCancelar.type = 'button'; // Evitar que el botón envíe el formulario
      btnCancelar.textContent = 'Cancelar';
      btnCancelar.classList.add('btnCancelar');
      btnCancelar.addEventListener('click', function () {
        restoSeccion.innerHTML = '';
        barraBusqueda.style.display = '';
        menuDesplegable.style.display = '';
        boton.style.display = '';
        mostrarProductos('todos');
        return
      });

      form.appendChild(btnEnviar);
      form.appendChild(btnCancelar);
      restoSeccion.appendChild(form);

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        getMaxIdProducto(function (nuevoIdProducto) {
          if (nuevoIdProducto) {
            var producto = {
              descripcion: form.descripcion.value,
              idProducto: nuevoIdProducto,
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

            mostrarBarraBusquedaProd();

            mostrarProductos('todos');
          } else {
            console.error('No se pudo obtener un nuevo ID para el producto');
          }
        });

      });

    });

  };
}

function obtenerTiposComida() {
  return firebase.database().ref('Tipo_comida').once('value').then(function (snapshot) {
    var tiposComida = [];
    snapshot.forEach(function (childSnapshot) {
      tiposComida.push(childSnapshot.val());
    });
    return tiposComida;
  });
}

function getMaxIdProducto(callback) {
  const productosRef = firebase.database().ref('Producto');
  let maxIdProducto = 0;

  productosRef.once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const idProducto = childSnapshot.val().IdProducto;
      if (idProducto > maxIdProducto) {
        maxIdProducto = idProducto;
      }
    });
    const nuevoIdProducto = maxIdProducto + 1;
    console.log(`El nuevo IdProducto es: ${nuevoIdProducto}`);
    callback(nuevoIdProducto);
  });
}

function guardarProductoBBDD(producto) {

  const dbRef = firebase.database().ref('Producto');

  const newProductoKey = producto.idProducto;

  dbRef.child(newProductoKey).set({
    IdProducto: newProductoKey, // Agregamos la propiedad IdProducto
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

function setUpAnadirOferta() {
  var btn = document.getElementById('btMasOf');
  btn.onclick = function () {
    obtenerDescripcionesProductos().then(function (descripciones) {
      console.log('productos:', descripciones);

      var barraBusqueda = document.getElementById('search-container-ofertas');
      var dropdown = document.getElementById('dropdown-ofertas');
      var restoSeccion = document.getElementById('resto-seccion-ofertas');

      barraBusqueda.style.display = 'none';
      dropdown.style.display = 'none';
      restoSeccion.innerHTML = '';

      var modalContainer = document.createElement('div');
      modalContainer.className = 'modal-container';

      var form = document.createElement('form');
      form.id = 'oferta-form';

      var campos = [
        { label: 'Nombre', name: 'nombre', type: 'text' },
        { label: 'Descuento (en tanto por uno)', name: 'descuento', type: 'text' },
        { label: 'Productos (selección múltiple)', name: 'productos', type: 'select', multiple: true },
        { label: 'Imagen de la Oferta (URL)', name: 'imagen', type: 'url' },
        { label: 'Estado de la oferta', name: 'activada', type: 'select' }
      ];

      campos.forEach(function (campo) {
        var label = document.createElement('label');
        label.textContent = campo.label;

        if (campo.type === 'select') {
          var select = document.createElement('select');
          select.name = campo.name;
          //select.size = 1;
          if (campo.multiple) {
            select.multiple = true;
          }

          if (campo.name === 'productos') {
            select.size = 7;
            select.id = 'select-seleccion-producto';
            descripciones.forEach(function (descripcion) {
              var option = document.createElement('option');
              option.value = descripcion;
              option.text = descripcion;
              select.appendChild(option);
            });
          } else if (campo.name === 'activada') {
            select.size = 1;//
            select.id = 'select-estado-oferta';
            var optionActivada = document.createElement('option');
            optionActivada.value = 'true';
            optionActivada.text = 'Activada';
            select.appendChild(optionActivada);

            var optionDesactivada = document.createElement('option');
            optionDesactivada.value = 'false';
            optionDesactivada.text = 'Desactivada';
            select.appendChild(optionDesactivada);
          }

          form.appendChild(label);
          form.appendChild(select);
        } else {
          form.appendChild(label);

          var input = document.createElement('input');
          input.type = campo.type;
          input.name = campo.name;
          input.required = true;

          form.appendChild(input);
        }
      });

      var btnEnviar = document.createElement('button');
      btnEnviar.type = 'submit';
      btnEnviar.textContent = 'Enviar';
      btnEnviar.classList.add('btnEnviar');

      var btnCancelar = document.createElement('button');
      btnCancelar.type = 'button';
      btnCancelar.textContent = 'Cancelar';
      btnCancelar.classList.add('btnCancelar');
      btnCancelar.addEventListener('click', function () {
        barraBusqueda.style.display = '';
        dropdown.style.display = '';
        restoSeccion.innerHTML = '';
        mostrarBarraBusquedaOferta();
        return;
      });

      form.appendChild(btnEnviar);
      form.appendChild(btnCancelar);

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        /**/
        var oferta = {};

        for (var i = 0; i < form.elements.length; i++) {
          var campo = form.elements[i];
          if (campo.name) {
            switch (campo.name) {
              case 'nombre':
                oferta.nombre = campo.value;
                break;
              case 'descuento':
                oferta.descuento = parseFloat(campo.value);
                break;
              case 'productos':
                oferta.productos = Array.from(campo.selectedOptions).map(function (option) {
                  return option.value;
                });
                break;
              case 'imagen':
                oferta.imagen = campo.value;
                break;
              case 'activada':
                oferta.activada = campo.value === 'true';
                break;
            }
          }
        }

        obtenerSiguienteIdOferta().then(function (idOferta) {
          console.log("El próximo IdOferta es:", idOferta);
          oferta.idOferta = idOferta;
          //guardarEnBBDD(oferta);
          console.log('la oferta nueva es: ' + oferta.productos);
          //console.log('desc prod: ' + buscarProductoPorDescripcion('papas fritas'));
          buscarProductoPorDescripcion("arroz").then(function (idProducto) {
            console.log("ID del producto:", idProducto);
          });

          guardarOfertaBBDD(oferta);
        });
      });

      restoSeccion.appendChild(form);
    });
  };
}

function obtenerSiguienteIdOferta() {
  var ref = firebase.database().ref("Oferta");
  return ref.once("value").then(function (snapshot) {
    var ofertas = snapshot.val();
    var maxIdOferta = 0;
    ofertas.forEach(function (oferta) {
      var idOferta = oferta.IdOferta;
      if (idOferta > maxIdOferta) {
        maxIdOferta = idOferta;
      }
    });
    return maxIdOferta + 1;
  });
}

function guardarOfertaBBDD(oferta) {
  // Obtener el ID de los productos asociados a la oferta
  const productosId = oferta.productos.map(producto => {
    return buscarProductoPorDescripcion(producto).then(idProducto => {
      return idProducto;
    });
  });

  // Esperar a que se resuelvan todas las promesas de obtener ID de productos
  Promise.all(productosId).then(ids => {
    // Crear un objeto oferta para guardar en la base de datos
    const ofertaBBDD = {
      IdOferta: oferta.idOferta,
      Nombre: oferta.nombre,
      Descuento: oferta.descuento,
      ProductosId: ids,
      RutaImagenOferta: oferta.imagen,
      Activada: oferta.activada
    };

    // Guardar la oferta en la base de datos
    const ref = firebase.database().ref("Oferta");
    ref.child(oferta.idOferta).set(ofertaBBDD).then(() => {
      console.log("Oferta guardada correctamente");

      var restoSeccion = document.getElementById('resto-seccion-ofertas');

      restoSeccion.innerHTML = '';
      mostrarBarraBusquedaOferta();
    }).catch(error => {
      console.error("Error al guardar la oferta:", error);
    });
  });
}

function buscarProductoPorDescripcion(descripcion) {
  var ref = firebase.database().ref("Producto");
  return ref.once("value").then(function (snapshot) {
    var productos = snapshot.val();
    for (var idProducto in productos) {
      var producto = productos[idProducto];
      if (producto.Descripcion.toLowerCase().includes(descripcion.toLowerCase())) {
        return producto.IdProducto;
      }
    }
    return null; // no se encontró el producto
  });
}

function obtenerDescripcionesProductos() {
  return firebase.database().ref('Producto').once('value').then(function (snapshot) {
    var descripcionesProductos = [];
    snapshot.forEach(function (childSnapshot) {
      descripcionesProductos.push(childSnapshot.val().Descripcion);
    });
    return descripcionesProductos;
  });
}

function shouldAddOffer(oferta, nombreFiltro, consultaBusqueda) {
  if (consultaBusqueda) {
    return oferta.Nombre.toLowerCase().trim().includes(consultaBusqueda.toLowerCase().trim());
  }

  switch (nombreFiltro) {
    case 'disponibles':
      return oferta.Activada;
    case 'noDisponibles':
      return !oferta.Activada;
    case 'todos':
    default:
      return true;
  }
}

async function obtenerNombreCliente(clienteId) {
  return new Promise((resolve, reject) => {
    const clientesRef = firebase.database().ref('Cliente');

    clientesRef.once('value')
      .then((snapshot) => {
        const clientes = snapshot.val();

        if (clientes) {
          for (let i = 0; i < clientes.length; i++) {
            const cliente = clientes[i];
            if (cliente && cliente.idCliente === clienteId) {
              resolve(cliente.nombre);
              return; // Detener el bucle una vez que se encuentra el cliente
            }
          }
        }

        // Si no se encuentra el cliente, resolver con cadena vacía
        resolve('');
      })
      .catch((error) => {
        // En caso de error, rechazar la promesa con el error
        console.log('nombre de cliente no encontrado');
      });
  });
}

function obtenerDescripcionProducto(productoId) {
  const productosRef = firebase.database().ref('Producto');

  return new Promise((resolve, reject) => {
    productosRef.child(productoId).once('value')
      .then((snapshot) => {
        const productoData = snapshot.val();
        if (productoData && productoData.Descripcion) {
          resolve(productoData.Descripcion);
        } else {
          reject(new Error('No se encontró la descripción del producto'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function obtenerNombreOferta(ofertaId) {
  const ofertasRef = firebase.database().ref('Oferta');

  return new Promise((resolve, reject) => {
    ofertasRef.child(ofertaId).once('value')
      .then((snapshot) => {
        const ofertaData = snapshot.val();
        if (ofertaData && ofertaData.Nombre) {
          resolve(ofertaData.Nombre);
        } else {
          reject(new Error('No se encontró el nombre de la oferta'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setUpBarraBusqueda(seccion) {
  switch (seccion) {
    case 'pedidos':
      var caja = document.getElementById('txt-pedidos');
      var lupa = document.getElementById('btn-lupa-pedidos');
      var enCurso = document.getElementById('opc1-pedidos');
      var terminados = document.getElementById('opc2-pedidos');
      var todos = document.getElementById('opc3-pedidos');

      lupa.onclick = function () {
        mostrarPedidos('todos', caja.value);
      };

      enCurso.onclick = function () {
        mostrarPedidos('en curso');
      };

      terminados.onclick = function () {
        mostrarPedidos('terminados');
      };

      todos.onclick = function () {
        mostrarPedidos('todos');
      };

      break;

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

function mostrarBarraBusquedaProd() {
  var barraBusqueda = document.getElementById('search-container-prod');
  var menuDesplegable = document.getElementById('dropdown-prod');
  var boton = document.getElementById('btMasProd');

  barraBusqueda.style.display = '';
  menuDesplegable.style.display = '';
  boton.style.display = '';
}

function mostrarBarraBusquedaOferta() {
  var btn = document.getElementById('btMasOf');
  var barraBusqueda = document.getElementById('search-container-ofertas');
  var dropdown = document.getElementById('dropdown-ofertas');

  btn.style.display = '';
  dropdown.style.display = '';
  barraBusqueda.style.display = '';

  mostrarOfertas('todos');
}

function gestionarClientes(correoCliente) {
  var database = firebase.database();

  database.ref('Cliente').orderByChild('correo').equalTo(correoCliente).once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var cliente = childSnapshot.val();
      var nuevoEstadoBloqueo = !cliente.bloqueado;

      childSnapshot.ref.update({ bloqueado: nuevoEstadoBloqueo }).then(function () {
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