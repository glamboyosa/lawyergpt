package pkg

import (
	"baliance.com/gooxml/document"
	"github.com/ledongthuc/pdf"
	"github.com/otiai10/gosseract/v2"
)

func chunkText(text string, chunkSize int) []string {
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

func processDOCX(filepath string) (string, error) {
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

func processOCR(filepath string) (string, error) {
	client := gosseract.NewClient()

	defer client.Close()

	client.SetImage(filepath)

	text, err := client.Text()

	if err != nil {
		return "", err
	}
	return text, nil
}
func processPDF(filePath string) (string, error) {
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
