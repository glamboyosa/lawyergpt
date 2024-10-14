package main

import (
	"encoding/json"
	"fmt"
	"io"
	"lawyergpt/api/models"
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
	"github.com/pgvector/pgvector-go"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type semaphore struct {
	sem chan struct{}
}
type Result struct {
	URL         string `json:"url"`
	TextContent string `json:"textContent"`
}
type Results struct {
	Results []Result `json:"results"`
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
	// 	versionToForce := 3
	// if err := m.Force(versionToForce); err != nil {
	// 	log.Fatalf("failed to force version %d: %v", versionToForce, err)
	// }
	// Apply the migrations
	if err := m.Up(); err != nil {
		// Skip, but not treated as a fatal error
		if err == migrate.ErrNoChange {
			return nil
		}
		log.Fatal(err)
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully.")
	return nil
}
func newSemaphore(n int) *semaphore {
	return &semaphore{sem: make(chan struct{}, n)}
}
func createOrGetResourceForURL(tx *gorm.DB, url *string, content string) (string, error) {
	// Check if the resource already exists
	var existingResource models.Resource
	if err := tx.Where("url = ?", url).First(&existingResource).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Resource does not exist, create a new one
			newResource := models.Resource{
				URL:     url,
				Content: content,
			}
			if err := tx.Create(&newResource).Error; err != nil {
				return "", err
			}
			log.Printf("Created resource with ID: %d", newResource.ID)
			return newResource.ID, nil
		} else {
			return "", err
		}
	}

	// Resource already exists, return the ID
	log.Printf("Found existing resource with ID: %d", existingResource.ID)
	return existingResource.ID, nil
}
func createOrGetResourceForFilename(tx *gorm.DB, filename *string, content string) (string, error) {
	// Check if the resource already exists
	var existingResource models.Resource
	if err := tx.Where("filename = ?", filename).First(&existingResource).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Resource does not exist, create a new one
			newResource := models.Resource{
				Filename: filename,
				Content:  content,
			}
			if err := tx.Create(&newResource).Error; err != nil {
				return "", err
			}
			log.Printf("Created resource with ID: %d", newResource.ID)
			return newResource.ID, nil
		} else {
			return "", err
		}
	}

	// Resource already exists, return the ID
	log.Printf("Found existing resource with ID: %d", existingResource.ID)
	return existingResource.ID, nil
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
		if r.Method == http.MethodOptions {
			// Set the necessary CORS headers
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, x-api-key")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.WriteHeader(http.StatusOK)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		log.Print("API MIDDLEWARE")
		apiKey := r.Header.Get("x-api-key")
		log.Print(r.Header)
		if apiKey != os.Getenv("x-api-key") {
			log.Printf("Keys are %s %s", apiKey, os.Getenv("x-api-key"))
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}
func (ah *AppHandler) handleUpload(w http.ResponseWriter, r *http.Request) {
	maxSize := int64(15 << 20) // 15 MB limit

	// Parse multipart form with file size limit
	r.ParseMultipartForm(maxSize)

	files := r.MultipartForm.File["documents"]

	if len(files) == 0 {
		http.Error(w, "No files uploaded", http.StatusBadRequest)
		return
	}

	// Send the 202 Accepted response immediately
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Files are being processed asynchronously")

	// Process files asynchronously in a separate goroutine
	go func() {
		log.Print("Do we enter this go routine")
		var wg sync.WaitGroup
		numSemaphore := int(math.Ceil(float64(len(files)) / 2.0))
		sem := newSemaphore(numSemaphore)
		log.Printf("Sempahore is %v", sem)
		for _, fileHeader := range files {
			if fileHeader.Size > maxSize {
				log.Print("File exceeds size limit")
				continue
			}
			fmt.Print("File header is %v", fileHeader.Filename)
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

				// Save to a temporary file
				tempFile, err := os.CreateTemp("", "upload-*")
				if err != nil {
					log.Printf("Error creating temp file: %v", err)
					return
				}

				defer os.Remove(tempFile.Name())

				_, err = io.Copy(tempFile, file)
				if err != nil {
					log.Printf("Error writing to temp file: %v", err)
					return
				}
				tempFile.Close()

				// Detect file type and process
				var content string
				var processError error

				switch strings.ToLower(filepath.Ext(fileHeader.Filename)) {
				case ".pdf":
					content, processError = pkg.ProcessPDF(tempFile.Name())
					if processError != nil {
						log.Printf("Error processing PDF: %v, falling back to OCR", processError)
						// Fallback to OCR for PDF errors
						tempDir, err := os.MkdirTemp("", "ocr")
						if err != nil {
							log.Printf("failed to create temp dir: %v", err)
							return
						}
						defer os.RemoveAll(tempDir)
						imagePaths, err := pkg.ConvertPDFToImages(tempFile.Name(), tempDir)
						if err != nil {
							log.Printf("failed to convert PDF to images: %v", err)
							return
						}
						content, processError = pkg.ProcessOCR(imagePaths)
						if processError != nil {
							log.Printf("OCR processing failed: %v", processError)
							return
						}
					}

				case ".docx":
					log.Print("Make it in here?")
					content, processError = pkg.ProcessDOCX(tempFile.Name())
				case ".jpg", ".jpeg", ".png", ".tiff", ".tif":
					// Process images with OCR
					content, processError = pkg.ProcessOCR([]string{tempFile.Name()})
				default:
					processError = fmt.Errorf("unsupported file type: %s", filepath.Ext(fileHeader.Filename))
				}

				if processError != nil {
					log.Printf("Error processing file: %v", processError)
					return
				}
				log.Printf("Content we have is %v", content)
				// Chunk content and generate embeddings
				chunks := pkg.ChunkText(content, 7500)
				log.Printf("Processed file %s into %d chunks", fileHeader.Filename, len(chunks))

				for _, chunk := range chunks {
					embedding, err := pkg.GenerateEmbeddings(chunk)
					if err != nil {
						continue
					}

					// Store embeddings and resource in database transaction
					err = ah.db.Session(&gorm.Session{}).Transaction(func(tx *gorm.DB) error {
						resourceId, err := createOrGetResourceForFilename(tx, &fileHeader.Filename, content)
						if err != nil {
							return err
						}
						log.Printf("Created resource with ID: %s", resourceId)
						log.Printf("Embedding %v", embedding)
						// create new embedding
						newEmbedding := models.Embedding{
							ResourceID: resourceId,
							Content:    chunk,
							Embedding:  pgvector.NewVector(embedding),
						}
						if err := tx.Create(&newEmbedding).Error; err != nil {
							log.Printf("Embedding insertion error %v", err)
							return err
						}
						log.Printf("Created embedding with ID: %s", newEmbedding.ID)

						return nil
					})

					if err != nil {
						log.Printf("Error creating embedding: %v", err)
					}
				}
			}(fileHeader)
		}
		// Wait for all processing to complete
		wg.Wait()
	}()
}

