package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Result struct {
	URL         string `json:"url"`
	TextContent string `json:"textContent"`
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// loadEnv if it exists in development
func LoadEnv(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])

			os.Setenv(key, value)
		}
	}
	return scanner.Err()
}
func main() {

	err := LoadEnv(".env.development")
	if err != nil && !os.IsNotExist(err) {
		log.Printf("Error loading .env.development: %v", err)
	}
	urls := []string{
		"https://nigerialii.org/akn/ng/judgment/ngca/2014/1/eng@2014-02-26",
		"https://nigerialii.org/akn/ng/judgment/ngsc/2016/51/eng@2016-02-11",
		"https://nigerialii.org/akn/ng/judgment/ngsc/1989/16/eng@1989-01-19",
		"https://nigerialii.org/akn/ng/judgment/ngsc/1989/24/eng@1989-01-20",
		"https://nigerialii.org/akn/ng/judgment/ngsc/1989/26/eng@1989-01-20",
		"https://nigerialii.org/akn/ng/judgment/ngsc/1976/35/eng@1976-06-04",
		"https://nigerialii.org/akn/ng/judgment/ngca/2013/1/eng@2013-02-10",
	}
	results := processURLs(urls)
	fmt.Printf("results %v", results)
	fmt.Printf("Results????")
	batches := batchResults(results)
	if err := makeTextEmbeddingsRequest(batches); err != nil {
		log.Fatalf("Error making request: %v", err)
	}
}

func processURLs(urls []string) []Result {
	var wg sync.WaitGroup

	results := make([]Result, len(urls))

	semaphore := make(chan struct{}, 5)

	for i, url := range urls {
		wg.Add(1)
		go func(i int, url string) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() {
				<-semaphore
			}()
			result, err := processURL(url)
			if err != nil {
				log.Printf("Error processing %s: %v", url, err)
				return
			}
			results[i] = result
		}(i, url)
	}
	wg.Wait()
	return results
}
func processURL(url string) (Result, error) {
	textContent, err := scrapeTextContent(url)
	if err != nil {
		return Result{}, fmt.Errorf("error scraping text content: %w", err)
	}
	return Result{
		URL:         url,
		TextContent: textContent,
	}, nil
}

func scrapeTextContent(url string) (string, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Unexpected status code: %d", resp.StatusCode)
	}
	doc, err := goquery.NewDocumentFromReader(resp.Body)

	if err != nil {
		return "", err
	}
	return doc.Find(".content-and-enrichments").Text(), nil
}
func batchResults(results []Result) [][]Result {
	var batches [][]Result

	for i := 0; i < len(results); i += 5 {
		end := i + 5
		if end > len(results) {
			end = len(results)
		}
		batches = append(batches, results[i:end])
	}

	return batches
}
func makeTextEmbeddingsRequest(batches [][]Result) error {
	fmt.Print("Do we make it in?")
	baseURL := os.Getenv("BASE_URL")
	apiKey := os.Getenv("API_KEY")

	// Initialize client outside the loop
	client := &http.Client{}

	for _, batch := range batches {

		payload := map[string]interface{}{
			"results": batch,
		}

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("failed to marshal payload: %w", err)
		}

		fmt.Printf("Base url %s", fmt.Sprintf("%s/text-embeddings", baseURL))

		req, err := http.NewRequest("POST", fmt.Sprintf("%s/text-embeddings", baseURL), bytes.NewBuffer(payloadBytes))
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-api-key", apiKey)

		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("request failed: %w", err)
		}

		defer resp.Body.Close()

		if resp.StatusCode != http.StatusAccepted {
			bodyBytes, _ := io.ReadAll(resp.Body) // Read the response body for debugging
			return fmt.Errorf("request failed with status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
		}
		fmt.Print("MAKE IT ALL THE WAY??")
	}

	return nil
}
