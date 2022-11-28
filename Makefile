develop:
	npx webpack serve

install: 
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

link:
	npm link

publish:
	npm publish --dry-run

lint:
	npx eslint .