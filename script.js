document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraNavegacion();
    
    // Forzar la creación de la base de datos simulada con el usuario demo corregido
    let afiliados = JSON.parse(localStorage.getItem('afiliadosCarbonEco')) || [];
    let existeDemo = afiliados.some(u => u.correo === "cliente@test.com");
    
    if (!existeDemo) {
        afiliados.push({
            usuario: "Cliente Demo Test",
            correo: "cliente@test.com",
            contrasena: "1234",
            celular: "932221052",
            suspendido: false
        });
        localStorage.setItem('afiliadosCarbonEco', JSON.stringify(afiliados));
    }
});

function abrirModal() { document.getElementById('accessModal').style.display = 'flex'; }
function cerrarModal() { document.getElementById('accessModal').style.display = 'none'; }

function showForm(type) {
    if (type === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-signup').classList.remove('active');
        document.getElementById('form-login').style.display = 'block';
        document.getElementById('form-signup').style.display = 'none';
    } else {
        document.getElementById('tab-signup').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('form-signup').style.display = 'block';
        document.getElementById('form-login').style.display = 'none';
    }
}

function handleLogin(event) {
    event.preventDefault();
    let email = document.getElementById('login-email').value.trim();
    let pass = document.getElementById('login-pass').value.trim();

    let afiliados = JSON.parse(localStorage.getItem('afiliadosCarbonEco')) || [];
    let usuarioEncontrado = afiliados.find(u => u.correo === email && u.contrasena === pass);

    if (usuarioEncontrado) {
        if(usuarioEncontrado.suspendido) {
            return alert("❌ Esta cuenta ha sido suspendida por el Administrador ERP.");
        }
        let clienteSesion = {
            nombre: usuarioEncontrado.usuario,
            correo: usuarioEncontrado.correo,
            celular: usuarioEncontrado.celular
        };
        localStorage.setItem('clienteActivoCarbonEco', JSON.stringify(clienteSesion));
        
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('verifyContainer').style.display = 'block';
    } else {
        alert("❌ Credenciales inválidas. Revise el correo o la contraseña.");
    }
}

function handleSimulatedSignup(event) {
    event.preventDefault();
    let name = document.getElementById('signup-name').value.trim();
    let email = document.getElementById('signup-email').value.trim();
    let pass = document.getElementById('signup-pass').value.trim();
    let phone = document.getElementById('signup-phone').value.trim();

    let afiliados = JSON.parse(localStorage.getItem('afiliadosCarbonEco')) || [];
    if (afiliados.some(u => u.correo === email)) { return alert("El correo ya existe."); }

    afiliados.push({ usuario: name, correo: email, contrasena: pass, celular: phone, suspendido: false });
    localStorage.setItem('afiliadosCarbonEco', JSON.stringify(afiliados));

    localStorage.setItem('clienteActivoCarbonEco', JSON.stringify({ nombre: name, correo: email, celular: phone }));

    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('verifyContainer').style.display = 'block';
}

function accesoConcedido() {
    actualizarBarraNavegacion();
    cerrarModal();
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('verifyContainer').style.display = 'none';
    alert("🎉 ¡Acceso concedido!");
}

function actualizarBarraNavegacion() {
    let cliente = JSON.parse(localStorage.getItem('clienteActivoCarbonEco'));
    let userBtn = document.getElementById('userBtn');
    if (cliente && userBtn) {
        userBtn.innerHTML = `👤 ${cliente.nombre} (Salir)`;
        userBtn.onclick = cerrarSesion;
    }
}

function cerrarSesion() {
    localStorage.removeItem('clienteActivoCarbonEco');
    let userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.innerHTML = "Entrar / Registro";
        userBtn.onclick = abrirModal;
    }
    alert("Sesión finalizada.");
}

function enviarPedidoAlERP(nombreProducto, precioProducto) {
    let cliente = JSON.parse(localStorage.getItem('clienteActivoCarbonEco'));
    let nombreFinal, correoFinal, celularFinal;

    if (!cliente) {
        alert("💡 Pedido en modo invitado. Por favor ingresa tus datos de entrega.");
        nombreFinal = prompt("Ingresa tu Nombre Completo:"); if (!nombreFinal) return;
        correoFinal = prompt("Ingresa tu Correo Electrónico:"); if (!correoFinal) return;
        celularFinal = prompt("Ingresa tu Número de Celular:"); if (!celularFinal) return;
    } else {
        nombreFinal = cliente.nombre;
        correoFinal = cliente.correo;
        celularFinal = cliente.celular;
    }

    let listaPedidos = JSON.parse(localStorage.getItem('pedidosCarbonEco')) || [];
    let cajaDineroActual = parseFloat(localStorage.getItem('dineroCarbonEco')) || 0;

    listaPedidos.push({
        nombre: nombreFinal, 
        correo: correoFinal,
        celular: celularFinal,
        producto: nombreProducto,
        precio: precioProducto,
        estado: "Pendiente"
    });

    cajaDineroActual += precioProducto;
    localStorage.setItem('pedidosCarbonEco', JSON.stringify(listaPedidos));
    localStorage.setItem('dineroCarbonEco', cajaDineroActual.toString());

    let textoMsg = `¡Hola CarbonEco! He solicitado una orden.%0A%0A*Datos del Cliente:*%0A👤 Nombre: ${nombreFinal}%0A📧 Correo: ${correoFinal}%0A📱 Celular: ${celularFinal}%0A%0A*Detalles de Compra:*%0A📦 Producto: ${nombreProducto}%0A💰 Total: S/ ${precioProducto}.00`;
    let enlaceWhatsApp = `https://wa.me/51932221052?text=${textoMsg}`;
    
    alert(`🎉 ¡Pedido cargado al ERP! Abriendo WhatsApp.`);
    window.open(enlaceWhatsApp, '_blank');
}

function calcularImpacto() {
    let kg = parseFloat(document.getElementById('kilos').value) || 0;
    let resultado = document.getElementById('resultado');
    if(kg <= 0) { resultado.innerText = "Ingrese una cantidad válida."; return; }
    resultado.innerHTML = `♻️ Evitas la liberación de <span style="color:#2ecc71">${(kg * 2.4).toFixed(2)} kg de CO₂</span> al año.`;
}

function toggleFaq(button) {
    let answer = button.nextElementSibling;
    answer.style.display = (answer.style.display === "block") ? "none" : "block";
}