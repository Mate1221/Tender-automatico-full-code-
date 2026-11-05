importScripts(
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js"
);


firebase.initializeApp({

    apiKey: "AIzaSyCxRb2S1VGQFv3RJl0epfIa4aNVYWnR73U",

    authDomain:
        "tender-automatico.firebaseapp.com",

    projectId:
        "tender-automatico",

    storageBucket:
        "tender-automatico.firebasestorage.app",

    messagingSenderId:
        "97815083485",

    appId:
        "1:97815083485:web:d9e052b9993917bd9b1e34"

});


const messaging =
    firebase.messaging();


messaging.onBackgroundMessage((payload) => {

    console.log(
        "[sw.js] Notificación recibida:",
        payload
    );


    const notificationTitle =
        payload.notification?.title ||
        "Tender Automático";


    const notificationOptions = {

        body:
            payload.notification?.body ||
            "Se detectó un cambio.",

        icon: "/icon.png"

    };


    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );

});
