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

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type semaphore struct {
	sem chan struct{}
}

// runMigrations uses golang-migrate to apply database migrations
func RunMigrations() error {
	fmt.Printf("db url %s", pkg.GetDBURL())
	m, err := migrate.New(
		"file://./migrations",
		pkg.GetDBURL(),
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}
	fmt.Printf("M is, %v", m)
	// 	versionToForce := 1
	// if err := m.Force(versionToForce); err != nil {
	// 	log.Fatalf("failed to force version %d: %v", versionToForce, err)
	// }
	// Apply the migrations
	if err := m.Up(); err != nil {
		log.Fatal(err)
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully.")
	return nil
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
// pattern for API stuff
type AppHandler struct {
	db *gorm.DB
}

func NewAppHandler(db *gorm.DB) *AppHandler {
	return &AppHandler{db: db}
}
func apiKeyMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey != os.Getenv("X_API_KEY") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}
func (ah *AppHandler) handleUpload(w http.ResponseWriter, r *http.Request) {
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
func SetupRoutes(db *gorm.DB) {
	ah := NewAppHandler(db)
	http.HandleFunc("/upload", apiKeyMiddleware(ah.handleUpload))
}


func main() {
	// loadEnv if exists (in development)
	err := pkg.LoadEnv(".env.development")
	if err != nil && !os.IsNotExist(err) {
		log.Printf("Error loading .env.development: %v", err)
	}
	// gorm config
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)
	fmt.Print(dsn)
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
		err := RunMigrations()
		if err != nil {
			fmt.Printf("Error is %v", err)
		}

	} else {
		log.Println("Skipping migrations. ENV is not set to DEVELOPMENT.")
	}
	
	SetupRoutes(db)
	fmt.Println("Server running on port 8080")

	http.ListenAndServe(":8080", nil)
}
