.PHONY: dev prod build stop logs clean help

# ── Development ───────────────────────────────────────────────
dev:
	@echo "Starting Histora in development mode..."
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

# ── Production ────────────────────────────────────────────────
prod:
	@[ -f .env ] || (echo "ERROR: .env file not found. Copy .env.example → .env and fill in values." && exit 1)
	docker compose up --build -d

prod-down:
	docker compose down

# ── Build only ────────────────────────────────────────────────
build-backend:
	docker build -f Dockerfile.backend -t histora-backend:latest .

build-frontend:
	docker build -f Dockerfile.frontend -t histora-frontend:latest .

build:
	$(MAKE) build-backend
	$(MAKE) build-frontend

# ── Logs ──────────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

# ── Maintenance ───────────────────────────────────────────────
clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --remove-orphans

ps:
	docker compose ps

help:
	@echo ""
	@echo "Histora Docker Commands:"
	@echo "  make dev            — Start in development mode (hot reload)"
	@echo "  make dev-down       — Stop development environment"
	@echo "  make prod           — Start in production mode (requires .env)"
	@echo "  make prod-down      — Stop production environment"
	@echo "  make build          — Build all Docker images"
	@echo "  make logs           — Follow all service logs"
	@echo "  make logs-backend   — Follow backend logs"
	@echo "  make clean          — Remove all containers and volumes"
	@echo ""
