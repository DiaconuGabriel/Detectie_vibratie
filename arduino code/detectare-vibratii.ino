#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "time.h"

#include "addons/TokenHelper.h"   // Provide the token generation process info.
#include "addons/RTDBHelper.h"    // Provide the RTDB payload printing info and other helper functions.

TaskHandle_t Task1;
TaskHandle_t Task2;
SemaphoreHandle_t mymutex;

const char* WIFI_SSID = "your-wifi-name";
const char* WIFI_PASSWORD = "your-wifi-password;

// Insert Firebase project API Key
const char* API_KEY = "your_api_key"; 

// Insert Authorized Email and Corresponding Password
const char* USER_EMAIL =  "email-user";
const char* USER_PASSWORD =  "email-password";

// Insert RTDB URLefine the RTDB URL
const char* DATABASE_URL = "your-data-base-url"; 

// Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variable to save USER UID
String uid;

// Database main path (to be updated in setup with the user UID)
String databasePath;
// Database child nodes
String vibratiepPath = "/vibratie";
String timePath = "/timestamp";

// Parent Node (to be updated in every loop)
String parentPath;

volatile int timestamp;
FirebaseJson json;

const char* ntpServer = "ro.pool.ntp.org";

float readings[100] = {};
byte pin = 34;
float valoare = 0;
float volti = 0;
String readingsArray = "";

// Initialize WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(2000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

// Function that gets current epoch time
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return(0);
  }
  time(&now);
  return now;
}

void setup(){

  Serial.begin(9600);
  pinMode(pin,INPUT);

  mymutex= xSemaphoreCreateMutex();

  if (mymutex ==NULL){
    Serial.println("Mutexul nu a putut fi creat!");
  }

  initWiFi();
  configTime(0, 0, ntpServer);

  // Assign the api key (required)
  config.api_key = API_KEY;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  // Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  // Assign the maximum retry of token generation
  config.max_token_generation_retry = 5;

  // Initialize the library with the Firebase authen and config
  Firebase.begin(&config, &auth);

  // Getting the user UID might take a few seconds
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }
  // Print user UID
  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  // Update database path
  databasePath = "/UsersData/" + uid + "/readings";

  Serial.print("Setup : ");
  Serial.println(xPortGetCoreID());

  xTaskCreatePinnedToCore(
      Task1code,
      "Task1",
      20000,
      NULL,
      2,
      &Task1,
      1);
  xTaskCreatePinnedToCore(
      Task2code,
      "Task2",
      20000,
      NULL,
      1,
      &Task2,
      0);
}

void loop(){
}

void Task1code( void* pvParameters){
  for(;;){
    xSemaphoreTake(mymutex,portMAX_DELAY);
    timestamp = getTime();
    if (Firebase.ready()){
      Serial.print ("time: ");
      Serial.println (timestamp);
      parentPath= databasePath + "/" ;
      json.set(vibratiepPath,readingsArray);
      readingsArray="";
      json.set(timePath, String(timestamp));
      Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, parentPath.c_str(), &json) ? "ok" : fbdo.errorReason().c_str());
      xSemaphoreGive(mymutex);
      Serial.println("Mutex task 1 dat");
    }
  }
}
void Task2code( void* pvParameters){
  for(;;){
    xSemaphoreTake(mymutex,portMAX_DELAY);
    for(int i=0; i<100; i++){
      valoare = analogRead(pin);
      volti = (valoare/4096) * 3.333333;
      readingsArray += String(volti, 2); // Format to two decimal places
      vTaskDelay(10);
    }
    Serial.println(readingsArray);
    xSemaphoreGive(mymutex);
    Serial.println("Mutex task 2 dat");
  }
}
