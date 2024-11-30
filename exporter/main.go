package main

import (
	"bufio"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/yaml.v3"
)

func main() {
	isDev := os.Getenv("DEV") == "true"

	if isDev {
		log.Default().Print("Running in development mode")
	}

	MONGO_URL := os.Getenv("MONGO_URI")
	if MONGO_URL == "" {
		log.Default().Print("MONGO_URI is not set: using localhost")
		MONGO_URL = "mongodb://localhost:27017"
	} else {
		MONGO_URL = "mongodb://" + MONGO_URL
		log.Default().Print("MONGO_URI is set: using " + MONGO_URL)
	}
	var Config map[string]interface{}

	SURICATA_CONFIG := os.Getenv("SURICATA_CONFIG")
	SURICATA_EVE := os.Getenv("SURICATA_EVE")
	if SURICATA_CONFIG == "" {
		log.Default().Print("SURICATA_CONFIG is not set - using /etc/suricata/suricata.yaml")
		SURICATA_CONFIG = "/etc/suricata/suricata.yaml"
	}
	file, err := os.ReadFile(SURICATA_CONFIG)
	if err != nil {
		if SURICATA_EVE == "" {
			log.Fatalf("error: %v", err)
		}
	}

	err = yaml.Unmarshal(file, &Config)
	if err != nil {
		if SURICATA_EVE == "" {
			log.Fatalf("error: %v", err)
		}
	}

	if SURICATA_EVE == "" {
		log.Default().Print("SURICATA_EVE is not set - using config from Config")
		SURICATA_EVE = Config["default-log-dir"].(string) + "/eve.json"
	}

	clientOptions := options.Client().ApplyURI(MONGO_URL)

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")

	// open eve file
	eveFile, err := os.Open(SURICATA_EVE)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	scanner := bufio.NewScanner(eveFile)

	dbName := "jackal"
	if isDev {
		dbName = "jackal-dev"
	}

	collection := client.Database(dbName).Collection("eve")
	fmt.Println("DB: ", dbName)
	fmt.Println("Collection: ", collection.Name())
	lognumber := 0
	for scanner.Scan() {
		// fmt.Println(scanner.Text())
		line := scanner.Text()
		var result map[string]interface{}
		json.Unmarshal([]byte(line), &result)
		sha256 := sha256.New()
		sha256.Write([]byte(line))
		hash := sha256.Sum(nil)
		result["hash"] = fmt.Sprintf("%x", hash)
		result["full_text"] = line
		const customTimeLayout = "2006-01-02T15:04:05.999999-0700"
		parsedTime, err := time.Parse(customTimeLayout, result["timestamp"].(string))
		if err != nil {
			log.Fatalf("error parsing timestamp: %v", err)
		}
		result["timestamp"] = primitive.NewDateTimeFromTime(parsedTime).Time().UTC()
		collection.InsertOne(context.TODO(), result)
		lognumber++
		if lognumber%1000 == 0 {
			fmt.Println("Inserted ", lognumber, " documents")
		}
	}
	if err := scanner.Err(); err != nil {
		log.Fatalf("error: %v", err)
	}

	// // Get a handle for your collection

	// // Insert a document
	// doc := map[string]string{"name": "Alice", "city": "Wonderland"}
	// insertResult, err := collection.InsertOne(context.TODO(), doc)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// fmt.Println("Inserted a single document: ", insertResult.InsertedID)
	defer client.Disconnect(context.Background())

	fmt.Println("Connection to MongoDB closed.")
}
