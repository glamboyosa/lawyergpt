package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Result struct {
	URL string `json:"url"`
	TextContent string `json:"textContent"`
}

func main()  {
	urls := []string{
		"https://nigerialii.org/akn/ng/judgment/ngsc/2007/3/eng@2007-02-22",
	}
	results := processURLs(urls)
	fmt.Printf("results %v", results)
}

func processURLs(urls []string) []Result  {
	var wg sync.WaitGroup

	results := make([]Result, len(urls))

	semaphore := make(chan struct{}, 5)

	for i, url := range urls {
		wg.Add(1)
		go func(i int, url string) {
			defer wg.Done()
			semaphore <- struct{}{} 
			defer func ()  {
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
func processURL(url string) (Result, error)  {
		textContent, err := scrapeTextContent(url)
		if err != nil {
			return Result{}, fmt.Errorf("error scraping text content: %w", err)
		}
		return Result{
			URL: url,
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