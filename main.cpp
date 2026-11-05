#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <PubSubClient.h>


// ==========================================
// WIFI
// ==========================================

const char* ssid = "Escuela Tecnica";
const char* password = "TecnicaEdu";


// ==========================================
// HIVE MQ
// ==========================================

const char* mqtt_server =
    "d95554d0e6434a35b9a224e50b0525ed.s1.eu.hivemq.cloud";

const int mqtt_port = 8883;

const char* mqtt_user =
    "TenderAutomatico";

const char* mqtt_password =
    "EscuelaTecnica1";


// ==========================================
// CLOUDFLARE WORKER
// ==========================================

const char* worker_url =
    "https://tender-notificaciones.matepinamar11.workers.dev/";


// ==========================================
// SENSOR
// ==========================================

const int PIN_SENSOR_AGUA = 34;

const int UMBRAL_AGUA = 300;


// ==========================================
// ESTADOS
// ==========================================

String estado = "";
String ultimoEstado = "";


// ==========================================
// MQTT
// ==========================================

WiFiClientSecure secureClient;

PubSubClient mqttClient(secureClient);


// ==========================================
// CONECTAR MQTT
// ==========================================

void conectarMQTT() {

    Serial.println("Conectando a HiveMQ...");

    while (!mqttClient.connected()) {

        if (
            mqttClient.connect(
                "ESP32_Tender_Prueba",
                mqtt_user,
                mqtt_password
            )
        ) {

            Serial.println("¡Conectado a HiveMQ!");

        } else {

            Serial.print(
                "Falló MQTT. Código: "
            );

            Serial.println(
                mqttClient.state()
            );

            delay(5000);
        }
    }
}


// ==========================================
// ENVIAR NOTIFICACIÓN
// ==========================================

void enviarNotificacion(String nuevoEstado) {

    Serial.println(
        "Enviando estado al Worker..."
    );


    WiFiClientSecure workerClient;

    // Para esta prueba usamos HTTPS sin
    // verificar el certificado.
    workerClient.setInsecure();


    HTTPClient http;


    if (
        !http.begin(
            workerClient,
            worker_url
        )
    ) {

        Serial.println(
            "No se pudo conectar al Worker."
        );

        return;
    }


    http.addHeader(
        "Content-Type",
        "application/json"
    );


    String datos =
        "{\"estado\":\"" +
        nuevoEstado +
        "\"}";


    int codigo =
        http.POST(datos);


    Serial.print(
        "Respuesta del Worker: "
    );

    Serial.println(codigo);


    if (codigo > 0) {

        String respuesta =
            http.getString();

        Serial.println(
            "Respuesta:"
        );

        Serial.println(
            respuesta
        );

    } else {

        Serial.print(
            "Error HTTP: "
        );

        Serial.println(
            http.errorToString(codigo)
        );
    }


    http.end();
}


// ==========================================
// SETUP
// ==========================================

void setup() {

    Serial.begin(115200);


    // ------------------------------
    // WIFI
    // ------------------------------

    Serial.println(
        "Conectando al Wi-Fi..."
    );

    WiFi.begin(
        ssid,
        password
    );


    while (
        WiFi.status() != WL_CONNECTED
    ) {

        delay(500);

        Serial.print(".");
    }


    Serial.println();

    Serial.println(
        "¡Wi-Fi conectado!"
    );


    Serial.print(
        "IP de la ESP32: "
    );

    Serial.println(
        WiFi.localIP()
    );


    // ------------------------------
    // MQTT
    // ------------------------------

    secureClient.setInsecure();

    mqttClient.setServer(
        mqtt_server,
        mqtt_port
    );


    conectarMQTT();
}


// ==========================================
// LOOP
// ==========================================

void loop() {


    // ------------------------------
    // MANTENER MQTT CONECTADO
    // ------------------------------

    if (!mqttClient.connected()) {
        conectarMQTT();
    }

    mqttClient.loop();


    // ------------------------------
    // LEER SENSOR
    // ------------------------------

    int valorAgua =
        analogRead(
            PIN_SENSOR_AGUA
        );


    if (
        valorAgua < UMBRAL_AGUA
    ) {

        estado = "Seco";

    } else {

        estado = "Mojado";
    }


    // ------------------------------
    // MOSTRAR INFORMACIÓN
    // ------------------------------

    Serial.print(
        "Sensor de agua: "
    );

    Serial.print(
        valorAgua
    );

    Serial.print(
        " | Estado: "
    );

    Serial.println(
        estado
    );


    // ------------------------------
    // CAMBIO DE ESTADO
    // ------------------------------

    if (
        estado != ultimoEstado
    ) {


        // MQTT → WEB

        mqttClient.publish(
            "tender/lluvia",
            estado.c_str()
        );


        Serial.print(
            "Estado enviado a HiveMQ: "
        );

        Serial.println(
            estado
        );


        // --------------------------
        // NOTIFICACIÓN
        // --------------------------

        if (
            estado == "Mojado"
        ) {

            enviarNotificacion(
                "Mojado"
            );
        }


        ultimoEstado =
            estado;
    }


    delay(500);
}