func (ah *AppHandler) handleTextEmbeddings(w http.ResponseWriter, r *http.Request) {
	log.Print("Got in here")
	var wg sync.WaitGroup
	var results Results
	err := json.NewDecoder(r.Body).Decode(&results)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	sem := newSemaphore(5)
	for _, result := range results.Results {
		wg.Add(1)
		sem.acquire()

		go func(result Result) {
			defer sem.release()
			defer wg.Done()
			log.Print(result)
			chunks := pkg.ChunkText(result.TextContent, 4000)
			for _, chunk := range chunks {
				log.Printf("chunk is %s", chunk)
				embedding, err := pkg.GenerateEmbeddings(chunk)

				if err != nil {
					log.Printf("Error is %v", err)
					continue
				}

				err = ah.db.Session(&gorm.Session{}).Transaction(func(tx *gorm.DB) error {
					resourceId, err := createOrGetResourceForURL(tx, &result.URL, result.TextContent)
					if err != nil {
						return err
					}
					log.Printf("Created resource with ID: %s", resourceId)
					log.Printf("Embedding %v", embedding)
					// create new embedding
					newEmbedding := models.Embedding{
						ResourceID: resourceId,
						Content:    chunk,
						Embedding:  pgvector.NewVector(embedding),
					}
					if err := tx.Create(&newEmbedding).Error; err != nil {
						log.Printf("Embedding insertion error %v", err)
						return err
					}
					log.Printf("Created embedding with ID: %s", newEmbedding.ID)

					return nil
				})
			}
		}(result)
	}
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Embeddings are being processed asynchronously")

	wg.Wait()
}
func helloHandler(w http.ResponseWriter, r *http.Request) {

	// Return some HTML
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	fmt.Fprint(w, "<h1>Hello, World!</h1>")
}

func SetupRoutes(db *gorm.DB) {
	ah := NewAppHandler(db)
	http.HandleFunc("/upload", apiKeyMiddleware(ah.handleUpload))
	http.HandleFunc("/text-embeddings", apiKeyMiddleware(ah.handleTextEmbeddings))
	http.HandleFunc("/", helloHandler)
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

	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
