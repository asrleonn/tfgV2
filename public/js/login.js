var usuario;
var contrasena;
var contrasenaCifrada;
var btnEnviar = document.getElementById('btnEnviar');

document.addEventListener('DOMContentLoaded', function () {

    btnEnviar.onclick = function (event) {

        event.preventDefault();

        usuario = document.getElementById('username').value;
        contrasena = document.getElementById('password').value;
        contrasenaCifrada = CryptoJS.SHA256(contrasena).toString(CryptoJS.enc.Hex);
        console.log("Nombre: " + usuario);
        console.log("Contraseña: " + contrasenaCifrada);

        firebase.auth().signInWithEmailAndPassword(usuario, contrasenaCifrada)
            .then((userCredential) => {
                // Autenticación exitosa, puedes acceder al usuario aquí
                const user = userCredential.user;
                const uid = user.uid;
                console.log("Usuario autenticado:", user);

                // Guardar el usuario en el localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));


                window.location.href = '../html/principal.html';

                /*if(uid.toString() == 'ryN8Qk0lOrV5zHBNj3MaJAUeZj42'){ //admin
                    alert('usuario con permisos');
                } else { ///noadmin
                    window.location.href = '../html/principal.html';
                }*/
            })
            .catch((error) => {
                // Si hay un error en la autenticación, puedes manejarlo aquí
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Error de autenticación:", errorCode, errorMessage);
                alert('Credenciales no válidas');
                document.getElementById("username").value = "";
                document.getElementById("password").value = "";
            });
    };

});

