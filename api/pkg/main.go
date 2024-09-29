package pkg

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"baliance.com/gooxml/document"
	"github.com/google/generative-ai-go/genai"
	"github.com/ledongthuc/pdf"
	"github.com/otiai10/gosseract/v2"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"google.golang.org/api/option"
)

// helper function to chunk text
func ChunkText(text string, chunkSize int) []string {
	var chunks []string
	runes := []rune(text)

	for len(runes) > 0 {
		if len(runes) > chunkSize {
			chunks = append(chunks, string(runes[:chunkSize]))
			runes = runes[chunkSize:]
		} else {
			chunks = append(chunks, string(runes))
			break
		}
	}
	return chunks
}

// helper function to process DOCX files
func ProcessDOCX(filepath string) (string, error) {
	// Defer a recovery function to prevent panics from crashing the goroutine
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in ProcessPDF: %v\n", r)
		}
	}()
	doc, err := document.Open(filepath)
	if err != nil {
		return "", err
	}

	var content string

	for _, para := range doc.Paragraphs() {
		for _, run := range para.Runs() {
			content += run.Text()
		}
		content += "\n"
	}
	return content, nil
}

// helper function to convert PDFs to images for OCR
func ConvertPDFToImages(pdfPath string, outputDir string) ([]string, error) {
	log.Print("from this func")
	// Defer a recovery function to prevent panics from crashing the goroutine
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in ProcessPDF: %v\n", r)
		}
	}()
	err := api.ExtractImagesFile(pdfPath, outputDir, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to extract images: %v", err)
	}
	imageFiles, err := filepath.Glob(filepath.Join(outputDir, "*.png"))
	log.Printf("imAGE FILES %v", imageFiles)
	if err != nil {
		return nil, fmt.Errorf("failed to list images: %v", err)
	}

	return imageFiles, nil
}

// helper function to process OCR
func ProcessOCR(imagePaths []string) (string, error) {
	client := gosseract.NewClient()
	// Defer a recovery function to prevent panics from crashing the goroutine
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in ProcessPDF: %v\n", r)
		}
	}()
	defer client.Close()
	log.Print("Gossecract")
	var fullText strings.Builder
	for _, imagePath := range imagePaths {
		client.SetImage(imagePath)
		text, err := client.Text()
		if err != nil {
			return "", fmt.Errorf("OCR failed for %s: %v", imagePath, err)
		}
		fullText.WriteString(text)
		fullText.WriteString("\n\n")
	}

	return fullText.String(), nil
}

// helper function to process PDFs
func ProcessPDF(filePath string) (string, error) {
	// Defer a recovery function to prevent panics from crashing the goroutine
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in ProcessPDF: %v\n", r)
		}
	}()

	f, r, err := pdf.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("error opening PDF: %w", err)
	}
	defer f.Close()

	var content string
	var totalPages int

	// Safely get the number of pages
	func() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Printf("Recovered from panic in NumPage(): %v\n", r)
				totalPages = 0
			}
		}()
		totalPages = r.NumPage()
	}()

	if totalPages == 0 {
		return "", fmt.Errorf("error getting number of pages in PDF or PDF has no pages")
	}

	for pageIndex := 1; pageIndex <= totalPages; pageIndex++ {
		func() {
			defer func() {
				if r := recover(); r != nil {
					fmt.Printf("Recovered from panic processing page %d: %v\n", pageIndex, r)
				}
			}()

			p := r.Page(pageIndex)
			if p.V.IsNull() {
				return
			}

			text, err := p.GetPlainText(nil)
			if err != nil {
				fmt.Printf("Error getting text from page %d: %v\n", pageIndex, err)
				return
			}
			content += text
		}()
	}

	if content == "" {
		return "", fmt.Errorf("no content extracted from PDF")
	}

	return content, nil
}
func ConvertFloat32ToFloat64(input []float32) []float64 {
	output := make([]float64, len(input))
	for i, v := range input {
		output[i] = float64(v)
	}
	return output
}

// Generates embeddings for a chunk of text
func GenerateEmbeddings(chunk string) ([]float32, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	em := client.EmbeddingModel("text-embedding-004")
	res, err := em.EmbedContent(ctx, genai.Text(chunk))
	if err != nil {
		return nil, err
	}

	return res.Embedding.Values, nil
}

// loadEnv loads environment variables from a file if it exists
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
func GetDBURL() string {
	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)
	return dsn
}
