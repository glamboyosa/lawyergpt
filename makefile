API_DIR=api
EXTRACTOR_DIR=extractor
PORT=8080

# Database configuration
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}

# Migrate command
MIGRATE-DEV=cd api && export $(cat .env.development | xargs) && migrate -database ${DB_URL} -path ./migrations
MIGRATE=migrate -database ${DB_URL} -path ./migrations

.PHONY: migrate-up migrate-down migrate-create

migrate-up:
	@echo "Running all up migrations..."
	@${MIGRATE} up

migrate-down:
	@echo "Running all down migrations..."
	@${MIGRATE} down

migrate-create:
	@read -p "Enter migration name: " name; \
	${MIGRATE} create -ext sql -dir ./migrations -seq $${name}

.PHONY: migrate-up-dev migrate-down-dev migrate-create-dev

migrate-up-dev:
	@echo "Running all up migrations..."
	@${MIGRATE-DEV} up

migrate-down-dev:
	@echo "Running all down migrations..."
	@${MIGRATE-DEV} down

migrate-create-dev:
	@read -p "Enter migration name: " name; \
	${MIGRATE-DEV} create -ext sql -dir ./migrations -seq $${name}
# Default task: run the API server
.PHONY: run
run:
	@echo "Running the Go API server in '$(API_DIR)' on port $(PORT)..."
	@cd $(API_DIR) && docker-compose -f docker-compose.dev.yaml up


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

# Build the binary in the 'extractor' folder and run it
.PHONY: build-extractor
build-extractor:
	@echo "Building the Go Extractor service..."
	@cd $(EXTRACTOR_DIR) && go build -o extractor main.go
	@echo "Build completed. Running the extractor..."
	@cd $(EXTRACTOR_DIR) && ./extractor


# Clean up build artifacts and cache in the 'extractor' folder
.PHONY: clean
clean:
	@echo "Cleaning up build artifacts..."
	@cd $(EXTRACTOR_DIR) && rm -f main && go clean
	@echo "Clean up completed."

fmt:
	cd api && gofmt -s -w . && cd .. && cd extractor && gofmt -s -w .