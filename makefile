API_DIR=./api
EXTRACTOR_DIR=./extractor
PORT=8080

# Default task: run the API server
.PHONY: run
run:
	@echo "Running the Go API server in '$(API_DIR)' on port $(PORT)..."
	@cd $(API_DIR) && go run main.go

# Install dependencies for the API
.PHONY: deps-api
deps-api:
	@echo "Installing dependencies for the API in '$(API_DIR)'..."
	@cd $(API_DIR) && go mod tidy && go mod download

# Build the binary in the 'api' folder
.PHONY: build-api
build-api:
	@echo "Building the Go API server..."
	@cd $(API_DIR) && go build -o go-api-server main.go
	@echo "Build completed."

.PHONY: deps-extractor
deps-extractor:
	@echo "Installing dependencies for the API in '$(EXTRACTOR_DIR)'..."
	@cd $(EXTRACTOR_DIR) && go mod tidy && go mod download

# Build the binary in the 'extractor' folder
.PHONY: build-extractor
build-extractor:
	@echo "Building the Go Extractor service..."
	@cd $(EXTRACTOR_DIR) && go build main.go
	@echo "Build completed."

# Clean up build artifacts and cache in the 'extractor' folder
.PHONY: clean
clean:
	@echo "Cleaning up build artifacts..."
	@cd $(EXTRACTOR_DIR) && rm -f main && go clean
	@echo "Clean up completed."

fmt:
	cd api && gofmt -s -w . && cd .. && cd extractor && gofmt -s -w .