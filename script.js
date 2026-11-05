import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js";


// ============================
// FIREBASE
// ============================

const firebaseConfig = {
    apiKey: "AIzaSyCxRb2S1VGQFv3RJl0epfIa4aNVYWnR73U",
    authDomain: "tender-automatico.firebaseapp.com",
    projectId: "tender-automatico",
    storageBucket: "tender-automatico.firebasestorage.app",
    messagingSenderId: "97815083485",
    appId: "1:97815083485:web:d9e052b9993917bd9b1e344"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


// ============================
// ELEMENTOS DE LA PÁGINA
// ============================

const estadoTender = document.querySelector(".estado_tender");
const btnColor = document.querySelector(".btn_color");


// ============================
// NOTIFICACIONES FIREBASE
// ============================

async function activarNotificaciones() {

    try {

        const permiso =
            await Notification.requestPermission();

        console.log(
            "Permiso de notificaciones:",
            permiso
        );

        if (permiso !== "granted") {
            console.log("Notificaciones rechazadas.");
            return;
        }


        const registroFirebase =
            await navigator.serviceWorker.register(
                "/Tender-Automatico/firebase-messaging-sw.js"
            );

        console.log(
            "Service Worker de Firebase registrado"
        );


        const token = await getToken(messaging, {

            vapidKey:
                "BHk4yzBKWjlMb4IEb3LEh3QVDcBHLeT1ixUaBVEqiry9lCxjLNLpFBtCgiE0OiamSZ9PsVG-cOXwwxKdXTuQvDg",

            serviceWorkerRegistration:
                registroFirebase

        });


        
        if (token) {

            console.log("TOKEN DEL DISPOSITIVO:");
            console.log(token);

            // ======================================
            // REGISTRAR ESTE DISPOSITIVO EN EL WORKER
            // ======================================

            const respuesta = await fetch(
                "https://tender-notificaciones.matepinamar11.workers.dev/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        accion: "registrar",
                        token: token
                    })
                }
            );

            const resultado =
                await respuesta.text();

            console.log(
                "Respuesta del registro:",
                resultado
            );

        } else {

            console.log(
                "No se pudo obtener el token."
            );
        }



    } catch (error) {

        console.error(
            "Error obteniendo el token:",
            error
        );

    }

}

activarNotificaciones();


// ============================
// MENSAJES FIREBASE CON LA WEB ABIERTA
// ============================

onMessage(messaging, (payload) => {

    console.log(
        "Notificación recibida:",
        payload
    );

});


// ============================
// MQTT
// ============================

const broker =
    "wss://d95554d0e6434a35b9a224e50b0525ed.s1.eu.hivemq.cloud:8884/mqtt";

const opciones = {

    username: "TenderWeb",

    // Mantené acá tu contraseña actual de HiveMQ.
    password: "ETecnica1"

};

const cliente = mqtt.connect(
    broker,
    opciones
);


cliente.on("connect", () => {

    console.log("Conectado a HiveMQ");

    cliente.subscribe("tender/lluvia");

});


cliente.on("message", (topic, mensaje) => {

    const estado = mensaje.toString();

    console.log(
        "Mensaje recibido:",
        estado
    );

    estadoTender.textContent = estado;


    btnColor.classList.remove(
        "btn_color_rojo",
        "btn_color_verde",
        "btn_color_azul"
    );


    if (estado === "Mojado") {

        btnColor.classList.add(
            "btn_color_rojo"
        );

    } else if (estado === "Seco") {

        btnColor.classList.add(
            "btn_color_verde"
        );

    } else {

        btnColor.classList.add(
            "btn_color_azul"
        );

    }

});
