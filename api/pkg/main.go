package pkg

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	"baliance.com/gooxml/document"

	"github.com/google/generative-ai-go/genai"
	"github.com/ledongthuc/pdf"
	"github.com/otiai10/gosseract/v2"
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

// helper function to process OCR
func ProcessOCR(filepath string) (string, error) {
	client := gosseract.NewClient()

	defer client.Close()

	client.SetImage(filepath)

	text, err := client.Text()

	if err != nil {
		return "", err
	}
	return text, nil
}

// helper function to process PDFs
func ProcessPDF(filePath string) (string, error) {
	f, r, err := pdf.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	var content string

	totalPages := r.NumPage()

	for pageIndex := 1; pageIndex <= totalPages; pageIndex++ {
		p := r.Page(pageIndex)

		if p.V.IsNull() {
			continue
		}
		text, err := p.GetPlainText(nil)

		if err != nil {
			return "", err
		}

		content += text
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
