#!/bin/bash

# Skrypt do łatwego uruchamiania projektu EkoDirekt w środowisku Docker

# Kolory dla lepsza czytelność
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funkcja wyświetlająca użycie
show_usage() {
  echo -e "${YELLOW}Użycie:${NC} $0 [opcja]"
  echo -e "  start       - Uruchamia wszystkie kontenery"
  echo -e "  stop        - Zatrzymuje wszystkie kontenery"
  echo -e "  restart     - Restartuje wszystkie kontenery"
  echo -e "  logs        - Pokazuje logi (Ctrl+C aby wyjść)"
  echo -e "  status      - Pokazuje status kontenerów"
  echo -e "  init-db     - Inicjalizuje bazę danych (jeśli skrypt istnieje)"
  echo -e "  clean       - Zatrzymuje kontenery i usuwa wolumeny (UWAGA: usuwa wszystkie dane)"
  echo -e "  shell-be    - Otwiera powłokę w kontenerze backend"
  echo -e "  shell-fe    - Otwiera powłokę w kontenerze frontend"
}

# Sprawdzanie argumentów
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

case "$1" in
  start)
    echo -e "${GREEN}Uruchamianie kontenerów EkoDirekt...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Kontenery uruchomione:${NC}"
    docker-compose ps
    echo -e "${GREEN}Frontend dostępny pod adresem:${NC} http://localhost:3000"
    echo -e "${GREEN}Backend dostępny pod adresem:${NC} http://localhost:5000"
    ;;
    
  stop)
    echo -e "${YELLOW}Zatrzymywanie kontenerów EkoDirekt...${NC}"
    docker-compose stop
    echo -e "${GREEN}Kontenery zatrzymane.${NC}"
    ;;
    
  restart)
    echo -e "${YELLOW}Restartowanie kontenerów EkoDirekt...${NC}"
    docker-compose restart
    echo -e "${GREEN}Kontenery zrestartowane:${NC}"
    docker-compose ps
    ;;
    
  logs)
    echo -e "${GREEN}Wyświetlanie logów (Ctrl+C aby wyjść)...${NC}"
    docker-compose logs -f
    ;;
    
  status)
    echo -e "${GREEN}Status kontenerów EkoDirekt:${NC}"
    docker-compose ps
    ;;
    
  init-db)
    echo -e "${YELLOW}Inicjalizacja bazy danych...${NC}"
    docker-compose -f docker-compose.tools.yml run --rm db-init
    echo -e "${GREEN}Inicjalizacja zakończona.${NC}"
    ;;
    
  clean)
    echo -e "${RED}UWAGA: Ta operacja usunie wszystkie dane. Czy na pewno chcesz kontynuować? (t/N)${NC}"
    read -r answer
    if [[ "$answer" =~ ^[Tt]$ ]]; then
      echo -e "${YELLOW}Zatrzymywanie kontenerów i usuwanie wolumenów...${NC}"
      docker-compose down -v
      echo -e "${GREEN}Operacja zakończona. Wszystkie dane zostały usunięte.${NC}"
    else
      echo -e "${YELLOW}Operacja anulowana.${NC}"
    fi
    ;;
    
  shell-be)
    echo -e "${GREEN}Otwieranie powłoki w kontenerze backend...${NC}"
    docker-compose exec backend /bin/sh
    ;;
    
  shell-fe)
    echo -e "${GREEN}Otwieranie powłoki w kontenerze frontend...${NC}"
    docker-compose exec frontend /bin/sh
    ;;
    
  *)
    echo -e "${RED}Nieznana opcja: $1${NC}"
    show_usage
    exit 1
    ;;
esac