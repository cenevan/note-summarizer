# Makefile for managing backend environment

VENV_NAME := venv
PYTHON := python3

.PHONY: setup activate run clean freeze

setup:
	$(PYTHON) -m venv $(VENV_NAME)
	. $(VENV_NAME)/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

activate:
	@echo "Run the following to activate your virtual environment:"
	@echo "source $(VENV_NAME)/bin/activate"

run:
	$(VENV_NAME)/bin/uvicorn app.main:app --reload

freeze:
	$(VENV_NAME)/bin/pip freeze > requirements.txt

clean:
	rm -rf $(VENV_NAME)
