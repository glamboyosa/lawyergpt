package main

import (
	"fmt"
	"io"
	"lawyergpt/api/pkg"
	"log"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type semaphore struct {
	sem chan struct{}
}

func newSemaphore(n int) *semaphore {
	return &semaphore{sem: make(chan struct{}, n)}
}

func (s *semaphore) acquire() {
	s.sem <- struct{}{}
}
func (s *semaphore) release() {
	<-s.sem
}
func handleUpload(w http.ResponseWriter, r *http.Request) {
	var wg sync.WaitGroup

	maxSize := int64(15 << 20) // 15 mb limit

	r.ParseMultipartForm(maxSize)

	files := r.MultipartForm.File["documents"]

	if len(files) == 0 {
		http.Error(w, "No files uploaded", http.StatusBadRequest)
		return
	}
	numSemaphore := int(math.Round(float64(len(files) / 2)))
	sem := newSemaphore(numSemaphore)
	for _, fileHeader := range files {
		if fileHeader.Size > maxSize {
			http.Error(w, "File exceeds size limit", http.StatusRequestEntityTooLarge)
			return
		}
		wg.Add(1)
		sem.acquire()

		go func(fileHeader *multipart.FileHeader) {
			defer sem.release()
			defer wg.Done()

			file, err := fileHeader.Open()

			if err != nil {
				log.Printf("Error opening file: %v", err)
				return
			}
			defer file.Close()

			// temporarily save the file
			tempFile, err := os.CreateTemp("", "upload-*")
			if err != nil {
				log.Printf("Error creating temp file: %v", err)
				return
			}
			defer os.Remove(tempFile.Name())

			_, readErr := io.ReadAll(file)
			if readErr != nil {
				log.Printf("Error reading file: %v", err)
				return
			}

			// Detect file type (PDF, DOCX, etc.) and process accordingly
			var content string
			var pdfTypeError error

			switch strings.ToLower(filepath.Ext(fileHeader.Filename)) {
			case ".pdf":

				content, pdfTypeError = pkg.ProcessPDF(tempFile.Name())
				if pdfTypeError != nil {
					// If PDF processing fails, attempt OCR as fallback
					content, pdfTypeError = pkg.ProcessOCR(tempFile.Name())
				}
			case ".docx":
				content, pdfTypeError = pkg.ProcessDOCX(tempFile.Name())
			case ".jpg", ".jpeg", ".png", ".tiff", ".tif":
				// Explicitly handle image files with OCR
				content, pdfTypeError = pkg.ProcessOCR(tempFile.Name())
			default:
				pdfTypeError = fmt.Errorf("unsupported file type: %s", filepath.Ext(fileHeader.Filename))
			}

			if pdfTypeError != nil {
				log.Printf("Error processing file: %v", err)
				return
			}
			chunks := pkg.ChunkText(content, 2000)
			log.Printf("Processed file %s into %d chunks", fileHeader.Filename, len(chunks))
		}(fileHeader)
	}
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Files are being processed asynchronously")

	wg.Wait() 
}
func main() {
	// loadEnv if exists (in development) 
err := pkg.LoadEnv(".env.development")
if err != nil && !os.IsNotExist(err) {
	log.Printf("Error loading .env.development: %v", err)
}
	// gorm config 
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)
	config := &gorm.Config{
		PrepareStmt: true,
	}

	db, err := gorm.Open(postgres.Open(dsn), config)

	if err != nil {
		log.Fatalf("Failed to connect database %v", err)
	}

	sqlDB, err := db.DB()

	if err != nil {
		log.Fatalf("Failed to get database %v", err)
	}

	sqlDB.SetMaxIdleConns(20)
	sqlDB.SetMaxOpenConns(130)
	sqlDB.SetConnMaxLifetime(time.Hour)

	env := os.Getenv("ENV")

	// Run migrations only if ENV is set to DEVELOPMENT
	if env == "DEVELOPMENT" {
		log.Println("Running migrations in DEVELOPMENT environment...")
		err := pkg.RunMigrations()
		if err != nil {
			log.Fatalf("Error running migrations: %v", err)
		}
	} else {
		log.Println("Skipping migrations. ENV is not set to DEVELOPMENT.")
	}
	http.HandleFunc("/upload", handleUpload)

	fmt.Println("Server running on port 8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
