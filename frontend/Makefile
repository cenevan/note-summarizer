# Makefile for managing frontend (React app)

NODE_BIN := node_modules/.bin

.PHONY: install start build lint format clean

install:
	npm install

start:
	npm start

build:
	npm run build

lint:
	$(NODE_BIN)/eslint src --ext .js,.jsx,.ts,.tsx

format:
	$(NODE_BIN)/prettier --write "src/**/*.{js,jsx,ts,tsx,css,scss,json,md}"

clean:
	rm -rf node_modules/ dist/ build/
