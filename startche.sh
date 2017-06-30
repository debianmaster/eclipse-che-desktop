#!/bin/bash
echo $(pwd)
mkdir -p $(pwd)/che
docker rm -f che_installer
docker run -d  -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd)/che:/data --name che_installer eclipse/che start
docker logs -f che_installer