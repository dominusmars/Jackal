package main

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"
)

func getIps(number int) []string {
	ips := make([]string, number)
	for i := 0; i < number; i++ {
		ips[i] = getRandomIP()
	}
	return ips
}
func getPorts(number int) []int {
	ports := make([]int, number)
	for i := 0; i < number; i++ {
		ports[i] = getRandomPort()
	}
	return ports
}

func getRandomIP() string {
	return fmt.Sprintf("%d.%d.%d.%d", rand.Intn(256), rand.Intn(256), rand.Intn(256), rand.Intn(256))
}

func getRandomPort() int {
	return rand.Intn(65536)
}

func main() {

	SURICATA_EVE := os.Getenv("SURICATA_EVE")
	if SURICATA_EVE == "" {
		log.Fatal("SURICATA_EVE is not set")
	}
	log.Default().Print("SURICATA_EVE is set: using " + SURICATA_EVE)

	numberOfComputers := 100

	ips := getIps(numberOfComputers)
	ports := getPorts(numberOfComputers)

	file, err := os.OpenFile(SURICATA_EVE, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Failed to open file: %v", err)
	}
	defer file.Close()

	for {
		source_ip := ips[rand.Intn(numberOfComputers)]
		source_port := ports[rand.Intn(numberOfComputers)]
		dest_ip := ips[rand.Intn(numberOfComputers)]
		dest_port := ports[rand.Intn(numberOfComputers)]
		if source_ip == dest_ip {
			continue
		}
		flow_id := rand.Intn(1000000000)

		if rand.Intn(100) < 10 {
			log.Default().Print("Writing alert")
			alertActions := []string{"allowed", "drop", "reject"}
			alertAction := alertActions[rand.Intn(len(alertActions))]
			alertEntry := fmt.Sprintf(`{"timestamp": "%s", "flow_id": %d, "in_iface": "eth1", "event_type": "alert", "src_ip": "%s", "src_port": %d, "dest_ip": "%s", "dest_port": %d, "proto": "TCP", "alert": {"action": "%s", "gid": 1, "signature_id": %d, "rev": 1, "signature": "Test alert", "category": "Misc activity", "severity": %d}}`, time.Now().Format(time.RFC3339), flow_id, source_ip, source_port, dest_ip, dest_port, alertAction, rand.Intn(1000000), rand.Intn(5)+1)

			if _, err := file.WriteString(alertEntry + "\n"); err != nil {
				log.Fatalf("Failed to write to file: %v", err)
			}
			
		} else {
			logEntry := fmt.Sprintf(`{"timestamp": "%s", "flow_id": %d, "in_iface": "eth1", "event_type": "dns", "src_ip": "%s", "src_port": %d, "dest_ip": "%s", "dest_port": %d, "proto": "UDP", "dns": {"type": "query", "id": 21642, "rrname": "charon.alien.moon.mine", "rrtype": "A", "tx_id": 0, "opcode": 0}}`, time.Now().Format(time.RFC3339), flow_id, source_ip, source_port, dest_ip, dest_port)
		
		

			if _, err := file.WriteString(logEntry + "\n"); err != nil {
				log.Fatalf("Failed to write to file: %v", err)
			}
		}
		
		time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
		log.Default().Print("Log entry written")
	}

}
