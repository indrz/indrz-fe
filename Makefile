SHELL=/bin/bash
PWD ?= pwd_unknown
PROJECT_NAME=indrz-backend-wu
COMPOSE_IGNORE_ORPHANS=True
DOCKER_IMAGE=indrz_web
BACKEND_NET=indrz-backend-wu_indrz-net

# cnf ?= indrz/settings/.env
# include $(cnf)
# export $(shell sed 's/=.*//' $(cnf))

.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

build-web: ## Build indrz_web Docker Image
	docker build -t indrz/web:latest . -f devops/docker/nginx/Dockerfile

run: ## Run Front-end (production-ready)
	@docker run -d 	\
		-p 80:80 -p 443:443 \
		-v indrz-backend-wu_indrz-static:/opt/data/static \
		-v indrz-backend-wu_indrz-media:/opt/data/media \
		--network ${BACKEND_NET} \
		--name ${DOCKER_IMAGE} \
		--restart always \
		indrz/web:latest


pull: ## Pull source code from Git
	git pull

# deploy: pull migrate collectstatic run ## Update and deploy Indrz application
# 	docker restart indrz

generate-dist: ## generate dist folder ie compiled version of Frontend
	git rm -r dist
	rm -rf dist
	yarn run generate
	git add dist
	git commit -m "updated dist" dist

stop: ## Stop Indrz Docker project
	docker stop ${DOCKER_IMAGE} && docker rm ${DOCKER_IMAGE}
